import { motion } from 'framer-motion';
import { Building2, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatBRL, type RankingRow } from './types';

interface PodioProps {
  rows: RankingRow[];
  destaqueId?: string | null;
}

/** Ouro, prata e bronze — as unicas cores fixas da tela, por convencao. */
const METAL = {
  1: { nome: 'ouro', cor: '#fbbf24', altura: 'h-28 sm:h-36', ordem: 'order-2' },
  2: { nome: 'prata', cor: '#cbd5e1', altura: 'h-20 sm:h-24', ordem: 'order-1' },
  3: { nome: 'bronze', cor: '#d98b52', altura: 'h-16 sm:h-20', ordem: 'order-3' },
} as const;

const Avatar = ({ row, cor, grande }: { row: RankingRow; cor: string; grande: boolean }) => {
  const tamanho = grande ? 'h-16 w-16 sm:h-20 sm:w-20' : 'h-12 w-12 sm:h-14 sm:w-14';
  return (
    <div className="relative">
      <div
        className="absolute -inset-1 rounded-2xl blur-md opacity-60"
        style={{ backgroundColor: cor }}
        aria-hidden
      />
      {row.foto_url ? (
        <img
          src={row.foto_url}
          alt=""
          className={cn('relative rounded-2xl object-cover border-2', tamanho)}
          style={{ borderColor: cor }}
        />
      ) : (
        <div
          className={cn(
            'relative rounded-2xl border-2 bg-surface-2 flex items-center justify-center',
            tamanho
          )}
          style={{ borderColor: cor }}
        >
          <Building2 className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

/**
 * Podio dos tres primeiros. Antes o topo do ranking era so as tres primeiras
 * linhas de uma tabela, com um emoji de medalha — nada que desse a sensacao de
 * disputa. Os degraus sobem do chao ao entrar na tela.
 */
export const Podio = ({ rows, destaqueId }: PodioProps) => {
  const top = rows.slice(0, 3).map((r, i) => ({ ...r, posicao: r.posicao || i + 1 }));
  if (top.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 sm:p-8 overflow-hidden">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/90 mb-8">
        Pódio do período
      </h3>

      <div className="flex items-end justify-center gap-3 sm:gap-6">
        {top.map((row, i) => {
          const metal = METAL[row.posicao as 1 | 2 | 3] ?? METAL[3];
          const primeiro = row.posicao === 1;
          const euMesmo = row.client_id === destaqueId;

          return (
            <motion.div
              key={row.client_id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.12, type: 'spring', stiffness: 200, damping: 22 }}
              className={cn('flex flex-col items-center flex-1 max-w-[150px]', metal.ordem)}
            >
              {primeiro && (
                <motion.div
                  initial={{ opacity: 0, y: 10, rotate: -20 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay: 0.55, type: 'spring', stiffness: 250, damping: 12 }}
                  className="mb-1 animate-float"
                >
                  <Crown className="h-6 w-6" style={{ color: metal.cor }} />
                </motion.div>
              )}

              <Avatar row={row} cor={metal.cor} grande={primeiro} />

              <p
                className={cn(
                  'mt-2 text-xs sm:text-sm font-semibold text-center leading-tight truncate w-full',
                  euMesmo ? 'text-level' : 'text-foreground'
                )}
              >
                {row.apelido || row.nome_cliente}
              </p>
              <p className="text-[11px] sm:text-xs font-bold tabular-nums" style={{ color: metal.cor }}>
                {formatBRL(row.total_vendido)}
              </p>

              {/* degrau */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.25 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'bottom' }}
                className={cn(
                  'relative mt-2 w-full rounded-t-lg overflow-hidden border-t border-x',
                  metal.altura
                )}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, ${metal.cor}40 0%, ${metal.cor}0d 100%)`,
                    borderColor: `${metal.cor}55`,
                  }}
                />
                <span
                  className="absolute inset-0 flex items-start justify-center pt-2 text-2xl sm:text-3xl font-black tabular-nums"
                  style={{ color: metal.cor }}
                >
                  {row.posicao}
                </span>
                {primeiro && (
                  <span className="absolute inset-0 overflow-hidden">
                    <span className="absolute inset-y-0 w-1/3 bg-foreground/15 blur-sm animate-sheen" />
                  </span>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
