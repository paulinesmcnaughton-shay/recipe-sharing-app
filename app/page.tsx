import Image from "next/image"

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Save and share recipes you'll actually use!
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Browse trusted recipes, save your favorites, and add your own — all
            in one simple, clutter-free space.
          </p>
        </div>
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
          <Image
            src="https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=80"
            alt="A beautifully plated steak dish"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  )
}
