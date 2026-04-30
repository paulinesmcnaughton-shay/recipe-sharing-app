alter table public.recipes
add column if not exists difficulty text
check (difficulty is null or difficulty in ('easy', 'medium', 'hard'));

alter table public.recipes
add column if not exists category text
check (category is null or category in ('breakfast', 'lunch', 'dinner'));
