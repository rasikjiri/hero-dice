drop function if exists public.set_player_password(text, text, text);

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
  set password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf'))
  where id = p_player_id;

  return true;
end;
$$;

revoke all on function public.set_player_password(text, text, text) from public;
grant execute on function public.set_player_password(text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
