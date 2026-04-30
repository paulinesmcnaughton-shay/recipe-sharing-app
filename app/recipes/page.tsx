import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/lib/supabase/database.types"

type RecipeRow = Pick<
  Tables<"recipes">,
  "id" | "title" | "description" | "created_at" | "image_url" | "difficulty" | "category"
>

type RecipesPageProps = {
  searchParams: Promise<{
    warning?: string
    q?: string
    difficulty?: "all" | "easy" | "medium" | "hard"
    category?: "all" | "breakfast" | "lunch" | "dinner"
  }>
}

async function getRecipes({
  query,
  difficulty,
  category,
}: {
  query: string
  difficulty: "all" | "easy" | "medium" | "hard"
  category: "all" | "breakfast" | "lunch" | "dinner"
}) {
  const supabase = await createClient()
  let request = supabase
    .from("recipes")
    .select("id, title, description, created_at, image_url, difficulty, category")
    .order("created_at", { ascending: false })
    .limit(24)

  if (query) {
    request = request.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
  }
  if (difficulty !== "all") request = request.eq("difficulty", difficulty)
  if (category !== "all") request = request.eq("category", category)

  const { data, error } = await request

  if (error) throw new Error(error.message)

  return (data ?? []) as RecipeRow[]
}

async function getRecipeLikeCounts(recipeIds: string[]) {
  if (recipeIds.length === 0) return {} as Record<string, number>

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("recipe_likes")
    .select("recipe_id")
    .in("recipe_id", recipeIds)

  if (error) throw new Error(error.message)

  return (data ?? []).reduce<Record<string, number>>((countsByRecipeId, likeRow) => {
    countsByRecipeId[likeRow.recipe_id] = (countsByRecipeId[likeRow.recipe_id] ?? 0) + 1
    return countsByRecipeId
  }, {})
}

async function getRecipeCommentCounts(recipeIds: string[]) {
  if (recipeIds.length === 0) return {} as Record<string, number>

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("recipe_comments")
    .select("recipe_id")
    .in("recipe_id", recipeIds)

  if (error) throw new Error(error.message)

  return (data ?? []).reduce<Record<string, number>>((countsByRecipeId, commentRow) => {
    countsByRecipeId[commentRow.recipe_id] = (countsByRecipeId[commentRow.recipe_id] ?? 0) + 1
    return countsByRecipeId
  }, {})
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const resolvedSearchParams = await searchParams
  const searchQuery = (resolvedSearchParams.q ?? "").trim()
  const selectedDifficulty = resolvedSearchParams.difficulty ?? "all"
  const selectedCategory = resolvedSearchParams.category ?? "all"
  const recipes = await getRecipes({
    query: searchQuery,
    difficulty: selectedDifficulty,
    category: selectedCategory,
  })
  const likeCountsByRecipeId = await getRecipeLikeCounts(recipes.map((recipe) => recipe.id))
  const commentCountsByRecipeId = await getRecipeCommentCounts(recipes.map((recipe) => recipe.id))
  const showImageCleanupWarning =
    resolvedSearchParams.warning === "image-cleanup-failed"

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6" aria-labelledby="recipes-heading">
      <header className="mb-8">
        <h1 id="recipes-heading" className="text-2xl font-semibold tracking-tight text-foreground">
          Browse recipes
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Latest community recipes from Supabase.
        </p>
      </header>

      {showImageCleanupWarning ? (
        <p
          className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          role="status"
        >
          Recipe deleted, but image cleanup in Storage did not fully complete.
        </p>
      ) : null}

      <form action="/recipes" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="recipe-search" className="sr-only">
          Search recipes
        </label>
        <input
          id="recipe-search"
          name="q"
          defaultValue={searchQuery}
          placeholder="Search by title or description..."
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:max-w-md"
        />
        <select
          name="difficulty"
          defaultValue={selectedDifficulty}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <option value="all">All difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
          name="category"
          defaultValue={selectedCategory}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <option value="all">All categories</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>
        <button
          type="submit"
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
        >
          Search
        </button>
        {searchQuery || selectedDifficulty !== "all" || selectedCategory !== "all" ? (
          <Link
            href="/recipes"
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Clear
          </Link>
        ) : null}
      </form>

      {recipes.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/40 p-6">
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? `No recipes found for "${searchQuery}".`
              : "No recipes yet. Be the first to upload one."}
          </p>
          <Link
            href="/upload"
            className="mt-4 inline-flex min-h-10 items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
          >
            Upload a recipe
          </Link>
        </div>
      ) : (
        <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <article className="h-full rounded-lg border border-border bg-background p-4">
                {recipe.image_url ? (
                  <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="mb-3 h-36 w-full rounded-md border border-border object-cover"
                    loading="lazy"
                  />
                ) : null}
                <h2 className="line-clamp-2 text-base font-semibold text-foreground">
                  <Link
                    href={`/recipes/${recipe.id}`}
                    className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {recipe.title}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {recipe.description || "No description provided yet."}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(recipe.created_at).toLocaleDateString()}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    Likes: {likeCountsByRecipeId[recipe.id] ?? 0}
                  </span>
                  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    Comments: {commentCountsByRecipeId[recipe.id] ?? 0}
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
