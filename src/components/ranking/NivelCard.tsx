import { motion } from 'framer-motion';
import { Award, Trophy, Lock } from 'lucide-react';
import { usePlacasCliente } from './nivel';
import { formatBRL, formatDataBR } from './types';
import { Stagger, StaggerItem } from '@/components/dashboard/Motion';
import { CardGridSkeleton } from '@/components/dashboard/Skeletons';
import { cn } from '@/lib/utils';

/**
 * Placas conquistadas, como troféus.
 *
 * Antes eram chips de texto numa linha; o marco de faturamento que a placa
 * representa e uma conquista rara, e a tela nao dava esse peso a ela.
 */
export const PlacasConquistadas = ({ clientId }: { clientId: string }) => {
  const { data: placas = [], isLoading } = usePlacasCliente(clientId);

  // Skeleton em vez de null: sumir com o bloco inteiro enquanto carrega fazia
  // o resto da aba saltar para cima e voltar quando os dados chegavam.
  if (isLoading) return <CardGridSkeleton count={3} className="sm:grid-cols-3 lg:grid-cols-3" />;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-5 w-5 text-level" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/90">
          Placas conquistadas
        </h3>
        {placas.length > 0 && (
          <span className="ml-auto rounded-full bg-level/15 px-2 py-0.5 text-xs font-bold text-level tabular-nums">
            {placas.length}
          </span>
        )}
      </div>

      {placas.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="rounded-full bg-foreground/5 p-4 mb-3">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Nenhuma placa ainda. Elas são desbloqueadas ao bater marcos de faturamento acumulado.
          </p>
        </div>
      ) : (
        <Stagger className="grid grid-cols-2 sm:grid-cols-3 gap-4" stagger={0.07}>
          {placas.map((p) => (
            <StaggerItem key={p.id}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                title={`Atingido em ${formatDataBR(p.atingido_em)}`}
                className="group relative h-full overflow-hidden rounded-xl border border-level/30 bg-gradient-to-b from-level/15 to-transparent p-4 text-center"
              >
                {/* brilho passando ao apontar */}
                <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="absolute inset-y-0 w-1/3 bg-foreground/20 blur-md animate-sheen" />
                </span>

                <Trophy className="relative mx-auto h-7 w-7 text-level drop-shadow-[0_0_10px_hsl(var(--level)/0.6)] mb-2" />
                <p className="relative text-sm font-bold text-foreground leading-tight">{p.nome}</p>
                <p className="relative text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                  {formatBRL(p.valor_acumulado_minimo)}
                </p>
                <span
                  className={cn(
                    'relative mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    p.entregue
                      ? 'bg-success/15 text-success'
                      : 'bg-warning/15 text-warning'
                  )}
                >
                  {p.entregue ? 'Entregue' : 'A caminho'}
                </span>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
};
