-- Pagina de links (linktree) por cliente.
-- Colunas em gestao_clientes, view publica somente-leitura, RPC de autoedicao
-- do cliente e notificacao assincrona (pg_net) para automacao no n8n.

-- 1. Colunas -----------------------------------------------------------
alter table public.gestao_clientes
  add column if not exists link_page_ativo boolean not null default false,
  add column if not exists link_page_slug text unique,
  add column if not exists link_page_titulo text,
  add column if not exists link_page_bio text,
  add column if not exists link_page_cor_primaria text,
  add column if not exists link_page_cor_secundaria text,
  add column if not exists link_page_cor_fundo text,
  add column if not exists link_page_links jsonb not null default '[]'::jsonb;

-- 2. View publica --------------------------------------------------------
-- Roda com o privilegio do dono (postgres), que ignora a RLS de
-- gestao_clientes -- so as colunas listadas aqui e o WHERE ficam publicos.
create or replace view public.linktree_publico as
select
  id,
  nome_cliente,
  logo_url,
  link_page_slug as slug,
  link_page_titulo as titulo,
  link_page_bio as bio,
  link_page_cor_primaria as cor_primaria,
  link_page_cor_secundaria as cor_secundaria,
  link_page_cor_fundo as cor_fundo,
  link_page_links as links
from public.gestao_clientes
where link_page_ativo = true and link_page_slug is not null;

grant select on public.linktree_publico to anon, authenticated;

-- 3. RPC de autoedicao do cliente ----------------------------------------
-- Unico caminho de escrita do cliente: resolve o client_id a partir da
-- sessao autenticada (nunca de um id enviado pelo chamador) e atualiza
-- somente as colunas de linktree.
create or replace function public.update_linktree_page(
  p_titulo text,
  p_bio text,
  p_cor_primaria text,
  p_cor_secundaria text,
  p_cor_fundo text,
  p_links jsonb,
  p_ativo boolean
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_client_id uuid;
begin
  select client_id into v_client_id
  from users_clients
  where user_id = auth.uid() and role = 'cliente'
  limit 1;

  if v_client_id is null then
    raise exception 'Acesso negado: usuario sem cliente vinculado';
  end if;

  update gestao_clientes
  set link_page_titulo = p_titulo,
      link_page_bio = p_bio,
      link_page_cor_primaria = p_cor_primaria,
      link_page_cor_secundaria = p_cor_secundaria,
      link_page_cor_fundo = p_cor_fundo,
      link_page_links = p_links,
      link_page_ativo = p_ativo,
      updated_at = now()
  where id = v_client_id;
end;
$$;

grant execute on function public.update_linktree_page(text, text, text, text, text, jsonb, boolean) to authenticated;

-- 4. Notificacao assincrona para automacao no n8n -------------------------
-- Observador, nao escritor: dispara depois que o Postgres ja aceitou a
-- mudanca. net.http_post enfileira de forma assincrona (pg_net), entao a
-- UPDATE/RPC do cliente sempre commita mesmo que o n8n esteja fora do ar.
-- O workflow ainda nao existe no n8n -- ate ser criado, a chamada so recebe
-- 404 e e descartada pelo pg_net, sem efeito nenhum.
create extension if not exists pg_net;

create or replace function public.notify_linktree_change()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  perform net.http_post(
    url := 'https://n8n.trafficsolutions.cloud/webhook/pagina-links-atualizada',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'client_id', new.id,
      'nome_cliente', new.nome_cliente,
      'slug', new.link_page_slug,
      'ativo', new.link_page_ativo,
      'titulo', new.link_page_titulo,
      'timestamp', now()
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_linktree_notify on public.gestao_clientes;

create trigger trg_linktree_notify
  after update on public.gestao_clientes
  for each row
  when (
    new.link_page_ativo is distinct from old.link_page_ativo
    or new.link_page_links is distinct from old.link_page_links
    or new.link_page_titulo is distinct from old.link_page_titulo
    or new.link_page_bio is distinct from old.link_page_bio
    or new.link_page_cor_primaria is distinct from old.link_page_cor_primaria
    or new.link_page_cor_secundaria is distinct from old.link_page_cor_secundaria
    or new.link_page_cor_fundo is distinct from old.link_page_cor_fundo
  )
  execute function public.notify_linktree_change();
