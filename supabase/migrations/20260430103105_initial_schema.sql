-- RecipeShare initial schema (MVP)
-- Creates:
-- profiles, recipes, favorites, tags, recipe_tags
-- Plus RLS policies and auth->profile trigger

create extension if not exists "pgcrypto";

-- Keep updated_at current on row updates
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  ingredients text not null,
  instructions text not null,
  image_url text,
  prep_time_minutes integer check (prep_time_minutes is null or prep_time_minutes >= 0),
  cook_time_minutes integer check (cook_time_minutes is null or cook_time_minutes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger recipes_set_updated_at
before update on public.recipes
for each row
execute function public.set_updated_at();

create index if not exists recipes_author_id_idx on public.recipes(author_id);
create index if not exists recipes_created_at_idx on public.recipes(created_at desc);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists favorites_recipe_id_idx on public.favorites(recipe_id);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.recipe_tags (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (recipe_id, tag_id)
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.favorites enable row level security;
alter table public.tags enable row level security;
alter table public.recipe_tags enable row level security;

-- profiles: everyone can read, users can insert/update only self
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
on public.profiles
for select
to public
using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- recipes: everyone can read, users can create/update/delete only own
drop policy if exists "recipes_select_all" on public.recipes;
create policy "recipes_select_all"
on public.recipes
for select
to public
using (true);

drop policy if exists "recipes_insert_own" on public.recipes;
create policy "recipes_insert_own"
on public.recipes
for insert
to authenticated
with check (auth.uid() = author_id);

drop policy if exists "recipes_update_own" on public.recipes;
create policy "recipes_update_own"
on public.recipes
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "recipes_delete_own" on public.recipes;
create policy "recipes_delete_own"
on public.recipes
for delete
to authenticated
using (auth.uid() = author_id);

-- favorites: users read/write only their own favorites
drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
on public.favorites
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
on public.favorites
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own"
on public.favorites
for delete
to authenticated
using (auth.uid() = user_id);

-- tags + recipe_tags are public read for browsing and filtering
drop policy if exists "tags_select_all" on public.tags;
create policy "tags_select_all"
on public.tags
for select
to public
using (true);

drop policy if exists "recipe_tags_select_all" on public.recipe_tags;
create policy "recipe_tags_select_all"
on public.recipe_tags
for select
to public
using (true);
