import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface SectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Conteudo alinhado a direita do cabecalho (filtros, botoes). */
  actions?: ReactNode;
  /** Quando true, o cabecalho vira um botao que abre/fecha a secao. */
  collapsible?: boolean;
  /** Estado inicial quando `collapsible`. */
  defaultOpen?: boolean;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

const Header = ({
  title,
  description,
  icon: Icon,
}: Pick<SectionProps, 'title' | 'description' | 'icon'>) => (
  <div className="flex items-center gap-3 min-w-0">
    {Icon && (
      <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
        <Icon className="h-4 w-4" />
      </div>
    )}
    <div className="min-w-0">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/90">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
    </div>
  </div>
);

/**
 * Agrupador de conteudo do painel: da hierarquia visual a blocos que hoje
 * aparecem soltos numa rolagem unica. Sem `collapsible`, e apenas um cabecalho
 * + conteudo (usado onde o conteudo precisa estar sempre no DOM, como o
 * relatorio capturado em PDF).
 */
export const Section = ({
  title,
  description,
  icon,
  actions,
  collapsible = false,
  defaultOpen = true,
  className,
  contentClassName,
  children,
}: SectionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  if (!collapsible) {
    return (
      <section className={cn('space-y-5', className)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Header title={title} description={description} icon={icon} />
          {actions}
        </div>
        <div className={contentClassName}>{children}</div>
      </section>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cn('space-y-5', className)} asChild>
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CollapsibleTrigger className="focus-ring group flex items-center gap-3 rounded-lg text-left min-w-0">
            <Header title={title} description={description} icon={icon} />
            <ChevronDown
              className={cn(
                'h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-foreground',
                open && 'rotate-180'
              )}
            />
          </CollapsibleTrigger>
          {actions}
        </div>
        <CollapsibleContent
          className={cn(
            'overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down',
            contentClassName
          )}
        >
          {children}
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
};
