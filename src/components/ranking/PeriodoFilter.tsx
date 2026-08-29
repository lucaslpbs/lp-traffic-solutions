import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type PeriodoPreset =
  | 'todos'
  | 'hoje'
  | 'dia'
  | 'mes_atual'
  | 'mes_passado'
  | 'ultimos_3'
  | 'ultimos_6'
  | 'ano_atual'
  | 'personalizado';

export interface Periodo {
  preset: PeriodoPreset;
  inicio: Date | null;
  fim: Date | null;
}

export const PERIODO_PADRAO: Periodo = { preset: 'todos', inicio: null, fim: null };

export const LABEL_PRESET: Record<PeriodoPreset, string> = {
  todos: 'Todo o período',
  hoje: 'Hoje',
  dia: 'Dia específico',
  mes_atual: 'Este mês',
  mes_passado: 'Mês passado',
  ultimos_3: 'Últimos 3 meses',
  ultimos_6: 'Últimos 6 meses',
  ano_atual: 'Este ano',
  personalizado: 'Entre duas datas',
};

export function intervaloDoPreset(preset: PeriodoPreset): { inicio: Date | null; fim: Date | null } {
  const hoje = new Date();
  switch (preset) {
    case 'hoje':
    case 'dia':
      return { inicio: hoje, fim: hoje };
    case 'mes_atual':
      return { inicio: startOfMonth(hoje), fim: endOfMonth(hoje) };
    case 'mes_passado': {
      const ref = subMonths(hoje, 1);
      return { inicio: startOfMonth(ref), fim: endOfMonth(ref) };
    }
    case 'ultimos_3':
      return { inicio: startOfMonth(subMonths(hoje, 2)), fim: endOfMonth(hoje) };
    case 'ultimos_6':
      return { inicio: startOfMonth(subMonths(hoje, 5)), fim: endOfMonth(hoje) };
    case 'ano_atual':
      return { inicio: startOfYear(hoje), fim: endOfYear(hoje) };
    default:
      return { inicio: null, fim: null };
  }
}

/** Converte o período em parametros da RPC ranking_geral */
export const paramsPeriodo = (p: Periodo) => ({
  p_inicio: p.inicio ? format(p.inicio, 'yyyy-MM-dd') : null,
  p_fim: p.fim ? format(p.fim, 'yyyy-MM-dd') : null,
});


const ANO_INICIAL = 2023;

/** Calendario em tema escuro, com selects de mes/ano para ir direto a datas antigas. */
const CalendarioEscuro = ({
  date,
  onSelect,
}: {
  date: Date | null;
  onSelect: (d: Date | undefined) => void;
}) => (
  <Calendar
    mode="single"
    selected={date ?? undefined}
    onSelect={onSelect}
    defaultMonth={date ?? undefined}
    initialFocus
    locale={ptBR}
    captionLayout="dropdown-buttons"
    fromYear={ANO_INICIAL}
    toYear={new Date().getFullYear() + 1}
    className="pointer-events-auto bg-surface-1 text-foreground"
    classNames={{
      caption_dropdowns: 'flex gap-1.5',
      dropdown:
        'bg-surface-1 text-foreground text-sm rounded-md border border-foreground/10 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary',
      dropdown_month: 'capitalize',
      day_today: 'bg-foreground/10 text-foreground',
      day_selected:
        'bg-primary text-foreground hover:bg-primary hover:text-foreground focus:bg-primary focus:text-foreground',
      head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
      day_outside: 'day-outside text-muted-foreground/80 opacity-50',
    }}
  />
);

const DatePicker = ({
  label,
  date,
  onSelect,
  largura = 'w-[150px]',
}: {
  label: string;
  date: Date | null;
  onSelect: (d: Date | undefined) => void;
  largura?: string;
}) => {
  const [aberto, setAberto] = useState(false);

  return (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-muted-foreground font-medium">{label}</span>
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            largura,
            'justify-start text-left font-normal bg-foreground/5 border-foreground/10 text-foreground hover:bg-foreground/10 hover:text-foreground',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-surface-1 border-foreground/10" align="start">
        <CalendarioEscuro
          date={date}
          onSelect={(d) => {
            onSelect(d);
            if (d) setAberto(false);
          }}
        />
      </PopoverContent>
    </Popover>
  </div>
  );
};

interface PeriodoFilterProps {
  value: Periodo;
  onChange: (p: Periodo) => void;
  className?: string;
}

export const PeriodoFilter = ({ value, onChange, className }: PeriodoFilterProps) => {
  const handlePreset = (preset: PeriodoPreset) => {
    if (preset === 'personalizado') {
      const base = intervaloDoPreset('mes_atual');
      onChange({
        preset,
        inicio: value.inicio ?? base.inicio,
        fim: value.fim ?? base.fim,
      });
      return;
    }
    if (preset === 'dia') {
      const dia = value.inicio ?? new Date();
      onChange({ preset, inicio: dia, fim: dia });
      return;
    }
    onChange({ preset, ...intervaloDoPreset(preset) });
  };

  return (
    <div className={cn('flex flex-wrap items-end gap-3', className)}>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground font-medium">Período</span>
        <Select value={value.preset} onValueChange={(v) => handlePreset(v as PeriodoPreset)}>
          <SelectTrigger className="w-[190px] bg-foreground/5 border-foreground/10 text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-surface-1 border-foreground/10 text-foreground">
            {(Object.keys(LABEL_PRESET) as PeriodoPreset[]).map((p) => (
              <SelectItem key={p} value={p} className="focus:bg-foreground/10 focus:text-foreground">
                {LABEL_PRESET[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Um dia especifico */}
      {value.preset === 'dia' && (
        <DatePicker
          label="Data"
          date={value.inicio}
          onSelect={(d) => d && onChange({ ...value, inicio: d, fim: d })}
          largura="w-[170px]"
        />
      )}

      {/* Intervalo entre duas datas */}
      {value.preset === 'personalizado' && (
        <>
          <DatePicker
            label="De"
            date={value.inicio}
            onSelect={(d) => onChange({ ...value, inicio: d ?? null })}
          />
          <DatePicker
            label="Até"
            date={value.fim}
            onSelect={(d) => onChange({ ...value, fim: d ?? null })}
          />
        </>
      )}
    </div>
  );
};
