-- Cadastro de produtos por cliente (upload de imagem + descricao), com
-- permissao individual por cliente e fluxo de aprovacao do admin.
--
-- Parte 1 e 2 da demanda "Cadastro de imagens/produtos por cliente": a
-- permissao (gestao_clientes.cadastro_produtos_ativo) e as tabelas que
-- sustentam a area do cliente. A conversao WebP via N8N e a integracao
-- com o SDR (partes 3 e 4) ficam para depois — as tabelas ja preveem os
-- campos que essa automacao vai precisar (storage_path / webp_url).

-- 1. Permissao por cliente ---------------------------------------------
alter table public.gestao_clientes
  add column if not exists cadastro_produtos_ativo boolean not null default false;

-- 2. Produtos -------------------------------------------------------------
create table if not exists public.client_products (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.gestao_clientes(id) on delete cascade,
  nome_produto text not null,
  categoria text,
  preco numeric(12, 2),
  descricao text not null,
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'rejeitado')),
  motivo_rejeicao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create index if not exists idx_client_products_client on public.client_products(client_id);
create index if not exists idx_client_products_status on public.client_products(status);

-- 3. Imagens dos produtos (1 produto : N imagens) --------------------------
-- storage_path fica salvo ao lado da url publica para a limpeza no Storage
-- (ou a futura conversao WebP) nao precisar reconstruir o caminho a partir
-- da URL. webp_url comeca nulo e e preenchido pelo workflow N8N (parte 3).
create table if not exists public.client_product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.client_products(id) on delete cascade,
  storage_path text not null,
  original_url text not null,
  webp_url text,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_client_product_images_product on public.client_product_images(product_id);

-- 4. RLS: client_products ---------------------------------------------------
alter table public.client_products enable row level security;

drop policy if exists "Admin gerencia client_products" on public.client_products;
create policy "Admin gerencia client_products" on public.client_products
  for all using (public.user_is_admin(auth.uid())) with check (public.user_is_admin(auth.uid()));

drop policy if exists "Cliente ve seus produtos" on public.client_products;
create policy "Cliente ve seus produtos" on public.client_products
  for select using (
    exists (
      select 1 from public.users_clients
      where users_clients.user_id = auth.uid()
        and users_clients.role = 'cliente'
        and users_clients.client_id = client_products.client_id
    )
  );

-- Cliente so cadastra se a permissao do admin estiver ativa e o produto
-- nasce sempre como 'pendente' — quem aprova e o admin.
drop policy if exists "Cliente cadastra produtos" on public.client_products;
create policy "Cliente cadastra produtos" on public.client_products
  for insert with check (
    status = 'pendente'
    and exists (
      select 1 from public.users_clients
      where users_clients.user_id = auth.uid()
        and users_clients.role = 'cliente'
        and users_clients.client_id = client_products.client_id
    )
    and exists (
      select 1 from public.gestao_clientes
      where gestao_clientes.id = client_products.client_id
        and gestao_clientes.cadastro_produtos_ativo = true
    )
  );

-- Cliente pode remover um cadastro proprio enquanto ainda nao foi revisado.
drop policy if exists "Cliente exclui produto pendente" on public.client_products;
create policy "Cliente exclui produto pendente" on public.client_products
  for delete using (
    status = 'pendente'
    and exists (
      select 1 from public.users_clients
      where users_clients.user_id = auth.uid()
        and users_clients.role = 'cliente'
        and users_clients.client_id = client_products.client_id
    )
  );

-- 5. RLS: client_product_images ---------------------------------------------
alter table public.client_product_images enable row level security;

drop policy if exists "Admin gerencia client_product_images" on public.client_product_images;
create policy "Admin gerencia client_product_images" on public.client_product_images
  for all using (public.user_is_admin(auth.uid())) with check (public.user_is_admin(auth.uid()));

drop policy if exists "Cliente ve imagens dos seus produtos" on public.client_product_images;
create policy "Cliente ve imagens dos seus produtos" on public.client_product_images
  for select using (
    exists (
      select 1 from public.client_products
      join public.users_clients on users_clients.client_id = client_products.client_id
      where client_products.id = client_product_images.product_id
        and users_clients.user_id = auth.uid()
        and users_clients.role = 'cliente'
    )
  );

drop policy if exists "Cliente insere imagens em produtos pendentes" on public.client_product_images;
create policy "Cliente insere imagens em produtos pendentes" on public.client_product_images
  for insert with check (
    exists (
      select 1 from public.client_products
      join public.users_clients on users_clients.client_id = client_products.client_id
      where client_products.id = client_product_images.product_id
        and client_products.status = 'pendente'
        and users_clients.user_id = auth.uid()
        and users_clients.role = 'cliente'
    )
  );

drop policy if exists "Cliente exclui imagens de produtos pendentes" on public.client_product_images;
create policy "Cliente exclui imagens de produtos pendentes" on public.client_product_images
  for delete using (
    exists (
      select 1 from public.client_products
      join public.users_clients on users_clients.client_id = client_products.client_id
      where client_products.id = client_product_images.product_id
        and client_products.status = 'pendente'
        and users_clients.user_id = auth.uid()
        and users_clients.role = 'cliente'
    )
  );

-- 6. Storage bucket -----------------------------------------------------
-- Caminho dos objetos: {client_id}/{product_id}/{arquivo} — o primeiro
-- segmento do path e o que as policies abaixo usam para conferir o dono.
insert into storage.buckets (id, name, public)
values ('client-products', 'client-products', true)
on conflict (id) do nothing;

drop policy if exists "Leitura publica de imagens de produtos" on storage.objects;
create policy "Leitura publica de imagens de produtos"
on storage.objects for select
using (bucket_id = 'client-products');

drop policy if exists "Cliente e admin enviam imagens de produtos" on storage.objects;
create policy "Cliente e admin enviam imagens de produtos"
on storage.objects for insert
with check (
  bucket_id = 'client-products'
  and (
    public.user_is_admin(auth.uid())
    or exists (
      select 1 from public.users_clients
      where users_clients.user_id = auth.uid()
        and users_clients.role = 'cliente'
        and users_clients.client_id::text = (storage.foldername(name))[1]
    )
  )
);

drop policy if exists "Cliente e admin atualizam imagens de produtos" on storage.objects;
create policy "Cliente e admin atualizam imagens de produtos"
on storage.objects for update
using (
  bucket_id = 'client-products'
  and (
    public.user_is_admin(auth.uid())
    or exists (
      select 1 from public.users_clients
      where users_clients.user_id = auth.uid()
        and users_clients.role = 'cliente'
        and users_clients.client_id::text = (storage.foldername(name))[1]
    )
  )
);

drop policy if exists "Cliente e admin deletam imagens de produtos" on storage.objects;
create policy "Cliente e admin deletam imagens de produtos"
on storage.objects for delete
using (
  bucket_id = 'client-products'
  and (
    public.user_is_admin(auth.uid())
    or exists (
      select 1 from public.users_clients
      where users_clients.user_id = auth.uid()
        and users_clients.role = 'cliente'
        and users_clients.client_id::text = (storage.foldername(name))[1]
    )
  )
);
