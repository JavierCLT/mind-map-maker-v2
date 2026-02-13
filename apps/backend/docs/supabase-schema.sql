-- Run this in Supabase SQL editor.
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free',
  subscription_status text not null default 'free',
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mindmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic text not null,
  markdown text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_mindmaps_user_updated_at on public.mindmaps(user_id, updated_at desc);
create index if not exists idx_mindmaps_user_created_at on public.mindmaps(user_id, created_at desc);
create unique index if not exists idx_profiles_stripe_customer_id_unique on public.profiles(stripe_customer_id) where stripe_customer_id is not null;
create unique index if not exists idx_profiles_stripe_subscription_id_unique on public.profiles(stripe_subscription_id) where stripe_subscription_id is not null;

alter table public.profiles enable row level security;
alter table public.mindmaps enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id);

drop policy if exists "mindmaps_select_own" on public.mindmaps;
create policy "mindmaps_select_own"
on public.mindmaps for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "mindmaps_insert_own" on public.mindmaps;
create policy "mindmaps_insert_own"
on public.mindmaps for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "mindmaps_update_own" on public.mindmaps;
create policy "mindmaps_update_own"
on public.mindmaps for update
to authenticated
using (auth.uid() = user_id);

drop policy if exists "mindmaps_delete_own" on public.mindmaps;
create policy "mindmaps_delete_own"
on public.mindmaps for delete
to authenticated
using (auth.uid() = user_id);
