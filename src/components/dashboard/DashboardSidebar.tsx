import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Users,
  FolderKanban,
  Headphones,
  Trophy,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Shimmer } from '@/components/dashboard/Skeletons';
import { NivelBadge } from '@/components/dashboard/NivelBadge';
import { supabase } from '@/integrations/supabase/client';

interface SidebarCliente {
  id: string;
  nome_cliente: string;
  numero_conta_anuncio: string;
  logo_url: string | null;
}

interface SidebarLinkProps {
  to: string;
  label: string;
  active: boolean;
  collapsed?: boolean;
  icon?: LucideIcon;
  /** Alternativa ao icone — usado pelo logo do cliente. */
  leading?: ReactNode;
  onNavigate?: () => void;
  /**
   * Namespace do indicador ativo. A sidebar fixa e o drawer coexistem no DOM
   * enquanto o drawer esta aberto; sem isso, os dois disputariam o mesmo
   * layoutId e o indicador saltaria entre eles.
   */
  instanceId: string;
}

/**
 * Item de navegacao da sidebar. Antes cada link repetia o mesmo bloco de
 * className com o gradiente hardcoded; o indicador ativo agora e uma camada
 * unica que desliza entre os itens (layoutId do framer).
 */
const SidebarLink = ({
  to,
  label,
  active,
  collapsed = false,
  icon: Icon,
  leading,
  onNavigate,
  instanceId,
}: SidebarLinkProps) => (
  <Link
    to={to}
    onClick={onNavigate}
    aria-current={active ? 'page' : undefined}
    title={collapsed ? label : undefined}
    className={cn(
      'focus-ring relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200',
      active ? 'text-primary-foreground' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
    )}
  >
    {active && (
      <motion.span
        layoutId={`sidebar-active-${instanceId}`}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="absolute inset-0 rounded-lg bg-gradient-to-r from-level-dark to-level shadow-lg shadow-level/30"
      />
    )}
    <span className="relative flex items-center gap-3 min-w-0">
      {leading ?? (Icon && <Icon className="h-5 w-5 flex-shrink-0" />)}
      {!collapsed && <span className="font-medium truncate">{label}</span>}
    </span>
  </Link>
);

interface SidebarContentProps {
  collapsed?: boolean;
  /** Chamado ao clicar num link — usado pelo drawer mobile para fechar. */
  onNavigate?: () => void;
  /** Botao de recolher, renderizado so na versao fixa de desktop. */
  collapseToggle?: ReactNode;
  /** Namespace do indicador ativo. Ver SidebarLink.instanceId. */
  instanceId?: string;
}

/**
 * Conteudo da sidebar, compartilhado entre a versao fixa (desktop) e o drawer
 * (mobile). Nao define largura nem posicionamento — quem monta decide isso.
 */
export const DashboardSidebarContent = ({
  collapsed = false,
  onNavigate,
  collapseToggle,
  instanceId = 'desktop',
}: SidebarContentProps) => {
  const { signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: clients = [], isLoading: loading } = useQuery({
    queryKey: ['sidebar-clients'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('gestao_clientes')
        .select('id, nome_cliente, numero_conta_anuncio, logo_url')
        .eq('status', 'ativo')
        .order('nome_cliente');
      if (error) throw error;
      return (data ?? []) as SidebarCliente[];
    },
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const path = location.pathname;
  const isActive = (prefix: string) => path.startsWith(prefix);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!collapsed && <img src="/TFLOGO.png" alt="Traffic Solutions" className="h-8" />}
        {collapseToggle}
      </div>

      {/* Navigation */}
      <nav aria-label="Navegacao principal" className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
          <SidebarLink
            to="/dashboard"
            label="Dashboard"
            icon={LayoutDashboard}
            active={path === '/dashboard'}
            collapsed={collapsed}
            onNavigate={onNavigate}
            instanceId={instanceId}
          />

          {isAdmin && (
            <>
              <SidebarLink
                to="/dashboard/guerra"
                label="Quarto de Guerra"
                icon={Crosshair}
                active={path === '/dashboard/guerra'}
                collapsed={collapsed}
                onNavigate={onNavigate}
                instanceId={instanceId}
              />
              <SidebarLink
                to="/dashboard/gestao-clientes"
                label="Gestão de Clientes"
                icon={Users}
                active={path === '/dashboard/gestao-clientes'}
                collapsed={collapsed}
                onNavigate={onNavigate}
                instanceId={instanceId}
              />
            </>
          )}

          <SidebarLink
            to="/dashboard/sistema"
            label="Sistema"
            icon={FolderKanban}
            active={isActive('/dashboard/sistema')}
            collapsed={collapsed}
            onNavigate={onNavigate}
            instanceId={instanceId}
          />
          <SidebarLink
            to="/dashboard/chamados"
            label="Chamados"
            icon={Headphones}
            active={isActive('/dashboard/chamados')}
            collapsed={collapsed}
            onNavigate={onNavigate}
            instanceId={instanceId}
          />
          <SidebarLink
            to="/dashboard/ranking"
            label="Ranking"
            icon={Trophy}
            active={path === '/dashboard/ranking'}
            collapsed={collapsed}
            onNavigate={onNavigate}
            instanceId={instanceId}
          />

          {isAdmin && (
            <SidebarLink
              to="/dashboard/ranking/admin"
              label="Admin Ranking"
              icon={ShieldCheck}
              active={isActive('/dashboard/ranking/admin')}
              collapsed={collapsed}
              onNavigate={onNavigate}
              instanceId={instanceId}
            />
          )}
        </div>

        {/* Clientes — somente admin */}
        {isAdmin && (
          <>
            {!collapsed && (
              <div className="mt-6 mb-2 px-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Clientes
                </span>
              </div>
            )}

            {loading ? (
              <div className="space-y-1 px-1 py-2" role="status" aria-label="Carregando clientes">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-2 py-2">
                    <Shimmer className="h-5 w-5 rounded flex-shrink-0" />
                    {!collapsed && <Shimmer className="h-3.5 flex-1" />}
                  </div>
                ))}
              </div>
            ) : clients.length === 0 ? (
              <p className={cn('text-muted-foreground text-sm px-3 py-2', collapsed && 'hidden')}>
                Nenhum cliente vinculado
              </p>
            ) : (
              <div className="space-y-1">
                {clients.map((client) => (
                  <SidebarLink
                    key={client.id}
                    to={`/dashboard/${client.numero_conta_anuncio}?nome=${encodeURIComponent(client.nome_cliente)}`}
                    label={client.nome_cliente}
                    active={isActive(`/dashboard/${client.numero_conta_anuncio}`)}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                    instanceId={instanceId}
                    leading={
                      client.logo_url ? (
                        <img
                          src={client.logo_url}
                          alt=""
                          className="h-5 w-5 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <Building2 className="h-5 w-5 flex-shrink-0" />
                      )
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
      </nav>

      {/* Footer */}
      <NivelBadge collapsed={collapsed} />
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            'w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Sair</span>}
        </Button>
      </div>
    </div>
  );
};

/**
 * Sidebar fixa do desktop. Escondida abaixo de `lg` — ali quem navega e o
 * drawer montado pelo DashboardLayout, porque a versao recolhida ainda comia
 * 64px de largura numa tela de 375px.
 */
export const DashboardSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden lg:flex h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex-col transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <DashboardSidebarContent
        collapsed={collapsed}
        collapseToggle={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            aria-expanded={!collapsed}
            className="text-muted-foreground hover:text-foreground hover:bg-foreground/10"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        }
      />
    </aside>
  );
};
