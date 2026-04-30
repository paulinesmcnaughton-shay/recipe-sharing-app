"use client"

export default function RecipeDetailError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6" role="alert">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Could not load this recipe
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {error.message || "Something went wrong while loading the recipe."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex min-h-10 items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
      >
        Try again
      </button>
    </section>
  )
}
