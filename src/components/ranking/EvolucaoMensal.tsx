import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatBRL, parseDateOnly } from './types';

interface EvolucaoMensalProps {
  /** Meses em ordem decrescente, no formato { mes: 'YYYY-MM', total }. */
  porMes: { mes: string; total: number }[];
}

/** Barras horizontais do total vendido por mes, normalizadas pelo melhor mes. */
export const EvolucaoMensal = ({ porMes }: EvolucaoMensalProps) => {
  const melhorMes = porMes.length ? Math.max(...porMes.map((m) => m.total)) : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Evolução por mês
      </h3>
      {porMes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma venda no período selecionado.</p>
      ) : (
        <div className="space-y-4">
          {porMes.map(({ mes, total }, i) => (
            <div key={mes} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground capitalize">
                  {format(parseDateOnly(`${mes}-01`), "MMMM 'de' yyyy", { locale: ptBR })}
                </span>
                <span className="font-semibold text-foreground tabular-nums">
                  {formatBRL(total)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${melhorMes ? (total / melhorMes) * 100 : 0}%` }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-level-dark to-level"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
