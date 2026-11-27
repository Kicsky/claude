-- Calisthenics : base de données des comptes (Supabase).
-- À exécuter une fois dans Supabase → SQL Editor → New query → Run.

-- Une ligne par compte : toute la progression au format JSON.
create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Sécurité : chaque personne ne peut lire et modifier que sa propre progression.
alter table public.progress enable row level security;

drop policy if exists "progress_select_own" on public.progress;
create policy "progress_select_own" on public.progress
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "progress_insert_own" on public.progress;
create policy "progress_insert_own" on public.progress
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "progress_update_own" on public.progress;
create policy "progress_update_own" on public.progress
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "progress_delete_own" on public.progress;
create policy "progress_delete_own" on public.progress
  for delete to authenticated using (auth.uid() = user_id);

-- Suppression de compte depuis l'application (bouton « Supprimer mon compte »).
-- Supprime l'utilisateur connecté ; sa progression part avec (on delete cascade).
create or replace function public.delete_account()
returns void
language sql
security definer
set search_path = public
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;

-- ---------------------------------------------------------------------------
-- Rappels de séance (notifications) : un abonnement par appareil, avec ou sans compte.
-- Le site ne peut ni lire ni lister les abonnements : il passe par les deux fonctions
-- ci-dessous. L'envoi (scripts/rappels.mjs) utilise la clé serveur, gardée dans GitHub.
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  subscription jsonb not null,
  days smallint[] not null default '{1,3,5}',
  hour smallint not null default 18,
  tz text not null default 'Europe/Paris',
  ctx jsonb not null default '{}',
  last_sent_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;

-- Enregistre ou met à jour l'abonnement d'un appareil (jours 1 = lundi … 7 = dimanche).
create or replace function public.save_push(p_subscription jsonb, p_days smallint[], p_hour smallint, p_tz text, p_ctx jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ep text := p_subscription->>'endpoint';
  zone text := coalesce(nullif(p_tz, ''), 'Europe/Paris');
begin
  if ep is null or ep !~ '^https://' or length(ep) > 1000 then raise exception 'abonnement invalide'; end if;
  if p_hour is null or p_hour < 0 or p_hour > 23 then raise exception 'heure invalide'; end if;
  if p_days is null or cardinality(p_days) = 0 or exists (select 1 from unnest(p_days) d where d < 1 or d > 7) then raise exception 'jours invalides'; end if;
  if length(p_subscription::text) > 3000 or length(coalesce(p_ctx, '{}')::text) > 2000 then raise exception 'données trop longues'; end if;
  if not exists (select 1 from pg_timezone_names where name = zone) then zone := 'Europe/Paris'; end if;
  insert into push_subscriptions (endpoint, subscription, days, hour, tz, ctx, updated_at)
  values (ep, p_subscription, p_days, p_hour, zone, coalesce(p_ctx, '{}'), now())
  on conflict (endpoint) do update
    set subscription = excluded.subscription, days = excluded.days, hour = excluded.hour,
        tz = excluded.tz, ctx = excluded.ctx, updated_at = now();
end;
$$;

-- Supprime l'abonnement d'un appareil (rappels désactivés).
create or replace function public.delete_push(p_endpoint text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from push_subscriptions where endpoint = p_endpoint;
$$;

revoke all on function public.save_push(jsonb, smallint[], smallint, text, jsonb) from public;
grant execute on function public.save_push(jsonb, smallint[], smallint, text, jsonb) to anon, authenticated;
revoke all on function public.delete_push(text) from public;
grant execute on function public.delete_push(text) to anon, authenticated;
