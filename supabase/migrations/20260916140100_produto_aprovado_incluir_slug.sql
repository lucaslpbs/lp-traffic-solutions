-- Adiciona o campo `slug` (mesmo calculo de slugify_cliente, criado na
-- migration anterior) no payload que notify_produto_aprovado manda pro
-- N8N — assim o fluxo de aprovacao de produto sabe em qual tabela
-- dedicada do cliente (produtos_<slug>) gravar, sem ter que recalcular
-- esse nome do zero dentro do N8N.

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
      'slug', public.slugify_cliente(v_cliente.nome_cliente),
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
