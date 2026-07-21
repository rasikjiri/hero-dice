create extension if not exists pgcrypto with schema extensions;

create or replace function public.players_password_hash_autofill()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if coalesce(new.password_hash, '') = '' then
    new.password_hash := extensions.crypt(new.id, extensions.gen_salt('bf'));
  elsif new.password_hash not like '$2a$%'
    and new.password_hash not like '$2b$%'
    and new.password_hash not like '$2y$%' then
    new.password_hash := extensions.crypt(new.password_hash, extensions.gen_salt('bf'));
  end if;

  if coalesce(new.role, '') = '' then
    new.role := 'player';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_players_password_hash_autofill on public.players;

create trigger trg_players_password_hash_autofill
before insert or update of id, password_hash, role
on public.players
for each row
execute function public.players_password_hash_autofill();

update public.players
set password_hash = extensions.crypt(id, extensions.gen_salt('bf'))
where coalesce(password_hash, '') = '';

update public.players
set password_hash = extensions.crypt(password_hash, extensions.gen_salt('bf'))
where password_hash not like '$2a$%'
  and password_hash not like '$2b$%'
  and password_hash not like '$2y$%';
