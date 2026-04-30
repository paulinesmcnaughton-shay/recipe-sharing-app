import Link from "next/link"
import { notFound } from "next/navigation"
import {
  createCommentAction,
  deleteCommentAction,
  deleteRecipeAction,
  toggleFavoriteAction,
  toggleLikeAction,
} from "@/app/recipes/[id]/actions"
import type { Tables } from "@/lib/supabase/database.types"
import { createClient } from "@/lib/supabase/server"

type RecipeDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ commented?: string; commentError?: string }>
}

type RecipeDetailRow = Pick<
  Tables<"recipes">,
  | "id"
  | "author_id"
  | "title"
  | "description"
  | "ingredients"
  | "instructions"
  | "image_url"
  | "prep_time_minutes"
  | "cook_time_minutes"
  | "created_at"
>

type RecipeCommentRow = Pick<Tables<"recipe_comments">, "id" | "user_id" | "content" | "created_at"> & {
  display_name: string | null
}

async function getRecipeById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("recipes")
    .select(
      "id, author_id, title, description, ingredients, instructions, image_url, prep_time_minutes, cook_time_minutes, created_at"
    )
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  return data as RecipeDetailRow
}

export default async function RecipeDetailPage({ params, searchParams }: RecipeDetailPageProps) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  const recipe = await getRecipeById(id)

  if (!recipe) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isFavorited = false
  let isLiked = false
  const isOwner = Boolean(user && user.id === recipe.author_id)

  if (user) {
    const { data: favorite } = await supabase
      .from("favorites")
      .select("recipe_id")
      .eq("user_id", user.id)
      .eq("recipe_id", id)
      .maybeSingle()

    isFavorited = Boolean(favorite)

    const { data: like } = await supabase
      .from("recipe_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("recipe_id", id)
      .maybeSingle()

    isLiked = Boolean(like)
  }

  const { count: likeCount } = await supabase
    .from("recipe_likes")
    .select("id", { count: "exact", head: true })
    .eq("recipe_id", id)

  const { data: commentData } = await supabase
    .from("recipe_comments")
    .select("id, user_id, content, created_at")
    .eq("recipe_id", id)
    .order("created_at", { ascending: false })

  const commentRows = (commentData ?? []) as Pick<
    Tables<"recipe_comments">,
    "id" | "user_id" | "content" | "created_at"
  >[]

  const commenterIds = Array.from(new Set(commentRows.map((comment) => comment.user_id)))
  let displayNamesByUserId: Record<string, string | null> = {}

  if (commenterIds.length > 0) {
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", commenterIds)

    displayNamesByUserId = (profileRows ?? []).reduce<Record<string, string | null>>((acc, profile) => {
      acc[profile.id] = profile.display_name
      return acc
    }, {})
  }

  const comments: RecipeCommentRow[] = commentRows.map((comment) => ({
    ...comment,
    display_name: displayNamesByUserId[comment.user_id] ?? null,
  }))

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/recipes"
        className="inline-flex items-center rounded-sm text-sm text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Back to recipes
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {recipe.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {new Date(recipe.created_at).toLocaleDateString()}
        </p>
      </header>

      <div className="mt-4 flex flex-wrap gap-2">
        {recipe.prep_time_minutes ? (
          <p className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
            Prep: {recipe.prep_time_minutes} min
          </p>
        ) : null}
        {recipe.cook_time_minutes ? (
          <p className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
            Cook: {recipe.cook_time_minutes} min
          </p>
        ) : null}
      </div>

      {user ? (
        <div className="mt-5 flex flex-wrap gap-3">
          <form action={toggleLikeAction}>
            <input type="hidden" name="recipeId" value={recipe.id} />
            <input type="hidden" name="currentlyLiked" value={isLiked ? "true" : "false"} />
            <button
              type="submit"
              className="inline-flex min-h-10 items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              {isLiked ? "Unlike" : "Like"} ({likeCount ?? 0})
            </button>
          </form>

          <form action={toggleFavoriteAction}>
            <input type="hidden" name="recipeId" value={recipe.id} />
            <input
              type="hidden"
              name="currentlyFavorited"
              value={isFavorited ? "true" : "false"}
            />
            <button
              type="submit"
              className="inline-flex min-h-10 items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              {isFavorited ? "Remove from saved" : "Save recipe"}
            </button>
          </form>

          {isOwner ? (
            <>
              <Link
                href={`/edit/${recipe.id}`}
                className="inline-flex min-h-10 items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Edit recipe
              </Link>
              <form action={deleteRecipeAction}>
                <input type="hidden" name="recipeId" value={recipe.id} />
                <button
                  type="submit"
                  className="inline-flex min-h-10 items-center rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  Delete recipe
                </button>
              </form>
            </>
          ) : null}
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">
          <Link
            href="/login"
            className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Log in
          </Link>{" "}
          to like and save this recipe.
        </p>
      )}

      {!user ? (
        <p className="mt-2 text-sm text-muted-foreground">
          <Link
            href="/login"
            className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Log in
          </Link>{" "}
          to leave a comment.
        </p>
      ) : null}

      {recipe.image_url ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-border bg-muted/20">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="h-auto max-h-[28rem] w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      {recipe.description ? (
        <p className="mt-6 leading-relaxed text-muted-foreground">{recipe.description}</p>
      ) : null}

      <section className="mt-8 rounded-lg border border-border bg-background p-5">
        <h2 className="text-lg font-semibold text-foreground">Ingredients</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
          {recipe.ingredients}
        </p>
      </section>

      <section className="mt-4 rounded-lg border border-border bg-background p-5">
        <h2 className="text-lg font-semibold text-foreground">Instructions</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
          {recipe.instructions}
        </p>
      </section>

      <section className="mt-4 rounded-lg border border-border bg-background p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Comments</h2>
          <p className="text-xs text-muted-foreground">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </p>
        </div>

        {resolvedSearchParams.commented === "true" ? (
          <p className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
            Comment posted.
          </p>
        ) : null}

        {resolvedSearchParams.commentError ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {resolvedSearchParams.commentError}
          </p>
        ) : null}

        {user ? (
          <form action={createCommentAction} className="mt-4 space-y-3">
            <input type="hidden" name="recipeId" value={recipe.id} />
            <label htmlFor="comment-content" className="sr-only">
              Add a comment
            </label>
            <textarea
              id="comment-content"
              name="content"
              rows={3}
              maxLength={1000}
              required
              placeholder="Share your thoughts about this recipe..."
              className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
            <button
              type="submit"
              className="inline-flex min-h-10 items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
            >
              Post comment
            </button>
          </form>
        ) : null}

        {comments.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {comments.map((comment) => {
              const isOwnComment = Boolean(user && user.id === comment.user_id)
              const authorName = comment.display_name?.trim() || "User"

              return (
                <li key={comment.id} className="rounded-md border border-border bg-background p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{authorName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {isOwnComment ? (
                      <form action={deleteCommentAction}>
                        <input type="hidden" name="recipeId" value={recipe.id} />
                        <input type="hidden" name="commentId" value={comment.id} />
                        <button
                          type="submit"
                          className="inline-flex min-h-8 items-center rounded-md border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </form>
                    ) : null}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {comment.content}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </article>
  )
}
