export default function EditRecipeLoading() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6" aria-busy="true" aria-live="polite">
      <div className="h-4 w-28 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-8 w-36 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-4 w-56 animate-pulse rounded bg-muted" />

      <div className="mt-6 space-y-4">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-40 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-20 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-28 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-40 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
      </div>
    </section>
  )
}
