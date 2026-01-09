import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/dashboard/KPICard';
import { DashboardChart } from '@/components/dashboard/DashboardChart';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';

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
  reproducoes_25: number;
  reproducoes_50: number;
  reproducoes_75: number;
  reproducoes_95: number;
  reproducoes_100: number;
  visitas_perfil_instagram: number;
  seguidores_instagram: number;
  custo_por_seguidor_instagram: number;
  ctr: number;
  cpm: number;
}

// Helper to parse date string for sorting (DD/MM/YYYY or DD-MM-YYYY)
const parseDateForSort = (dateStr: string): number => {
  // Handle DD/MM/YYYY format
  const slashParts = dateStr.split('/');
  if (slashParts.length === 3) {
    const day = parseInt(slashParts[0], 10);
    const month = parseInt(slashParts[1], 10);
    const year = parseInt(slashParts[2], 10);
    // Create a comparable number: YYYYMMDD
    const fullYear = year < 100 ? 2000 + year : year;
    return fullYear * 10000 + month * 100 + day;
  }
  // Handle DD-MM-YYYY format
  const dashParts = dateStr.split('-');
  if (dashParts.length === 3 && dashParts[0].length <= 2) {
    const day = parseInt(dashParts[0], 10);
    const month = parseInt(dashParts[1], 10);
    const year = parseInt(dashParts[2], 10);
    const fullYear = year < 100 ? 2000 + year : year;
    return fullYear * 10000 + month * 100 + day;
  }
  return 0;
};

