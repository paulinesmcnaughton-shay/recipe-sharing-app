import Link from "next/link"

export default function RecipeNotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Recipe not found
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        The recipe may have been removed or the link is incorrect.
      </p>
      <Link
        href="/recipes"
        className="mt-6 inline-flex min-h-10 items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
      >
        Back to recipes
      </Link>
    </section>
  )
}
