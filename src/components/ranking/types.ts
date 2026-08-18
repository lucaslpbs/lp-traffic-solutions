export interface RankingRow {
  /** Posicao no ranking completo, calculada no banco (ranking_geral). */
  posicao: number;
  client_id: string;
  nome_cliente: string;
  apelido: string | null;
  foto_url: string | null;
  total_vendido: number;
  qtd_vendas: number;
  maior_venda: number;
  ultima_venda: string | null;
}

export interface Venda {
  id: string;
  client_id: string;
  valor: number;
  data: string;
  foto_url: string | null;
  descricao: string | null;
  created_by: string | null;
  created_at: string;
}

export interface PerfilRanking {
  client_id: string;
  apelido: string | null;
  foto_url: string | null;
}

export const formatBRL = (valor: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(Number(valor) || 0);

/** Converte "2026-08-18" (DATE do Postgres) em data local, sem cair no dia anterior. */
export const parseDateOnly = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const formatDataBR = (iso: string | null) => {
  if (!iso) return '—';
  return parseDateOnly(iso).toLocaleDateString('pt-BR');
};

/** Medalhas do pódio */
export const medalhaPara = (posicao: number) => {
  if (posicao === 1) return '🥇';
  if (posicao === 2) return '🥈';
  if (posicao === 3) return '🥉';
  return null;
};
