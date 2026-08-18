-- ============================================================
-- RANKING DE VENDAS DOS CLIENTES
-- RODAR NO SUPABASE "GESTAO CLIENTES"
-- URL: https://twclltazkfvtufbsehsv.supabase.co
-- Dashboard Supabase > SQL Editor > New Query > colar e rodar
--
-- Cria:
--   - ranking_vendas   (vendas lancadas por cada cliente)
--   - ranking_perfis   (foto/apelido do cliente dentro do ranking)
--   - bucket "ranking" no Storage (prints das vendas + fotos de perfil)
--   - funcao ranking_geral() (ranking consolidado, visivel a todos)
--
-- OBS: users_clients.client_id e gestao_clientes.id podem estar como
-- uuid OU text dependendo da base. Por isso TODAS as comparacoes de
-- client_id abaixo usam ::text nos dois lados (evita o erro
-- "operator does not exist: uuid = text").
--
-- Para conferir os tipos da sua base, rode antes:
--   SELECT table_name, column_name, data_type
--   FROM information_schema.columns
--   WHERE (table_name = 'users_clients' AND column_name = 'client_id')
--      OR (table_name = 'gestao_clientes' AND column_name = 'id');
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABELA DE VENDAS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ranking_vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  valor NUMERIC(14,2) NOT NULL CHECK (valor > 0),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  foto_url TEXT,
  descricao TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ranking_vendas_client_idx ON ranking_vendas (client_id);
CREATE INDEX IF NOT EXISTS ranking_vendas_data_idx ON ranking_vendas (data DESC);

ALTER TABLE ranking_vendas ENABLE ROW LEVEL SECURITY;

-- Admin: acesso total
DROP POLICY IF EXISTS "Admin full access ranking_vendas" ON ranking_vendas;
CREATE POLICY "Admin full access ranking_vendas" ON ranking_vendas
  FOR ALL USING (user_is_admin(auth.uid()))
  WITH CHECK (user_is_admin(auth.uid()));

-- Cliente: ve somente as proprias vendas
DROP POLICY IF EXISTS "Cliente ve proprias vendas" ON ranking_vendas;
CREATE POLICY "Cliente ve proprias vendas" ON ranking_vendas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_clients
      WHERE users_clients.user_id = auth.uid()
      AND users_clients.client_id::text = ranking_vendas.client_id::text
    )
  );

-- Cliente: cadastra venda no proprio client_id
DROP POLICY IF EXISTS "Cliente cadastra venda" ON ranking_vendas;
CREATE POLICY "Cliente cadastra venda" ON ranking_vendas
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM users_clients
      WHERE users_clients.user_id = auth.uid()
      AND users_clients.client_id::text = ranking_vendas.client_id::text
    )
  );

-- Cliente: edita as proprias vendas
DROP POLICY IF EXISTS "Cliente edita proprias vendas" ON ranking_vendas;
CREATE POLICY "Cliente edita proprias vendas" ON ranking_vendas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users_clients
      WHERE users_clients.user_id = auth.uid()
      AND users_clients.client_id::text = ranking_vendas.client_id::text
    )
  );

-- Cliente: apaga as proprias vendas
DROP POLICY IF EXISTS "Cliente apaga proprias vendas" ON ranking_vendas;
CREATE POLICY "Cliente apaga proprias vendas" ON ranking_vendas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users_clients
      WHERE users_clients.user_id = auth.uid()
      AND users_clients.client_id::text = ranking_vendas.client_id::text
    )
  );

-- ------------------------------------------------------------
-- 2. PERFIL DO CLIENTE NO RANKING (foto + apelido)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ranking_perfis (
  client_id TEXT PRIMARY KEY,
  apelido TEXT,
  foto_url TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ranking_perfis ENABLE ROW LEVEL SECURITY;

-- Leitura: admin ve todos; cliente ve somente o proprio perfil.
-- (a funcao ranking_geral e SECURITY DEFINER, entao ela continua
--  conseguindo montar o ranking completo para o admin)
DROP POLICY IF EXISTS "Logados veem perfis do ranking" ON ranking_perfis;
CREATE POLICY "Logados veem perfis do ranking" ON ranking_perfis
  FOR SELECT TO authenticated USING (
    user_is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM users_clients
      WHERE users_clients.user_id = auth.uid()
      AND users_clients.client_id::text = ranking_perfis.client_id::text
    )
  );

-- Admin: acesso total
DROP POLICY IF EXISTS "Admin full access ranking_perfis" ON ranking_perfis;
CREATE POLICY "Admin full access ranking_perfis" ON ranking_perfis
  FOR ALL USING (user_is_admin(auth.uid()))
  WITH CHECK (user_is_admin(auth.uid()));

