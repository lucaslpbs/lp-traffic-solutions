-- Limita a 2 o numero de agendamentos (nao cancelados) que um cliente pode
-- ter com um mesmo influenciador dentro da mesma semana (segunda a domingo).
-- Vale tanto pra agendamento feito pelo proprio cliente quanto pelo admin em
-- nome dele, ja que os dois fluxos passam pelo mesmo insert em
-- influenciador_agendamentos. So dispara em INSERT: cancelar um agendamento
-- ja libera vaga (a contagem ignora status = 'cancelado'), e atualizar um
-- agendamento existente (ex: influenciador confirmando) nao deve ser barrado.

create or replace function public.check_limite_semanal_agendamento()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inicio_semana date;
  v_fim_semana date;
  v_count int;
begin
  if new.status = 'cancelado' then
    return new;
  end if;

  v_inicio_semana := date_trunc('week', new.data::timestamp)::date;
  v_fim_semana := v_inicio_semana + 6;

  select count(*) into v_count
  from public.influenciador_agendamentos
  where influenciador_id = new.influenciador_id
    and client_id = new.client_id
    and status <> 'cancelado'
    and data between v_inicio_semana and v_fim_semana;

  if v_count >= 2 then
    raise exception 'Limite de 2 agendamentos por semana com este influenciador atingido para este cliente.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_limite_semanal_agendamento on public.influenciador_agendamentos;
create trigger trg_limite_semanal_agendamento
  before insert on public.influenciador_agendamentos
  for each row execute function public.check_limite_semanal_agendamento();
