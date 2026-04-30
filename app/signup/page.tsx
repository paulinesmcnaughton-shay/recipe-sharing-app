import Link from "next/link"
import { signupAction } from "@/app/auth/actions"
import { FormSubmitButton } from "@/components/form-submit-button"

type SignupPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const resolvedSearchParams = await searchParams

  return (
    <section className="mx-auto w-full max-w-md px-4 py-12 sm:px-6" aria-labelledby="auth-title">
      <h1 id="auth-title" className="text-2xl font-semibold tracking-tight text-foreground">
        Sign up
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Use your email and password to continue.</p>

      <form className="mt-6 space-y-4" action={signupAction}>
        <div>
          <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
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

        <FormSubmitButton idleText="Create account" loadingText="Creating account..." />
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </section>
  )
}
