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

// Funnel step definition
const FUNNEL_STEPS = [
  { key: 'impressoes',                    label: 'Impressões',                        icon: Eye,          color: '#3b82f6' },
  { key: 'cliques_link',                  label: 'Cliques no Link',                   icon: MousePointer, color: '#8b5cf6' },
  { key: 'visualizacoes_pagina_destino',  label: 'Visualizações da Pág. de Destino',  icon: Monitor,      color: '#06b6d4' },
  { key: 'finalizacoes_compra_iniciadas', label: 'Finalizações de Compra Iniciadas',  icon: ShoppingCart, color: '#f59e0b' },
  { key: 'adicionados_carrinho',          label: 'Adicionados ao Carrinho',           icon: Package,      color: '#f97316' },
  { key: 'compras',                       label: 'Compras',                           icon: TrendingUp,   color: '#22c55e' },
] as const;

// Metric badge aligned to funnel step (index corresponds to step that the metric sits beside)
const METRIC_CONNECTORS = [
  { label: 'CTR',              stepIndex: 1, colorClass: 'text-[#8b5cf6]' },
  { label: 'Connect Rate',     stepIndex: 2, colorClass: 'text-[#06b6d4]' },
  { label: 'Taxa de Checkout', stepIndex: 3, colorClass: 'text-[#f59e0b]' },
  { label: 'Taxa de Compras',  stepIndex: 5, colorClass: 'text-[#22c55e]' },
  { label: 'ROAS',             stepIndex: 5, colorClass: 'text-[#f97316]' },
];

