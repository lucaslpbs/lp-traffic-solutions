-- Checklist: "pendente cliente" (feito o que dependia de mim, falta o cliente
-- responder), nas demandas fixas e nos itens comuns, e observacao por
-- ocorrencia nas demandas fixas.

-- Demandas fixas
ALTER TABLE sistema_checklist_demandas_fixas
  -- Ocorrencia (data) marcada como pendente do cliente. Enquanto ela for a
  -- ocorrencia atual, o card nao entra em alerta; quando a proxima chega, volta
  -- a alertar normalmente.
  ADD COLUMN IF NOT EXISTS aguardando_ocorrencia DATE,
  -- Observacao valida so para a ocorrencia em observacao_ocorrencia; some do
  -- card sozinha quando a proxima ocorrencia passa a valer.
  ADD COLUMN IF NOT EXISTS observacao TEXT,
  ADD COLUMN IF NOT EXISTS observacao_ocorrencia DATE;

-- Itens comuns do checklist
ALTER TABLE sistema_checklist_itens
  ADD COLUMN IF NOT EXISTS aguardando_cliente BOOLEAN NOT NULL DEFAULT false;
