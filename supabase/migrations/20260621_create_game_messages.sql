create extension if not exists pgcrypto;

create table if not exists public.game_messages (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.online_sessions(id) on delete cascade,
  player_id text,
  player_name text not null,
  message text not null check (char_length(trim(message)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_game_messages_game_id_created_at
  on public.game_messages (game_id, created_at);
