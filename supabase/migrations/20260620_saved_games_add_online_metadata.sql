alter table saved_games
add column if not exists game_mode text default 'offline';

alter table saved_games
add column if not exists online_session_id uuid null;
