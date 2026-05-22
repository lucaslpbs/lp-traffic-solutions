-- Adiciona campos de controle de cobrança na tabela gestao_clientes
-- ATENÇÃO: executar no projeto Supabase de GESTÃO (VITE_SUPABASE_GESTAO_URL)

ALTER TABLE public.gestao_clientes
  ADD COLUMN IF NOT EXISTS status_cobranca TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ultimo_contato_cobranca TIMESTAMPTZ DEFAULT NULL;
