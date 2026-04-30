# GatherBites

A Next.js App Router project for sharing and browsing recipes.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Setup (Supabase)

This project includes Supabase client helpers in:

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`

To configure environment variables:

1. Copy the example file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Supabase project values to `.env.local`:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

No database tables are required yet for this step.

## Database Setup (Supabase SQL + RLS)

This project includes a starter schema migration:

- `supabase/migrations/20260430103105_initial_schema.sql`

It creates these tables:

- `profiles`
- `recipes`
- `favorites`
- `tags`
- `recipe_tags`

It also enables Row Level Security policies so:

- anyone can read profiles, recipes, tags, and recipe_tags
- authenticated users can insert/update only their own `profiles`
- authenticated users can insert/update/delete only their own `recipes`
- authenticated users can read/insert/delete only their own `favorites`

To run it in Supabase:

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Paste the migration file contents and run it

After that, auth and ownership constraints are ready for app features.

## Supabase Project Checklist

After creating your Supabase project, verify:

- Auth provider: Email is enabled
- SQL migration was run from `supabase/migrations/20260430103105_initial_schema.sql`
- Tables exist with these fields:
  - `profiles`: `id`, `display_name`, `avatar_url`, `bio`, `created_at`, `updated_at`
  - `recipes`: `id`, `author_id`, `title`, `description`, `ingredients`, `instructions`, `image_url`, `prep_time_minutes`, `cook_time_minutes`, `created_at`, `updated_at`
  - `favorites`: `user_id`, `recipe_id`, `created_at`
  - `tags`: `id`, `name`, `slug`, `created_at`
  - `recipe_tags`: `recipe_id`, `tag_id`, `created_at`
- Storage bucket `recipe-images` exists and policies are applied

This codebase now includes typed Supabase schema definitions in:

- `lib/supabase/database.types.ts`
