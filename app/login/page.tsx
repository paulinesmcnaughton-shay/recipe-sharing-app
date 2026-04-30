import Link from "next/link"
import { loginAction } from "@/app/auth/actions"
import { FormSubmitButton } from "@/components/form-submit-button"

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams

  return (
    <section className="mx-auto w-full max-w-md px-4 py-12 sm:px-6" aria-labelledby="auth-title">
      <h1 id="auth-title" className="text-2xl font-semibold tracking-tight text-foreground">
        Log in
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Use your email and password to continue.</p>

      <form className="mt-6 space-y-4" action={loginAction}>
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            placeholder="At least 6 characters"
          />
        </div>

        {resolvedSearchParams.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {resolvedSearchParams.error}
          </p>
        ) : null}

        <FormSubmitButton idleText="Log in" loadingText="Logging in..." />
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        No account yet?{" "}
        <Link href="/signup" className="underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </section>
  )
}
