import { Trophy, TrendingUp, Receipt, Medal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Stagger, StaggerItem } from '@/components/dashboard/Motion';
import { cn } from '@/lib/utils';
import { formatBRL } from './types';

const StatCard = ({
  icon: Icon,
  label,
  valor,
  destaque,
}: {
  icon: LucideIcon;
  label: string;
  valor: string;
  destaque?: boolean;
}) => (
  <div
    className={cn(
      'rounded-xl border p-5 h-full',
      destaque
        ? 'border-level/40 bg-gradient-to-br from-level-dark/25 to-level/10 shadow-lg shadow-level/10'
        : 'border-border bg-card'
    )}
  >
    <div className="flex items-center gap-2 text-muted-foreground mb-2">
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-xl xl:text-2xl font-bold text-foreground tabular-nums leading-tight break-words">
      {valor}
    </p>
  </div>
);

interface ResumoStatsProps {
  posicaoTexto: string;
  totalVendido: number;
  qtdVendas: number;
  melhorMes: number;
}

export const ResumoStats = ({
  posicaoTexto,
  totalVendido,
  qtdVendas,
  melhorMes,
}: ResumoStatsProps) => (
  <Stagger className="grid gap-5 sm:grid-cols-2" stagger={0.05}>
    <StaggerItem>
      <StatCard icon={Trophy} label="Posição" valor={posicaoTexto} destaque />
    </StaggerItem>
    <StaggerItem>
      <StatCard icon={TrendingUp} label="Total no período" valor={formatBRL(totalVendido)} />
    </StaggerItem>
    <StaggerItem>
      <StatCard icon={Receipt} label="Vendas" valor={String(qtdVendas)} />
    </StaggerItem>
    <StaggerItem>
      <StatCard icon={Medal} label="Melhor mês" valor={formatBRL(melhorMes)} />
    </StaggerItem>
  </Stagger>
);
