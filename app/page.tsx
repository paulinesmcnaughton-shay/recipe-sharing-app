import Link from "next/link"

const primaryCta =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const secondaryCta =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Share recipes, simply
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        Browse community recipes, save your favorites, and upload your own —
        all in one calm, readable place.
      </p>
      <ul className="mt-10 flex list-none flex-wrap gap-3">
        <li>
          <Link href="/recipes" className={primaryCta}>
            Browse recipes
          </Link>
        </li>
        <li>
          <Link href="/signup" className={secondaryCta}>
            Create an account
          </Link>
        </li>
      </ul>
    </div>
  )
}
