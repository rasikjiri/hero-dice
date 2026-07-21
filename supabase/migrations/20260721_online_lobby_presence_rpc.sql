create or replace function public.claim_online_player_identity(
  p_session_id uuid,
  p_player_id text,
  p_device_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state jsonb;
  v_selected_players jsonb;
  v_connected_players jsonb;
  v_readiness jsonb;
  v_existing_device text;
  v_turn_version integer;
  v_updated_at_ms bigint;
  v_next_state jsonb;
begin
  select s.game_state
  into v_state
  from public.online_sessions s
  where s.id = p_session_id
  for update;

  if v_state is null then
    raise exception using message = 'Online session nebyla nalezena.';
  end if;

  v_selected_players := coalesce(v_state->'selectedPlayers', '[]'::jsonb);

  if not exists (
    select 1
    from jsonb_array_elements_text(v_selected_players) as selected_player(player_id)
    where selected_player.player_id = p_player_id
  ) then
    raise exception using message = 'Hrac neni soucasti teto online session.';
  end if;

  v_connected_players := coalesce(v_state->'connectedPlayers', '{}'::jsonb);
  v_existing_device := v_connected_players->>p_player_id;

  if v_existing_device is not null and v_existing_device <> p_device_id then
    raise exception using message = 'Tento hrac je jiz pripojen na jinem zarizeni.';
  end if;

  v_connected_players := jsonb_set(
    v_connected_players,
    array[p_player_id],
    to_jsonb(p_device_id),
    true
  );

  v_readiness := coalesce(v_state->'playerReadiness', '{}'::jsonb);

  if not (v_readiness ? p_player_id) then
    v_readiness := jsonb_set(
      v_readiness,
      array[p_player_id],
      'false'::jsonb,
      true
    );
  end if;

  v_turn_version :=
    case
      when coalesce(v_state->>'turnVersion', '') ~ '^\\d+$' then (v_state->>'turnVersion')::integer + 1
      else 1
    end;

  v_updated_at_ms := (extract(epoch from now()) * 1000)::bigint;

  v_next_state := jsonb_set(v_state, '{connectedPlayers}', v_connected_players, true);
  v_next_state := jsonb_set(v_next_state, '{playerReadiness}', v_readiness, true);
  v_next_state := jsonb_set(v_next_state, '{turnVersion}', to_jsonb(v_turn_version), true);
  v_next_state := jsonb_set(v_next_state, '{updatedByPlayerId}', to_jsonb(p_player_id), true);
  v_next_state := jsonb_set(v_next_state, '{updatedAt}', to_jsonb(v_updated_at_ms), true);

  update public.online_sessions
  set game_state = v_next_state
  where id = p_session_id;

  return v_next_state;
end;
$$;

create or replace function public.set_online_player_readiness(
  p_session_id uuid,
  p_player_id text,
  p_device_id text,
  p_ready boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state jsonb;
  v_selected_players jsonb;
  v_connected_players jsonb;
  v_readiness jsonb;
  v_existing_device text;
  v_turn_version integer;
  v_updated_at_ms bigint;
  v_next_state jsonb;
begin
  select s.game_state
  into v_state
  from public.online_sessions s
  where s.id = p_session_id
  for update;

  if v_state is null then
    raise exception using message = 'Online session nebyla nalezena.';
  end if;

  v_selected_players := coalesce(v_state->'selectedPlayers', '[]'::jsonb);

  if not exists (
    select 1
    from jsonb_array_elements_text(v_selected_players) as selected_player(player_id)
    where selected_player.player_id = p_player_id
  ) then
    raise exception using message = 'Hrac neni soucasti teto online session.';
  end if;

  v_connected_players := coalesce(v_state->'connectedPlayers', '{}'::jsonb);
  v_existing_device := v_connected_players->>p_player_id;

  if v_existing_device is null or v_existing_device <> p_device_id then
    raise exception using message = 'Nejprve se pripoj ke sve identite v lobby.';
  end if;

  v_readiness := coalesce(v_state->'playerReadiness', '{}'::jsonb);
  v_readiness := jsonb_set(
    v_readiness,
    array[p_player_id],
    to_jsonb(p_ready),
    true
  );

  v_turn_version :=
    case
      when coalesce(v_state->>'turnVersion', '') ~ '^\\d+$' then (v_state->>'turnVersion')::integer + 1
      else 1
    end;

  v_updated_at_ms := (extract(epoch from now()) * 1000)::bigint;

  v_next_state := jsonb_set(v_state, '{playerReadiness}', v_readiness, true);
  v_next_state := jsonb_set(v_next_state, '{turnVersion}', to_jsonb(v_turn_version), true);
  v_next_state := jsonb_set(v_next_state, '{updatedByPlayerId}', to_jsonb(p_player_id), true);
  v_next_state := jsonb_set(v_next_state, '{updatedAt}', to_jsonb(v_updated_at_ms), true);

  update public.online_sessions
  set game_state = v_next_state
  where id = p_session_id;

  return v_next_state;
end;
$$;

revoke all on function public.claim_online_player_identity(uuid, text, text) from public;
revoke all on function public.set_online_player_readiness(uuid, text, text, boolean) from public;

grant execute on function public.claim_online_player_identity(uuid, text, text) to anon, authenticated;
grant execute on function public.set_online_player_readiness(uuid, text, text, boolean) to anon, authenticated;

notify pgrst, 'reload schema';
