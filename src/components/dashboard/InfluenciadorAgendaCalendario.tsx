// @ts-nocheck
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Phone, Instagram } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  if (status === 'confirmado') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success border border-success/30">
        Confirmado
      </span>
    );
  }
  if (status === 'cancelado') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/20 text-destructive border border-destructive/30">
        Cancelado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-500 border border-amber-500/30">
      Pendente
    </span>
  );
}

/**
 * Visao de calendario (mes grande): marca com um ponto verde/ambar os dias
 * que tem agendamento confirmado/pendente, e ao clicar num dia mostra os
 * agendamentos daquele dia ao lado.
 *
 * `detalhado` controla o nivel de informacao do painel do dia: admin/
 * influenciador (true) veem cliente, telefone, instagram e servico de cada
 * item; cliente (false) ve so o horario e o status — os itens que chegam
 * nesse caso vem da RPC listar_ocupacao_influenciador, que ja nao devolve
 * dado de contato de outros clientes (RLS de influenciador_agendamentos
 * restringe o cliente a ver so os PROPRIOS agendamentos).
 */
export default function InfluenciadorAgendaCalendario({
  agendamentos,
  detalhado = true,
}: {
  agendamentos: any[];
  detalhado?: boolean;
}) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const porData = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const a of agendamentos) {
      if (a.status === 'cancelado') continue;
      if (!map.has(a.data)) map.set(a.data, []);
      map.get(a.data)!.push(a);
    }
    return map;
  }, [agendamentos]);

  const diasConfirmado = useMemo(
    () =>
      Array.from(porData.entries())
        .filter(([, itens]) => itens.some((a) => a.status === 'confirmado'))
        .map(([data]) => new Date(`${data}T00:00:00`)),
    [porData]
  );
  const diasPendente = useMemo(
    () =>
      Array.from(porData.entries())
        .filter(([, itens]) => itens.every((a) => a.status !== 'confirmado'))
        .map(([data]) => new Date(`${data}T00:00:00`)),
    [porData]
  );

  const selectedKey = format(selectedDate, 'yyyy-MM-dd');
  const itensDoDia = (porData.get(selectedKey) ?? [])
    .slice()
    .sort((a, b) => String(a.hora_inicio).localeCompare(String(b.hora_inicio)));

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr] p-5">
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => d && setSelectedDate(d)}
          locale={ptBR}
          modifiers={{ diaConfirmado: diasConfirmado, diaPendente: diasPendente }}
          modifiersClassNames={{
            diaConfirmado:
              'after:content-[\'\'] after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-success',
            diaPendente:
              'after:content-[\'\'] after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-amber-500',
          }}
          classNames={{
            cell: 'h-12 w-12 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
            day: 'h-12 w-12 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-foreground/10 relative',
            caption_label: 'text-base font-medium',
          }}
          className="pointer-events-auto bg-foreground/5 border border-foreground/10 rounded-xl"
        />
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" /> Confirmado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" /> Pendente
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 capitalize">
          {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
        </h3>
        {itensDoDia.length === 0 ? (
          <p className="text-sm text-muted-foreground">Dia livre — nenhum agendamento.</p>
        ) : (
          <div className="space-y-2">
            {itensDoDia.map((a: any, idx: number) => (
              <div
                key={a.id ?? `${a.hora_inicio}-${idx}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-foreground/10 bg-foreground/[0.02] px-3 py-2"
              >
                {detalhado ? (
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {String(a.hora_inicio).slice(0, 5)} ·{' '}
                      <span className="capitalize text-muted-foreground">{a.servico}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{a.gestao_clientes?.nome_cliente ?? '—'}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {a.telefone_contato}
                      </span>
                      {a.instagram_contato && (
                        <span className="flex items-center gap-1">
                          <Instagram className="h-3 w-3" />
                          {a.instagram_contato}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-foreground">
                    {String(a.hora_inicio).slice(0, 5)}–{String(a.hora_fim).slice(0, 5)}
                  </p>
                )}
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
