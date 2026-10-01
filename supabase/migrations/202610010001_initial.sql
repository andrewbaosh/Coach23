-- Draft for Supabase PostgreSQL. Not applied by local demo.
begin;
create table public.athletes (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  timezone text not null default 'Asia/Shanghai',
  created_at timestamptz not null default now()
);
create table public.source_records (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  provider text not null check (provider in ('strava','whoop','suunto')),
  record_type text not null check (record_type in ('workout','recovery','sleep')),
  external_id text not null,
  recorded_at timestamptz not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  unique (athlete_id, provider, record_type, external_id)
);
create index source_records_athlete_time on public.source_records(athlete_id, recorded_at desc);
create table public.coach_reviews (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  review_date date not null,
  context jsonb not null,
  proposal jsonb not null,
  status text not null default 'draft' check (status in ('draft','approved','rejected')),
  created_at timestamptz not null default now(),
  unique (athlete_id, review_date)
);
alter table public.athletes enable row level security;
alter table public.source_records enable row level security;
alter table public.coach_reviews enable row level security;
-- Clients read only their own data. Trusted backend performs writes.
create policy athlete_read on public.athletes for select to authenticated using ((select auth.uid()) = id);
create policy source_read on public.source_records for select to authenticated using ((select auth.uid()) = athlete_id);
create policy review_read on public.coach_reviews for select to authenticated using ((select auth.uid()) = athlete_id);
commit;
