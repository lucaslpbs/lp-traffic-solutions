-- Cor customizavel por cliente no quadro de Checklist (aba "Checklist" dentro de Sistema)
ALTER TABLE gestao_clientes
  ADD COLUMN IF NOT EXISTS checklist_cor TEXT;
