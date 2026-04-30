"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"

interface AuthNavProps {
  isAuthenticated: boolean
}

export function AuthNav({ isAuthenticated }: AuthNavProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function handleLogOut() {
    setErrorMessage("")
    setIsLoggingOut(true)
    let error

    try {
      const supabase = createClient()
      const response = await supabase.auth.signOut()
      error = response.error
    } catch (requestError) {
      setIsLoggingOut(false)
      setErrorMessage(
        requestError instanceof Error ? requestError.message : "Unable to connect to Supabase."
      )
      return
    }

    setIsLoggingOut(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    router.push("/login")
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2 border-l border-border pl-4 sm:pl-6">
      <nav aria-label="Account" className="flex items-center">
        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleLogOut}
            disabled={isLoggingOut}
            className={`inline-flex min-h-9 min-w-[4.5rem] items-center justify-center rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 ${focusRing}`}
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        ) : (
          <Link
            href="/login"
            className={`inline-flex min-h-9 min-w-[4.5rem] items-center justify-center rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 ${focusRing}`}
          >
            Log in
          </Link>
        )}
      </nav>
      {errorMessage ? (
        <p className="hidden text-xs text-red-600 md:block" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
