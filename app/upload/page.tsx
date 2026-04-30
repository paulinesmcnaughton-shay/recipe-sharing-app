"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { TablesInsert } from "@/lib/supabase/database.types"

export default function UploadPage() {
  const router = useRouter()

  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [ingredients, setIngredients] = useState("")
  const [instructions, setInstructions] = useState("")
  const [prepTimeMinutes, setPrepTimeMinutes] = useState("")
  const [cookTimeMinutes, setCookTimeMinutes] = useState("")
  const [difficulty, setDifficulty] = useState("easy")
  const [category, setCategory] = useState("breakfast")
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    let isMounted = true

    async function checkSession() {
      let supabase
      try {
        supabase = createClient()
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to connect to Supabase.")
        setIsCheckingAuth(false)
        return
      }

      const { data, error } = await supabase.auth.getUser()
      if (!isMounted) return

      if (error) {
        setErrorMessage(error.message)
        setIsCheckingAuth(false)
        return
      }

      setIsAuthenticated(Boolean(data.user))
      setIsCheckingAuth(false)
    }

    void checkSession()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")
    setIsSubmitting(true)

    let supabase
    try {
      supabase = createClient()
    } catch (error) {
      setIsSubmitting(false)
      setErrorMessage(error instanceof Error ? error.message : "Unable to connect to Supabase.")
      return
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setIsSubmitting(false)
      setErrorMessage("You must be logged in before uploading a recipe.")
      return
    }

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      setIsSubmitting(false)
      setErrorMessage("Difficulty must be easy, medium, or hard.")
      return
    }

    if (!["breakfast", "lunch", "dinner"].includes(category)) {
      setIsSubmitting(false)
      setErrorMessage("Category must be breakfast, lunch, or dinner.")
      return
    }

    let imageUrl: string | null = null

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop()?.toLowerCase() || "jpg"
      const imagePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("recipe-images")
        .upload(imagePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        setIsSubmitting(false)
        setErrorMessage(
          `Image upload failed: ${uploadError.message}. Make sure the "recipe-images" bucket exists and has proper policies.`
        )
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from("recipe-images")
        .getPublicUrl(imagePath)

      imageUrl = publicUrlData.publicUrl
    }

    const newRecipe: TablesInsert<"recipes"> = {
      author_id: user.id,
      title,
      description: description || null,
      ingredients,
      instructions,
      image_url: imageUrl,
      difficulty,
      category,
      prep_time_minutes: prepTimeMinutes ? Number(prepTimeMinutes) : null,
      cook_time_minutes: cookTimeMinutes ? Number(cookTimeMinutes) : null,
    }

    const { data: insertedRecipe, error: insertError } = await supabase
      .from("recipes")
      .insert(newRecipe)
      .select("id")
      .single()

    setIsSubmitting(false)

    if (insertError) {
      setErrorMessage(insertError.message)
      return
    }

    router.push(`/recipes/${insertedRecipe.id}`)
    router.refresh()
  }

  if (isCheckingAuth) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6" aria-busy="true" aria-live="polite">
        <div className="h-8 w-44 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-72 animate-pulse rounded bg-muted" />

        <div className="mt-6 space-y-4">
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-20 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-28 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-40 w-full animate-pulse rounded-md bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
        </div>
      </section>
    )
  }

  if (!isAuthenticated) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Upload a recipe
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Please log in first to upload recipes.
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

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6" aria-labelledby="upload-heading">
      <h1 id="upload-heading" className="text-2xl font-semibold tracking-tight text-foreground">
        Upload a recipe
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Share title, ingredients, steps, and an optional image.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            placeholder="Best banana bread"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-foreground">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            placeholder="A soft and simple loaf for beginners."
          />
        </div>

        <div>
          <label htmlFor="ingredients" className="mb-1.5 block text-sm font-medium text-foreground">
            Ingredients
          </label>
          <textarea
            id="ingredients"
            name="ingredients"
            required
            rows={6}
            value={ingredients}
            onChange={(event) => setIngredients(event.target.value)}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            placeholder={"2 bananas\n1 cup flour\n1/2 cup sugar"}
          />
        </div>

        <div>
          <label htmlFor="instructions" className="mb-1.5 block text-sm font-medium text-foreground">
            Instructions
          </label>
          <textarea
            id="instructions"
            name="instructions"
            required
            rows={8}
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            placeholder={"1. Preheat oven...\n2. Mix ingredients...\n3. Bake for 40 minutes..."}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="difficulty" className="mb-1.5 block text-sm font-medium text-foreground">
              Difficulty
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-foreground">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="prep-time" className="mb-1.5 block text-sm font-medium text-foreground">
              Prep time (minutes, optional)
            </label>
            <input
              id="prep-time"
              name="prep-time"
              type="number"
              min={0}
              value={prepTimeMinutes}
              onChange={(event) => setPrepTimeMinutes(event.target.value)}
              className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>

          <div>
            <label htmlFor="cook-time" className="mb-1.5 block text-sm font-medium text-foreground">
              Cook time (minutes, optional)
            </label>
            <input
              id="cook-time"
              name="cook-time"
              type="number"
              min={0}
              value={cookTimeMinutes}
              onChange={(event) => setCookTimeMinutes(event.target.value)}
              className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>
        </div>

        <div>
          <label htmlFor="image" className="mb-1.5 block text-sm font-medium text-foreground">
            Recipe image (optional)
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:text-foreground"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Upload works with the Supabase Storage bucket named `recipe-images`.
          </p>
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
          {isSubmitting ? "Uploading recipe..." : "Upload recipe"}
        </button>
      </form>
    </section>
  )
}
