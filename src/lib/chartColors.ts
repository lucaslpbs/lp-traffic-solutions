/**
 * Paleta das series de grafico do painel interno.
 *
 * O Recharts recebe cor como string (stroke/fill), nao como classe utilitaria —
 * entao esta e a forma correta de centralizar essas cores. Os valores sao os
 * mesmos que ja estavam espalhados no JSX; a diferenca e que agora existe um
 * unico lugar para altera-los.
 *
 * `brand` acompanha o --primary do tema do dashboard (#3b82f6).
 */
export const chartColors = {
  brand: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  accent: '#8b5cf6',
  pink: '#ec4899',
  cyan: '#06b6d4',
  orange: '#f97316',
} as const;

export type ChartColorName = keyof typeof chartColors;

/** Ordem usada quando as series sao geradas dinamicamente. */
export const chartSeries: string[] = [
  chartColors.brand,
  chartColors.success,
  chartColors.warning,
  chartColors.accent,
  chartColors.pink,
  chartColors.cyan,
  chartColors.orange,
];

/** Cor da serie na posicao `index`, com wrap-around. */
export const seriesColor = (index: number) =>
  chartSeries[index % chartSeries.length];

/** Tons neutros dos eixos/grade — casam com o tema escuro do painel. */
export const chartAxis = {
  grid: 'hsl(0 0% 100% / 0.08)',
  line: 'hsl(0 0% 100% / 0.2)',
  tick: 'hsl(0 0% 65%)',
} as const;
