-- Permite ao cliente EDITAR os proprios produtos (nome, categoria, preco,
-- descricao) e gerenciar as fotos (remover e adicionar mais) em qualquer
-- status — antes so era possivel excluir um produto ainda pendente e nao
-- havia como alterar nada depois de cadastrado.
--
-- Regra de negocio: toda edicao feita pelo cliente devolve o produto para
-- 'pendente' (a WITH CHECK abaixo obriga isso), para o admin revisar de novo.
-- Quando o admin reaprova, o trigger notify_produto_aprovado dispara outra
-- vez (transicao pendente -> aprovado) e o N8N substitui a versao antiga
-- em produtos_<slug> no Supabase do SDR.

-- 1. client_products: cliente atualiza o proprio produto ---------------------
-- USING: o produto e dele, em qualquer status, e a permissao de cadastro
-- continua ligada. WITH CHECK: o resultado da edicao tem que ficar
-- 'pendente' — o cliente nunca aprova o proprio produto.
drop policy if exists "Cliente edita seus produtos" on public.client_products;
create policy "Cliente edita seus produtos" on public.client_products
  for update
  using (
    exists (
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
  )
  with check (
    status = 'pendente'
    and exists (
      select 1 from public.users_clients
      where users_clients.user_id = auth.uid()
        and users_clients.role = 'cliente'
        and users_clients.client_id = client_products.client_id
    )
  );

-- 2. client_products: exclusao continua so para produto NUNCA revisado -------
-- Como agora um produto aprovado volta para 'pendente' ao ser editado, so
-- olhar status = 'pendente' deixaria o cliente excluir um produto que ja
-- esta no catalogo do SDR (a copia la ficaria orfa). reviewed_at nulo =
-- nunca passou pelo admin, que e exatamente o comportamento de antes.
drop policy if exists "Cliente exclui produto pendente" on public.client_products;
create policy "Cliente exclui produto pendente" on public.client_products
  for delete using (
    status = 'pendente'
    and reviewed_at is null
    and exists (
      select 1 from public.users_clients
      where users_clients.user_id = auth.uid()
        and users_clients.role = 'cliente'
        and users_clients.client_id = client_products.client_id
    )
  );

-- 3. client_product_images: inserir / remover foto em qualquer status --------
drop policy if exists "Cliente insere imagens em produtos pendentes" on public.client_product_images;
drop policy if exists "Cliente insere imagens nos seus produtos" on public.client_product_images;
create policy "Cliente insere imagens nos seus produtos" on public.client_product_images
  for insert with check (
    exists (
      select 1 from public.client_products
      join public.users_clients on users_clients.client_id = client_products.client_id
      join public.gestao_clientes on gestao_clientes.id = client_products.client_id
      where client_products.id = client_product_images.product_id
        and gestao_clientes.cadastro_produtos_ativo = true
        and users_clients.user_id = auth.uid()
        and users_clients.role = 'cliente'
    )
  );

drop policy if exists "Cliente exclui imagens de produtos pendentes" on public.client_product_images;
drop policy if exists "Cliente exclui imagens dos seus produtos" on public.client_product_images;
create policy "Cliente exclui imagens dos seus produtos" on public.client_product_images
  for delete using (
    exists (
      select 1 from public.client_products
      join public.users_clients on users_clients.client_id = client_products.client_id
      join public.gestao_clientes on gestao_clientes.id = client_products.client_id
      where client_products.id = client_product_images.product_id
        and gestao_clientes.cadastro_produtos_ativo = true
        and users_clients.user_id = auth.uid()
        and users_clients.role = 'cliente'
    )
  );

-- Storage: as policies de insert/update/delete do bucket 'client-products'
-- (migration 20260916120000) ja liberam o dono da pasta {client_id}/... em
-- qualquer momento, entao nao precisam de mudanca.
