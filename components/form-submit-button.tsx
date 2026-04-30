"use client"

import { useFormStatus } from "react-dom"

interface FormSubmitButtonProps {
  idleText: string
  loadingText: string
}

export function FormSubmitButton({ idleText, loadingText }: FormSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? loadingText : idleText}
    </button>
  )
}
