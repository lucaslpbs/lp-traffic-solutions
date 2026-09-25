-- Checklist: data limite nos itens + demandas fixas (recorrentes, com horario)

-- Data limite opcional em cada item. Quando chega o dia (ou passa), o card do
-- cliente entra em alerta e sobe para o topo do quadro.
ALTER TABLE sistema_checklist_itens
  ADD COLUMN IF NOT EXISTS data_limite DATE;

-- Demandas fixas: aparecem no card do cliente, com alerta, no dia e horario
-- configurados (ex.: toda terca 11h "gerar saldo de R$200 + relatorio").
CREATE TABLE IF NOT EXISTS sistema_checklist_demandas_fixas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES gestao_clientes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  responsavel TEXT,
  recorrencia TEXT NOT NULL DEFAULT 'semanal'
    CHECK (recorrencia IN ('semanal', 'mensal', 'unica')),
  -- 0 = domingo ... 6 = sabado (mesmo valor de Date.getDay())
  dias_semana SMALLINT[] NOT NULL DEFAULT '{}',
  dia_mes SMALLINT CHECK (dia_mes BETWEEN 1 AND 31),
  data_unica DATE,
  horario TIME NOT NULL DEFAULT '09:00',
  ativo BOOLEAN NOT NULL DEFAULT true,
  -- Data da ultima ocorrencia marcada como feita. A ocorrencia de um dia D
  -- esta feita quando ultima_conclusao >= D.
  ultima_conclusao DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_sistema_checklist_demandas_fixas_client_id
  ON sistema_checklist_demandas_fixas (client_id);

ALTER TABLE sistema_checklist_demandas_fixas ENABLE ROW LEVEL SECURITY;

-- Admin: acesso total (CRUD)
DROP POLICY IF EXISTS "Admin full access demandas fixas" ON sistema_checklist_demandas_fixas;
CREATE POLICY "Admin full access demandas fixas" ON sistema_checklist_demandas_fixas
  FOR ALL USING (user_is_admin(auth.uid()));

-- Colaborador com a sessao "sistema" liberada: acesso total (CRUD)
DROP POLICY IF EXISTS "Colaborador acesso demandas fixas (sessao)" ON sistema_checklist_demandas_fixas;
CREATE POLICY "Colaborador acesso demandas fixas (sessao)" ON sistema_checklist_demandas_fixas
  FOR ALL USING (colaborador_tem_sessao(auth.uid(), 'sistema'))
  WITH CHECK (colaborador_tem_sessao(auth.uid(), 'sistema'));
