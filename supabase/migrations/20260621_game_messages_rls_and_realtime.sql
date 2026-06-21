alter table if exists public.game_messages
  enable row level security;

drop policy if exists game_messages_select_all on public.game_messages;
drop policy if exists game_messages_insert_all on public.game_messages;

drop policy if exists "game_messages_select_online_games" on public.game_messages;
create policy "game_messages_select_online_games"
  on public.game_messages
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.online_sessions os
      where os.id = game_messages.game_id
    )
  );

drop policy if exists "game_messages_insert_online_games" on public.game_messages;
create policy "game_messages_insert_online_games"
  on public.game_messages
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.online_sessions os
      where os.id = game_messages.game_id
    )
  );

grant select, insert on public.game_messages to anon;
grant select, insert on public.game_messages to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'game_messages'
  ) then
    alter publication supabase_realtime add table public.game_messages;
  end if;
end $$;

notify pgrst, 'reload schema';
