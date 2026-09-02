/**
 * Palavras reservadas para o slug da pagina de links: primeiro segmento de
 * toda rota estatica declarada em App.tsx, mais alguns nomes tecnicos
 * obvios. Um cliente com um desses slugs ficaria "encoberto" pela rota
 * fixa (react-router prioriza rotas estaticas sobre `/:slug`).
 */
export const RESERVED_SLUGS = new Set([
  'servicos', 'sobre', 'cases', 'contato', 'privacidade', 'termos',
  'brinde-exclusivo', 'orcamento-lv3-multimarcas', 'orcamento-lubrasil',
  'nps-ncsaude', 'koru-engenharia', 'orcamento-oticasvisao', 'leads-dashboard',
  'livet-dashboard', 'ncsaude-dashboard', 'clarafashion-dashboard',
  'facanha-dashboard', 'msfarma-dashboard', 'samysam-dashboard',
  'nucleo-oftalmologia', 'nucleo-oftalmologia-dashboard',
  'proposta-piazza-aldeota', 'obrigado', 'danielmaiaautomacoes',
  'sandelly-automacoes', 'cadastroinstancia', 'sistema',
  'orcamento-escola-cearence-oftalmologia', 'orcamento-setemares',
  'proposta-flavinha', 'lpccapital', 'relatorio-ncsaude-kommo',
  'roadmap-estruture-sua-empresa', 'diagnostico-estruture-sua-empresa',
  'proposta-usebiquinisqsol', 'painel-oftalmologia', 'login',
  'relatorio-lv3-multimarcas', 'dashboard-kommo-sandelly', 'dashboard',
  'api', 'admin', 'assets', 'static', 'public', 'favicon.ico', 'index',
  'home', 'null', 'undefined',
]);

const DIACRITICS_REGEX = /[̀-ͯ]/g;

/** Gera um slug de URL a partir de um texto livre (nome do cliente). */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}
