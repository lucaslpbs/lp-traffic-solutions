import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

/**
 * Tom do cartao. Todos os KPIs eram azuis identicos, o que deixava a tela
 * monocromatica e sem hierarquia — agora o tom marca o grupo de metrica.
 */
export type KPITone = 'brand' | 'accent' | 'success' | 'warning' | 'info' | 'neutral';

const toneStyles: Record<KPITone, { icon: string; hover: string }> = {
  brand: { icon: 'bg-level/15 text-level', hover: 'hover:border-level/40' },
  accent: { icon: 'bg-accent/15 text-accent', hover: 'hover:border-accent/40' },
  success: { icon: 'bg-success/15 text-success', hover: 'hover:border-success/40' },
  warning: { icon: 'bg-warning/15 text-warning', hover: 'hover:border-warning/40' },
  info: { icon: 'bg-info/15 text-info', hover: 'hover:border-info/40' },
  neutral: {
    icon: 'bg-foreground/10 text-muted-foreground',
    hover: 'hover:border-foreground/25',
  },
};

export interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  prefix?: string;
  suffix?: string;
  tone?: KPITone;
  /** Texto de apoio abaixo do valor (contexto, comparativo). */
  hint?: string;
  className?: string;
}

export const KPICard = ({
  title,
  value,
  icon: Icon,
  trend,
  prefix = '',
  suffix = '',
  tone = 'brand',
  hint,
  className,
}: KPICardProps) => {
  const styles = toneStyles[tone];

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-5 h-full',
        'transition-colors duration-300 hover:bg-surface-2/60',
        styles.hover,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1 tabular-nums break-words">
            {prefix}
            {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            {suffix}
          </p>
          {trend !== undefined && (
            <p
              className={cn(
                'text-xs mt-1 font-medium tabular-nums',
                trend >= 0 ? 'text-success' : 'text-destructive'
              )}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
            </p>
          )}
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
        <div className={cn('p-3 rounded-lg flex-shrink-0', styles.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
