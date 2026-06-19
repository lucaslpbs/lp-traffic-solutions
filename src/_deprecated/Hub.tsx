import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Home,
  BarChart3,
  Settings,
  LogOut,
  ArrowRight,

  Users,
  Crosshair,
  FolderOpen,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientInfo {
  id: string;
  nome_cliente: string;
  logo_url: string | null;
}

const adminNavItems = [
  { label: 'Hub', icon: Home, path: '/hub' },
  { label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
  { label: 'Sistema', icon: Settings, path: '/sistema' },
  { label: 'Quarto de Guerra', icon: Crosshair, path: '/dashboard/guerra' },
  { label: 'Gestao de Clientes', icon: Users, path: '/dashboard/gestao-clientes' },
];

const adminCards = [
  {
    title: 'Dashboard',
    description: 'Painel geral de leads, campanhas e conversas dos clientes',
    icon: BarChart3,
    path: '/dashboard',
  },
  {
    title: 'Sistema',
    description: 'Gestao de clientes, demandas, metas e fluxos de trabalho',
    icon: Settings,
    path: '/sistema',
  },
  {
    title: 'Quarto de Guerra',
    description: 'Acompanhe metricas e objetivos em tempo real',
    icon: Crosshair,
    path: '/dashboard/guerra',
  },
  {
    title: 'Gestao de Clientes',
    description: 'Visualize e gerencie todos os clientes ativos',
    icon: Users,
    path: '/dashboard/gestao-clientes',
  },
];

const AdminHub = ({ userName }: { userName: string }) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <aside className="w-[240px] bg-[#111111] border-r border-[#2a2a2a] flex flex-col fixed h-screen">
        <div className="h-16 border-b border-[#2a2a2a] px-5 flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-[#7c3aed] flex items-center justify-center font-bold text-white text-sm">
            T
          </div>
          <div className="leading-tight">
            <p className="text-xs text-[#a1a1aa]">Traffic Solutions</p>
            <p className="text-sm font-semibold text-white">Hub</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                  active
                    ? 'bg-[#7c3aed]/15 text-[#7c3aed] border border-[#7c3aed]/30'
                    : 'text-[#a1a1aa] hover:bg-white/5 hover:text-white border border-transparent'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleSignOut}
          className="m-3 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[#a1a1aa] hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </aside>

      <main className="flex-1 ml-[240px] p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Bem-vindo, {userName}
          </h1>
          <p className="text-[#a1a1aa] mt-2">
            Acesse rapidamente todas as ferramentas do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {adminCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.path}
                to={card.path}
                className="group bg-[#1c1c1e] border border-[#2a2a2a] rounded-xl p-6 transition-all duration-300 hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/5 hover:-translate-y-0.5"
              >
                <div className="p-3 rounded-lg bg-[#7c3aed]/10 w-fit mb-4">
                  <Icon className="h-6 w-6 text-[#7c3aed]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-[#a1a1aa] mb-4">
                  {card.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-[#7c3aed] font-medium group-hover:gap-2 transition-all">
                  Acessar <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};

const ClienteLogo = ({ url, name, size = 'h-14 w-14' }: { url: string | null | undefined; name: string; size?: string }) => {
  const [broken, setBroken] = useState(false);
  const showImg = url && !broken;
  return showImg ? (
    <img
      src={url}
      alt={name}
      className={`${size} rounded-xl object-cover border border-[#2a2a2a]`}
      onError={() => setBroken(true)}
    />
  ) : (
    <div className={`${size} rounded-xl bg-[#7c3aed]/10 border border-[#2a2a2a] flex items-center justify-center`}>
      <span className="text-[#7c3aed] font-bold text-lg">{name.charAt(0).toUpperCase()}</span>
    </div>
  );
};

const ClienteHub = ({
  clientInfo,
  onSignOut,
}: {
  clientInfo: ClientInfo | null;
  onSignOut: () => void;
}) => {
  const clientName = clientInfo?.nome_cliente ?? 'Cliente';

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <ClienteLogo url={clientInfo?.logo_url} name={clientName} />
            <div>
              <h1 className="text-2xl font-bold text-white">
                Ola, {clientName}
              </h1>
              <p className="text-[#a1a1aa] text-sm">
                Bem-vindo a sua area exclusiva
              </p>
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[#a1a1aa] hover:bg-red-500/10 hover:text-red-400 transition-colors border border-[#2a2a2a]"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/hub/dashboard"
            className="group bg-[#1c1c1e] border border-[#2a2a2a] rounded-xl p-8 transition-all duration-300 hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/5 hover:-translate-y-0.5"
          >
            <div className="p-4 rounded-lg bg-[#7c3aed]/10 w-fit mb-5">
              <BarChart3 className="h-8 w-8 text-[#7c3aed]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Meu Dashboard
            </h3>
            <p className="text-sm text-[#a1a1aa] mb-6">
              Acompanhe seus resultados e conversas
            </p>
            <span className="inline-flex items-center gap-1 text-sm text-[#7c3aed] font-medium group-hover:gap-2 transition-all">
              Acessar <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link
            to="/hub/perfil"
            className="group bg-[#1c1c1e] border border-[#2a2a2a] rounded-xl p-8 transition-all duration-300 hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/5 hover:-translate-y-0.5"
          >
            <div className="p-4 rounded-lg bg-[#7c3aed]/10 w-fit mb-5">
              <FolderOpen className="h-8 w-8 text-[#7c3aed]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Meu Perfil & Materiais
            </h3>
            <p className="text-sm text-[#a1a1aa] mb-6">
              Acesse sua persona, escopo e materiais
            </p>
            <span className="inline-flex items-center gap-1 text-sm text-[#7c3aed] font-medium group-hover:gap-2 transition-all">
              Acessar <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function Hub() {
  const { user, isAdmin, clienteVinculadoId, loadingRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [loadingClient, setLoadingClient] = useState(false);

  useEffect(() => {
    if (!isAdmin && clienteVinculadoId) {
      setLoadingClient(true);
      supabase
        .from('gestao_clientes')
        .select('id, nome_cliente, logo_url')
        .eq('id', clienteVinculadoId)
        .single()
        .then(({ data }) => {
          if (data) {
            setClientInfo(data as ClientInfo);
          }
          setLoadingClient(false);
        });
    }
  }, [isAdmin, clienteVinculadoId]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loadingRole || loadingClient) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#7c3aed]" />
      </div>
    );
  }

  const isChildRoute = location.pathname !== '/hub';
  if (isChildRoute) {
    return <Outlet />;
  }

  if (isAdmin) {
    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin';
    return <AdminHub userName={userName} />;
  }

  return <ClienteHub clientInfo={clientInfo} onSignOut={handleSignOut} />;
}
