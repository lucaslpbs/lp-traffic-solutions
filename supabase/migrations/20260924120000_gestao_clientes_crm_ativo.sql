-- Permissao por cliente para a aba "CRM" (acompanhamento do SDR no WhatsApp).
-- Mesmo padrao de cadastro_produtos_ativo (migration 20260916120000): o admin
-- liga em Gestao de Clientes e a sidebar do cliente passa a mostrar o link.
--
-- Esta flag so controla a interface e e conferida de novo pela edge function
-- sdr-crm. Quem diz QUAL token de UAZAPI (cliente_traffic_solutions) pertence a
-- cada cliente e a tabela crm_clientes, que vive no Supabase do SDR (ver
-- src/sql/crm_clientes_sdr.sql) — o token e credencial e gestao_clientes e
-- legivel pelo proprio cliente, entao ele nunca fica aqui.
alter table public.gestao_clientes
  add column if not exists crm_ativo boolean not null default false;
