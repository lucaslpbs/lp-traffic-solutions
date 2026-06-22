-- ============================================================
-- TABELA: sistema_chamados
-- Rodar no Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS sistema_chamados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  mensagem TEXT NOT NULL,
  resposta_admin TEXT,
  respondido_por UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'aberto'
    CHECK (status IN ('aberto', 'respondido', 'concluido')),
  created_at TIMESTAMPTZ DEFAULT now(),
  respondido_at TIMESTAMPTZ,
  concluido_at TIMESTAMPTZ
);

ALTER TABLE sistema_chamados ENABLE ROW LEVEL SECURITY;

-- Cliente: pode criar chamado com seu proprio client_id
CREATE POLICY "Cliente cria chamado" ON sistema_chamados
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM users_clients
      WHERE users_clients.user_id = auth.uid()
      AND users_clients.client_id = sistema_chamados.client_id
    )
  );

-- Cliente: ve somente seus proprios chamados
CREATE POLICY "Cliente ve proprios chamados" ON sistema_chamados
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_clients
      WHERE users_clients.user_id = auth.uid()
      AND users_clients.client_id = sistema_chamados.client_id
    )
  );

-- Admin: ve todos os chamados
CREATE POLICY "Admin ve todos chamados" ON sistema_chamados
  FOR SELECT USING (user_is_admin(auth.uid()));

-- Admin: pode atualizar qualquer chamado (responder, concluir)
CREATE POLICY "Admin atualiza chamados" ON sistema_chamados
  FOR UPDATE USING (user_is_admin(auth.uid()));
