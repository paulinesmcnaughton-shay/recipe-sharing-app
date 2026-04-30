export default function RecipeDetailLoading() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6" aria-busy="true" aria-live="polite">
      <div className="h-4 w-28 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-9 w-2/3 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-4 w-28 animate-pulse rounded bg-muted" />

      <div className="mt-6 h-64 w-full animate-pulse rounded-lg border border-border bg-muted" />

      <div className="mt-6 h-20 w-full animate-pulse rounded-lg border border-border bg-muted" />
      <div className="mt-4 h-40 w-full animate-pulse rounded-lg border border-border bg-muted" />
    </article>
  )
}
