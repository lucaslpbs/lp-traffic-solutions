-- ============================================================
-- RODAR NO SUPABASE DO SDR (projeto compartilhado entre os clientes
-- que têm SDR — cada cliente ganha sua PRÓPRIA TABELA aqui dentro,
-- não um projeto separado)
-- URL: https://xhrcrusqzfckrjghjmgb.supabase.co
-- Dashboard Supabase > SQL Editor > New Query > colar e rodar
--
-- Cria a função RPC que o N8N chama (via HTTP, service role key) toda
-- vez que o admin libera "Cadastro de Imagens/Produtos" pra um cliente
-- no app principal. Ela cria uma tabela nova, nomeada `produtos_<slug>`,
-- com o mesmo formato de `produtos_catalogo` (a tabela genérica que já
-- existe hoje — essa função substitui a necessidade dela pra clientes
-- novos, que passam a ter tabela própria).
-- ============================================================

create or replace function public.criar_tabela_produtos_cliente(p_slug text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_nome_tabela text;
begin
  -- mesmo formato de slug que o Supabase principal do app já gera
  -- (letra minuscula, numero, underscore — comeca com letra)
  if p_slug !~ '^[a-z][a-z0-9_]{2,50}$' then
    raise exception 'Slug invalido para nome de tabela: %', p_slug;
  end if;

  v_nome_tabela := 'produtos_' || p_slug;

  execute format($f$
    create table if not exists public.%I (
      id uuid primary key default gen_random_uuid(),
      produto_id uuid not null,
      nome_produto text not null,
      categoria text,
      preco numeric(12, 2),
      descricao text not null,
      imagens jsonb not null default '[]'::jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  $f$, v_nome_tabela);

  execute format(
    'create unique index if not exists %I on public.%I(produto_id)',
    'idx_' || v_nome_tabela || '_origem',
    v_nome_tabela
  );

  execute format('alter table public.%I enable row level security', v_nome_tabela);

  execute format('drop policy if exists "Leitura publica" on public.%I', v_nome_tabela);
  execute format(
    'create policy "Leitura publica" on public.%I for select using (true)',
    v_nome_tabela
  );
end;
$$;

-- Quem chama essa funcao e o N8N, usando a service role key (que ja
-- ignora RLS/grants por padrao no Supabase) — o grant abaixo e so por
-- clareza/consistencia.
grant execute on function public.criar_tabela_produtos_cliente(text) to service_role;
