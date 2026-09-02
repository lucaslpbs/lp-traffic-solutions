-- Hardening pos-migration da pagina de links: fecha grants implicitos de
-- PUBLIC (Postgres concede EXECUTE a PUBLIC por padrao na criacao de toda
-- funcao).
--
-- O advisor tambem aponta "pg_net instalada no schema public" -- essa
-- extensao e nao-relocavel (ALTER EXTENSION ... SET SCHEMA falha com
-- 0A000), entao fica assim mesmo; e um aviso conhecido/aceito em projetos
-- Supabase que usam pg_net.

revoke execute on function public.update_linktree_page(text, text, text, text, text, jsonb, boolean) from public;
grant execute on function public.update_linktree_page(text, text, text, text, text, jsonb, boolean) to authenticated;

-- notify_linktree_change so deve rodar como trigger (dispara com o
-- privilegio do dono da tabela, sem precisar de grant nenhum) -- ninguem
-- precisa chama-la via RPC.
revoke execute on function public.notify_linktree_change() from public;
revoke execute on function public.notify_linktree_change() from anon, authenticated;
