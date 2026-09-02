-- Formaliza um admin "master" (dono/CEO) dentro de admin_users: so ele pode
-- promover/rebaixar os outros admins pela UI, e ninguem (nem ele mesmo)
-- consegue editar a propria linha de master pela API (sem policy de update).

alter table public.admin_users add column if not exists master boolean not null default false;

update public.admin_users au
set master = true
from auth.users u
where u.id = au.user_id
  and u.email = 'lucaspaulinobs@gmail.com'
  and au.master = false;

create or replace function public.user_is_master(p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = p_user_id and master = true
  );
$$;

-- Hoje admin_users so tem a policy de select proprio (nenhum insert/update/
-- delete): promover/remover admin so era possivel via SQL manual. Abre isso
-- pra API, mas restrito ao master, e sem policy de update (a coluna master
-- so muda via SQL direto no editor do Supabase).
drop policy if exists "Master promove admin" on public.admin_users;
create policy "Master promove admin" on public.admin_users
  for insert with check (public.user_is_master(auth.uid()));

drop policy if exists "Master remove admin" on public.admin_users;
create policy "Master remove admin" on public.admin_users
  for delete using (public.user_is_master(auth.uid()) and master = false);

-- list_admin_users precisa devolver a coluna master pra UI marcar quem e o
-- master; muda o tipo de retorno, entao precisa dropar antes de recriar.
drop function if exists public.list_admin_users();

create function public.list_admin_users()
returns table (user_id uuid, email text, created_at timestamptz, master boolean)
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  if not public.user_is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  return query
    select au.user_id, u.email::text, au.created_at, au.master
    from public.admin_users au
    join auth.users u on u.id = au.user_id
    order by au.master desc, u.email;
end;
$$;
