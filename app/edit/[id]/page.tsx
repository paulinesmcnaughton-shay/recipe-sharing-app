import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { updateRecipeAction } from "@/app/edit/[id]/actions"
import { FormSubmitButton } from "@/components/form-submit-button"
import type { Tables } from "@/lib/supabase/database.types"
import { createClient } from "@/lib/supabase/server"

type EditRecipePageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}

type EditableRecipe = Pick<
  Tables<"recipes">,
  | "id"
  | "author_id"
  | "title"
  | "description"
  | "ingredients"
  | "instructions"
  | "image_url"
  | "difficulty"
  | "category"
  | "prep_time_minutes"
  | "cook_time_minutes"
>

async function getEditableRecipe(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("recipes")
    .select(
      "id, author_id, title, description, ingredients, instructions, image_url, difficulty, category, prep_time_minutes, cook_time_minutes"
    )
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  return data as EditableRecipe
}

export default async function EditRecipePage({ params, searchParams }: EditRecipePageProps) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const recipe = await getEditableRecipe(id)
  if (!recipe) notFound()

  if (recipe.author_id !== user.id) redirect("/recipes")

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6" aria-labelledby="edit-heading">
      <Link
        href={`/recipes/${id}`}
        className="inline-flex items-center rounded-sm text-sm text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Back to recipe
      </Link>

      <h1 id="edit-heading" className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
        Edit recipe
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Update recipe details below.
      </p>

      <form className="mt-6 space-y-4" action={updateRecipeAction}>
        <input type="hidden" name="recipeId" value={recipe.id} />

        <div>
          <label htmlFor="edit-image" className="mb-1.5 block text-sm font-medium text-foreground">
            Change image (optional)
          </label>
          <input
            id="edit-image"
            name="image"
            type="file"
            accept="image/*"
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:text-foreground"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Upload uses the `recipe-images` bucket.
          </p>
        </div>

        {recipe.image_url ? (
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Current image</p>
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="h-40 w-full rounded-md border border-border object-cover sm:max-w-md"
              loading="lazy"
            />
          </div>
        ) : null}

        <div>
          <label htmlFor="edit-title" className="mb-1.5 block text-sm font-medium text-foreground">
            Title
          </label>
          <input
            id="edit-title"
            name="title"
            required
            defaultValue={recipe.title}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </div>

        <div>
          <label htmlFor="edit-description" className="mb-1.5 block text-sm font-medium text-foreground">
            Description (optional)
          </label>
          <textarea
            id="edit-description"
            name="description"
            rows={3}
            defaultValue={recipe.description ?? ""}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </div>

        <div>
          <label htmlFor="edit-ingredients" className="mb-1.5 block text-sm font-medium text-foreground">
            Ingredients
          </label>
          <textarea
            id="edit-ingredients"
            name="ingredients"
            required
            rows={6}
            defaultValue={recipe.ingredients}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </div>

        <div>
          <label htmlFor="edit-instructions" className="mb-1.5 block text-sm font-medium text-foreground">
            Instructions
          </label>
          <textarea
            id="edit-instructions"
            name="instructions"
            required
            rows={8}
            defaultValue={recipe.instructions}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-difficulty" className="mb-1.5 block text-sm font-medium text-foreground">
              Difficulty
            </label>
            <select
              id="edit-difficulty"
              name="difficulty"
              defaultValue={recipe.difficulty ?? "easy"}
              className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label htmlFor="edit-category" className="mb-1.5 block text-sm font-medium text-foreground">
              Category
            </label>
            <select
              id="edit-category"
              name="category"
              defaultValue={recipe.category ?? "breakfast"}
              className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-prep-time" className="mb-1.5 block text-sm font-medium text-foreground">
              Prep time (minutes, optional)
            </label>
            <input
              id="edit-prep-time"
              name="prepTimeMinutes"
              type="number"
              min={0}
              defaultValue={recipe.prep_time_minutes ?? ""}
              className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>

          <div>
            <label htmlFor="edit-cook-time" className="mb-1.5 block text-sm font-medium text-foreground">
              Cook time (minutes, optional)
            </label>
            <input
              id="edit-cook-time"
              name="cookTimeMinutes"
              type="number"
              min={0}
              defaultValue={recipe.cook_time_minutes ?? ""}
              className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>
        </div>

        {resolvedSearchParams.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {resolvedSearchParams.error}
          </p>
        ) : null}

        <FormSubmitButton idleText="Save changes" loadingText="Saving changes..." />
      </form>
    </section>
  )
}
