import Link from "next/link"
import { AuthNav } from "@/components/auth-nav"
import { createClient } from "@/lib/supabase/server"

const primaryLinks = [
  { href: "/recipes", label: "Recipes" },
  { href: "/upload", label: "Upload" },
  { href: "/saved", label: "Saved" },
  { href: "/profile", label: "Profile" },
] as const

const linkClassName =
  "inline-flex min-h-9 items-center rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const logoClassName =
  "text-base font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"

export async function SiteHeader() {
  let isAuthenticated = false

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    isAuthenticated = Boolean(user)
  } catch {
    isAuthenticated = false
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md"
      role="banner"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={isAuthenticated ? "/kitchen" : "/"} className={logoClassName}>
          GatherBites
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-4">
          {isAuthenticated && (
            <nav aria-label="Primary" className="min-w-0">
              <ul className="flex list-none flex-wrap items-center justify-end gap-0.5 sm:gap-1">
                {primaryLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className={linkClassName}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <AuthNav isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </header>
  )
}
