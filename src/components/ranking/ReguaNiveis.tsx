import { motion } from 'framer-motion';
import { Check, Lock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  NIVEIS,
  ESTRELAS_POR_NIVEL,
  estrelaPorOrdem,
  nivelPorOrdem,
  progressoNaRegua,
} from './niveis';

interface ReguaNiveisProps {
  /** Posicao do cliente na regua, 1..15. Nulo = ainda nao entrou. */
  ordem?: number | null;
}

/**
 * A jornada inteira numa faixa so: os cinco niveis lado a lado, cada um na sua
 * cor, com o degrau atual marcado.
 *
 * Diferente da barra de progresso do hero (que mede o proximo degrau), esta
 * responde "onde eu estou na regua toda e o que ainda falta" — que era uma
 * pergunta sem resposta na tela antiga.
 */
export const ReguaNiveis = ({ ordem }: ReguaNiveisProps) => {
  const nivelAtual = nivelPorOrdem(ordem);
  const estrelaAtual = estrelaPorOrdem(ordem);
  const progresso = progressoNaRegua(ordem);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/90">
          Régua de níveis
        </h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {ordem ? `Degrau ${ordem} de ${NIVEIS.length * ESTRELAS_POR_NIVEL}` : 'Não iniciado'}
        </span>
      </div>

      {/* ── Trilho continuo com o gradiente dos cinco niveis ── */}
      <div className="relative h-2 rounded-full bg-foreground/8 overflow-hidden mb-7">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progresso * 100}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{
            backgroundImage: `linear-gradient(90deg, ${NIVEIS.map((n) => n.hex).join(', ')})`,
            backgroundSize: `${progresso > 0 ? 100 / progresso : 100}% 100%`,
          }}
        />
      </div>

      {/* ── Os cinco degraus ── */}
      <ol className="grid grid-cols-5 gap-2.5 sm:gap-3">
        {NIVEIS.map((n, i) => {
          const atingido = !!nivelAtual && n.posicao < nivelAtual.posicao;
          const atual = nivelAtual?.slug === n.slug;
          const bloqueado = !atingido && !atual;

          return (
            <motion.li
              key={n.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 300, damping: 22 }}
              className={cn(
                'relative rounded-lg border p-2.5 text-center transition-colors',
                atual && 'border-transparent',
                atingido && 'border-border bg-surface-2/50 hover:bg-surface-2',
                bloqueado && 'border-border/60 bg-background/40 hover:bg-background/70'
              )}
              style={
                atual
                  ? {
                      borderColor: `${n.hex}66`,
                      backgroundColor: `${n.hex}1f`,
                      boxShadow: `0 0 24px -6px ${n.hex}80`,
                    }
                  : undefined
              }
            >
              {/* marcador de estado */}
              <div className="flex justify-center mb-1.5">
                {atual ? (
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full animate-pulse-glow"
                    style={{ backgroundColor: n.hex }}
                  >
                    <Star className="h-3.5 w-3.5 text-background fill-background" />
                  </span>
                ) : atingido ? (
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${n.hex}33`, color: n.hex }}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/5 text-muted-foreground/80">
                    <Lock className="h-3 w-3" />
                  </span>
                )}
              </div>

              <p
                className={cn(
                  'text-[11px] sm:text-xs font-semibold leading-tight truncate',
                  bloqueado ? 'text-muted-foreground' : 'text-foreground'
                )}
                style={atual ? { color: n.hex } : undefined}
              >
                {n.nome}
              </p>

              {atual && (
                <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  você está aqui
                </span>
              )}

              {/* estrelas do degrau atual */}
              {atual && (
                <div className="flex justify-center gap-0.5 mt-1">
                  {Array.from({ length: ESTRELAS_POR_NIVEL }).map((_, s) => (
                    <Star
                      key={s}
                      className="h-2.5 w-2.5"
                      style={{
                        color: n.hex,
                        fill: s < estrelaAtual ? n.hex : 'transparent',
                        opacity: s < estrelaAtual ? 1 : 0.35,
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
};
