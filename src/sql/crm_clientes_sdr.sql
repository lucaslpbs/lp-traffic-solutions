-- ============================================================
-- RODAR NO SUPABASE DO SDR (projeto compartilhado entre os clientes)
-- URL: https://xhrcrusqzfckrjghjmgb.supabase.co
-- Dashboard Supabase > SQL Editor > New Query > colar e rodar
--
-- Liga cada cliente do app (gestao_clientes.id, no Supabase PRINCIPAL) ao
-- token da instancia UAZAPI dele — o mesmo valor que o n8n grava em
-- contatos_agente.cliente_traffic_solutions — e ao webhook de "Responder
-- novamente" do workflow desse cliente.
--
-- Quem le esta tabela e a edge function sdr-crm, com a service role key.
-- O token da UAZAPI e credencial (da pra enviar mensagem pelo numero), por
-- isso NAO fica em gestao_clientes, que o proprio cliente consegue ler.
-- RLS ligado e sem nenhuma policy = anon/authenticated nao leem nada.
-- ============================================================

create table if not exists public.crm_clientes (
  -- gestao_clientes.id do Supabase principal (nao ha FK: e outro projeto).
  client_id uuid primary key,
  -- token da instancia UAZAPI = contatos_agente.cliente_traffic_solutions
  cliente_traffic_solutions text not null unique,
  -- URL de producao do webhook "Responder novamente" do workflow do cliente
  retry_webhook_url text,
  nome text,
  created_at timestamptz not null default now()
);

alter table public.crm_clientes enable row level security;
revoke all on public.crm_clientes from anon, authenticated;

-- ------------------------------------------------------------
-- Cadastrar um cliente (rodar uma vez por cliente, trocando os <...>):
--
--   1. client_id: no Supabase PRINCIPAL, rode
--        select id, nome_cliente from gestao_clientes where nome_cliente ilike '%rute%';
--   2. token: o mesmo de contatos_agente.cliente_traffic_solutions desse cliente
--      (ou body.token de uma execucao do Webhook dele no n8n).
--   3. retry_webhook_url: URL de PRODUCAO do nodo "Webhook /responder1"
--      (https://n8n.trafficsolutions.cloud/webhook/<path>).
--
-- insert into public.crm_clientes (client_id, cliente_traffic_solutions, retry_webhook_url, nome)
-- values ('<client_id>', '<token da UAZAPI>', '<url do webhook de responder>', 'Estilo Rute Atacado')
-- on conflict (client_id) do update
--   set cliente_traffic_solutions = excluded.cliente_traffic_solutions,
--       retry_webhook_url = excluded.retry_webhook_url,
--       nome = excluded.nome;
-- ------------------------------------------------------------
