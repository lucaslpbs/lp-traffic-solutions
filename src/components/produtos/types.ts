export type ProdutoStatus = 'pendente' | 'aprovado' | 'rejeitado';

export interface ClientProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  original_url: string;
  webp_url: string | null;
  ordem: number;
  created_at: string;
}

export interface ClientProduct {
  id: string;
  client_id: string;
  nome_produto: string;
  categoria: string | null;
  preco: number | null;
  descricao: string;
  status: ProdutoStatus;
  motivo_rejeicao: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  /** Preenchido so na visao de admin, via join com gestao_clientes. */
  nome_cliente?: string;
  client_product_images?: ClientProductImage[];
}

export const statusConfig: Record<ProdutoStatus, { label: string; cls: string }> = {
  pendente: { label: 'Pendente', cls: 'bg-warning/15 text-warning border-warning/40' },
  aprovado: { label: 'Aprovado', cls: 'bg-success/15 text-success border-success/40' },
  rejeitado: { label: 'Rejeitado', cls: 'bg-destructive/15 text-destructive border-destructive/40' },
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatPreco = (preco: number | null) =>
  preco == null
    ? null
    : preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
