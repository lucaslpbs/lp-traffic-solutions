-- Intensidade (transparencia/forca) da cor do cliente no quadro de Checklist
ALTER TABLE gestao_clientes
  ADD COLUMN IF NOT EXISTS checklist_cor_intensidade INTEGER NOT NULL DEFAULT 100;
