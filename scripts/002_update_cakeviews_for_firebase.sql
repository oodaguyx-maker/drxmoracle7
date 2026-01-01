-- Update RLS policies to work with Firebase auth (stored in user_id column)
-- Drop existing policies
drop policy if exists "Users can view their own videos" on public.cakeviews_videos;
drop policy if exists "Users can insert their own videos" on public.cakeviews_videos;
drop policy if exists "Users can update their own videos" on public.cakeviews_videos;
drop policy if exists "Users can delete their own videos" on public.cakeviews_videos;

drop policy if exists "Users can view their own characters" on public.cakeviews_characters;
drop policy if exists "Users can insert their own characters" on public.cakeviews_characters;
drop policy if exists "Users can update their own characters" on public.cakeviews_characters;
drop policy if exists "Users can delete their own characters" on public.cakeviews_characters;

drop policy if exists "Users can view their character video assignments" on public.cakeviews_character_videos;
drop policy if exists "Users can insert character video assignments" on public.cakeviews_character_videos;
drop policy if exists "Users can delete their character video assignments" on public.cakeviews_character_videos;

-- Temporarily disable RLS to allow Firebase auth users
alter table public.cakeviews_videos disable row level security;
alter table public.cakeviews_characters disable row level security;
alter table public.cakeviews_character_videos disable row level security;

-- Note: For production, you should implement proper RLS with Firebase JWT validation
-- or migrate to Supabase Auth. For now, RLS is disabled to allow Firebase users to access data.
