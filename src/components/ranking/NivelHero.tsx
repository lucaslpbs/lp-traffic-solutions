import { motion } from 'framer-motion';
import { Star, Trophy, TrendingUp, Sparkles } from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { ProximoDegrau } from './ProximoDegrau';
import type { NivelCliente } from './nivel';
import { cn } from '@/lib/utils';
import { formatBRL } from './types';
import {
  ESTRELAS_POR_NIVEL,
  estrelaPorOrdem,
  nivelPorNome,
  type NivelMeta,
} from './niveis';

interface NivelHeroProps {
  nomeExibicao: string;
  fotoUrl?: string | null;
  nivelNome?: string | null;
  ordem?: number | null;
  posicao: number;
  totalVendido: number;
  /**
   * Dados de nivel do cliente. O bloco de progresso deriva daqui os dois
   * caminhos (mensal e acumulado) em vez de receber so um pronto.
   */
  nivel?: NivelCliente | null;
}

/** Tres estrelas do degrau atual, acendendo uma a uma. */
const Estrelas = ({ ativas, tamanho = 'h-5 w-5' }: { ativas: number; tamanho?: string }) => (
  <span className="flex items-center gap-1" aria-label={`${ativas} de ${ESTRELAS_POR_NIVEL} estrelas`}>
    {Array.from({ length: ESTRELAS_POR_NIVEL }).map((_, i) => {
      const acesa = i < ativas;
      return (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -60, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 0.35 + i * 0.12, type: 'spring', stiffness: 260, damping: 14 }}
        >
          <Star
            className={cn(
              tamanho,
              acesa
                ? 'fill-level-glow text-level-glow drop-shadow-[0_0_8px_hsl(var(--level-glow)/0.7)]'
                : 'text-foreground/20'
            )}
          />
        </motion.span>
      );
    })}
  </span>
);

/**
 * Cabecalho do ranking: identidade do cliente pintada com a cor do nivel dele.
 *
 * Substitui o "lamp" generico que existia antes — aquele era sempre azul e nao
 * dizia nada sobre onde a pessoa esta. Aqui o fundo, o brilho e as estrelas
 * acompanham o degrau, entao dois clientes em niveis diferentes veem telas
 * visivelmente diferentes.
 */
export const NivelHero = ({
  nomeExibicao,
  fotoUrl,
  nivelNome,
  ordem,
  posicao,
  totalVendido,
  nivel,
}: NivelHeroProps) => {
  const meta: NivelMeta | null = nivelPorNome(nivelNome);
  const estrelas = estrelaPorOrdem(ordem);
  const posicaoTexto = posicao > 0 ? `${posicao}º` : '—';

  return (
    <section className="relative overflow-hidden rounded-2xl border border-level/25 bg-card">
      {/* ── Fundo: manchas de luz na cor do nivel ── */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-level-dark/25 via-transparent to-level/10" />
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-level/25 blur-3xl animate-aurora" />
        <div
          className="absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-level-glow/20 blur-3xl animate-aurora"
          style={{ animationDelay: '-7s' }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-level/60 to-transparent" />
      </div>

      <div className="relative p-7 sm:p-9 lg:p-11">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
          {/* ── Identidade ── */}
          <div className="flex items-center gap-5 min-w-0 flex-1">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
              className="relative flex-shrink-0"
            >
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-level to-level-glow opacity-70 blur-md animate-pulse-glow" />
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt=""
                  className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover border-2 border-level/60"
                />
              ) : (
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-level/60 bg-surface-2 flex items-center justify-center">
                  <Trophy className="h-9 w-9 text-level" />
                </div>
              )}
            </motion.div>

            <div className="min-w-0">
              {meta ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="inline-flex items-center gap-2 rounded-full border border-level/40 bg-level/10 px-3 py-1 mb-2"
                >
                  <Sparkles className="h-3.5 w-3.5 text-level" />
                  <span className="text-xs font-bold uppercase tracking-widest text-level">
                    {meta.nome}
                  </span>
                </motion.div>
              ) : (
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Fora da régua
                </p>
              )}

              <h1 className="text-3xl sm:text-4xl font-bold text-foreground truncate">
                {nomeExibicao}
              </h1>

              {meta ? (
                <div className="flex items-center gap-3 mt-2">
                  <Estrelas ativas={estrelas} />
                  <span className="text-sm text-muted-foreground">{meta.legenda}</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  Registre suas vendas para entrar no primeiro degrau.
                </p>
              )}
            </div>
          </div>

          {/* ── Numeros ── */}
          <div className="flex gap-4 sm:gap-6 lg:flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-level/30 bg-background/40 backdrop-blur px-5 py-4 min-w-[110px]"
            >
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Trophy className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-widest">Posição</span>
              </div>
              <p className="text-3xl font-bold text-level tabular-nums leading-none">
                {posicaoTexto}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="rounded-xl border border-border bg-background/40 backdrop-blur px-5 py-4 flex-1 min-w-[150px]"
            >
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-widest">
                  Total vendido
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground tabular-nums leading-none">
                <AnimatedNumber value={totalVendido} format={formatBRL} delay={0.35} />
              </p>
            </motion.div>
          </div>
        </div>

        {/* ── Progresso: os dois caminhos da regua ── */}
        {nivel && (
          <div className="mt-9 pt-7 border-t border-level/15">
            <ProximoDegrau nivel={nivel} />
          </div>
        )}
      </div>
    </section>
  );
};
