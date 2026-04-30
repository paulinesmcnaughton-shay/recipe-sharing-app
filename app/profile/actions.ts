"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function updateProfileAction(formData: FormData) {
  const displayName = String(formData.get("displayName") ?? "").trim()
  const bio = String(formData.get("bio") ?? "").trim()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  let avatarUrl: string | null = null

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle()

  avatarUrl = existingProfile?.avatar_url ?? null

  const avatarFile = formData.get("avatar")
  if (avatarFile instanceof File && avatarFile.size > 0) {
    const fileExtension = avatarFile.name.split(".").pop()?.toLowerCase() || "jpg"
    const avatarPath = `${user.id}/${crypto.randomUUID()}.${fileExtension}`

    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(avatarPath, avatarFile, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      redirect(`/profile?error=${encodeURIComponent(`Avatar upload failed: ${uploadError.message}`)}`)
    }

    const { data: publicUrlData } = supabase.storage
      .from("profile-images")
      .getPublicUrl(avatarPath)

    avatarUrl = publicUrlData.publicUrl
  }

  const { error: updateError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: displayName || null,
      bio: bio || null,
      avatar_url: avatarUrl,
    },
    {
      onConflict: "id",
    }
  )

  if (updateError) {
    redirect(`/profile?error=${encodeURIComponent(updateError.message)}`)
  }

  revalidatePath("/profile")
  redirect("/profile?saved=true")
}
