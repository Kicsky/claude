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
