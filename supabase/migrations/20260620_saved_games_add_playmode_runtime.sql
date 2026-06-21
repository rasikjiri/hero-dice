alter table if exists public.saved_games
  add column if not exists current_play_player_index integer,
  add column if not exists play_mode_dice integer[],
  add column if not exists locked_dice boolean[],
  add column if not exists confirmed_locked_dice boolean[],
  add column if not exists remaining_rolls integer,
  add column if not exists bonus_used boolean,
  add column if not exists selected_general_value integer,
  add column if not exists has_rolled_dice boolean,
  add column if not exists has_started_play_mode boolean;
