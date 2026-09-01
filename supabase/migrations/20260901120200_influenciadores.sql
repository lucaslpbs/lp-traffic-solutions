-- Modulo de Influenciadores: cadastro, disponibilidade semanal, vinculo com
-- clientes ativos e agendamentos (com fluxo de confirmacao pelo influenciador
-- ou agendamento direto pelo admin).

create table if not exists public.influenciadores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  nome text not null,
  telefone text not null,
  email text not null,
  valor_stories numeric(10,2),
  valor_feed numeric(10,2),
  valor_presencial numeric(10,2),
  valor_online numeric(10,2),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.influenciador_horarios (
  id uuid primary key default gen_random_uuid(),
  influenciador_id uuid not null references public.influenciadores(id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 0 and 6),
  servico text check (servico in ('stories', 'feed', 'presencial', 'online')),
  hora_inicio time not null,
  hora_fim time not null,
  created_at timestamptz not null default now(),
  check (hora_fim > hora_inicio)
);

create table if not exists public.influenciador_clientes (
  influenciador_id uuid not null references public.influenciadores(id) on delete cascade,
  client_id uuid not null references public.gestao_clientes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (influenciador_id, client_id)
);

create table if not exists public.influenciador_agendamentos (
  id uuid primary key default gen_random_uuid(),
  influenciador_id uuid not null references public.influenciadores(id) on delete cascade,
  client_id uuid not null references public.gestao_clientes(id) on delete cascade,
  data date not null,
  hora_inicio time not null,
  hora_fim time not null,
  servico text not null check (servico in ('stories', 'feed', 'presencial', 'online')),
  nome_contato text not null,
  telefone_contato text not null,
  instagram_contato text,
  status text not null default 'pendente_confirmacao' check (status in ('pendente_confirmacao', 'confirmado', 'cancelado')),
  origem text not null check (origem in ('cliente', 'admin')),
  created_by uuid references auth.users(id),
  confirmed_at timestamptz,
  webhook_criado_disparado boolean not null default false,
  webhook_confirmado_disparado boolean not null default false,
  observacoes text,
  created_at timestamptz not null default now(),
  check (hora_fim > hora_inicio)
);

-- Evita agendar duas vezes exatamente o mesmo horario do mesmo influenciador
-- (nao detecta sobreposicao parcial de horarios, so a colisao exata).
create unique index if not exists idx_influenciador_agendamento_slot_unico
  on public.influenciador_agendamentos (influenciador_id, data, hora_inicio)
  where status <> 'cancelado';

create index if not exists idx_influenciador_horarios_influenciador on public.influenciador_horarios(influenciador_id);
create index if not exists idx_influenciador_clientes_client on public.influenciador_clientes(client_id);
create index if not exists idx_influenciador_agendamentos_client on public.influenciador_agendamentos(client_id);
create index if not exists idx_influenciador_agendamentos_influenciador_data on public.influenciador_agendamentos(influenciador_id, data);

alter table public.influenciadores enable row level security;
alter table public.influenciador_horarios enable row level security;
alter table public.influenciador_clientes enable row level security;
alter table public.influenciador_agendamentos enable row level security;

-- ============================================================
-- Funcoes auxiliares SECURITY DEFINER.
--
-- As policies abaixo precisam checar coisas em OUTRAS tabelas que tambem tem
-- RLS habilitado (ex: a policy de `influenciadores` olha pra
-- `influenciador_clientes`, cujas proprias policies olham de volta pra
-- `influenciadores`). Se essas checagens forem feitas com EXISTS/JOIN inline
-- dentro do USING da policy, o Postgres detecta o ciclo entre as duas tabelas
-- e derruba a query com "infinite recursion detected in policy for relation".
-- Isolar a checagem numa funcao SECURITY DEFINER (mesmo padrao ja usado em
-- user_is_admin/user_has_client_access) resolve: a funcao roda com o
-- privilegio do dono (que ignora RLS), entao a consulta interna nao reaciona
-- as policies da tabela consultada.
-- ============================================================

create or replace function public.eh_dono_influenciador(p_influenciador_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.influenciadores i
    where i.id = p_influenciador_id and i.user_id = p_user_id
  );
$$;

create or replace function public.cliente_tem_acesso_client_id(p_client_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.users_clients uc
    where uc.client_id = p_client_id and uc.user_id = p_user_id
  );
$$;

create or replace function public.influenciador_tem_cliente(p_influenciador_id uuid, p_client_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.influenciador_clientes ic
    where ic.influenciador_id = p_influenciador_id and ic.client_id = p_client_id
  );
$$;

