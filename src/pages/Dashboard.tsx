import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  MessageSquare,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Client {
  id: string;
  name: string;
  logo_url: string | null;
}

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, logo_url')
        .order('name');

      if (!error && data) {
        setClients(data);
      }
      setLoading(false);
    };

    fetchClients();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Bem-vindo ao Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Selecione um cliente para visualizar seus relatórios de desempenho
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-xl p-6 neon-border">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/20">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <p className="text-2xl font-bold text-foreground">{clients.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 neon-border">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Campanhas Ativas</p>
              <p className="text-2xl font-bold text-foreground">{clients.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 neon-border">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <MessageSquare className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Relatórios Disponíveis</p>
              <p className="text-2xl font-bold text-foreground">{clients.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Seus Clientes</h2>
        
        {clients.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center neon-border">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">Nenhum cliente encontrado</h3>
            <p className="text-muted-foreground mt-2">
              Você ainda não tem clientes vinculados à sua conta.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <Link
                key={client.id}
                to={`/dashboard/${client.id}`}
                className="glass-card rounded-xl p-6 neon-border transition-all duration-300 hover:scale-[1.02] hover:neon-glow group"
              >
                <div className="flex items-center gap-4">
                  {client.logo_url ? (
                    <img
                      src={client.logo_url}
                      alt={client.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {client.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Ver relatório →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
