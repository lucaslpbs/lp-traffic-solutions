-- ============================================================
-- RODAR NO SUPABASE "GESTAO CLIENTES"
-- URL: https://twclltazkfvtufbsehsv.supabase.co
-- Dashboard Supabase > SQL Editor > New Query > colar e rodar
--
-- Este projeto ja tem: gestao_clientes, form_leads,
-- war_room_metrics, sistema_*. Agora ele tambem hospeda
-- o Auth (login/sessao) e as tabelas de papeis abaixo.
-- ============================================================

-- Tabela de vinculo usuario <-> cliente
CREATE TABLE IF NOT EXISTS users_clients (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  role TEXT DEFAULT 'cliente',
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, client_id)
);

-- Tabela de admins
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Funcao que checa se o usuario e admin
CREATE OR REPLACE FUNCTION user_is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.user_id = user_is_admin.user_id
  );
$$;

-- Funcao que checa se o usuario tem acesso a um client_id especifico
CREATE OR REPLACE FUNCTION user_has_client_access(client_id TEXT, user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users_clients
    WHERE users_clients.user_id = user_has_client_access.user_id
    AND users_clients.client_id = user_has_client_access.client_id
  );
$$;

-- RLS
ALTER TABLE users_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario ve seu proprio vinculo" ON users_clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin ve tudo em users_clients" ON users_clients
  FOR SELECT USING (user_is_admin(auth.uid()));

CREATE POLICY "Admin pode inserir em users_clients" ON users_clients
  FOR INSERT WITH CHECK (user_is_admin(auth.uid()));

CREATE POLICY "Admin pode deletar em users_clients" ON users_clients
  FOR DELETE USING (user_is_admin(auth.uid()));

CREATE POLICY "Usuario ve se e admin" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- INSERIR PRIMEIRO ADMIN
-- Depois de criar a conta no Auth deste projeto, pegar o user_id
-- (Authentication > Users no dashboard) e rodar:
-- ============================================================
-- INSERT INTO admin_users (user_id) VALUES ('<seu-user-id-aqui>');
