-- HOMEFORM AI — schéma initial. Toutes les tables sont protégées par RLS :
-- un utilisateur ne voit et ne modifie que ses propres lignes. Les abonnements
-- sont écrits uniquement par le webhook Stripe (clé service role, côté serveur).

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  profile jsonb,
  program jsonb,
  goals jsonb not null default '[]'::jsonb,
  coach_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analyses (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise text check (exercise in ('squat','pushup')),
  status text not null check (status in ('ok','uncertain','rejected')),
  result jsonb not null, -- mesures et observations uniquement, jamais d'image
  has_local_video boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists analyses_user_idx on public.analyses(user_id, created_at desc);

create table if not exists public.workout_logs (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  log jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists workout_logs_user_idx on public.workout_logs(user_id, created_at desc);

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'none' check (status in ('none','active','trialing','past_due','canceled')),
  plan text check (plan in ('monthly','annual')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.analyses enable row level security;
alter table public.workout_logs enable row level security;
alter table public.subscriptions enable row level security;

create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own analyses" on public.analyses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own logs" on public.workout_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- lecture seule pour l'utilisateur ; aucune policy d'écriture => seul le service role écrit
create policy "read own subscription" on public.subscriptions for select using (auth.uid() = user_id);

-- Rétention RGPD : suppression des analyses de plus de 365 jours (à planifier avec pg_cron)
-- select cron.schedule('purge-old-analyses', '0 3 * * *', $$delete from public.analyses where created_at < now() - interval '365 days'$$);