export const SiteDashboard = ({ dailyData, showLabelsForPDF = false }: SiteDashboardProps) => {
  // ── Totals ────────────────────────────────────────────────────────────────
  const totalSpent          = dailyData.reduce((s, d) => s + (d.valor_usado_brl || 0), 0);
  const totalImpressions    = dailyData.reduce((s, d) => s + (d.impressoes || 0), 0);
  const totalMessages       = dailyData.reduce((s, d) => s + (d.conversas_mensagem_iniciadas || 0), 0);
  const totalInstagramVisits= dailyData.reduce((s, d) => s + (d.visitas_perfil_instagram || 0), 0);
  const totalVideoViews     = dailyData.reduce((s, d) => s + (d.reproducoes_video_3s || 0), 0);
  const totalLinkClicks     = dailyData.reduce((s, d) => s + (d.cliques_link || 0), 0);
  const totalPageViews      = dailyData.reduce((s, d) => s + (d.visualizacoes_pagina_destino || 0), 0);
  const totalCheckoutStarts = dailyData.reduce((s, d) => s + (d.finalizacoes_compra_iniciadas || 0), 0);
  const totalAddToCart      = dailyData.reduce((s, d) => s + (d.adicionados_carrinho || 0), 0);
  const totalPurchases      = dailyData.reduce((s, d) => s + (d.compras || 0), 0);
  const totalPurchaseValue  = dailyData.reduce((s, d) => s + (d.valor_conversao_compra || 0), 0);
  const totalClicks         = dailyData.reduce((s, d) => s + (d.cliques_todos || 0), 0);

  // ── Period-level metrics (never per-day) ──────────────────────────────────
  const ctr          = totalImpressions > 0    ? (totalClicks / totalImpressions) * 100        : 0;
  const connectRate  = totalLinkClicks > 0     ? (totalPageViews / totalLinkClicks) * 100      : 0;
  const checkoutRate = totalPageViews > 0      ? (totalCheckoutStarts / totalPageViews) * 100  : 0;
  const purchaseRate = totalCheckoutStarts > 0 ? (totalPurchases / totalCheckoutStarts) * 100  : 0;
  const roas         = totalSpent > 0          ? totalPurchaseValue / totalSpent                : 0;

  // ── Funnel values map ─────────────────────────────────────────────────────
  const funnelValues: Record<string, number> = {
    impressoes:                    totalImpressions,
    cliques_link:                  totalLinkClicks,
    visualizacoes_pagina_destino:  totalPageViews,
    finalizacoes_compra_iniciadas: totalCheckoutStarts,
    adicionados_carrinho:          totalAddToCart,
    compras:                       totalPurchases,
  };

  // Conversion % relative to the previous step
  const stepPct = (index: number): number | null => {
    if (index === 0) return null;
    const prev = funnelValues[FUNNEL_STEPS[index - 1].key] ?? 0;
    const cur  = funnelValues[FUNNEL_STEPS[index].key] ?? 0;
    return prev > 0 ? (cur / prev) * 100 : 0;
  };

  // Bar width relative to impressions (top = 100%)
  const barWidth = (index: number) =>
    totalImpressions > 0 ? Math.max((funnelValues[FUNNEL_STEPS[index].key] / totalImpressions) * 100, 3) : 0;

  // Metrics for side panel
  const sideMetrics = [
    { label: 'CTR',              value: `${ctr.toFixed(2)}%`,          color: '#8b5cf6' },
    { label: 'Connect Rate',     value: `${connectRate.toFixed(2)}%`,  color: '#06b6d4' },
    { label: 'Taxa de Checkout', value: `${checkoutRate.toFixed(2)}%`, color: '#f59e0b' },
    { label: 'Taxa de Compras',  value: `${purchaseRate.toFixed(2)}%`, color: '#22c55e' },
    { label: 'ROAS',             value: `${roas.toFixed(2)}x`,         color: '#f97316' },
  ];

  // ── Chart data (no ROAS per day) ──────────────────────────────────────────
  const chartData = dailyData.map((d) => ({
    date:                          formatDateBR(d.dia),
    valor_usado_brl:               d.valor_usado_brl,
    cliques_link:                  d.cliques_link,
    visualizacoes_pagina_destino:  d.visualizacoes_pagina_destino || 0,
    finalizacoes_compra_iniciadas: d.finalizacoes_compra_iniciadas || 0,
    adicionados_carrinho:          d.adicionados_carrinho || 0,
    compras:                       d.compras,
    custo_por_compra:              d.compras > 0 ? d.valor_usado_brl / d.compras : 0,
  }));

  return (
    <div>
      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KPICard title="Valor Usado"        value={totalSpent.toFixed(2)}                          icon={DollarSign}  prefix="R$ " />
        <KPICard title="Impressões"         value={totalImpressions.toLocaleString('pt-BR')}       icon={Eye} />
        <KPICard title="Mensagens Iniciadas"value={totalMessages.toLocaleString('pt-BR')}          icon={MessageSquare} />
        <KPICard title="Visitas Instagram"  value={totalInstagramVisits.toLocaleString('pt-BR')}   icon={Instagram} />
        <KPICard title="Reprod. de Vídeo"   value={totalVideoViews.toLocaleString('pt-BR')}        icon={Video} />
      </div>

      {/* ── Funnel + Right metrics ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6 mb-8">

        {/* Funnel card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-6">Funil de Conversão</h3>

          <div className="flex gap-4">
            {/* Left: funnel bars + labels */}
            <div className="flex-1 space-y-0">
              {FUNNEL_STEPS.map((step, i) => {
                const Icon   = step.icon;
                const val    = funnelValues[step.key] ?? 0;
                const pct    = stepPct(i);
                const width  = barWidth(i);
                const isLast = i === FUNNEL_STEPS.length - 1;

                return (
                  <div key={step.key} className="relative">
                    {/* Step row */}
                    <div className="flex items-center gap-3 mb-1">
                      {/* Icon */}
                      <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                           style={{ backgroundColor: `${step.color}22` }}>
                        <Icon className="h-3.5 w-3.5" style={{ color: step.color }} />
                      </div>

                      {/* Label + value */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400 truncate pr-2">{step.label}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {pct !== null && (
                              <span className="text-[10px] text-gray-500 bg-white/5 rounded px-1.5 py-0.5">
                                {pct.toFixed(1)}%
                              </span>
                            )}
                            <span className="text-sm font-bold text-white">
                              {val.toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        {/* Bar */}
                        <div className="h-6 bg-white/5 rounded-md overflow-hidden">
                          <div
                            className="h-full rounded-md transition-all duration-700"
                            style={{ width: `${width}%`, backgroundColor: step.color, opacity: 0.85 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Connector line between steps */}
                    {!isLast && (
                      <div className="flex ml-3.5">
                        <div className="w-px h-4 bg-white/15 mx-auto" style={{ marginLeft: '11px' }} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Purchase value highlight */}
              <div className="mt-3 ml-10">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
                  <span className="text-gray-500">↓</span>
                  <span>Valor da Compra</span>
                </div>
                <div className="border-2 border-dashed border-[#22c55e]/60 rounded-xl p-4 bg-[#22c55e]/5">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Receita gerada</p>
                  <p className="text-2xl font-bold text-[#22c55e]">
                    R$ {totalPurchaseValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalPurchases > 0
                      ? `Ticket médio: R$ ${(totalPurchaseValue / totalPurchases).toFixed(2)}`
                      : 'Sem compras no período'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right metrics panel */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Métricas do Período</h3>

          {sideMetrics.map((m, i) => (
            <div key={i} className="rounded-lg p-3 border border-white/8 bg-white/3 flex flex-col gap-0.5"
                 style={{ borderColor: `${m.color}30` }}>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">{m.label}</span>
              <span className="text-xl font-bold" style={{ color: m.color }}>{m.value}</span>
            </div>
          ))}

          {/* ROAS context note */}
          <p className="text-[10px] text-gray-600 mt-auto leading-relaxed">
            * ROAS calculado sobre o total do período selecionado
          </p>
        </div>
      </div>

      {/* ── Charts ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardChart
          title="Funil Diário – Cliques vs Compras"
          data={chartData}
          dataKey="cliques_link"
          color="#8b5cf6"
          type="composed"
          secondaryLine={{ dataKey: 'compras', color: '#22c55e', label: 'Compras' }}
          forceShowLabels={showLabelsForPDF}
        />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardChart
          title="Custo por Compra"
          data={chartData}
          dataKey="custo_por_compra"
          color="#f59e0b"
          type="line"
          prefix="R$ "
          forceShowLabels={showLabelsForPDF}
        />
        <DashboardChart
          title="Adicionados ao Carrinho por Dia"
          data={chartData}
          dataKey="adicionados_carrinho"
          color="#f97316"
          type="bar"
          forceShowLabels={showLabelsForPDF}
        />
      </div>

      {/* ── Daily table ──────────────────────────────────────────────────── */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Dados Diários</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Data','Valor Gasto','Impressões','Cliques Link','Pág. Destino','Checkout','Carrinho','Compras','Receita','Custo/Compra'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dailyData.map((d, i) => {
                const costPerPurchase = d.compras > 0 ? d.valor_usado_brl / d.compras : 0;
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
                    <td className="px-4 py-3 text-[#22c55e] whitespace-nowrap font-medium">R$ {(d.valor_conversao_compra || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={costPerPurchase > 0 ? 'text-[#f59e0b] font-bold' : 'text-gray-600'}>
                        {costPerPurchase > 0 ? `R$ ${costPerPurchase.toFixed(2)}` : '—'}
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
