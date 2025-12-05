import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Building2, 
  TrendingUp, 
  MessageSquare,
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

interface N8NClient {
  id_conta: string;
  nome: string;
  campanhas_ativas: number;
  picture_url: string;
}

interface N8NResponse {
  total_clientes: number;
  campanhas_ativas: number;
  relatorios_disponiveis: number;
  clientes: N8NClient[];
}

export default function Dashboard() {
  const [data, setData] = useState<N8NResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('https://n8n.trafficsolutions.cloud/webhook/bm-clientes-ativos', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar clientes');
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados dos clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  const clients = data?.clientes || [];
  const totalClientes = data?.total_clientes || 0;
  const campanhasAtivas = data?.campanhas_ativas || 0;
  const relatoriosDisponiveis = data?.relatorios_disponiveis || 0;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Bem-vindo ao Dashboard
        </h1>
        <p className="text-gray-400 mt-2">
          Selecione um cliente para visualizar seus relatórios de desempenho
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[#3b82f6]/20">
              <Building2 className="h-6 w-6 text-[#3b82f6]" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Clientes</p>
              <p className="text-2xl font-bold text-white">{totalClientes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Campanhas Ativas</p>
              <p className="text-2xl font-bold text-white">{campanhasAtivas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[#3b82f6]/20">
              <MessageSquare className="h-6 w-6 text-[#3b82f6]" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Relatórios Disponíveis</p>
              <p className="text-2xl font-bold text-white">{relatoriosDisponiveis}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Seus Clientes</h2>
        
        {clients.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 text-center border border-white/10">
            <Building2 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white">Nenhum cliente encontrado</h3>
            <p className="text-gray-400 mt-2">
              Você ainda não tem clientes vinculados à sua conta.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <Link
                key={client.id_conta}
                to={`/dashboard/${client.id_conta}?nome=${encodeURIComponent(client.nome)}`}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-[#3b82f6]/50 hover:shadow-lg hover:shadow-blue-500/10 group"
              >
                <div className="flex items-center gap-4">
                  {client.picture_url ? (
                    <img
                      src={client.picture_url}
                      alt={client.nome}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-[#3b82f6]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-[#3b82f6] transition-colors">
                      {client.nome}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">
                        Ver relatório →
                      </p>
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">
                        {client.campanhas_ativas} campanhas
                      </span>
                    </div>
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
