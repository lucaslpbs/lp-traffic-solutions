-- Adiciona 'semanal' como valor válido para tipo_contrato na tabela gestao_clientes
-- ATENÇÃO: Esta migration deve ser executada no projeto Supabase de GESTÃO
-- (o que usa VITE_SUPABASE_GESTAO_URL), não no projeto principal.

-- Se tipo_contrato for um ENUM PostgreSQL:
-- ALTER TYPE tipo_contrato_enum ADD VALUE IF NOT EXISTS 'semanal' BEFORE 'mensal';

-- Se tipo_contrato for uma coluna TEXT com CHECK CONSTRAINT (mais provável):
ALTER TABLE public.gestao_clientes
  DROP CONSTRAINT IF EXISTS gestao_clientes_tipo_contrato_check;

ALTER TABLE public.gestao_clientes
  ADD CONSTRAINT gestao_clientes_tipo_contrato_check
  CHECK (tipo_contrato IN ('semanal', 'mensal', 'trimestral', 'semestral', 'anual'));
