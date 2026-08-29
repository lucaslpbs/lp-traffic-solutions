import { useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** URL do logo/avatar exibido a esquerda. Cai no `icon` se falhar. */
  imageUrl?: string | null;
  /** Icone de fallback quando nao ha imagem (ou ela quebra). */
  icon?: LucideIcon;
  /** Letra de fallback, alternativa ao icone. */
  initial?: string;
  /** Botao de voltar ou qualquer elemento antes do titulo. */
  leading?: ReactNode;
  /** Filtros/acoes alinhados a direita. */
  actions?: ReactNode;
  className?: string;
}

/**
 * Cabecalho padrao das telas do painel. Concentra o tratamento de logo
 * quebrado, que antes era repetido com `useState(logoBroken)` em cada pagina.
 */
export const PageHeader = ({
  title,
  subtitle,
  imageUrl,
  icon: Icon,
  initial,
  leading,
  actions,
  className,
}: PageHeaderProps) => {
  const [imageBroken, setImageBroken] = useState(false);
  const showImage = !!imageUrl && !imageBroken;

  return (
    <div
      className={cn(
        'flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4',
        className
      )}
    >
      <div className="flex items-center gap-4 min-w-0">
        {leading}

        {showImage ? (
          <img
            src={imageUrl!}
            alt={title}
            className="h-12 w-12 rounded-xl object-cover border border-border flex-shrink-0"
            onError={() => setImageBroken(true)}
          />
        ) : (
          (Icon || initial) && (
            <div className="h-12 w-12 rounded-xl bg-primary/15 border border-border flex items-center justify-center flex-shrink-0">
              {Icon ? (
                <Icon className="h-6 w-6 text-primary" />
              ) : (
                <span className="text-primary font-bold text-lg">{initial}</span>
              )}
            </div>
          )
        )}

        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
        </div>
      </div>

      {actions}
    </div>
  );
};
