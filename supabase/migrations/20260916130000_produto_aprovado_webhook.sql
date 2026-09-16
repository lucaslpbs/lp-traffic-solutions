-- Parte 3 da demanda "Cadastro de imagens/produtos por cliente": notifica o
-- N8N assim que o admin aprova um produto, para o workflow converter as
-- imagens para WebP e gravar o resultado final no Supabase do SDR
-- (projeto separado, xhrcrusqzfckrjghjmgb.supabase.co — fora do alcance
-- desta migration, que so cobre o Supabase principal do app).
--
-- Mesmo padrao ja usado para a pagina de links do cliente (ver
-- 20260902120000_add_linktree_pages.sql): observador, nao escritor — dispara
-- depois que o Postgres ja aceitou a mudanca, via pg_net (assincrono). Se o
-- workflow no N8N ainda nao existir nessa URL, a chamada so recebe 404 e e
-- descartada, sem efeito nenhum na aprovacao do produto.

create extension if not exists pg_net;

create or replace function public.notify_produto_aprovado()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_cliente record;
  v_imagens jsonb;
begin
  select nome_cliente, numero_whatsapp_cliente
    into v_cliente
    from gestao_clientes
    where id = new.client_id;

  select coalesce(
    jsonb_agg(jsonb_build_object('url', original_url, 'ordem', ordem) order by ordem),
    '[]'::jsonb
  )
    into v_imagens
    from client_product_images
    where product_id = new.id;

  perform net.http_post(
    url := 'https://n8n.trafficsolutions.cloud/webhook/produto-aprovado',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'produto_id', new.id,
      'client_id', new.client_id,
      'nome_cliente', v_cliente.nome_cliente,
      'numero_whatsapp_cliente', v_cliente.numero_whatsapp_cliente,
      'nome_produto', new.nome_produto,
      'categoria', new.categoria,
      'preco', new.preco,
      'descricao', new.descricao,
      'imagens', v_imagens,
      'timestamp', now()
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_produto_aprovado_notify on public.client_products;

create trigger trg_produto_aprovado_notify
  after update on public.client_products
  for each row
  when (new.status = 'aprovado' and old.status is distinct from new.status)
  execute function public.notify_produto_aprovado();
