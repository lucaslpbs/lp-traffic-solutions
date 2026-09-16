-- Quando o admin libera "Cadastro de Imagens/Produtos" pra um cliente,
-- avisa o N8N pra criar a tabela dedicada daquele cliente no Supabase do
-- SDR (produtos_<slug>). Mesmo padrao de notify_produto_aprovado
-- (20260916130000): observador via pg_net, nao bloqueia a gravacao.
--
-- O slug e calculado aqui (uma vez so) e reaproveitado tanto nesse
-- webhook quanto no de aprovacao de produto, pra garantir que os dois
-- lados (criar tabela / gravar na tabela) cheguem sempre no mesmo nome.

create extension if not exists unaccent;

create or replace function public.slugify_cliente(p_nome text)
returns text
language sql
immutable
set search_path to 'public'
as $$
  select case
    when left(base, 1) ~ '[a-z]' then left(base, 50)
    else 'c_' || left(base, 48)
  end
  from (
    select regexp_replace(
      regexp_replace(lower(unaccent(coalesce(p_nome, ''))), '[^a-z0-9]+', '_', 'g'),
      '(^_+|_+$)', '', 'g'
    ) as base
  ) s;
$$;

create or replace function public.notify_cliente_produtos_liberado()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  perform net.http_post(
    url := 'https://n8n.trafficsolutions.cloud/webhook/cliente-aprovado',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'client_id', new.id,
      'nome_cliente', new.nome_cliente,
      'slug', public.slugify_cliente(new.nome_cliente),
      'timestamp', now()
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_cliente_produtos_liberado_notify on public.gestao_clientes;

create trigger trg_cliente_produtos_liberado_notify
  after update on public.gestao_clientes
  for each row
  when (
    new.cadastro_produtos_ativo = true
    and old.cadastro_produtos_ativo is distinct from new.cadastro_produtos_ativo
  )
  execute function public.notify_cliente_produtos_liberado();
