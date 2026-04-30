export default function ProfileLoading() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6" aria-busy="true" aria-live="polite">
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 animate-pulse rounded-full bg-muted" />
        <div className="min-w-0 flex-1">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-28 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
      </div>
    </section>
  )
}
