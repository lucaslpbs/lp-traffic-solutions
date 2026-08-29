import type { Transition, Variants } from 'framer-motion';

/**
 * Variants compartilhadas do painel interno.
 *
 * Regra geral: movimento curto (8–16px), rapido (0.2–0.35s) e sempre com
 * `prefers-reduced-motion` respeitado — o framer-motion nao faz isso sozinho,
 * quem faz e o hook `useReducedMotionSafe` abaixo, usado pelos wrappers.
 */

export const EASE_OUT: Transition['ease'] = [0.16, 1, 0.3, 1];

/** Container que escalona a entrada dos filhos (grids de KPI, listas). */
export const staggerContainer = (stagger = 0.05, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

/** Item padrao: sobe 12px com fade. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
};

/** Variante mais discreta, para blocos grandes (graficos, tabelas). */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25, ease: EASE_OUT } },
};

/**
 * Troca de aba/secao.
 *
 * O Radix desmonta o painel inativo, entao a entrada e o que o usuario percebe
 * como transicao. Um deslize horizontal curto le melhor que vertical aqui: as
 * abas ficam lado a lado, e o conteudo entrar "do lado" reforca de onde veio.
 */
export const tabPanel: Variants = {
  hidden: { opacity: 0, x: 12, filter: 'blur(3px)' },
  show: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.32, ease: EASE_OUT },
  },
  exit: { opacity: 0, x: -12, transition: { duration: 0.16, ease: 'easeIn' } },
};

/** Troca de rota dentro do shell do dashboard. */
export const routeTransition: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE_OUT } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.16, ease: 'easeIn' } },
};

/** Versao "sem movimento" — usada quando o usuario pede reducao de animacao. */
export const staticVariants: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1 },
  exit: { opacity: 1 },
};
