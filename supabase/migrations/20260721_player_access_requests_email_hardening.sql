create extension if not exists pgcrypto;

alter table if exists public.players
  add column if not exists email text,
  add column if not exists password_plain text;

alter table if exists public.player_access_requests
  add column if not exists requested_password_plain text;

create table if not exists public.player_access_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('registration', 'password_reset')),
  player_id text not null,
  player_name text,
  email text not null,
  requested_password_hash text not null,
  requested_password_plain text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by_player_id text references public.players(id) on delete set null
);

create index if not exists idx_player_access_requests_status_created
  on public.player_access_requests (status, created_at desc);

create unique index if not exists idx_player_access_requests_unique_pending
  on public.player_access_requests (request_type, player_id)
  where status = 'pending';

create or replace function public.submit_player_access_request(
  p_request_type text,
  p_player_id text,
  p_player_name text,
  p_email text,
  p_password text
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_request_type text := lower(trim(coalesce(p_request_type, '')));
  v_player_id text := lower(trim(coalesce(p_player_id, '')));
  v_player_name text := trim(coalesce(p_player_name, ''));
  v_email text := lower(trim(coalesce(p_email, '')));
  v_password text := trim(coalesce(p_password, ''));
  v_player_email text;
  v_request_id uuid;
begin
  if v_request_type not in ('registration', 'password_reset') then
    raise exception using message = 'Neplatny typ zadosti.';
  end if;

  if v_player_id !~ '^[a-z]+$' then
    raise exception using message = 'ID hrace muze obsahovat pouze mala pismena.';
  end if;

  if length(v_player_id) = 0 or length(v_player_id) > 6 then
    raise exception using message = 'ID hrace musi mit 1 az 6 znaku.';
  end if;

  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception using message = 'Zadej platny e-mail.';
  end if;

  if length(v_password) < 6 then
    raise exception using message = 'Heslo musi mit alespon 6 znaku.';
  end if;

  if v_request_type = 'registration' then
    if length(v_player_name) = 0 then
      raise exception using message = 'Vypln jmeno hrace.';
    end if;

    if exists (
      select 1
      from public.players p
      where lower(p.id) = v_player_id
    ) then
      raise exception using message = 'Hrac s timto ID jiz existuje.';
    end if;
  else
    select lower(trim(coalesce(p.email, '')))
    into v_player_email
    from public.players p
    where lower(p.id) = v_player_id
    limit 1;

    if v_player_email is null then
      raise exception using message = 'Hrac s timto ID nebyl nalezen.';
    end if;

    if length(v_player_email) = 0 then
      raise exception using message = 'Pro tohoto hrace neni nastaven e-mail. Kontaktuj admina.';
    end if;

    if v_player_email <> v_email then
      raise exception using message = 'E-mail neodpovida evidovanemu e-mailu hrace.';
    end if;
  end if;

  if exists (
    select 1
    from public.player_access_requests r
    where r.request_type = v_request_type
      and r.player_id = v_player_id
      and r.status = 'pending'
  ) then
    raise exception using message = 'Pro tohoto hrace jiz existuje nevyrizena zadost.';
  end if;

  insert into public.player_access_requests (
    request_type,
    player_id,
    player_name,
    email,
    requested_password_hash,
    requested_password_plain
  )
  values (
    v_request_type,
    v_player_id,
    case when v_request_type = 'registration' then v_player_name else null end,
    v_email,
    extensions.crypt(v_password, extensions.gen_salt('bf')),
    v_password
  )
  returning id into v_request_id;

  return v_request_id;
end;
$$;

create or replace function public.process_player_access_request(
  p_admin_session_token text,
  p_request_id uuid,
  p_action text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_admin_player_id text;
  v_is_admin boolean;
  v_request public.player_access_requests%rowtype;
  v_action text := lower(trim(coalesce(p_action, '')));
begin
  if v_action not in ('approve', 'reject') then
    raise exception using message = 'Neplatna akce.';
  end if;

  select ps.player_id
  into v_admin_player_id
  from public.player_sessions ps
  where ps.session_token_hash = encode(extensions.digest(p_admin_session_token, 'sha256'), 'hex')
    and ps.status = 'active'
  limit 1;

  if v_admin_player_id is null then
    raise exception using message = 'Neplatna nebo neaktivni admin session.';
  end if;

  select (p.role = 'admin')
  into v_is_admin
  from public.players p
  where p.id = v_admin_player_id
  limit 1;

  if coalesce(v_is_admin, false) = false then
    raise exception using message = 'Pouze admin muze zpracovat zadost.';
  end if;

  select *
  into v_request
  from public.player_access_requests r
  where r.id = p_request_id
    and r.status = 'pending'
  for update;

  if not found then
    raise exception using message = 'Zadost nebyla nalezena nebo jiz byla zpracovana.';
  end if;

  if v_action = 'approve' then
    if v_request.request_type = 'registration' then
      if exists (
        select 1
        from public.players p
        where p.id = v_request.player_id
      ) then
        raise exception using message = 'Hrac s timto ID jiz existuje.';
      end if;

      insert into public.players (
        id,
        name,
        active,
        role,
        password_hash,
        password_plain,
        email
      )
      values (
        v_request.player_id,
        coalesce(v_request.player_name, v_request.player_id),
        true,
        'player',
        v_request.requested_password_hash,
        v_request.requested_password_plain,
        v_request.email
      );
    else
      update public.players
      set password_hash = v_request.requested_password_hash,
          password_plain = coalesce(v_request.requested_password_plain, password_plain),
          active = true
      where id = v_request.player_id;

      update public.player_sessions
      set status = 'revoked',
          revoked_by_admin = true,
          logout_at = now()
      where player_id = v_request.player_id
        and status = 'active';
    end if;

    update public.player_access_requests
    set status = 'approved',
        reviewed_at = now(),
        reviewed_by_player_id = v_admin_player_id
    where id = v_request.id;

    return true;
  end if;

  update public.player_access_requests
  set status = 'rejected',
      reviewed_at = now(),
      reviewed_by_player_id = v_admin_player_id
  where id = v_request.id;

  return true;
end;
$$;

create or replace function public.list_player_access_requests(
  p_admin_session_token text
)
returns table (
  id uuid,
  request_type text,
  player_id text,
  player_name text,
  email text,
  status text,
  created_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by_player_id text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_admin_player_id text;
  v_is_admin boolean;
begin
  select ps.player_id
  into v_admin_player_id
  from public.player_sessions ps
  where ps.session_token_hash = encode(extensions.digest(p_admin_session_token, 'sha256'), 'hex')
    and ps.status = 'active'
  limit 1;

  if v_admin_player_id is null then
    raise exception using message = 'Neplatna nebo neaktivni admin session.';
  end if;

  select (p.role = 'admin')
  into v_is_admin
  from public.players p
  where p.id = v_admin_player_id
  limit 1;

  if coalesce(v_is_admin, false) = false then
    raise exception using message = 'Pouze admin muze zobrazit zadosti.';
  end if;

  return query
  select
    r.id,
    r.request_type,
    r.player_id,
    r.player_name,
    r.email,
    r.status,
    r.created_at,
    r.reviewed_at,
    r.reviewed_by_player_id
  from public.player_access_requests r
  order by
    case when r.status = 'pending' then 0 else 1 end,
    r.created_at desc;
end;
$$;

create or replace function public.count_pending_player_access_requests(
  p_admin_session_token text
)
returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_admin_player_id text;
  v_is_admin boolean;
  v_count bigint;
begin
  select ps.player_id
  into v_admin_player_id
  from public.player_sessions ps
  where ps.session_token_hash = encode(extensions.digest(p_admin_session_token, 'sha256'), 'hex')
    and ps.status = 'active'
  limit 1;

  if v_admin_player_id is null then
    raise exception using message = 'Neplatna nebo neaktivni admin session.';
  end if;

  select (p.role = 'admin')
  into v_is_admin
  from public.players p
  where p.id = v_admin_player_id
  limit 1;

  if coalesce(v_is_admin, false) = false then
    raise exception using message = 'Pouze admin muze zobrazit pocet zadosti.';
  end if;

  select count(*)
  into v_count
  from public.player_access_requests r
  where r.status = 'pending';

  return coalesce(v_count, 0);
end;
$$;

create or replace function public.set_player_password(
  p_admin_session_token text,
  p_new_password text,
  p_player_id text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_admin_player_id text;
  v_is_admin boolean;
begin
  if coalesce(length(trim(p_new_password)), 0) < 6 then
    raise exception using message = 'Heslo musi mit alespon 6 znaku.';
  end if;

  select ps.player_id
  into v_admin_player_id
  from public.player_sessions ps
  where ps.session_token_hash = encode(extensions.digest(p_admin_session_token, 'sha256'), 'hex')
    and ps.status = 'active'
  limit 1;

  if v_admin_player_id is null then
    raise exception using message = 'Neplatna nebo neaktivni admin session.';
  end if;

  select (p.role = 'admin')
  into v_is_admin
  from public.players p
  where p.id = v_admin_player_id
  limit 1;

  if coalesce(v_is_admin, false) = false then
    raise exception using message = 'Pouze admin muze menit hesla hracu.';
  end if;

  if not exists (
    select 1
    from public.players p
    where p.id = p_player_id
  ) then
    raise exception using message = 'Hrac nebyl nalezen.';
  end if;

  update public.players
  set password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
      password_plain = p_new_password
  where id = p_player_id;

  return true;
end;
$$;

revoke all on function public.submit_player_access_request(text, text, text, text, text) from public;
revoke all on function public.list_player_access_requests(text) from public;
revoke all on function public.count_pending_player_access_requests(text) from public;
revoke all on function public.process_player_access_request(text, uuid, text) from public;
revoke all on function public.set_player_password(text, text, text) from public;

grant execute on function public.submit_player_access_request(text, text, text, text, text) to anon, authenticated;
grant execute on function public.list_player_access_requests(text) to anon, authenticated;
grant execute on function public.count_pending_player_access_requests(text) to anon, authenticated;
grant execute on function public.process_player_access_request(text, uuid, text) to anon, authenticated;
grant execute on function public.set_player_password(text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
