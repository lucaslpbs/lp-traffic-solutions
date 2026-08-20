-- Painel de atendimento (Núcleo de Oftalmologia): permite que a chave anônima
-- leia/atualize atendentes_status e leia atendentes_log.
-- As tabelas e as linhas iniciais (carina/jeane) já foram criadas manualmente
-- pelo usuário; este script só adiciona as policies que faltavam.

alter table public.atendentes_status enable row level security;
alter table public.atendentes_log enable row level security;

drop policy if exists "anon select atendentes_status" on public.atendentes_status;
create policy "anon select atendentes_status"
  on public.atendentes_status
  for select
  to anon
  using (true);

drop policy if exists "anon update atendentes_status" on public.atendentes_status;
create policy "anon update atendentes_status"
  on public.atendentes_status
  for update
  to anon
  using (true)
  with check (true);

drop policy if exists "anon select atendentes_log" on public.atendentes_log;
create policy "anon select atendentes_log"
  on public.atendentes_log
  for select
  to anon
  using (true);

-- A trigger que grava o log roda com o papel "anon" (quem chamou o UPDATE).
-- Sem isso, o INSERT dela em atendentes_log é barrado pelo RLS e o UPDATE
-- inteiro é revertido. SECURITY DEFINER deixa a trigger gravar com o
-- privilégio do dono da função, sem precisar abrir INSERT para o anon.
create or replace function public.log_mudanca_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.ativo is distinct from old.ativo then
    insert into public.atendentes_log (nome, status_novo)
    values (new.nome, new.ativo);
  end if;
  return new;
end;
$$;
