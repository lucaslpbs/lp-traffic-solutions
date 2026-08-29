import type { ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeIn, fadeUp, staggerContainer } from '@/lib/motion';

/**
 * Wrappers de animacao do painel interno.
 *
 * O respeito a `prefers-reduced-motion` vem do <MotionConfig reducedMotion="user">
 * montado uma unica vez no DashboardLayout — o framer neutraliza os transforms
 * automaticamente, entao aqui nao ha checagem duplicada.
 */

interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Intervalo entre os filhos, em segundos. */
  stagger?: number;
  /** Atraso antes do primeiro filho, em segundos. */
  delay?: number;
}

/** Container que escalona a entrada dos filhos. Use com <StaggerItem>. */
export const Stagger = ({ children, className, stagger = 0.05, delay = 0 }: StaggerProps) => (
  <motion.div
    variants={staggerContainer(stagger, delay)}
    initial="hidden"
    animate="show"
    className={className}
  >
    {children}
  </motion.div>
);

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}

/** Filho direto de <Stagger>. Sobe 12px com fade. */
export const StaggerItem = ({ children, className, variants = fadeUp }: StaggerItemProps) => (
  <motion.div variants={variants} className={className}>
    {children}
  </motion.div>
);

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Atraso da entrada, em segundos. */
  delay?: number;
  /** `subtle` so faz fade — indicado para blocos grandes (graficos, tabelas). */
  subtle?: boolean;
}

/** Entrada avulsa, sem container de stagger. */
export const Reveal = ({ children, className, delay = 0, subtle = false }: RevealProps) => (
  <motion.div
    variants={subtle ? fadeIn : fadeUp}
    initial="hidden"
    animate="show"
    transition={{ delay }}
    className={className}
  >
    {children}
  </motion.div>
);

interface StaticProps {
  children: ReactNode;
  className?: string;
}

/**
 * Escape hatch para conteudo capturado pelo html2canvas (geracao de PDF em
 * ClientReport): o canvas fotografa o DOM no estado atual e nao espera a
 * animacao terminar, entao ali nao pode haver opacity/transform em curso.
 */
export const NoMotion = ({ children, className }: StaticProps) => (
  <div className={cn(className)}>{children}</div>
);
