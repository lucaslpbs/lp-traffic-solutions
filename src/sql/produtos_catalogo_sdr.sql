-- ============================================================
-- RODAR NO SUPABASE DO SDR DESTE CLIENTE (projeto dedicado, FORA
-- do Supabase principal da Traffic Solutions)
-- URL: https://xhrcrusqzfckrjghjmgb.supabase.co
-- Dashboard Supabase > SQL Editor > New Query > colar e rodar
--
-- Catalogo de produtos que o Agente SDR consulta para enviar fotos ao
-- lead quando ele pede catalogo no WhatsApp. E alimentada pelo workflow
-- N8N "Produto Aprovado -> Catalogo SDR", disparado pelo trigger de
-- aprovacao no Supabase principal (ver
-- supabase/migrations/20260916130000_produto_aprovado_webhook.sql no
-- repo do app). Projeto single-tenant (um Supabase por cliente com SDR),
-- por isso nao ha coluna de client_id aqui dentro.
-- ============================================================

create table if not exists public.produtos_catalogo (
  id uuid primary key default gen_random_uuid(),
  -- id de origem em client_products, no Supabase principal do app —
  -- usado pelo N8N para saber qual linha atualizar/apagar numa reaprovacao.
  produto_id uuid not null,
  nome_produto text not null,
  categoria text,
  preco numeric(12, 2),
  descricao text not null,
  -- [{ "url": "https://.../foo.webp", "ordem": 0 }, ...]
  imagens jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_produtos_catalogo_origem on public.produtos_catalogo(produto_id);

-- Bucket para as imagens ja convertidas em WebP.
insert into storage.buckets (id, name, public)
values ('catalogo-produtos', 'catalogo-produtos', true)
on conflict (id) do nothing;

-- Leitura publica (o Agente SDR e o proprio WhatsApp precisam acessar a
-- imagem pela URL). Escrita fica restrita a service role (o N8N usa a
-- service role key, que ignora RLS por padrao).
alter table public.produtos_catalogo enable row level security;

drop policy if exists "Leitura publica do catalogo de produtos" on public.produtos_catalogo;
create policy "Leitura publica do catalogo de produtos"
on public.produtos_catalogo for select
using (true);

drop policy if exists "Leitura publica das imagens do catalogo" on storage.objects;
create policy "Leitura publica das imagens do catalogo"
on storage.objects for select
using (bucket_id = 'catalogo-produtos');
