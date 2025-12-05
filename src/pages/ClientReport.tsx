import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { format, subDays } from 'date-fns';
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
  ArrowLeft,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/dashboard/KPICard';
import { DashboardChart } from '@/components/dashboard/DashboardChart';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

// Helper to parse date in DD/MM/YYYY format
const parseDateString = (dateStr: string): Date => {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  // Try DD-MM-YYYY format
  const dashParts = dateStr.split('-');
  if (dashParts.length === 3 && dashParts[0].length === 2) {
    return new Date(parseInt(dashParts[2]), parseInt(dashParts[1]) - 1, parseInt(dashParts[0]));
  }
  return new Date(dateStr);
};

export default function ClientReport() {
  const { clientId } = useParams<{ clientId: string }>();
  const [searchParams] = useSearchParams();
  const clientName = searchParams.get('nome') || 'Cliente';
  const navigate = useNavigate();
  const chartsContainerRef = useRef<HTMLDivElement>(null);
  
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
    if (!chartsContainerRef.current) return;

    setShowLabelsForPDF(showLabels);
    
    // Wait for state to update and re-render
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      toast.info('Gerando PDF...');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      
      // Title
      pdf.setFontSize(18);
      pdf.setTextColor(59, 130, 246);
      pdf.text(`Relatório - ${clientName}`, margin, 20);
      
      // Date range
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      const dateRange = `Período: ${startDate ? format(startDate, 'dd/MM/yyyy') : ''} - ${endDate ? format(endDate, 'dd/MM/yyyy') : ''}`;
      pdf.text(dateRange, margin, 28);
      
      // KPIs Section
      pdf.setFontSize(12);
      pdf.setTextColor(0);
      pdf.text('Métricas Principais:', margin, 40);
      
      pdf.setFontSize(9);
      const kpiY = 48;
      pdf.text(`Valor Total Gasto: R$ ${totalSpent.toFixed(2)}`, margin, kpiY);
      pdf.text(`Total de Conversas: ${totalMessages}`, margin + 60, kpiY);
      pdf.text(`Custo por Conversa: R$ ${costPerMessage.toFixed(2)}`, margin + 120, kpiY);
      pdf.text(`Total de Compras: ${totalPurchases}`, margin, kpiY + 6);
      pdf.text(`Impressões: ${totalImpressions.toLocaleString('pt-BR')}`, margin + 60, kpiY + 6);
      pdf.text(`Alcance: ${totalReach.toLocaleString('pt-BR')}`, margin + 120, kpiY + 6);
      pdf.text(`CPM Médio: R$ ${avgCPM.toFixed(2)}`, margin, kpiY + 12);
      pdf.text(`CTR Médio: ${avgCTR.toFixed(2)}%`, margin + 60, kpiY + 12);
      pdf.text(`Cliques Totais: ${totalClicks.toLocaleString('pt-BR')}`, margin + 120, kpiY + 12);

      // Capture charts
      const charts = chartsContainerRef.current.querySelectorAll('.chart-container');
      let currentY = 75;

      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i] as HTMLElement;
        
        const canvas = await html2canvas(chart, {
          backgroundColor: '#1a1a1a',
          scale: 2,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Check if we need a new page
        if (currentY + imgHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
      }

      pdf.save(`relatorio-${clientName.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
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
    const dateA = parseDateString(a.dia);
    const dateB = parseDateString(b.dia);
    return dateA.getTime() - dateB.getTime();
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

  // Format chart data
  const chartData = dailyData.map((d: any) => ({
    date: d.dia,
    valor_usado_brl: d.valor_usado_brl,
    conversas_mensagem_iniciadas: d.conversas_mensagem_iniciadas,
    custo_por_conversa: d.count_conversas > 0 ? d.custo_por_conversa_total / d.count_conversas : 0,
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
        <>
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
          <div ref={chartsContainerRef}>
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
        </>
      )}
    </div>
  );
}
