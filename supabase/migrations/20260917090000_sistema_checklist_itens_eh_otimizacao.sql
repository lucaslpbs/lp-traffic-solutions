-- Marca se um item do checklist, ao ser concluido, deve virar um registro
-- de otimizacao do cliente (aba Otimizacao dentro de Sistema).
ALTER TABLE sistema_checklist_itens
  ADD COLUMN IF NOT EXISTS eh_otimizacao BOOLEAN NOT NULL DEFAULT false;
