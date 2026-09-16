import type { ReactNode } from 'react';
import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { statusConfig, formatDate, formatPreco, type ClientProduct } from './types';

interface ProductCardProps {
  product: ClientProduct;
  /** Exibe o nome do cliente no topo — usado na visao de admin. */
  showCliente?: boolean;
  /** Botoes de acao no rodape (aprovar, rejeitar, excluir). */
  actions?: ReactNode;
}

export const ProductCard = ({ product, showCliente = false, actions }: ProductCardProps) => {
  const cfg = statusConfig[product.status];
  const imagens = product.client_product_images ?? [];
  const preco = formatPreco(product.preco);

  return (
    <article className="rounded-xl border border-border bg-card/60 p-4 space-y-3 transition-colors hover:border-border/80">
      <div className="flex gap-3">
        <div className="h-20 w-20 rounded-lg overflow-hidden bg-foreground/5 flex-shrink-0 flex items-center justify-center">
          {imagens[0] ? (
            <img src={imagens[0].original_url} alt={product.nome_produto} className="h-full w-full object-cover" />
          ) : (
            <Package className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">{product.nome_produto}</p>
              {showCliente && product.nome_cliente && (
                <p className="text-xs text-muted-foreground truncate">{product.nome_cliente}</p>
              )}
            </div>
            <Badge className={`${cfg.cls} flex-shrink-0`}>{cfg.label}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {product.categoria && <span>{product.categoria}</span>}
            {preco && <span>· {preco}</span>}
            <span>· {formatDate(product.created_at)}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-foreground/85 whitespace-pre-wrap">{product.descricao}</p>

      {imagens.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {imagens.slice(1).map((img) => (
            <img
              key={img.id}
              src={img.original_url}
              alt={product.nome_produto}
              className="h-14 w-14 rounded-md object-cover"
            />
          ))}
        </div>
      )}

      {product.status === 'rejeitado' && product.motivo_rejeicao && (
        <div className="border-t border-border pt-3">
          <p className="text-xs text-muted-foreground mb-1">Motivo da rejeição</p>
          <p className="text-sm text-destructive/90">{product.motivo_rejeicao}</p>
        </div>
      )}

      {actions && <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
    </article>
  );
};
