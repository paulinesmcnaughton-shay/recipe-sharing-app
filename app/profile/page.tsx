import Link from "next/link"
import { updateProfileAction } from "@/app/profile/actions"
import { FormSubmitButton } from "@/components/form-submit-button"
import type { Tables } from "@/lib/supabase/database.types"
import { createClient } from "@/lib/supabase/server"

type ProfilePageProps = {
  searchParams: Promise<{ error?: string; saved?: string }>
}

type ProfileRow = Pick<Tables<"profiles">, "id" | "display_name" | "bio" | "avatar_url">

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Profile
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Please log in to view and update your profile.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex min-h-10 items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
        >
          Go to login
        </Link>
      </section>
    )
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, bio, avatar_url")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Profile
        </h1>
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {profileError.message}
        </p>
      </section>
    )
  }

  const profile = profileData as ProfileRow | null

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6" aria-labelledby="profile-heading">
      <div className="flex items-start gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Current profile avatar"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
              No avatar
            </div>
          )}
          <label
            htmlFor="profile-avatar"
            className="absolute inset-x-0 bottom-0 cursor-pointer bg-black/60 px-2 py-1 text-center text-xs font-medium text-white transition hover:bg-black/75 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Change
          </label>
        </div>

        <div className="min-w-0">
          <h1 id="profile-heading" className="text-2xl font-semibold tracking-tight text-foreground">
            Profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Update your display name, bio, and avatar image.
          </p>
        </div>
      </div>

      {resolvedSearchParams.saved === "true" ? (
        <p className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          Profile updated successfully.
        </p>
      ) : null}

      {resolvedSearchParams.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {resolvedSearchParams.error}
        </p>
      ) : null}

      <form className="mt-6 space-y-4" action={updateProfileAction}>
        <input
          id="profile-avatar"
          name="avatar"
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Choose a new profile avatar image"
        />

        <div>
          <label htmlFor="profile-display-name" className="mb-1.5 block text-sm font-medium text-foreground">
            Display name
          </label>
          <input
            id="profile-display-name"
            name="displayName"
            defaultValue={profile?.display_name ?? ""}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="profile-bio" className="mb-1.5 block text-sm font-medium text-foreground">
            Bio
          </label>
          <textarea
            id="profile-bio"
            name="bio"
            rows={4}
            defaultValue={profile?.bio ?? ""}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            placeholder="Tell people a little about yourself."
          />
        </div>

        <FormSubmitButton idleText="Save profile" loadingText="Saving profile..." />
      </form>
    </section>
  )
}
