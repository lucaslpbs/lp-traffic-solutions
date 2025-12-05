import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Building2, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface N8NClient {
  id_conta: string;
  nome: string;
  campanhas_ativas: number;
  picture_url: string;
}

export const DashboardSidebar = () => {
  const [clients, setClients] = useState<N8NClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('https://n8n.trafficsolutions.cloud/webhook/bm-clientes-ativos', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          setClients(result.clientes || []);
        }
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside 
      className={cn(
        "h-screen bg-[#0a0a0a] border-r border-white/10 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        {!collapsed && (
          <img 
            src="/TFLOGO.png" 
            alt="Traffic Solutions" 
            className="h-8"
          />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white hover:bg-white/10"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <Link
          to="/dashboard"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 mb-1",
            location.pathname === '/dashboard'
              ? "bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white shadow-lg shadow-blue-500/25"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          )}
        >
          <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Dashboard</span>}
        </Link>

        {/* Clients Section */}
        {!collapsed && (
          <div className="mt-6 mb-2 px-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Clientes
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="space-y-1">
            {clients.map((client) => (
              <Link
                key={client.id_conta}
                to={`/dashboard/${client.id_conta}?nome=${encodeURIComponent(client.nome)}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive(`/dashboard/${client.id_conta}`)
                    ? "bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                {client.picture_url ? (
                  <img 
                    src={client.picture_url} 
                    alt={client.nome}
                    className="h-5 w-5 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <Building2 className="h-5 w-5 flex-shrink-0" />
                )}
                {!collapsed && (
                  <span className="font-medium truncate">{client.nome}</span>
                )}
              </Link>
            ))}
          </div>
        )}

        {clients.length === 0 && !loading && (
          <p className={cn(
            "text-gray-500 text-sm px-3 py-2",
            collapsed && "hidden"
          )}>
            Nenhum cliente vinculado
          </p>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-white/10">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start text-gray-400 hover:bg-red-500/10 hover:text-red-400",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Sair</span>}
        </Button>
      </div>
    </aside>
  );
};
