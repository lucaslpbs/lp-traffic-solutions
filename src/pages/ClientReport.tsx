import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  DollarSign, 
  MessageSquare, 
  Eye, 
  MousePointer,
  TrendingUp,
  Users,
  Instagram,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/dashboard/KPICard';
import { DashboardChart } from '@/components/dashboard/DashboardChart';
import { DateFilter } from '@/components/dashboard/DateFilter';

interface Client {
  id: string;
  name: string;
  logo_url: string | null;
}

interface Report {
  id: string;
  date: string;
  value_spent: number;
  messages_started: number;
  cost_per_message: number;
  impressions: number;
  clicks: number;
  cpm_real: number;
  ctr_real: number;
  instagram_visits: number;
  instagram_followers: number;
}

export default function ClientReport() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const fetchData = async () => {
    if (!clientId) return;

    setLoading(true);

    // Fetch client
    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .maybeSingle();

    if (clientData) {
      setClient(clientData);
    }

    // Fetch reports with date filter
    let query = supabase
      .from('reports')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: true });

    if (startDate) {
      query = query.gte('date', format(startDate, 'yyyy-MM-dd'));
    }
    if (endDate) {
      query = query.lte('date', format(endDate, 'yyyy-MM-dd'));
    }

    const { data: reportsData } = await query;

    if (reportsData) {
      setReports(reportsData);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const handleFilter = () => {
    fetchData();
  };

  // Calculate KPIs
  const totalSpent = reports.reduce((sum, r) => sum + Number(r.value_spent), 0);
  const totalMessages = reports.reduce((sum, r) => sum + r.messages_started, 0);
  const totalImpressions = reports.reduce((sum, r) => sum + r.impressions, 0);
  const totalClicks = reports.reduce((sum, r) => sum + r.clicks, 0);
  const totalVisits = reports.reduce((sum, r) => sum + r.instagram_visits, 0);
  const totalFollowers = reports.reduce((sum, r) => sum + r.instagram_followers, 0);
  const avgCPM = reports.length > 0 
    ? reports.reduce((sum, r) => sum + Number(r.cpm_real), 0) / reports.length 
    : 0;
  const avgCTR = reports.length > 0 
    ? reports.reduce((sum, r) => sum + Number(r.ctr_real), 0) / reports.length 
    : 0;

  // Format chart data
  const chartData = reports.map(r => ({
    date: format(parseISO(r.date), 'dd/MM', { locale: ptBR }),
    value_spent: Number(r.value_spent),
    messages_started: r.messages_started,
    cost_per_message: Number(r.cost_per_message),
    impressions: r.impressions,
    clicks: r.clicks,
    cpm_real: Number(r.cpm_real),
    ctr_real: Number(r.ctr_real),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">Cliente não encontrado</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4 bg-gradient-to-r from-[#1e40af] to-[#3b82f6]">
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {client.logo_url ? (
            <img
              src={client.logo_url}
              alt={client.name}
              className="h-14 w-14 rounded-xl object-cover"
            />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-[#3b82f6]/20 flex items-center justify-center">
              <Users className="h-7 w-7 text-[#3b82f6]" />
            </div>
          )}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              {client.name}
            </h1>
            <p className="text-gray-400">
              Relatório de Desempenho
            </p>
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

      {reports.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 text-center border border-white/10">
          <TrendingUp className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Nenhum dado encontrado</h3>
          <p className="text-gray-400 mt-2">
            Não há relatórios disponíveis para o período selecionado.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Valor Total Gasto"
              value={totalSpent.toFixed(2)}
              icon={DollarSign}
              prefix="R$ "
            />
            <KPICard
              title="Total de Conversas"
              value={totalMessages}
              icon={MessageSquare}
            />
            <KPICard
              title="CPM Médio"
              value={avgCPM.toFixed(2)}
              icon={Eye}
              prefix="R$ "
            />
            <KPICard
              title="CTR Médio"
              value={avgCTR.toFixed(2)}
              icon={MousePointer}
              suffix="%"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Total de Impressões"
              value={totalImpressions}
              icon={Eye}
            />
            <KPICard
              title="Total de Cliques"
              value={totalClicks}
              icon={MousePointer}
            />
            <KPICard
              title="Visitas Instagram"
              value={totalVisits}
              icon={Instagram}
            />
            <KPICard
              title="Novos Seguidores"
              value={totalFollowers}
              icon={Users}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <DashboardChart
              title="Valor Gasto por Dia"
              data={chartData}
              dataKey="value_spent"
              color="#3b82f6"
              type="area"
              prefix="R$ "
            />
            <DashboardChart
              title="Conversas Iniciadas"
              data={chartData}
              dataKey="messages_started"
              color="#22c55e"
              type="bar"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardChart
              title="Custo por Mensagem"
              data={chartData}
              dataKey="cost_per_message"
              color="#f59e0b"
              type="line"
              prefix="R$ "
            />
            <DashboardChart
              title="CPM Real"
              data={chartData}
              dataKey="cpm_real"
              color="#8b5cf6"
              type="area"
              prefix="R$ "
            />
          </div>
        </>
      )}
    </div>
  );
}