-- Cliente: cria/edita o proprio perfil
DROP POLICY IF EXISTS "Cliente cria proprio perfil" ON ranking_perfis;
CREATE POLICY "Cliente cria proprio perfil" ON ranking_perfis
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_clients
      WHERE users_clients.user_id = auth.uid()
      AND users_clients.client_id::text = ranking_perfis.client_id::text
    )
  );

DROP POLICY IF EXISTS "Cliente edita proprio perfil" ON ranking_perfis;
CREATE POLICY "Cliente edita proprio perfil" ON ranking_perfis
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users_clients
      WHERE users_clients.user_id = auth.uid()
      AND users_clients.client_id::text = ranking_perfis.client_id::text
    )
  );

-- ------------------------------------------------------------
-- 3. RANKING CONSOLIDADO
--    ADMIN  -> recebe a lista completa (todos os clientes).
--    CLIENTE -> recebe SOMENTE a propria linha, ja com a posicao
--    calculada sobre o ranking inteiro. Assim ele sabe em que lugar
--    esta, mas nunca ve o nome nem o valor dos outros clientes.
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS ranking_geral(DATE, DATE);
CREATE OR REPLACE FUNCTION ranking_geral(
  p_inicio DATE DEFAULT NULL,
  p_fim DATE DEFAULT NULL
)
RETURNS TABLE (
  posicao BIGINT,
  client_id TEXT,
  nome_cliente TEXT,
  apelido TEXT,
  foto_url TEXT,
  total_vendido NUMERIC,
  qtd_vendas BIGINT,
  maior_venda NUMERIC,
  ultima_venda DATE
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $func$
  WITH base AS (
    SELECT
      gc.id::text                            AS client_id,
      gc.nome_cliente                        AS nome_cliente,
      rp.apelido                             AS apelido,
      COALESCE(rp.foto_url, gc.logo_url)     AS foto_url,
      COALESCE(SUM(rv.valor), 0)::numeric    AS total_vendido,
      COUNT(rv.id)                           AS qtd_vendas,
      COALESCE(MAX(rv.valor), 0)::numeric    AS maior_venda,
      MAX(rv.data)                           AS ultima_venda
    FROM gestao_clientes gc
    LEFT JOIN ranking_perfis rp
      ON rp.client_id = gc.id::text
    LEFT JOIN ranking_vendas rv
      ON rv.client_id = gc.id::text
     AND (p_inicio IS NULL OR rv.data >= p_inicio)
     AND (p_fim    IS NULL OR rv.data <= p_fim)
    WHERE gc.status = 'ativo'
    GROUP BY gc.id, gc.nome_cliente, rp.apelido, rp.foto_url, gc.logo_url
  ),
  ordenado AS (
    SELECT
      ROW_NUMBER() OVER (ORDER BY b.total_vendido DESC, b.nome_cliente ASC) AS posicao,
      b.*
    FROM base b
  )
  SELECT
    o.posicao,
    o.client_id,
    o.nome_cliente,
    o.apelido,
    o.foto_url,
    o.total_vendido,
    o.qtd_vendas,
    o.maior_venda,
    o.ultima_venda
  FROM ordenado o
  WHERE user_is_admin(auth.uid())
     OR EXISTS (
       SELECT 1 FROM users_clients uc
       WHERE uc.user_id = auth.uid()
       AND uc.client_id::text = o.client_id
     )
  ORDER BY o.posicao;
$func$;

GRANT EXECUTE ON FUNCTION ranking_geral(DATE, DATE) TO authenticated;

-- ------------------------------------------------------------
-- 4. STORAGE — bucket "ranking" (prints de venda e fotos de perfil)
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('ranking', 'ranking', true)
ON CONFLICT (id) DO NOTHING;

-- Leitura publica das imagens
DROP POLICY IF EXISTS "Leitura publica ranking" ON storage.objects;
CREATE POLICY "Leitura publica ranking"
ON storage.objects FOR SELECT
USING (bucket_id = 'ranking');

-- Upload: admin ou o proprio cliente (pasta = client_id)
DROP POLICY IF EXISTS "Upload ranking" ON storage.objects;
CREATE POLICY "Upload ranking"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'ranking'
  AND (
    user_is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM users_clients
      WHERE users_clients.user_id = auth.uid()
      AND users_clients.client_id::text = (storage.foldername(name))[1]
    )
  )
);

DROP POLICY IF EXISTS "Update ranking" ON storage.objects;
CREATE POLICY "Update ranking"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'ranking'
  AND (
    user_is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM users_clients
      WHERE users_clients.user_id = auth.uid()
      AND users_clients.client_id::text = (storage.foldername(name))[1]
    )
  )
);

DROP POLICY IF EXISTS "Delete ranking" ON storage.objects;
CREATE POLICY "Delete ranking"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'ranking'
  AND (
    user_is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM users_clients
      WHERE users_clients.user_id = auth.uid()
      AND users_clients.client_id::text = (storage.foldername(name))[1]
    )
  )
);