// Format date to DD/MM/YY (keep original day/month, just shorten year)
const formatDateBR = (dateStr: string): string => {
  // Handle DD/MM/YYYY -> DD/MM/YY
  const slashParts = dateStr.split('/');
  if (slashParts.length === 3) {
    const day = slashParts[0].padStart(2, '0');
    const month = slashParts[1].padStart(2, '0');
    const year = slashParts[2].length === 4 ? slashParts[2].slice(-2) : slashParts[2];
    return `${day}/${month}/${year}`;
  }
  // Handle DD-MM-YYYY -> DD/MM/YY
  const dashParts = dateStr.split('-');
  if (dashParts.length === 3 && dashParts[0].length <= 2) {
    const day = dashParts[0].padStart(2, '0');
    const month = dashParts[1].padStart(2, '0');
    const year = dashParts[2].length === 4 ? dashParts[2].slice(-2) : dashParts[2];
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

export default function ClientReport() {
  const { clientId } = useParams<{ clientId: string }>();
  const [searchParams] = useSearchParams();
  const clientName = searchParams.get('nome') || 'Cliente';
  const navigate = useNavigate();
  
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [showLabelsForPDF, setShowLabelsForPDF] = useState(false);

  const fetchData = async () => {
    if (!clientId) return;

    setLoading(true);

    try {
      const dataInicial = startDate ? format(startDate, 'dd/MM/yyyy') : format(subDays(new Date(), 7), 'dd/MM/yyyy');
      const dataFinal = endDate ? format(endDate, 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');

      const response = await fetch('https://n8n.trafficsolutions.cloud/webhook/relatorio-meta-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data_inicial: dataInicial,
          data_final: dataFinal,
          nome_cliente: clientName,
          account_id: clientId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar relatório');
      }

      const result = await response.json();
      setReports(Array.isArray(result) ? result : result.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const handleFilter = () => {
    fetchData();
  };

  const handleGeneratePDF = async (showLabels: boolean) => {
    const reportContainer = document.getElementById('report-content');
    if (!reportContainer) return;

    setShowLabelsForPDF(showLabels);
    
    // Wait for state to update and re-render
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      toast.info('Gerando PDF...');
      
      const opt = {
        margin: 5,
        filename: `relatorio-${clientName.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'dd-MM-yyyy')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          backgroundColor: '#0a0a0a'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(reportContainer).save();
      
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setShowLabelsForPDF(false);
    }
  };

  // Aggregate data by day
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
        custo_por_conversa_total: 0,
        visitas_perfil_instagram: 0,
        reproducoes_video_3s: 0,
        compras: 0,
        valor_conversao_compra: 0,
        count_conversas: 0,
      };
    }
    acc[day].valor_usado_brl += r.valor_usado_brl || 0;
    acc[day].impressoes += r.impressoes || 0;
    acc[day].alcance += r.alcance || 0;
    acc[day].cliques_todos += r.cliques_todos || 0;
    acc[day].cliques_link += r.cliques_link || 0;
    acc[day].conversas_mensagem_iniciadas += r.conversas_mensagem_iniciadas || 0;
    if (r.custo_por_conversa_mensagem_iniciada > 0) {
      acc[day].custo_por_conversa_total += r.custo_por_conversa_mensagem_iniciada;
      acc[day].count_conversas += 1;
    }
    acc[day].visitas_perfil_instagram += r.visitas_perfil_instagram || 0;
    acc[day].reproducoes_video_3s += r.reproducoes_video_3s || 0;
    acc[day].compras += r.compras || 0;
    acc[day].valor_conversao_compra += r.valor_conversao_compra || 0;
    return acc;
  }, {} as Record<string, any>);

  // Sort by date in ascending order
  const dailyData = Object.values(aggregatedByDay).sort((a: any, b: any) => {
    return parseDateForSort(a.dia) - parseDateForSort(b.dia);
  });

  // Calculate KPIs
  const totalSpent = reports.reduce((sum, r) => sum + (r.valor_usado_brl || 0), 0);
  const totalMessages = reports.reduce((sum, r) => sum + (r.conversas_mensagem_iniciadas || 0), 0);
  const totalImpressions = reports.reduce((sum, r) => sum + (r.impressoes || 0), 0);
  const totalReach = reports.reduce((sum, r) => sum + (r.alcance || 0), 0);
  const totalClicks = reports.reduce((sum, r) => sum + (r.cliques_todos || 0), 0);
  const totalLinkClicks = reports.reduce((sum, r) => sum + (r.cliques_link || 0), 0);
  const totalVisits = reports.reduce((sum, r) => sum + (r.visitas_perfil_instagram || 0), 0);
  const totalVideoViews = reports.reduce((sum, r) => sum + (r.reproducoes_video_3s || 0), 0);
  const totalPurchases = reports.reduce((sum, r) => sum + (r.compras || 0), 0);
  const totalPurchaseValue = reports.reduce((sum, r) => sum + (r.valor_conversao_compra || 0), 0);
  
  const avgCPM = totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0;
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const costPerMessage = totalMessages > 0 ? totalSpent / totalMessages : 0;
  const costPerClick = totalClicks > 0 ? totalSpent / totalClicks : 0;

  // Format chart data with Brazilian date format
  // custo_por_conversa = valor total gasto no dia / quantidade de conversas do dia
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
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
          <div className="h-14 w-14 rounded-xl bg-[#3b82f6]/20 flex items-center justify-center">
            <Users className="h-7 w-7 text-[#3b82f6]" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              {clientName}
            </h1>
            <p className="text-gray-400">
              Relatório de Desempenho • ID: {clientId}
            </p>
          </div>
        </div>

        <DateFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onFilter={handleFilter}
          onGeneratePDF={handleGeneratePDF}
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
        <div id="report-content" className="bg-[#0a0a0a]">
          {/* Header for PDF */}
          <div className="mb-6 pb-4 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white mb-1">{clientName}</h2>
            <p className="text-gray-400 text-sm">
              Período: {startDate ? format(startDate, 'dd/MM/yyyy') : ''} - {endDate ? format(endDate, 'dd/MM/yyyy') : ''}
            </p>
          </div>
          
          {/* KPI Cards - Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
              title="Custo por Conversa"
              value={costPerMessage.toFixed(2)}
              icon={MessageSquare}
              prefix="R$ "
            />
            <KPICard
              title="Total de Compras"
              value={totalPurchases}
              icon={TrendingUp}
            />
          </div>

          {/* KPI Cards - Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <KPICard
              title="Impressões"
              value={totalImpressions.toLocaleString('pt-BR')}
              icon={Eye}
            />
            <KPICard
              title="Alcance"
              value={totalReach.toLocaleString('pt-BR')}
              icon={Users}
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

          {/* KPI Cards - Row 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Cliques Totais"
              value={totalClicks.toLocaleString('pt-BR')}
              icon={MousePointer}
            />
            <KPICard
              title="Cliques no Link"
              value={totalLinkClicks.toLocaleString('pt-BR')}
              icon={MousePointer}
            />
            <KPICard
              title="Visitas Instagram"
              value={totalVisits.toLocaleString('pt-BR')}
              icon={Instagram}
            />
            <KPICard
              title="Visualizações 3s"
              value={totalVideoViews.toLocaleString('pt-BR')}
              icon={Video}
            />
          </div>

          {/* Charts */}
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="chart-container">
                <DashboardChart
                  title="Valor Gasto por Dia"
                  data={chartData}
                  dataKey="valor_usado_brl"
                  color="#3b82f6"
                  type="area"
                  prefix="R$ "
                  forceShowLabels={showLabelsForPDF}
                />
              </div>
              <div className="chart-container">
                <DashboardChart
                  title="Conversas Iniciadas"
                  data={chartData}
                  dataKey="conversas_mensagem_iniciadas"
                  color="#22c55e"
                  type="composed"
                  secondaryLine={{
                    dataKey: 'custo_por_conversa',
                    color: '#f59e0b',
                    prefix: 'R$ ',
                    label: 'Custo/Conversa'
                  }}
                  forceShowLabels={showLabelsForPDF}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="chart-container">
                <DashboardChart
                  title="Impressões por Dia"
                  data={chartData}
                  dataKey="impressoes"
                  color="#f59e0b"
                  type="line"
                  forceShowLabels={showLabelsForPDF}
                />
              </div>
              <div className="chart-container">
                <DashboardChart
                  title="Cliques por Dia"
                  data={chartData}
                  dataKey="cliques_todos"
                  color="#8b5cf6"
                  type="bar"
                  forceShowLabels={showLabelsForPDF}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="chart-container">
                <DashboardChart
                  title="Visitas ao Instagram"
                  data={chartData}
                  dataKey="visitas_perfil_instagram"
                  color="#ec4899"
                  type="area"
                  forceShowLabels={showLabelsForPDF}
                />
              </div>
              <div className="chart-container">
                <DashboardChart
                  title="Visualizações de Vídeo (3s)"
                  data={chartData}
                  dataKey="reproducoes_video_3s"
                  color="#06b6d4"
                  type="bar"
                  forceShowLabels={showLabelsForPDF}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
