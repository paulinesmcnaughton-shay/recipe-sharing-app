export default function RecipesLoading() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6" aria-busy="true" aria-live="polite">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-4 w-72 animate-pulse rounded bg-muted" />

      <ul className="mt-8 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <li key={index} className="rounded-lg border border-border bg-background p-4">
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-3 w-24 animate-pulse rounded bg-muted" />
          </li>
        ))}
      </ul>
    </section>
  )
}
