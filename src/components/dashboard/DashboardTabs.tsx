import { forwardRef } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { tabPanel } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Tabs do painel interno.
 *
 * O TabsTrigger do shadcn marca a aba ativa com `bg-background` — que no tema
 * escuro daqui e preto sobre cinza, ou seja, invertido. Estas variantes pintam
 * a aba ativa com o azul da marca, mantendo o comportamento de teclado do Radix
 * (setas, Home/End) que o toggle manual anterior nao tinha.
 */

export const DashTabs = Tabs;
export const DashTabsContent = TabsContent;

export const DashTabsList = forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex flex-wrap items-center gap-1 rounded-xl border border-border bg-surface-2/60 p-1 text-muted-foreground',
      className
    )}
    {...props}
  />
));
DashTabsList.displayName = 'DashTabsList';

export const DashTabsTrigger = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold',
      'ring-offset-background transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'hover:text-foreground hover:bg-foreground/5',
      'data-[state=active]:bg-level data-[state=active]:text-primary-foreground',
      'data-[state=active]:shadow-lg data-[state=active]:shadow-level/30 data-[state=active]:hover:bg-level',
      className
    )}
    {...props}
  />
));
DashTabsTrigger.displayName = 'DashTabsTrigger';

/**
 * TabsContent com transicao de entrada.
 *
 * A `className` vai no motion.div interno, e nao no TabsContent: os filhos do
 * painel sao filhos DESTE wrapper, entao um `space-y-*` aplicado por fora so
 * espacaria o wrapper contra nada. Era por isso que o espacamento passado aos
 * paineis nao surtia efeito nenhum na tela.
 */
export const DashTabsPanel = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) => (
  <TabsContent className="mt-8" {...props}>
    <motion.div
      variants={tabPanel}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  </TabsContent>
);
