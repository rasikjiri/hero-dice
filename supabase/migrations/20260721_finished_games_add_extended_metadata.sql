-- Extend completed game tables with unified metadata for league/fun analytics and filtering.

alter table if exists public.games
  add column if not exists date timestamptz,
  add column if not exists roll_count integer,
  add column if not exists rewrite_enabled boolean,
  add column if not exists bonus_mode text,
  add column if not exists bonus_rolls integer,
  add column if not exists game_mode text,
  add column if not exists score_schema_version integer not null default 2,
  add column if not exists has_category_breakdown boolean not null default false;

alter table if exists public.fun_games
  add column if not exists date timestamptz,
  add column if not exists game_mode text,
  add column if not exists score_schema_version integer not null default 2,
  add column if not exists has_category_breakdown boolean not null default false;

update public.games
set game_mode = coalesce(game_mode, 'league')
where game_mode is null;

update public.fun_games
set game_mode = coalesce(game_mode, 'fun')
where game_mode is null;

alter table if exists public.games
  drop constraint if exists games_game_mode_check;

alter table if exists public.games
  add constraint games_game_mode_check check (game_mode in ('league', 'fun'));

alter table if exists public.fun_games
  drop constraint if exists fun_games_game_mode_check;

alter table if exists public.fun_games
  add constraint fun_games_game_mode_check check (game_mode in ('league', 'fun'));
