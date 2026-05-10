import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/lib/supabase/database.types"

type Recipe = Pick<Tables<"recipes">, "id" | "title" | "image_url">

type FavoriteRow = {
  recipes: Recipe | null
}

const accentBtn =
  "inline-flex min-h-10 items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"

const outlineBtn =
  "inline-flex min-h-10 items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group block rounded-lg border border-border bg-background overflow-hidden transition hover:border-accent"
    >
      {recipe.image_url ? (
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className="h-36 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-36 w-full bg-muted" />
      )}
      <p className="line-clamp-2 px-3 py-2.5 text-sm font-medium text-foreground">
        {recipe.title}
      </p>
    </Link>
  )
}

export default async function KitchenPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <p className="text-sm text-muted-foreground">
          Please{" "}
          <Link href="/login" className="underline hover:text-foreground">
            log in
          </Link>{" "}
          to view your kitchen.
        </p>
      </section>
    )
  }

  const [{ data: favData }, { data: myRecipesData }] = await Promise.all([
    supabase
      .from("favorites")
      .select("recipes(id, title, image_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("recipes")
      .select("id, title, image_url")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false }),
  ])

  const savedRecipes = ((favData ?? []) as unknown as FavoriteRow[])
    .map((f) => f.recipes)
    .filter((r): r is Recipe => Boolean(r))

  const myRecipes = (myRecipesData ?? []) as Recipe[]

  const isEmpty = savedRecipes.length === 0 && myRecipes.length === 0

  if (isEmpty) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Start building your kitchen
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Save recipes you love or add your own — everything in one place.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/recipes" className={accentBtn}>
            Browse recipes
          </Link>
          <Link href="/upload" className={outlineBtn}>
            Add recipe
          </Link>
        </div>
      </section>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 space-y-14">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Your Kitchen
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your saved recipes, your meals, your space
        </p>
      </header>

      {savedRecipes.length > 0 && (
        <section aria-labelledby="saved-heading">
          <div className="flex items-center justify-between mb-4">
            <h2
              id="saved-heading"
              className="text-lg font-semibold text-foreground"
            >
              Saved recipes
            </h2>
            <Link
              href="/saved"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              See all
            </Link>
          </div>
          <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedRecipes.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard recipe={recipe} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="your-recipes-heading">
        <h2
          id="your-recipes-heading"
          className="mb-4 text-lg font-semibold text-foreground"
        >
          Your recipes
        </h2>
        {myRecipes.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted/40 p-6">
            <p className="text-sm text-muted-foreground">
              You haven't added any recipes yet.
            </p>
            <Link href="/upload" className={`${accentBtn} mt-4`}>
              Add your first recipe
            </Link>
          </div>
        ) : (
          <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myRecipes.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard recipe={recipe} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="quick-actions-heading">
        <h2
          id="quick-actions-heading"
          className="mb-4 text-lg font-semibold text-foreground"
        >
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/upload" className={accentBtn}>
            Add recipe
          </Link>
          <Link href="/recipes" className={outlineBtn}>
            Browse recipes
          </Link>
        </div>
      </section>
    </div>
  )
}
