import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import {
  DollarSign,
  MessageSquare,
  Eye,
  MousePointer,
  TrendingUp,
  Users,
  Instagram,
  Loader2,
  ArrowLeft,
  Video,

} from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { DashboardChart } from '@/components/dashboard/DashboardChart';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { SiteDashboard } from '@/components/dashboard/SiteDashboard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { parseDateForSort, formatDateBR } from '@/lib/dateUtils';

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

export default function ClienteDashboard() {
  const { clienteVinculadoId } = useAuth();
  const navigate = useNavigate();

  const [clientName, setClientName] = useState('');
  const [clientLogo, setClientLogo] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingClient, setLoadingClient] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('mensagem');
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (!clienteVinculadoId) {
      setLoadingClient(false);
      return;
    }

    supabase
      .from('gestao_clientes')
      .select('id, nome_cliente, logo_url')
      .eq('id', clienteVinculadoId)
      .single()
      .then(({ data }) => {
        if (data) {
          setClientName((data as any).nome_cliente ?? '');
          setClientLogo((data as any).logo_url ?? null);
          setAccountId(clienteVinculadoId);
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7c3aed]" />
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

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/hub')}
              className="p-2 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <ClienteLogo url={clientLogo} name={clientName || 'C'} size="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-bold text-white">{clientName || 'Meu Dashboard'}</h1>
              <p className="text-[#a1a1aa] text-sm">Acompanhe seus resultados</p>
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

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1 w-fit border border-white/10">
          {(['mensagem', 'site'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-500/25'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-white/10'
              }`}
            >
              {tab === 'mensagem' ? 'Mensagem' : 'Site'}
            </button>
          ))}
        </div>

        {reports.length === 0 ? (
          <div className="bg-[#1c1c1e] rounded-xl p-12 text-center border border-[#2a2a2a]">
            <TrendingUp className="h-12 w-12 text-[#a1a1aa] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white">Nenhum dado encontrado</h3>
            <p className="text-[#a1a1aa] mt-2">
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
                  <DashboardChart title="Valor Gasto por Dia" data={chartData} dataKey="valor_usado_brl" color="#7c3aed" type="area" prefix="R$ " />
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
    </div>
  );
}
