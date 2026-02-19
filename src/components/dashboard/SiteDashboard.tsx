import { 
  DollarSign, 
  Eye, 
  MessageSquare, 
  Instagram, 
  Video,
  MousePointer,
  TrendingUp,
  ShoppingCart,
  Package,
  Link,
  Monitor
} from 'lucide-react';
import { KPICard } from './KPICard';
import { DashboardChart } from './DashboardChart';
import { formatDateBR } from '@/lib/dateUtils';

interface SiteReportData {
  dia: string;
  valor_usado_brl: number;
  impressoes: number;
  conversas_mensagem_iniciadas: number;
  visitas_perfil_instagram: number;
  reproducoes_video_3s: number;
  cliques_link: number;
  visualizacoes_pagina_destino?: number;
  finalizacoes_compra_iniciadas?: number;
  adicionados_carrinho?: number;
  compras: number;
  valor_conversao_compra: number;
  cliques_todos: number;
  alcance?: number;
}

interface SiteDashboardProps {
  dailyData: SiteReportData[];
  showLabelsForPDF?: boolean;
}

export const SiteDashboard = ({ dailyData, showLabelsForPDF = false }: SiteDashboardProps) => {
  // KPI totals
  const totalSpent = dailyData.reduce((sum, d) => sum + (d.valor_usado_brl || 0), 0);
  const totalImpressions = dailyData.reduce((sum, d) => sum + (d.impressoes || 0), 0);
  const totalMessages = dailyData.reduce((sum, d) => sum + (d.conversas_mensagem_iniciadas || 0), 0);
  const totalInstagramVisits = dailyData.reduce((sum, d) => sum + (d.visitas_perfil_instagram || 0), 0);
  const totalVideoViews = dailyData.reduce((sum, d) => sum + (d.reproducoes_video_3s || 0), 0);
  const totalLinkClicks = dailyData.reduce((sum, d) => sum + (d.cliques_link || 0), 0);
  const totalPageViews = dailyData.reduce((sum, d) => sum + (d.visualizacoes_pagina_destino || 0), 0);
  const totalCheckoutStarts = dailyData.reduce((sum, d) => sum + (d.finalizacoes_compra_iniciadas || 0), 0);
  const totalAddToCart = dailyData.reduce((sum, d) => sum + (d.adicionados_carrinho || 0), 0);
  const totalPurchases = dailyData.reduce((sum, d) => sum + (d.compras || 0), 0);
  const totalPurchaseValue = dailyData.reduce((sum, d) => sum + (d.valor_conversao_compra || 0), 0);
  const totalClicks = dailyData.reduce((sum, d) => sum + (d.cliques_todos || 0), 0);

  // Metrics
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const connectRate = totalLinkClicks > 0 ? (totalPageViews / totalLinkClicks) * 100 : 0;
  const checkoutRate = totalPageViews > 0 ? (totalCheckoutStarts / totalPageViews) * 100 : 0;
  const purchaseRate = totalCheckoutStarts > 0 ? (totalPurchases / totalCheckoutStarts) * 100 : 0;
  const roas = totalSpent > 0 ? totalPurchaseValue / totalSpent : 0;

  // Chart data
  const chartData = dailyData.map((d) => ({
    date: formatDateBR(d.dia),
    valor_usado_brl: d.valor_usado_brl,
    impressoes: d.impressoes,
    cliques_link: d.cliques_link,
    visualizacoes_pagina_destino: d.visualizacoes_pagina_destino || 0,
    finalizacoes_compra_iniciadas: d.finalizacoes_compra_iniciadas || 0,
    adicionados_carrinho: d.adicionados_carrinho || 0,
    compras: d.compras,
    roas: d.valor_conversao_compra > 0 && d.valor_usado_brl > 0 ? d.valor_conversao_compra / d.valor_usado_brl : 0,
    custo_por_compra: d.compras > 0 ? d.valor_usado_brl / d.compras : 0,
  }));

  // Funnel steps
  const funnelSteps = [
    {
      label: 'Impressões',
      value: totalImpressions,
      icon: Eye,
      color: '#3b82f6',
      pct: 100,
    },
    {
      label: 'Cliques no Link',
      value: totalLinkClicks,
      icon: MousePointer,
      color: '#8b5cf6',
      pct: totalImpressions > 0 ? (totalLinkClicks / totalImpressions) * 100 : 0,
    },
    {
      label: 'Visualizações da Pág. Destino',
      value: totalPageViews,
      icon: Monitor,
      color: '#06b6d4',
      pct: totalLinkClicks > 0 ? (totalPageViews / totalLinkClicks) * 100 : 0,
    },
    {
      label: 'Finalizações de Compra Iniciadas',
      value: totalCheckoutStarts,
      icon: ShoppingCart,
      color: '#f59e0b',
      pct: totalPageViews > 0 ? (totalCheckoutStarts / totalPageViews) * 100 : 0,
    },
    {
      label: 'Adicionados ao Carrinho',
      value: totalAddToCart,
      icon: Package,
      color: '#f97316',
      pct: totalCheckoutStarts > 0 ? (totalAddToCart / totalCheckoutStarts) * 100 : 0,
    },
    {
      label: 'Compras',
      value: totalPurchases,
      icon: TrendingUp,
      color: '#22c55e',
      pct: totalAddToCart > 0 ? (totalPurchases / totalAddToCart) * 100 : 0,
    },
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KPICard title="Valor Usado" value={totalSpent.toFixed(2)} icon={DollarSign} prefix="R$ " />
        <KPICard title="Impressões" value={totalImpressions.toLocaleString('pt-BR')} icon={Eye} />
        <KPICard title="Mensagens Iniciadas" value={totalMessages.toLocaleString('pt-BR')} icon={MessageSquare} />
        <KPICard title="Visitas Instagram" value={totalInstagramVisits.toLocaleString('pt-BR')} icon={Instagram} />
        <KPICard title="Reprod. de Vídeo" value={totalVideoViews.toLocaleString('pt-BR')} icon={Video} />
      </div>

      {/* Main layout: Funnel + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 mb-8">
        {/* Funnel */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-5">Funil de Conversão</h3>
          <div className="space-y-3">
            {funnelSteps.map((step, i) => {
              const Icon = step.icon;
              const width = Math.max(step.pct, 8);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0" style={{ color: step.color }} />
                      <span className="text-xs text-gray-300 leading-tight">{step.label}</span>
                    </div>
                    <div className="text-right ml-2 shrink-0">
                      <span className="text-sm font-bold text-white">
                        {typeof step.value === 'number' ? step.value.toLocaleString('pt-BR') : step.value}
                      </span>
                      {i > 0 && (
                        <span className="text-xs text-gray-500 ml-1.5">
                          ({step.pct.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${width}%`, backgroundColor: step.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional metrics */}
          <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Métricas</h4>
            {[
              { label: 'CTR', value: `${ctr.toFixed(2)}%`, color: '#3b82f6' },
              { label: 'Connect Rate', value: `${connectRate.toFixed(2)}%`, color: '#8b5cf6' },
              { label: 'Taxa de Checkout', value: `${checkoutRate.toFixed(2)}%`, color: '#f59e0b' },
              { label: 'Taxa de Compras', value: `${purchaseRate.toFixed(2)}%`, color: '#22c55e' },
              { label: 'Valor da Compra', value: `R$ ${totalPurchaseValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: '#06b6d4' },
              { label: 'ROAS', value: `${roas.toFixed(2)}x`, color: '#f97316' },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{m.label}</span>
                <span className="text-sm font-bold" style={{ color: m.color }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-6">
          <DashboardChart
            title="Funil Diário"
            data={chartData}
            dataKey="cliques_link"
            color="#8b5cf6"
            type="composed"
            secondaryLine={{ dataKey: 'compras', color: '#22c55e', label: 'Compras' }}
            forceShowLabels={showLabelsForPDF}
          />
          <DashboardChart
            title="ROAS por Dia"
            data={chartData}
            dataKey="roas"
            color="#f97316"
            type="area"
            suffix="x"
            forceShowLabels={showLabelsForPDF}
          />
        </div>
      </div>

      {/* Bottom charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardChart
          title="Valor Gasto por Dia"
          data={chartData}
          dataKey="valor_usado_brl"
          color="#3b82f6"
          type="area"
          prefix="R$ "
          forceShowLabels={showLabelsForPDF}
        />
        <DashboardChart
          title="Custo por Compra"
          data={chartData}
          dataKey="custo_por_compra"
          color="#f59e0b"
          type="line"
          prefix="R$ "
          forceShowLabels={showLabelsForPDF}
        />
      </div>

      {/* Daily table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Dados Diários</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Data', 'Valor Gasto', 'Impressões', 'Cliques Link', 'Pág. Destino', 'Checkout', 'Carrinho', 'Compras', 'Receita', 'ROAS'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dailyData.map((d, i) => {
                const dayRoas = d.valor_usado_brl > 0 ? d.valor_conversao_compra / d.valor_usado_brl : 0;
                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap font-medium">{formatDateBR(d.dia)}</td>
                    <td className="px-4 py-3 text-white whitespace-nowrap">R$ {(d.valor_usado_brl || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{(d.impressoes || 0).toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{(d.cliques_link || 0).toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{(d.visualizacoes_pagina_destino || 0).toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{(d.finalizacoes_compra_iniciadas || 0).toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{(d.adicionados_carrinho || 0).toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{(d.compras || 0).toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-green-400 whitespace-nowrap font-medium">R$ {(d.valor_conversao_compra || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`font-bold ${dayRoas >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                        {dayRoas.toFixed(2)}x
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
