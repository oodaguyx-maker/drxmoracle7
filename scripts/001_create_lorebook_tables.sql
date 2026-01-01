-- Create profiles table for user management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Create lorebooks table
create table if not exists public.lorebooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  world_map_url text,
  world_map_data jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.lorebooks enable row level security;

create policy "lorebooks_select_own"
  on public.lorebooks for select
  using (auth.uid() = user_id);

create policy "lorebooks_insert_own"
  on public.lorebooks for insert
  with check (auth.uid() = user_id);

create policy "lorebooks_update_own"
  on public.lorebooks for update
  using (auth.uid() = user_id);

create policy "lorebooks_delete_own"
  on public.lorebooks for delete
  using (auth.uid() = user_id);

create index idx_lorebooks_user_id on public.lorebooks(user_id);

-- Create lore entries table
create table if not exists public.lore_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lorebook_id uuid references public.lorebooks(id) on delete cascade,
  name text not null,
  content text not null,
  keys text[] default '{}',
  importance text default 'medium' check (importance in ('low', 'medium', 'high', 'critical')),
  category text,
  subcategory text,
  entry_type text check (entry_type in ('place', 'person', 'object', 'concept', 'history', 'current', 'legend', 'fact', 'rumor', 'secret', 'common_knowledge')),
  tags text[] default '{}',
  related_entries uuid[] default '{}',
  generated_from_roleplay boolean default false,
  source_node_id text,
  source_character_id text,
  map_position jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.lore_entries enable row level security;

create policy "lore_entries_select_own"
  on public.lore_entries for select
  using (auth.uid() = user_id);

create policy "lore_entries_insert_own"
  on public.lore_entries for insert
  with check (auth.uid() = user_id);

create policy "lore_entries_update_own"
  on public.lore_entries for update
  using (auth.uid() = user_id);

create policy "lore_entries_delete_own"
  on public.lore_entries for delete
  using (auth.uid() = user_id);

create index idx_lore_entries_user_id on public.lore_entries(user_id);
create index idx_lore_entries_lorebook_id on public.lore_entries(lorebook_id);
create index idx_lore_entries_keys on public.lore_entries using gin(keys);

-- Create proposed lore cards table
create table if not exists public.proposed_lore_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id text not null,
  name text not null,
  content text not null,
  keys text[] default '{}',
  importance text default 'medium' check (importance in ('low', 'medium', 'high', 'critical')),
  category text,
  subcategory text,
  entry_type text check (entry_type in ('place', 'person', 'object', 'concept', 'history', 'current', 'legend', 'fact', 'rumor', 'secret', 'common_knowledge')),
  tags text[] default '{}',
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.proposed_lore_cards enable row level security;

create policy "proposed_lore_cards_select_own"
  on public.proposed_lore_cards for select
  using (auth.uid() = user_id);

create policy "proposed_lore_cards_insert_own"
  on public.proposed_lore_cards for insert
  with check (auth.uid() = user_id);

create policy "proposed_lore_cards_update_own"
  on public.proposed_lore_cards for update
  using (auth.uid() = user_id);

create policy "proposed_lore_cards_delete_own"
  on public.proposed_lore_cards for delete
  using (auth.uid() = user_id);

create index idx_proposed_lore_cards_user_id on public.proposed_lore_cards(user_id);
create index idx_proposed_lore_cards_conversation_id on public.proposed_lore_cards(conversation_id);
