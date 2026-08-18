import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
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
  mes_atual: 'Este mês',
  mes_passado: 'Mês passado',
  ultimos_3: 'Últimos 3 meses',
  ultimos_6: 'Últimos 6 meses',
  ano_atual: 'Este ano',
  personalizado: 'Personalizado',
};

export function intervaloDoPreset(preset: PeriodoPreset): { inicio: Date | null; fim: Date | null } {
  const hoje = new Date();
  switch (preset) {
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
    onChange({ preset, ...intervaloDoPreset(preset) });
  };

  const DatePicker = ({
    label,
    date,
    onSelect,
  }: {
    label: string;
    date: Date | null;
    onSelect: (d: Date | undefined) => void;
  }) => (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-zinc-500 font-medium">{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[150px] justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white',
              !date && 'text-zinc-500'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-[#111] border-white/10" align="start">
          <Calendar
            mode="single"
            selected={date ?? undefined}
            onSelect={onSelect}
            initialFocus
            locale={ptBR}
            className="pointer-events-auto bg-[#111] text-white"
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className={cn('flex flex-wrap items-end gap-3', className)}>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-zinc-500 font-medium">Período</span>
        <Select value={value.preset} onValueChange={(v) => handlePreset(v as PeriodoPreset)}>
          <SelectTrigger className="w-[190px] bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-white/10 text-white">
            {(Object.keys(LABEL_PRESET) as PeriodoPreset[]).map((p) => (
              <SelectItem key={p} value={p} className="focus:bg-white/10 focus:text-white">
                {LABEL_PRESET[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
