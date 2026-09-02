-- RLS de influenciador_agendamentos so deixa um cliente ver os PROPRIOS
-- agendamentos (policy "Cliente ve seus agendamentos"), entao ele nunca
-- enxergava horarios/dias ja ocupados por OUTROS clientes do mesmo
-- influenciador — nem no seletor de horario do formulario, nem na aba
-- Agenda. Essa funcao devolve so data/hora/status (sem nome, telefone,
-- instagram de outro cliente) pra quem tem algum acesso a esse
-- influenciador (admin, o proprio influenciador, ou cliente vinculado a
-- ele) conseguir ver a disponibilidade real.
create or replace function public.listar_ocupacao_influenciador(p_influenciador_id uuid)
returns table (data date, hora_inicio time, hora_fim time, status text)
language sql
security definer
stable
set search_path = public
as $$
  select a.data, a.hora_inicio, a.hora_fim, a.status
  from public.influenciador_agendamentos a
  where a.influenciador_id = p_influenciador_id
    and a.status <> 'cancelado'
    and (
      public.user_is_admin(auth.uid())
      or public.eh_dono_influenciador(p_influenciador_id, auth.uid())
      or public.cliente_tem_influenciador_vinculado(p_influenciador_id, auth.uid())
    );
$$;
