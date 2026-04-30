type PagePlaceholderProps = {
  title: string
  description: string
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}
