import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays } from 'date-fns';
import {
  Building2,
  TrendingUp,
  MessageSquare,
  Loader2,
  DollarSign,
  Eye,
  MousePointer,
  Users,
  Instagram,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { KPICard } from '@/components/dashboard/KPICard';
import { DashboardChart } from '@/components/dashboard/DashboardChart';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { SiteDashboard } from '@/components/dashboard/SiteDashboard';
import { parseDateForSort, formatDateBR } from '@/lib/dateUtils';

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

interface ReportData {
  nome_campanha: string;
  dia: string;
  nome_conjunto_anuncios: string;
  alcance: number;
  impressoes: number;
  frequencia: number;
  valor_usado_brl: number;
  compras: number;
  custo_por_compra: number;
  valor_conversao_compra: number;
  cliques_link: number;
  cpc_clique_link: number;
  cliques_todos: number;
  cpc_todos: number;
  conversas_mensagem_iniciadas: number;
  custo_por_conversa_mensagem_iniciada: number;
  reproducoes_video_3s: number;
  visitas_perfil_instagram: number;
  ctr: number;
  cpm: number;
  visualizacoes_pagina_destino?: number;
  finalizacoes_compra_iniciadas?: number;
  adicionados_carrinho?: number;
}

type TabType = 'mensagem' | 'site';

function ClienteDashboardView() {
  const { clienteVinculadoId } = useAuth();

  const [clientName, setClientName] = useState('');
  const [clientLogo, setClientLogo] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingClient, setLoadingClient] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('mensagem');
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [logoBroken, setLogoBroken] = useState(false);
  const [missingAccount, setMissingAccount] = useState(false);

  useEffect(() => {
    if (!clienteVinculadoId) {
      setLoadingClient(false);
      return;
    }

    supabase
      .from('gestao_clientes')
      .select('id, nome_cliente, logo_url, numero_conta_anuncio')
      .eq('id', clienteVinculadoId)
      .single()
      .then(({ data }) => {
        if (data) {
          setClientName((data as any).nome_cliente ?? '');
          setClientLogo((data as any).logo_url ?? null);
          const conta = (data as any).numero_conta_anuncio;
          if (conta) {
            setAccountId(conta);
          } else {
            setMissingAccount(true);
          }
        }
        setLoadingClient(false);
      });
  }, [clienteVinculadoId]);

  const fetchData = async () => {
    if (!accountId || !clientName) return;
    setLoading(true);
    try {
      const dataInicial = startDate ? format(startDate, 'dd/MM/yyyy') : format(subDays(new Date(), 7), 'dd/MM/yyyy');
      const dataFinal = endDate ? format(endDate, 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');

      const response = await fetch('https://n8n.trafficsolutions.cloud/webhook/relatorio-meta-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_inicial: dataInicial,
          data_final: dataFinal,
          nome_cliente: clientName,
          account_id: accountId,
        }),
      });

      if (!response.ok) throw new Error('Erro ao buscar relatorio');
      const result = await response.json();
      setReports(Array.isArray(result) ? result : result.data || []);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accountId && clientName) {
      fetchData();
    }
  }, [accountId, clientName]);

  const handleFilter = () => fetchData();

  if (loadingClient || (loading && reports.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  if (missingAccount) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-12 text-center border border-white/10 max-w-md">
          <Building2 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Conta de anúncio não configurada</h3>
          <p className="text-gray-400 mt-2">
            Este cliente ainda não possui uma conta de anúncio vinculada. Contate o administrador.
          </p>
        </div>
      </div>
    );
  }

  const aggregatedByDay = reports.reduce((acc, r) => {
    const day = r.dia;
    if (!acc[day]) {
      acc[day] = {
        dia: day,
        valor_usado_brl: 0,
        impressoes: 0,
        alcance: 0,
        cliques_todos: 0,
        cliques_link: 0,
        conversas_mensagem_iniciadas: 0,
        visitas_perfil_instagram: 0,
        reproducoes_video_3s: 0,
        compras: 0,
        valor_conversao_compra: 0,
        visualizacoes_pagina_destino: 0,
        finalizacoes_compra_iniciadas: 0,
        adicionados_carrinho: 0,
      };
    }
    acc[day].valor_usado_brl += r.valor_usado_brl || 0;
    acc[day].impressoes += r.impressoes || 0;
    acc[day].alcance += r.alcance || 0;
    acc[day].cliques_todos += r.cliques_todos || 0;
    acc[day].cliques_link += r.cliques_link || 0;
    acc[day].conversas_mensagem_iniciadas += r.conversas_mensagem_iniciadas || 0;
    acc[day].visitas_perfil_instagram += r.visitas_perfil_instagram || 0;
    acc[day].reproducoes_video_3s += r.reproducoes_video_3s || 0;
    acc[day].compras += r.compras || 0;
    acc[day].valor_conversao_compra += r.valor_conversao_compra || 0;
    acc[day].visualizacoes_pagina_destino += r.visualizacoes_pagina_destino || 0;
    acc[day].finalizacoes_compra_iniciadas += r.finalizacoes_compra_iniciadas || 0;
    acc[day].adicionados_carrinho += r.adicionados_carrinho || 0;
    return acc;
  }, {} as Record<string, any>);

  const dailyData = Object.values(aggregatedByDay).sort((a: any, b: any) =>
    parseDateForSort(a.dia) - parseDateForSort(b.dia)
  );

  const totalSpent = reports.reduce((sum, r) => sum + (r.valor_usado_brl || 0), 0);
  const totalMessages = reports.reduce((sum, r) => sum + (r.conversas_mensagem_iniciadas || 0), 0);
  const totalImpressions = reports.reduce((sum, r) => sum + (r.impressoes || 0), 0);
  const totalReach = reports.reduce((sum, r) => sum + (r.alcance || 0), 0);
  const totalClicks = reports.reduce((sum, r) => sum + (r.cliques_todos || 0), 0);
  const totalLinkClicks = reports.reduce((sum, r) => sum + (r.cliques_link || 0), 0);
  const totalVisits = reports.reduce((sum, r) => sum + (r.visitas_perfil_instagram || 0), 0);
  const totalVideoViews = reports.reduce((sum, r) => sum + (r.reproducoes_video_3s || 0), 0);
  const totalPurchases = reports.reduce((sum, r) => sum + (r.compras || 0), 0);

  const avgCPM = totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0;
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const costPerMessage = totalMessages > 0 ? totalSpent / totalMessages : 0;

  const chartData = dailyData.map((d: any) => ({
    date: formatDateBR(d.dia),
    valor_usado_brl: d.valor_usado_brl,
    conversas_mensagem_iniciadas: d.conversas_mensagem_iniciadas,
    custo_por_conversa: d.conversas_mensagem_iniciadas > 0
      ? d.valor_usado_brl / d.conversas_mensagem_iniciadas
      : 0,
    impressoes: d.impressoes,
    cliques_todos: d.cliques_todos,
    cliques_link: d.cliques_link,
    visitas_perfil_instagram: d.visitas_perfil_instagram,
    reproducoes_video_3s: d.reproducoes_video_3s,
  }));

  const showLogo = clientLogo && !logoBroken;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {showLogo ? (
            <img
              src={clientLogo!}
              alt={clientName}
              className="h-12 w-12 rounded-xl object-cover border border-white/10"
              onError={() => setLogoBroken(true)}
            />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-[#3b82f6]/20 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-[#3b82f6]" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{clientName || 'Meu Dashboard'}</h1>
            <p className="text-gray-400 text-sm">Acompanhe seus resultados</p>
          </div>
        </div>

        <DateFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onFilter={handleFilter}
        />
      </div>

      <div className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1 w-fit border border-white/10">
        {(['mensagem', 'site'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === tab
                ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/25'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab === 'mensagem' ? 'Mensagem' : 'Site'}
          </button>
        ))}
      </div>

      {reports.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-12 text-center border border-white/10">
          <TrendingUp className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Nenhum dado encontrado</h3>
          <p className="text-gray-400 mt-2">
            Nao ha dados disponiveis para o periodo selecionado.
          </p>
        </div>
      ) : (
        <div>
          {activeTab === 'mensagem' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <KPICard title="Valor Total Gasto" value={totalSpent.toFixed(2)} icon={DollarSign} prefix="R$ " />
                <KPICard title="Total de Conversas" value={totalMessages} icon={MessageSquare} />
                <KPICard title="Custo por Conversa" value={costPerMessage.toFixed(2)} icon={MessageSquare} prefix="R$ " />
                <KPICard title="Total de Compras" value={totalPurchases} icon={TrendingUp} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <KPICard title="Impressoes" value={totalImpressions.toLocaleString('pt-BR')} icon={Eye} />
                <KPICard title="Alcance" value={totalReach.toLocaleString('pt-BR')} icon={Users} />
                <KPICard title="CPM Medio" value={avgCPM.toFixed(2)} icon={Eye} prefix="R$ " />
                <KPICard title="CTR Medio" value={avgCTR.toFixed(2)} icon={MousePointer} suffix="%" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KPICard title="Cliques Totais" value={totalClicks.toLocaleString('pt-BR')} icon={MousePointer} />
                <KPICard title="Cliques no Link" value={totalLinkClicks.toLocaleString('pt-BR')} icon={MousePointer} />
                <KPICard title="Visitas Instagram" value={totalVisits.toLocaleString('pt-BR')} icon={Instagram} />
                <KPICard title="Visualizacoes 3s" value={totalVideoViews.toLocaleString('pt-BR')} icon={Video} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <DashboardChart title="Valor Gasto por Dia" data={chartData} dataKey="valor_usado_brl" color="#3b82f6" type="area" prefix="R$ " />
                <DashboardChart title="Conversas Iniciadas" data={chartData} dataKey="conversas_mensagem_iniciadas" color="#22c55e" type="composed" secondaryLine={{ dataKey: 'custo_por_conversa', color: '#f59e0b', prefix: 'R$ ', label: 'Custo/Conversa' }} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <DashboardChart title="Impressoes por Dia" data={chartData} dataKey="impressoes" color="#f59e0b" type="line" />
                <DashboardChart title="Cliques por Dia" data={chartData} dataKey="cliques_todos" color="#8b5cf6" type="bar" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardChart title="Visitas ao Instagram" data={chartData} dataKey="visitas_perfil_instagram" color="#ec4899" type="area" />
                <DashboardChart title="Visualizacoes de Video (3s)" data={chartData} dataKey="reproducoes_video_3s" color="#06b6d4" type="bar" />
              </div>
            </>
          ) : (
            <SiteDashboard dailyData={dailyData} showLabelsForPDF={false} />
          )}
        </div>
      )}
    </div>
  );
}

function AdminDashboardView() {
  const [data, setData] = useState<N8NResponse | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Bem-vindo ao Dashboard
        </h1>
        <p className="text-gray-400 mt-2">
          Selecione um cliente para visualizar seus relatórios de desempenho
        </p>
      </div>

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

function RemovedAccessView() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-8 text-center">
        <div className="mx-auto mb-6 p-4 rounded-full bg-red-500/15 w-fit">
          <Building2 className="h-10 w-10 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-3">
          Seu acesso não está mais ativo
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Para mais dúvidas, fale com Lucas Paulino ou procure o Instagram da
          Traffic Solutions.
        </p>
        <button
          onClick={() => signOut()}
          className="text-sm text-gray-500 hover:text-white transition-colors underline underline-offset-4"
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin, isRemoved } = useAuth();

  if (!isAdmin && isRemoved) return <RemovedAccessView />;
  return isAdmin ? <AdminDashboardView /> : <ClienteDashboardView />;
}
