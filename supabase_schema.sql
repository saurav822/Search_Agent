-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Search Agents table
create table if not exists search_agents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  llm_provider text not null,
  model_id text not null,
  api_key text not null,
  system_prompt text not null,
  output_columns jsonb not null default '[]',
  slug text unique not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security: users can only access their own agents
alter table search_agents enable row level security;

create policy "Users can view own agents"
  on search_agents for select
  using (auth.uid() = user_id);

create policy "Users can insert own agents"
  on search_agents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own agents"
  on search_agents for update
  using (auth.uid() = user_id);

create policy "Users can delete own agents"
  on search_agents for delete
  using (auth.uid() = user_id);

-- Search Logs table (usage tracking)
create table if not exists search_logs (
  id uuid default gen_random_uuid() primary key,
  agent_id uuid references search_agents(id) on delete cascade not null,
  query text not null,
  created_at timestamptz default now()
);

-- Migrations: run these if table already exists
alter table search_agents add column if not exists final_prompt text;
alter table search_agents add column if not exists result_count integer default 10;
alter table search_agents add column if not exists result_count_max integer default null;

-- Index for faster slug lookups on the public search endpoint
create index if not exists search_agents_slug_idx on search_agents(slug);
create index if not exists search_agents_user_id_idx on search_agents(user_id);
