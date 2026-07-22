create or replace function public.delete_player_access_request(
  p_admin_session_token text,
  p_request_id uuid
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
    raise exception using message = 'Pouze admin muze mazat zadosti.';
  end if;

  delete from public.player_access_requests
  where id = p_request_id;

  if not found then
    raise exception using message = 'Zadost nebyla nalezena.';
  end if;

  return true;
end;
$$;

revoke all on function public.delete_player_access_request(text, uuid) from public;
grant execute on function public.delete_player_access_request(text, uuid) to anon, authenticated;

notify pgrst, 'reload schema';
