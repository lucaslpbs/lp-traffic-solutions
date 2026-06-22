-- ============================================================
-- TABELA: sistema_otimizacoes
-- Rodar no Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS sistema_otimizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  data DATE NOT NULL,
  otimizado BOOLEAN NOT NULL DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE sistema_otimizacoes ENABLE ROW LEVEL SECURITY;

-- Admin: acesso total (CRUD)
CREATE POLICY "Admin full access sistema_otimizacoes" ON sistema_otimizacoes
  FOR ALL USING (user_is_admin(auth.uid()));

-- Cliente: somente leitura nas linhas do proprio client_id
CREATE POLICY "Cliente ve proprias otimizacoes" ON sistema_otimizacoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_clients
      WHERE users_clients.user_id = auth.uid()
      AND users_clients.client_id = sistema_otimizacoes.client_id
    )
  );