create or replace function public.cliente_tem_influenciador_vinculado(p_influenciador_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.influenciador_clientes ic
    where ic.influenciador_id = p_influenciador_id
    and public.cliente_tem_acesso_client_id(ic.client_id, p_user_id)
  );
$$;

-- influenciadores: admin ve/gerencia tudo; o proprio influenciador ve seu
-- perfil; cliente vinculado ve o(s) influenciador(es) linkados a ele.
drop policy if exists "Admin gerencia influenciadores" on public.influenciadores;
create policy "Admin gerencia influenciadores" on public.influenciadores
  for all using (public.user_is_admin(auth.uid())) with check (public.user_is_admin(auth.uid()));

drop policy if exists "Influenciador ve seu proprio perfil" on public.influenciadores;
create policy "Influenciador ve seu proprio perfil" on public.influenciadores
  for select using (auth.uid() = user_id);

drop policy if exists "Cliente ve influenciador vinculado" on public.influenciadores;
create policy "Cliente ve influenciador vinculado" on public.influenciadores
  for select using (public.cliente_tem_influenciador_vinculado(id, auth.uid()));

-- influenciador_horarios: mesma visibilidade do influenciador dono; escrita
-- so admin.
drop policy if exists "Admin gerencia influenciador_horarios" on public.influenciador_horarios;
create policy "Admin gerencia influenciador_horarios" on public.influenciador_horarios
  for all using (public.user_is_admin(auth.uid())) with check (public.user_is_admin(auth.uid()));

drop policy if exists "Influenciador ve seus horarios" on public.influenciador_horarios;
create policy "Influenciador ve seus horarios" on public.influenciador_horarios
  for select using (public.eh_dono_influenciador(influenciador_id, auth.uid()));

drop policy if exists "Cliente ve horarios do influenciador vinculado" on public.influenciador_horarios;
create policy "Cliente ve horarios do influenciador vinculado" on public.influenciador_horarios
  for select using (public.cliente_tem_influenciador_vinculado(influenciador_id, auth.uid()));

-- influenciador_clientes: admin gerencia; influenciador e cliente enxergam
-- seus proprios vinculos.
drop policy if exists "Admin gerencia influenciador_clientes" on public.influenciador_clientes;
create policy "Admin gerencia influenciador_clientes" on public.influenciador_clientes
  for all using (public.user_is_admin(auth.uid())) with check (public.user_is_admin(auth.uid()));

drop policy if exists "Influenciador ve seus vinculos" on public.influenciador_clientes;
create policy "Influenciador ve seus vinculos" on public.influenciador_clientes
  for select using (public.eh_dono_influenciador(influenciador_id, auth.uid()));

drop policy if exists "Cliente ve seu vinculo" on public.influenciador_clientes;
create policy "Cliente ve seu vinculo" on public.influenciador_clientes
  for select using (public.cliente_tem_acesso_client_id(client_id, auth.uid()));

-- influenciador_agendamentos: admin gerencia tudo; influenciador ve/atualiza
-- (confirma) os seus proprios; cliente ve os seus e so insere se existir
-- vinculo com aquele influenciador.
drop policy if exists "Admin gerencia agendamentos" on public.influenciador_agendamentos;
create policy "Admin gerencia agendamentos" on public.influenciador_agendamentos
  for all using (public.user_is_admin(auth.uid())) with check (public.user_is_admin(auth.uid()));

drop policy if exists "Influenciador ve seus agendamentos" on public.influenciador_agendamentos;
create policy "Influenciador ve seus agendamentos" on public.influenciador_agendamentos
  for select using (public.eh_dono_influenciador(influenciador_id, auth.uid()));

drop policy if exists "Influenciador confirma seus agendamentos" on public.influenciador_agendamentos;
create policy "Influenciador confirma seus agendamentos" on public.influenciador_agendamentos
  for update using (public.eh_dono_influenciador(influenciador_id, auth.uid()))
  with check (public.eh_dono_influenciador(influenciador_id, auth.uid()));

drop policy if exists "Cliente ve seus agendamentos" on public.influenciador_agendamentos;
create policy "Cliente ve seus agendamentos" on public.influenciador_agendamentos
  for select using (public.cliente_tem_acesso_client_id(client_id, auth.uid()));

drop policy if exists "Cliente cria agendamento com influenciador vinculado" on public.influenciador_agendamentos;
create policy "Cliente cria agendamento com influenciador vinculado" on public.influenciador_agendamentos
  for insert with check (
    origem = 'cliente'
    and public.cliente_tem_acesso_client_id(client_id, auth.uid())
    and public.influenciador_tem_cliente(influenciador_id, client_id)
  );
