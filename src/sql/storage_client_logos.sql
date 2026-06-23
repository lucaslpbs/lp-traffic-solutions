-- ============================================================
-- RODAR NO SUPABASE "GESTAO CLIENTES"
-- URL: https://twclltazkfvtufbsehsv.supabase.co
-- Dashboard Supabase > SQL Editor > New Query > colar e rodar
--
-- Cria o bucket "client-logos" no Supabase Storage e as
-- policies de acesso (leitura publica, escrita somente admin).
-- ============================================================

-- 1. Criar o bucket (publico para leitura de imagens)
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-logos', 'client-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Leitura publica (qualquer pessoa pode ver as logos)
CREATE POLICY "Leitura publica de logos de clientes"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-logos');

-- 3. Upload restrito a admins
CREATE POLICY "Admin pode fazer upload de logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'client-logos'
  AND user_is_admin(auth.uid())
);

-- 4. Sobrescrever/atualizar restrito a admins
CREATE POLICY "Admin pode atualizar logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'client-logos'
  AND user_is_admin(auth.uid())
);

-- 5. Deletar restrito a admins
CREATE POLICY "Admin pode deletar logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'client-logos'
  AND user_is_admin(auth.uid())
);
