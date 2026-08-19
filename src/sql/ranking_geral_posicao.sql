-- ============================================================
-- CORRIGE A POSICAO NO RANKING
-- Rodar no Supabase "GESTAO CLIENTES" > SQL Editor
--
-- E a MESMA funcao da secao 3 do ranking_vendas.sql, isolada aqui
-- para garantir que a versao com a coluna "posicao" esteja no ar.
-- Sintoma de que ela nao foi aplicada: posicao aparece como "—"
-- para o cliente e "0" no admin.
--
-- 1) CONFERIR qual versao esta ativa:
--    SELECT pg_get_function_result(oid)
--    FROM pg_proc WHERE proname = 'ranking_geral';
--    -> tem que comecar com: TABLE(posicao bigint, client_id text, ...)
--
-- 2) Rodar o bloco abaixo.
--
-- 3) Recarregar o cache do PostgREST (o app usa a API REST):
--    NOTIFY pgrst, 'reload schema';
--
-- OBS: rodar "SELECT * FROM ranking_geral(NULL, NULL)" aqui no editor
-- devolve 0 linhas — e esperado: nao existe auth.uid() no SQL Editor,
-- entao o filtro de admin/cliente corta tudo. Teste pelo app.
-- ============================================================

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
     AND rv.status = 'aprovada'          -- so venda aprovada pelo admin pontua
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

-- recarrega o schema da API (necessario quando a assinatura muda)
NOTIFY pgrst, 'reload schema';
