-- Add game_id column to games table
alter table if exists public.games
  add column if not exists game_id uuid null;

-- Add game_id column to fun_games table
alter table if exists public.fun_games
  add column if not exists game_id uuid null;
