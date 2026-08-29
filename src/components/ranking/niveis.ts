/**
 * A regua de niveis do ranking e a identidade visual de cada um.
 *
 * Os degraus vem da tabela `ranking_config_niveis`: 5 niveis x 3 estrelas,
 * ordem 1..15. Aqui ficam so o nome, a cor e o texto de cada faixa — os
 * valores de meta continuam sendo do banco, porque o admin pode mudar.
 *
 * A cor de cada nivel vira um conjunto de CSS vars (--level, --level-dark,
 * --level-glow) aplicado no <html> via data-nivel, entao qualquer tela pode
 * usar `bg-level`, `text-level`, `shadow-level` e acompanhar o nivel do
 * cliente logado sem receber nada por prop.
 */

export type NivelSlug = 'starter' | 'growth' | 'performance' | 'scale' | 'enterprise';

export interface NivelMeta {
  slug: NivelSlug;
  nome: string;
  /** Posicao na regua, 1 a 5. */
  posicao: number;
  /** Como a faixa e descrita para o cliente. */
  legenda: string;
  /** Hex da cor do nivel — para SVG/canvas, que nao leem classe utilitaria. */
  hex: string;
}

export const NIVEIS: NivelMeta[] = [
  {
    slug: 'starter',
    nome: 'Starter',
    posicao: 1,
    legenda: 'O começo da jornada',
    hex: '#fabc1e',
  },
  {
    slug: 'growth',
    nome: 'Growth',
    posicao: 2,
    legenda: 'Crescimento consistente',
    hex: '#f97316',
  },
  {
    slug: 'performance',
    nome: 'Performance',
    posicao: 3,
    legenda: 'Máquina de vendas azeitada',
    hex: '#12cf8f',
  },
  {
    slug: 'scale',
    nome: 'Scale',
    posicao: 4,
    legenda: 'Operação em escala',
    hex: '#3b82f6',
  },
  {
    slug: 'enterprise',
    nome: 'Enterprise',
    posicao: 5,
    legenda: 'O topo da régua',
    hex: '#f7466a',
  },
];

const PorSlug = new Map(NIVEIS.map((n) => [n.slug, n]));
const PorNome = new Map(NIVEIS.map((n) => [n.nome.toLowerCase(), n]));

export const TOTAL_NIVEIS = NIVEIS.length;
export const ESTRELAS_POR_NIVEL = 3;
export const TOTAL_DEGRAUS = TOTAL_NIVEIS * ESTRELAS_POR_NIVEL;

/** Converte o nome vindo do banco ("Growth") no slug do tema. */
export const nivelPorNome = (nome?: string | null): NivelMeta | null =>
  (nome && PorNome.get(nome.trim().toLowerCase())) || null;

export const nivelPorSlug = (slug?: string | null): NivelMeta | null =>
  (slug && PorSlug.get(slug as NivelSlug)) || null;

/** Nivel correspondente a uma `ordem` de 1..15 da regua. */
export const nivelPorOrdem = (ordem?: number | null): NivelMeta | null => {
  if (!ordem || ordem < 1) return null;
  const idx = Math.min(TOTAL_NIVEIS, Math.ceil(ordem / ESTRELAS_POR_NIVEL)) - 1;
  return NIVEIS[idx] ?? null;
};

/** Estrela (1..3) dentro do nivel, a partir da `ordem` de 1..15. */
export const estrelaPorOrdem = (ordem?: number | null): number =>
  ordem && ordem >= 1 ? ((ordem - 1) % ESTRELAS_POR_NIVEL) + 1 : 0;

/**
 * Progresso do cliente na regua inteira, de 0 a 1. Usado pela barra que mostra
 * os 5 niveis lado a lado — nao e o progresso para o proximo degrau, e sim
 * quanto da jornada completa ja foi percorrido.
 */
export const progressoNaRegua = (ordem?: number | null) =>
  ordem && ordem > 0 ? Math.min(1, ordem / TOTAL_DEGRAUS) : 0;

/**
 * O nivel que deve pintar a interface. Cai no azul da marca (`null`) quando o
 * cliente ainda nao entrou na regua, para nao inventar um nivel que ele nao tem.
 */
export const temaDoNivel = (nomeNivel?: string | null): NivelSlug | null =>
  nivelPorNome(nomeNivel)?.slug ?? null;
