"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

function getStoragePathFromPublicUrl(imageUrl: string) {
  const marker = "/object/public/recipe-images/"
  const markerIndex = imageUrl.indexOf(marker)
  if (markerIndex === -1) return null
  return imageUrl.slice(markerIndex + marker.length)
}

export async function updateRecipeAction(formData: FormData) {
  const recipeId = formData.get("recipeId")

  if (typeof recipeId !== "string" || !recipeId) return

  const title = String(formData.get("title") ?? "").trim()
  const descriptionValue = String(formData.get("description") ?? "").trim()
  const ingredients = String(formData.get("ingredients") ?? "").trim()
  const instructions = String(formData.get("instructions") ?? "").trim()
  const difficulty = String(formData.get("difficulty") ?? "").trim()
  const category = String(formData.get("category") ?? "").trim()
  const prepTimeValue = String(formData.get("prepTimeMinutes") ?? "").trim()
  const cookTimeValue = String(formData.get("cookTimeMinutes") ?? "").trim()

  if (!title || !ingredients || !instructions) {
    redirect(`/edit/${recipeId}?error=${encodeURIComponent("Title, ingredients, and instructions are required.")}`)
  }

  const prepTimeMinutes = prepTimeValue ? Number(prepTimeValue) : null
  const cookTimeMinutes = cookTimeValue ? Number(cookTimeValue) : null

  if (
    (prepTimeMinutes !== null && (Number.isNaN(prepTimeMinutes) || prepTimeMinutes < 0)) ||
    (cookTimeMinutes !== null && (Number.isNaN(cookTimeMinutes) || cookTimeMinutes < 0))
  ) {
    redirect(`/edit/${recipeId}?error=${encodeURIComponent("Prep and cook time must be 0 or greater.")}`)
  }

  if (!["easy", "medium", "hard"].includes(difficulty)) {
    redirect(`/edit/${recipeId}?error=${encodeURIComponent("Difficulty must be easy, medium, or hard.")}`)
  }

  if (!["breakfast", "lunch", "dinner"].includes(category)) {
    redirect(`/edit/${recipeId}?error=${encodeURIComponent("Category must be breakfast, lunch, or dinner.")}`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, author_id, image_url")
    .eq("id", recipeId)
    .maybeSingle()

  if (!recipe || recipe.author_id !== user.id) {
    redirect("/recipes")
  }

  let imageUrl: string | null = recipe.image_url
  const imageFile = formData.get("image")

  if (imageFile instanceof File && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop()?.toLowerCase() || "jpg"
    const imagePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("recipe-images")
      .upload(imagePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      redirect(`/edit/${recipeId}?error=${encodeURIComponent(`Image upload failed: ${uploadError.message}`)}`)
    }

    const { data: publicUrlData } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(imagePath)

    imageUrl = publicUrlData.publicUrl

    if (recipe.image_url) {
      const oldStoragePath = getStoragePathFromPublicUrl(recipe.image_url)
      if (oldStoragePath) {
        await supabase.storage.from("recipe-images").remove([oldStoragePath])
      }
    }
  }

  const { error } = await supabase
    .from("recipes")
    .update({
      title,
      description: descriptionValue || null,
      ingredients,
      instructions,
      image_url: imageUrl,
      difficulty,
      category,
      prep_time_minutes: prepTimeMinutes,
      cook_time_minutes: cookTimeMinutes,
    })
    .eq("id", recipeId)
    .eq("author_id", user.id)

  if (error) {
    redirect(`/edit/${recipeId}?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath("/recipes")
  revalidatePath(`/recipes/${recipeId}`)
  redirect(`/recipes/${recipeId}`)
}
