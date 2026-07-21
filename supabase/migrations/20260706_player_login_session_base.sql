create extension if not exists pgcrypto;

alter table if exists public.players
  add column if not exists role text not null default 'player';

alter table if exists public.players
  add column if not exists password_hash text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'players_role_check'
      and conrelid = 'public.players'::regclass
  ) then
    alter table public.players
      add constraint players_role_check
      check (role in ('admin', 'player'));
  end if;
end $$;

update public.players
set role = 'admin'
where lower(id) in ('admin', 'jachym')
  and role <> 'admin';

update public.players
set password_hash = extensions.crypt(id, extensions.gen_salt('bf'))
where password_hash is null;

create table if not exists public.player_sessions (
  id uuid primary key default gen_random_uuid(),
  player_id text not null references public.players(id) on delete cascade,
  device_id text not null,
  session_token_hash text not null,
  status text not null default 'active' check (status in ('active', 'ended', 'revoked')),
  login_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  logout_at timestamptz,
  revoked_by_admin boolean not null default false
);

create index if not exists idx_player_sessions_player_status
  on public.player_sessions (player_id, status);

create index if not exists idx_player_sessions_last_seen
  on public.player_sessions (last_seen_at);

create unique index if not exists idx_player_sessions_token_hash
  on public.player_sessions (session_token_hash);

alter table if exists public.player_sessions
  enable row level security;

revoke all on table public.player_sessions from anon;
revoke all on table public.player_sessions from authenticated;

create or replace function public.verify_login(
  p_player_id text,
  p_password text,
  p_device_id text
)
returns table (
  session_token text,
  player_id text,
  player_name text,
  role text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_player public.players%rowtype;
  v_session_token text;
begin
  select *
  into v_player
  from public.players
  where id = p_player_id
    and active = true
  limit 1;

  if not found then
    return;
  end if;

  if v_player.password_hash is null then
    return;
  end if;

  if extensions.crypt(p_password, v_player.password_hash) <> v_player.password_hash then
    return;
  end if;

  update public.player_sessions ps
  set status = 'ended',
      logout_at = now()
  where ps.player_id = v_player.id
    and ps.device_id = p_device_id
    and ps.status = 'active';

  v_session_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.player_sessions (
    player_id,
    device_id,
    session_token_hash,
    status,
    login_at,
    last_seen_at,
    revoked_by_admin
  )
  values (
    v_player.id,
    p_device_id,
    encode(extensions.digest(v_session_token, 'sha256'), 'hex'),
    'active',
    now(),
    now(),
    false
  );

  return query
  select
    v_session_token,
    v_player.id,
    v_player.name,
    v_player.role;
end;
$$;

create or replace function public.heartbeat_session(
  p_session_token text
)
returns table (
  status text,
  player_id text,
  role text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_session public.player_sessions%rowtype;
  v_role text;
begin
  select ps.*
  into v_session
  from public.player_sessions ps
  where ps.session_token_hash = encode(extensions.digest(p_session_token, 'sha256'), 'hex')
  limit 1;

  if not found then
    return query select 'invalid'::text, null::text, null::text;
    return;
  end if;

  select p.role
  into v_role
  from public.players p
  where p.id = v_session.player_id
  limit 1;

  if v_session.status = 'revoked' then
    return query select 'revoked'::text, v_session.player_id, v_role;
    return;
  end if;

  if v_session.status <> 'active' then
    return query select 'ended'::text, v_session.player_id, v_role;
    return;
  end if;

  update public.player_sessions
  set last_seen_at = now()
  where id = v_session.id;

  return query select 'active'::text, v_session.player_id, v_role;
end;
$$;

create or replace function public.logout_session(
  p_session_token text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update public.player_sessions
  set status = case
                 when status = 'active' then 'ended'
                 else status
               end,
      logout_at = now()
  where session_token_hash = encode(extensions.digest(p_session_token, 'sha256'), 'hex');
end;
$$;

create or replace function public.revoke_player_sessions(
  p_player_id text
)
returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_count bigint;
begin
  update public.player_sessions
  set status = 'revoked',
      revoked_by_admin = true,
      logout_at = now()
  where player_id = p_player_id
    and status = 'active';

  get diagnostics v_count = row_count;

  return v_count;
end;
$$;

create or replace function public.get_player_activity(
  p_ttl_seconds integer default 120
)
returns table (
  player_id text,
  is_online boolean,
  last_seen_at timestamptz,
  active_sessions bigint
)
language sql
security definer
set search_path = public, extensions
as $$
  select
    p.id as player_id,
    coalesce(activity.is_online, false) as is_online,
    activity.last_seen_at,
    coalesce(activity.active_sessions, 0) as active_sessions
  from public.players p
  left join lateral (
    select
      max(ps.last_seen_at) as last_seen_at,
      count(*) filter (where ps.status = 'active') as active_sessions,
      bool_or(
        ps.status = 'active'
        and ps.last_seen_at >= now() - make_interval(secs => greatest(p_ttl_seconds, 1))
      ) as is_online
    from public.player_sessions ps
    where ps.player_id = p.id
  ) activity on true
  order by p.id;
$$;

revoke all on function public.verify_login(text, text, text) from public;
revoke all on function public.heartbeat_session(text) from public;
revoke all on function public.logout_session(text) from public;
revoke all on function public.revoke_player_sessions(text) from public;
revoke all on function public.get_player_activity(integer) from public;

grant execute on function public.verify_login(text, text, text) to anon, authenticated;
grant execute on function public.heartbeat_session(text) to anon, authenticated;
grant execute on function public.logout_session(text) to anon, authenticated;
grant execute on function public.revoke_player_sessions(text) to anon, authenticated;
grant execute on function public.get_player_activity(integer) to anon, authenticated;

notify pgrst, 'reload schema';
