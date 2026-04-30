export default function SignupLoading() {
  return (
    <section className="mx-auto w-full max-w-md px-4 py-12 sm:px-6" aria-busy="true" aria-live="polite">
      <div className="h-8 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-4 w-64 animate-pulse rounded bg-muted" />

      <div className="mt-6 space-y-4">
        <div>
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-10 w-full animate-pulse rounded bg-muted" />
        </div>
        <div>
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-10 w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
      </div>
    </section>
  )
}
