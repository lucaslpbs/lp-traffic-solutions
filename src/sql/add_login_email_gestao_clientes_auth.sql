-- ============================================================
-- RODAR NO SUPABASE "GESTAO CLIENTES"
-- URL: https://twclltazkfvtufbsehsv.supabase.co
-- Dashboard Supabase > SQL Editor > New Query > colar e rodar
--
-- Adiciona coluna login_email na tabela gestao_clientes
-- para armazenar o email de acesso vinculado ao cliente.
-- ============================================================

ALTER TABLE gestao_clientes
ADD COLUMN IF NOT EXISTS login_email TEXT;

-- Permite que admins atualizem users_clients (necessário para
-- a Edge Function manage-client-auth operar corretamente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users_clients'
    AND policyname = 'Admin pode atualizar em users_clients'
  ) THEN
    CREATE POLICY "Admin pode atualizar em users_clients" ON users_clients
      FOR UPDATE USING (user_is_admin(auth.uid()));
  END IF;
END
$$;
