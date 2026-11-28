-- Bilan de départ et défis du jour (stockés dans le profil, protégés par la RLS existante)
alter table public.profiles add column if not exists assessments jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists challenges jsonb not null default '[]'::jsonb;
