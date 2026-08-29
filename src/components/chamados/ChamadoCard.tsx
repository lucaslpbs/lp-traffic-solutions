import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { MarkdownEditor } from '@/components/sistema/MarkdownEditor';
import { statusConfig, formatDate, type Chamado } from './types';

interface ChamadoCardProps {
  chamado: Chamado;
  /** Exibe o nome do cliente no topo — usado na visao de admin. */
  showCliente?: boolean;
  /** Botoes de acao no rodape (responder, concluir). */
  actions?: ReactNode;
}

/**
 * Cartao de um chamado. Antes esse bloco existia duplicado — uma copia na
 * visao do cliente e outra na do admin, com pequenas divergencias de estilo
 * entre elas.
 */
export const ChamadoCard = ({ chamado, showCliente = false, actions }: ChamadoCardProps) => {
  const cfg = statusConfig[chamado.status];

  return (
    <article className="rounded-xl border border-border bg-card/60 p-4 space-y-3 transition-colors hover:border-border/80">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1 min-w-0">
          {showCliente ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{chamado.nome_cliente}</span>
              <span className="text-xs text-muted-foreground">
                · {formatDate(chamado.created_at)}
              </span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{formatDate(chamado.created_at)}</p>
          )}
          <div className="text-sm text-foreground/85">
            <MarkdownEditor value={chamado.mensagem} readOnly />
          </div>
        </div>
        <Badge className={cfg.cls}>{cfg.label}</Badge>
      </div>

      {chamado.resposta_admin && (
        <div className="border-t border-border pt-3">
          <p className="text-xs text-muted-foreground mb-1">
            Resposta do suporte
            {chamado.respondido_at ? ` · ${formatDate(chamado.respondido_at)}` : ''}
          </p>
          <div className="text-sm text-foreground/85">
            <MarkdownEditor value={chamado.resposta_admin} readOnly />
          </div>
        </div>
      )}

      {actions && <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
    </article>
  );
};
