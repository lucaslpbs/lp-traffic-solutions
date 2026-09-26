-- Conteudo por cliente das abas de "Materiais de referencia" do Sistema
-- (Persona, ICP...). Uma linha por (cliente, secao); `dados` guarda o JSON do form.
CREATE TABLE IF NOT EXISTS sistema_cliente_secoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES gestao_clientes(id) ON DELETE CASCADE,
  secao TEXT NOT NULL,
  dados JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE (client_id, secao)
);

ALTER TABLE sistema_cliente_secoes ENABLE ROW LEVEL SECURITY;

-- Admin: acesso total (CRUD)
CREATE POLICY "Admin full access cliente secoes" ON sistema_cliente_secoes
  FOR ALL USING (user_is_admin(auth.uid()));

-- Colaborador com a sessao "sistema" liberada: acesso total (CRUD)
CREATE POLICY "Colaborador acesso cliente secoes (sessao)" ON sistema_cliente_secoes
  FOR ALL USING (colaborador_tem_sessao(auth.uid(), 'sistema'))
  WITH CHECK (colaborador_tem_sessao(auth.uid(), 'sistema'));

-- Cliente: somente leitura das proprias secoes
CREATE POLICY "Cliente ve proprias secoes" ON sistema_cliente_secoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_clients
      WHERE users_clients.user_id = auth.uid()
      AND users_clients.client_id = sistema_cliente_secoes.client_id
    )
  );
