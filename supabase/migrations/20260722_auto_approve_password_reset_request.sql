create extension if not exists pgcrypto;

create or replace function public.submit_and_auto_approve_password_reset_request(
  p_player_id text,
  p_email text,
  p_password text
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_player_id text := lower(trim(coalesce(p_player_id, '')));
  v_email text := lower(trim(coalesce(p_email, '')));
  v_password text := trim(coalesce(p_password, ''));
  v_player_email text;
  v_request_id uuid;
begin
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

  insert into public.player_access_requests (
    request_type,
    player_id,
    player_name,
    email,
    requested_password_hash,
    requested_password_plain,
    status,
    reviewed_at,
    reviewed_by_player_id
  )
  values (
    'password_reset',
    v_player_id,
    null,
    v_email,
    extensions.crypt(v_password, extensions.gen_salt('bf')),
    v_password,
    'approved',
    now(),
    null
  )
  returning id into v_request_id;

  update public.players
  set password_hash = extensions.crypt(v_password, extensions.gen_salt('bf')),
      password_plain = v_password,
      active = true
  where id = v_player_id;

  update public.player_sessions
  set status = 'revoked',
      revoked_by_admin = true,
      logout_at = now()
  where player_id = v_player_id
    and status = 'active';

  return v_request_id;
end;
$$;

revoke all on function public.submit_and_auto_approve_password_reset_request(text, text, text) from public;
grant execute on function public.submit_and_auto_approve_password_reset_request(text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
