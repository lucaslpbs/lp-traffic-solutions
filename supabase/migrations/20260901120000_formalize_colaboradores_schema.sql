-- Formaliza em migration o schema de colaboradores, que ate agora so existia
-- criado manualmente no SQL Editor do Supabase (mesmo padrao documentado em
-- src/sql/auth_roles_gestao.sql). Tudo com IF NOT EXISTS / CREATE OR REPLACE
-- para nao alterar dados existentes caso as tabelas ja existam em producao.

-- Dependencias (users_clients / admin_users / user_is_admin) — recriadas aqui
-- de forma idempotente caso este script rode num ambiente que ainda nao tenha
-- rodado src/sql/auth_roles_gestao.sql manualmente.
-- Nota: o `users_clients.client_id` real de producao e UUID (referencia
-- gestao_clientes.id), nao TEXT como o rascunho antigo em
-- src/sql/auth_roles_gestao.sql sugeria — corrigido aqui apos erro de
-- "operator does not exist: uuid = text" ao rodar esta migration.
create table if not exists public.users_clients (
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null,
  role text default 'cliente',
  created_at timestamptz default now(),
  primary key (user_id, client_id)
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create or replace function public.user_is_admin(user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where admin_users.user_id = user_is_admin.user_id
  );
$$;

create or replace function public.user_has_client_access(client_id uuid, user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.users_clients
    where users_clients.user_id = user_has_client_access.user_id
    and users_clients.client_id = user_has_client_access.client_id
  );
$$;

alter table public.users_clients enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Usuario ve seu proprio vinculo" on public.users_clients;
create policy "Usuario ve seu proprio vinculo" on public.users_clients
  for select using (auth.uid() = user_id);

drop policy if exists "Admin ve tudo em users_clients" on public.users_clients;
create policy "Admin ve tudo em users_clients" on public.users_clients
  for select using (public.user_is_admin(auth.uid()));

drop policy if exists "Admin pode inserir em users_clients" on public.users_clients;
create policy "Admin pode inserir em users_clients" on public.users_clients
  for insert with check (public.user_is_admin(auth.uid()));

drop policy if exists "Admin pode deletar em users_clients" on public.users_clients;
create policy "Admin pode deletar em users_clients" on public.users_clients
  for delete using (public.user_is_admin(auth.uid()));

drop policy if exists "Usuario ve se e admin" on public.admin_users;
create policy "Usuario ve se e admin" on public.admin_users
  for select using (auth.uid() = user_id);

-- ============================================================
-- Colaboradores (gestao de usuarios) — o schema real que
-- GestaoUsuarios.tsx, useAuth.tsx e a edge function
-- manage-collaborator-auth ja consomem em producao.
-- ============================================================

create table if not exists public.colaboradores (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  cargo text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.colaborador_clientes (
  user_id uuid not null references public.colaboradores(user_id) on delete cascade,
  client_id uuid not null references public.gestao_clientes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, client_id)
);

create table if not exists public.colaborador_sessoes (
  user_id uuid not null references public.colaboradores(user_id) on delete cascade,
  sessao text not null check (sessao in ('guerra', 'gestao_clientes', 'sistema', 'chamados', 'ranking')),
  created_at timestamptz not null default now(),
  primary key (user_id, sessao)
);

alter table public.colaboradores enable row level security;
alter table public.colaborador_clientes enable row level security;
alter table public.colaborador_sessoes enable row level security;

drop policy if exists "Colaborador ve seu proprio perfil" on public.colaboradores;
create policy "Colaborador ve seu proprio perfil" on public.colaboradores
  for select using (auth.uid() = user_id);

drop policy if exists "Admin gerencia colaboradores" on public.colaboradores;
create policy "Admin gerencia colaboradores" on public.colaboradores
  for all using (public.user_is_admin(auth.uid())) with check (public.user_is_admin(auth.uid()));

drop policy if exists "Colaborador ve seus proprios clientes" on public.colaborador_clientes;
create policy "Colaborador ve seus proprios clientes" on public.colaborador_clientes
  for select using (auth.uid() = user_id);

drop policy if exists "Admin gerencia colaborador_clientes" on public.colaborador_clientes;
create policy "Admin gerencia colaborador_clientes" on public.colaborador_clientes
  for all using (public.user_is_admin(auth.uid())) with check (public.user_is_admin(auth.uid()));

drop policy if exists "Colaborador ve suas proprias sessoes" on public.colaborador_sessoes;
create policy "Colaborador ve suas proprias sessoes" on public.colaborador_sessoes
  for select using (auth.uid() = user_id);

drop policy if exists "Admin gerencia colaborador_sessoes" on public.colaborador_sessoes;
create policy "Admin gerencia colaborador_sessoes" on public.colaborador_sessoes
  for all using (public.user_is_admin(auth.uid())) with check (public.user_is_admin(auth.uid()));

create index if not exists idx_colaborador_clientes_client on public.colaborador_clientes(client_id);
