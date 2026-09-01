-- Campos opcionais adicionais no cadastro de cliente.
alter table public.gestao_clientes
  add column if not exists instagram text,
  add column if not exists endereco text;
