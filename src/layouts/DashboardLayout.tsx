import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { DashboardSidebar, DashboardSidebarContent } from '@/components/dashboard/DashboardSidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useNivelTema } from '@/hooks/useNivelTema';
import { IntroSistema } from '@/components/dashboard/IntroSistema';
import { Button } from '@/components/ui/button';
import { routeTransition } from '@/lib/motion';

/**
 * Aplica o tema do painel no <html>.
 *
 * Nao basta por a classe na div do layout: Dialog, Popover, Sheet, Select e os
 * toasts do sonner renderizam em portal no <body>, fora da arvore do layout —
 * era por isso que cada um desses precisava de cor hardcoded para nao sair
 * branco. Com a classe no elemento raiz, o portal herda os tokens certos.
 * A limpeza no unmount devolve o tema claro as paginas publicas.
 */
const useDashboardTheme = () => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dashboard-theme');
    return () => root.classList.remove('dashboard-theme');
  }, []);
};

export const DashboardLayout = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useDashboardTheme();

  // Pinta o painel inteiro com a cor do nivel do cliente (data-nivel no <html>).
  // Sem nivel, --level continua sendo o azul da marca.
  useNivelTema();

  // Fecha o drawer ao navegar — senao ele fica aberto sobre a nova rota.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="dashboard-theme min-h-screen bg-background text-foreground flex w-full">
        <IntroSistema />

        {/* Sidebar fixa — desktop */}
        <DashboardSidebar />

        {/* Drawer — mobile e tablet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="dashboard-theme w-72 max-w-[85vw] bg-sidebar border-sidebar-border p-0"
          >
            <DashboardSidebarContent
              instanceId="mobile"
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <div className="relative flex-1 flex flex-col min-w-0">
          {/* Brilho de fundo na cor do nivel — sutil, mas faz o painel inteiro
              mudar de temperatura conforme o cliente sobe na regua. */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 opacity-70"
          >
            <div className="absolute -top-40 left-1/4 h-[28rem] w-[28rem] rounded-full bg-level/[0.07] blur-3xl" />
            <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-level-glow/[0.05] blur-3xl" />
          </div>

          {/* Barra superior — so existe onde a sidebar fixa esta escondida */}
          <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 border-b border-border bg-background/80 backdrop-blur-xl">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu de navegacao"
              className="text-muted-foreground hover:text-foreground hover:bg-foreground/10"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <img src="/TFLOGO.png" alt="Traffic Solutions" className="h-7" />
          </header>

          <main className="flex-1 overflow-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                variants={routeTransition}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </MotionConfig>
  );
};
