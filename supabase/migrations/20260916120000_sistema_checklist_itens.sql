-- Checklist de demandas por cliente (aba "Checklist" dentro de Sistema)
CREATE TABLE IF NOT EXISTS sistema_checklist_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES gestao_clientes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  responsavel TEXT,
  observacao TEXT,
  concluido BOOLEAN NOT NULL DEFAULT false,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_sistema_checklist_itens_client_id
  ON sistema_checklist_itens (client_id, ordem);

ALTER TABLE sistema_checklist_itens ENABLE ROW LEVEL SECURITY;

-- Admin: acesso total (CRUD)
CREATE POLICY "Admin full access checklist" ON sistema_checklist_itens
  FOR ALL USING (user_is_admin(auth.uid()));

-- Colaborador com a sessao "sistema" liberada: acesso total (CRUD)
CREATE POLICY "Colaborador acesso checklist (sessao)" ON sistema_checklist_itens
  FOR ALL USING (colaborador_tem_sessao(auth.uid(), 'sistema'))
  WITH CHECK (colaborador_tem_sessao(auth.uid(), 'sistema'));

-- Cliente: somente leitura do proprio checklist
CREATE POLICY "Cliente ve proprio checklist" ON sistema_checklist_itens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_clients
      WHERE users_clients.user_id = auth.uid()
      AND users_clients.client_id = sistema_checklist_itens.client_id
    )
  );
