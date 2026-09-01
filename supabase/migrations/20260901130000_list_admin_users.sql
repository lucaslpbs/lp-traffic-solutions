-- Permite a tela de Gestao de Usuarios listar quem ja e admin (nome/email
-- moram em auth.users, que o client nao consegue consultar direto via
-- PostgREST — so um SECURITY DEFINER pode ler ali). Auto-protegida: so
-- retorna algo se quem chamou ja for admin.
create or replace function public.list_admin_users()
returns table (user_id uuid, email text, created_at timestamptz)
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
    select au.user_id, u.email::text, au.created_at
    from public.admin_users au
    join auth.users u on u.id = au.user_id
    order by u.email;
end;
$$;
