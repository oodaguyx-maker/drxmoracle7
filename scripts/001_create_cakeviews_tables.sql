-- Create cakeviews_videos table for storing video embeds
create table if not exists public.cakeviews_videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  description text,
  url text not null,
  embed_code text not null,
  iframe_code text not null,
  video_id text not null,
  platform text not null,
  thumbnail_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create cakeviews_characters table for character galleries
create table if not exists public.cakeviews_characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create junction table for character-video assignments
create table if not exists public.cakeviews_character_videos (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.cakeviews_characters(id) on delete cascade,
  video_id uuid not null references public.cakeviews_videos(id) on delete cascade,
  display_order int default 0,
  created_at timestamptz default now(),
  unique(character_id, video_id)
);

-- Enable RLS
alter table public.cakeviews_videos enable row level security;
alter table public.cakeviews_characters enable row level security;
alter table public.cakeviews_character_videos enable row level security;

-- RLS Policies for cakeviews_videos
create policy "Users can view their own videos"
  on public.cakeviews_videos for select
  using (auth.uid() = user_id);

create policy "Users can insert their own videos"
  on public.cakeviews_videos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own videos"
  on public.cakeviews_videos for update
  using (auth.uid() = user_id);

create policy "Users can delete their own videos"
  on public.cakeviews_videos for delete
  using (auth.uid() = user_id);

-- RLS Policies for cakeviews_characters
create policy "Users can view their own characters"
  on public.cakeviews_characters for select
  using (auth.uid() = user_id);

create policy "Users can insert their own characters"
  on public.cakeviews_characters for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own characters"
  on public.cakeviews_characters for update
  using (auth.uid() = user_id);

create policy "Users can delete their own characters"
  on public.cakeviews_characters for delete
  using (auth.uid() = user_id);

-- RLS Policies for cakeviews_character_videos
create policy "Users can view their character video assignments"
  on public.cakeviews_character_videos for select
  using (
    exists (
      select 1 from public.cakeviews_characters
      where id = character_id and user_id = auth.uid()
    )
  );

create policy "Users can insert character video assignments"
  on public.cakeviews_character_videos for insert
  with check (
    exists (
      select 1 from public.cakeviews_characters
      where id = character_id and user_id = auth.uid()
    )
  );

create policy "Users can delete their character video assignments"
  on public.cakeviews_character_videos for delete
  using (
    exists (
      select 1 from public.cakeviews_characters
      where id = character_id and user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
create index if not exists cakeviews_videos_user_id_idx on public.cakeviews_videos(user_id);
create index if not exists cakeviews_characters_user_id_idx on public.cakeviews_characters(user_id);
create index if not exists cakeviews_character_videos_character_id_idx on public.cakeviews_character_videos(character_id);
create index if not exists cakeviews_character_videos_video_id_idx on public.cakeviews_character_videos(video_id);
