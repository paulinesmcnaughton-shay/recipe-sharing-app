export default function RootLoading() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6" aria-busy="true" aria-live="polite">
      <div className="h-9 w-56 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-5 w-full animate-pulse rounded bg-muted" />
      <div className="mt-2 h-5 w-4/5 animate-pulse rounded bg-muted" />

      <div className="mt-8 flex gap-3">
        <div className="h-11 w-36 animate-pulse rounded-lg bg-muted" />
        <div className="h-11 w-40 animate-pulse rounded-lg bg-muted" />
      </div>
    </section>
  )
}
