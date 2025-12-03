import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const KPICard = ({ 
  title, 
  value, 
  icon: Icon,
  trend,
  prefix = '',
  suffix = '',
  className
}: KPICardProps) => {
  return (
    <div className={cn(
      "glass-card rounded-xl p-5 neon-border transition-all duration-300 hover:scale-[1.02]",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}{suffix}
          </p>
          {trend !== undefined && (
            <p className={cn(
              "text-xs mt-1 font-medium",
              trend >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/20">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
};
