-- 1) O cliente so le, no banco, as secoes que a tela dele mostra
--    (persona, icp, escopo, biblioteca). Calendario, diario de bordo, canais,
--    linhas editoriais, historias, mineracao e relatorios sao internos da agencia.
DROP POLICY IF EXISTS "Cliente ve proprias secoes" ON sistema_cliente_secoes;

CREATE POLICY "Cliente ve proprias secoes" ON sistema_cliente_secoes
  FOR SELECT USING (
    secao IN ('persona', 'icp', 'escopo', 'biblioteca')
    AND EXISTS (
      SELECT 1 FROM users_clients
      WHERE users_clients.user_id = auth.uid()
      AND users_clients.client_id = sistema_cliente_secoes.client_id
    )
  );

-- 2) Bucket PRIVADO para os relatorios (PDF/imagem) da aba "Relatorios".
--    Caminho dos arquivos: <client_id>/<ano-mes>/<id>-<nome>. Acesso por URL assinada.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-reports', 'client-reports', false, 26214400,
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Somente admin e colaborador com a sessao "sistema" liberada (mesma regra das tabelas sistema_*)
CREATE POLICY "Equipe le relatorios de clientes" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'client-reports'
    AND (user_is_admin(auth.uid()) OR colaborador_tem_sessao(auth.uid(), 'sistema'))
  );

CREATE POLICY "Equipe envia relatorios de clientes" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'client-reports'
    AND (user_is_admin(auth.uid()) OR colaborador_tem_sessao(auth.uid(), 'sistema'))
  );

CREATE POLICY "Equipe apaga relatorios de clientes" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'client-reports'
    AND (user_is_admin(auth.uid()) OR colaborador_tem_sessao(auth.uid(), 'sistema'))
  );
