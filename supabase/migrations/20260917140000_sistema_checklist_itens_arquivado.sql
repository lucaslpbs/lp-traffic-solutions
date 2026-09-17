-- Arquivamento de itens concluidos do checklist (aba "Concluidas" por cliente/dia)
ALTER TABLE sistema_checklist_itens
  ADD COLUMN IF NOT EXISTS arquivado BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS arquivado_em TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_sistema_checklist_itens_arquivado
  ON sistema_checklist_itens (client_id, arquivado, arquivado_em);
