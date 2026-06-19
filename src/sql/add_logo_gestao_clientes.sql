-- ============================================================
-- RODAR NO SUPABASE "GESTAO CLIENTES"
-- URL: https://twclltazkfvtufbsehsv.supabase.co
-- Dashboard Supabase > SQL Editor > New Query > colar e rodar
-- ============================================================

ALTER TABLE gestao_clientes
ADD COLUMN IF NOT EXISTS logo_url TEXT;
