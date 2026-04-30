import Link from "next/link"
import type { Tables } from "@/lib/supabase/database.types"
import { createClient } from "@/lib/supabase/server"

type SavedRecipeRow = Pick<Tables<"favorites">, "recipe_id" | "created_at"> & {
  recipes: Pick<
    Tables<"recipes">,
    "id" | "title" | "description" | "created_at" | "image_url"
  > | null
}

export default async function SavedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Saved recipes
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Please log in to view your saved recipes.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex min-h-10 items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
        >
          Go to login
        </Link>
      </section>
    )
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("recipe_id, created_at, recipes(id, title, description, created_at, image_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  const savedRecipes = (data ?? []) as unknown as SavedRecipeRow[]
  const availableRecipes = savedRecipes
    .map((item) => ({
      recipeId: item.recipe_id,
      savedAt: item.created_at,
      recipe: item.recipes,
    }))
    .filter(
      (item): item is { recipeId: string; savedAt: string; recipe: NonNullable<SavedRecipeRow["recipes"]> } =>
        Boolean(item.recipe)
    )

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6" aria-labelledby="saved-heading">
      <header className="mb-8">
        <h1 id="saved-heading" className="text-2xl font-semibold tracking-tight text-foreground">
          Saved recipes
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Recipes you marked to revisit later.
        </p>
      </header>

      {availableRecipes.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/40 p-6">
          <p className="text-sm text-muted-foreground">
            You have not saved any recipes yet.
          </p>
          <Link
            href="/recipes"
            className="mt-4 inline-flex min-h-10 items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
          >
            Browse recipes
          </Link>
        </div>
      ) : (
        <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availableRecipes.map((item) => (
            <li key={item.recipeId}>
              <article className="h-full rounded-lg border border-border bg-background p-4">
                {item.recipe.image_url ? (
                  <img
                    src={item.recipe.image_url}
                    alt={item.recipe.title}
                    className="mb-3 h-36 w-full rounded-md border border-border object-cover"
                    loading="lazy"
                  />
                ) : null}
                <h2 className="line-clamp-2 text-base font-semibold text-foreground">
                  <Link
                    href={`/recipes/${item.recipe.id}`}
                    className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {item.recipe.title}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {item.recipe.description || "No description provided yet."}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Saved on {new Date(item.savedAt).toLocaleDateString()}
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
