"use client"

import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface AuthFormProps {
  mode: "login" | "signup"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")
    setIsSubmitting(true)

    let response

    try {
      const supabase = createClient()
      response =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password })
    } catch (error) {
      setIsSubmitting(false)
      setErrorMessage(error instanceof Error ? error.message : "Unable to connect to Supabase.")
      return
    }

    setIsSubmitting(false)

    if (response.error) {
      setErrorMessage(response.error.message)
      return
    }

    router.push("/recipes")
    router.refresh()
  }

  const title = mode === "login" ? "Log in" : "Sign up"
  const submitLabel =
    mode === "login"
      ? isSubmitting
        ? "Logging in..."
        : "Log in"
      : isSubmitting
        ? "Creating account..."
        : "Create account"

  return (
    <section className="mx-auto w-full max-w-md px-4 py-12 sm:px-6" aria-labelledby="auth-title">
      <h1 id="auth-title" className="text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Use your email and password to continue.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor={`${mode}-email`} className="mb-1.5 block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id={`${mode}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor={`${mode}-password`} className="mb-1.5 block text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id={`${mode}-password`}
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            placeholder="At least 6 characters"
          />
        </div>

        {errorMessage ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitLabel}
        </button>
      </form>
    </section>
  )
}
