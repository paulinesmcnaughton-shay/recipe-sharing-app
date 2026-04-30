"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function toggleFavoriteAction(formData: FormData) {
  const recipeId = formData.get("recipeId")
  const currentlyFavorited = formData.get("currentlyFavorited") === "true"

  if (typeof recipeId !== "string" || !recipeId) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  if (currentlyFavorited) {
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("recipe_id", recipeId)
  } else {
    await supabase.from("favorites").insert({
      user_id: user.id,
      recipe_id: recipeId,
    })
  }

  revalidatePath(`/recipes/${recipeId}`)
  revalidatePath("/saved")
}

export async function toggleLikeAction(formData: FormData) {
  const recipeId = formData.get("recipeId")
  const currentlyLiked = formData.get("currentlyLiked") === "true"

  if (typeof recipeId !== "string" || !recipeId) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  if (currentlyLiked) {
    await supabase
      .from("recipe_likes")
      .delete()
      .eq("user_id", user.id)
      .eq("recipe_id", recipeId)
  } else {
    await supabase.from("recipe_likes").insert({
      user_id: user.id,
      recipe_id: recipeId,
    })
  }

  revalidatePath(`/recipes/${recipeId}`)
}

export async function createCommentAction(formData: FormData) {
  const recipeId = formData.get("recipeId")
  const content = formData.get("content")

  if (typeof recipeId !== "string" || !recipeId) return
  if (typeof content !== "string") return

  const trimmedContent = content.trim()
  if (!trimmedContent || trimmedContent.length > 1000) {
    redirect(`/recipes/${recipeId}?commentError=Comment%20must%20be%201-1000%20characters`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?error=Please%20log%20in%20to%20comment`)

  const { error: insertError } = await supabase.from("recipe_comments").insert({
    recipe_id: recipeId,
    user_id: user.id,
    content: trimmedContent,
  })

  if (insertError) {
    const encodedMessage = encodeURIComponent(insertError.message)
    redirect(`/recipes/${recipeId}?commentError=${encodedMessage}`)
  }

  revalidatePath(`/recipes/${recipeId}`)
  redirect(`/recipes/${recipeId}?commented=true`)
}

export async function deleteCommentAction(formData: FormData) {
  const commentId = formData.get("commentId")
  const recipeId = formData.get("recipeId")

  if (typeof commentId !== "string" || !commentId) return
  if (typeof recipeId !== "string" || !recipeId) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { data: existingComment } = await supabase
    .from("recipe_comments")
    .select("id, user_id")
    .eq("id", commentId)
    .maybeSingle()

  if (!existingComment || existingComment.user_id !== user.id) return

  await supabase
    .from("recipe_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id)

  revalidatePath(`/recipes/${recipeId}`)
}

function getStoragePathFromPublicUrl(imageUrl: string) {
  const marker = "/object/public/recipe-images/"
  const markerIndex = imageUrl.indexOf(marker)
  if (markerIndex === -1) return null
  return imageUrl.slice(markerIndex + marker.length)
}

export async function deleteRecipeAction(formData: FormData) {
  const recipeId = formData.get("recipeId")

  if (typeof recipeId !== "string" || !recipeId) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, author_id, image_url")
    .eq("id", recipeId)
    .maybeSingle()

  if (!recipe || recipe.author_id !== user.id) return

  let imageCleanupFailed = false

  if (recipe.image_url) {
    const storagePath = getStoragePathFromPublicUrl(recipe.image_url)
    if (storagePath) {
      const { error: removeError } = await supabase.storage
        .from("recipe-images")
        .remove([storagePath])
      if (removeError) imageCleanupFailed = true
    }
  }

  await supabase.from("recipes").delete().eq("id", recipeId).eq("author_id", user.id)

  revalidatePath("/recipes")
  revalidatePath("/saved")
  if (imageCleanupFailed) {
    redirect("/recipes?warning=image-cleanup-failed")
  }
  redirect("/recipes")
}
