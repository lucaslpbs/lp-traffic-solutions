import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Eye, MousePointerClick, ShoppingCart,
  CreditCard, Users, DollarSign, Target, AlertTriangle, XCircle,
  CheckCircle2, HelpCircle, ArrowDown, ChevronUp, ChevronDown,
  BarChart3, Megaphone, Layers, MessageCircle,
} from 'lucide-react';

// ── Colors ───────────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#FAF8F5',
  card: '#FFFFFF',
  terracotta: '#C4775B',
  wine: '#8B2252',
  gold: '#C9A96E',
  text: '#2D2A26',
  textMuted: '#7A756E',
  border: '#E8E4DF',
  red: '#DC2626',
  yellow: '#F59E0B',
  green: '#16A34A',
  greenBg: '#F0FDF4',
  yellowBg: '#FFFBEB',
  redBg: '#FEF2F2',
};

// ── Google Font ──────────────────────────────────────────────────────────────

function GoogleFont() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
      .font-playfair { font-family: 'Playfair Display', Georgia, serif; }
    `}</style>
  );
}

// ── useCountUp hook ──────────────────────────────────────────────────────────

function useCountUp(end: number, duration = 1500, startOnView = true, isInView = true) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView || !isInView || started.current) return;
    started.current = true;

    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * end);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, startOnView, isInView]);

  return value;
}

// ── Number formatting ────────────────────────────────────────────────────────

function fmtBRL(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtNum(n: number, decimals = 0) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtPct(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
}

// ── Animated KPI Card ────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number;
  format: 'brl' | 'number' | 'percent' | 'decimal';
  icon: React.ReactNode;
  decimals?: number;
  delay?: number;
}

function KpiCard({ label, value, format, icon, decimals = 0, delay = 0 }: KpiCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const animated = useCountUp(value, 1500, true, isInView);

  const display = () => {
    const v = animated;
    switch (format) {
      case 'brl': return fmtBRL(v);
      case 'percent': return fmtPct(v);
      case 'decimal': return fmtNum(v, decimals || 2);
      default: return fmtNum(v, decimals);
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-shadow"
      style={{ borderColor: COLORS.border }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${COLORS.terracotta}15` }}>
          {icon}
        </div>
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: COLORS.textMuted }}>
          {label}
        </span>
      </div>
      <div className="text-2xl font-semibold font-playfair" style={{ color: COLORS.text }}>
        {display()}
      </div>
    </motion.div>
  );
}

// ── Section Wrapper ──────────────────────────────────────────────────────────

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className={`mb-10 ${className}`}
    >
      {children}
    </motion.section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-playfair text-2xl md:text-3xl font-semibold mb-6" style={{ color: COLORS.text }}>
      {children}
    </h2>
  );
}

// ── Creative Table ───────────────────────────────────────────────────────────

interface Creative {
  name: string;
  format: string;
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
}

const creatives: Creative[] = [
  { name: 'AD06 – Conjunto V Croped e Saia', format: 'Reels', impressions: 5754, clicks: 63, ctr: 1.09, spend: 76.33 },
  { name: 'AD03 – Macaquinho Brasil', format: 'Carrossel', impressions: 3817, clicks: 28, ctr: 0.73, spend: 30.78 },
  { name: 'AD05 – Conjunto Croped Ciganinha e Saia Balonê', format: 'Reels', impressions: 1499, clicks: 8, ctr: 0.53, spend: 13.62 },
  { name: 'AD02 – Macacão Longo Tomara que Caia Aladim', format: 'Carrossel', impressions: 341, clicks: 9, ctr: 2.64, spend: 3.70 },
  { name: 'AD02 – Vestido Brasil Amarelo', format: 'Vídeo', impressions: 294, clicks: 3, ctr: 1.02, spend: 3.07 },
  { name: 'AD01 – Macacão Longo Tomara que Caia', format: 'Vídeo', impressions: 316, clicks: 2, ctr: 0.63, spend: 3.00 },
  { name: 'AD01 – Vestido Brasil Verde', format: 'Vídeo', impressions: 432, clicks: 3, ctr: 0.69, spend: 3.13 },
  { name: 'AD03 – Macacão Longo Manga Curta Poliamida', format: 'Vídeo', impressions: 152, clicks: 0, ctr: 0.00, spend: 2.18 },
  { name: 'AD04 – Macacão Longo Manga Curta', format: 'Carrossel', impressions: 44, clicks: 1, ctr: 2.27, spend: 0.24 },
];

type SortKey = keyof Creative;

function CreativeTable() {
  const [sortKey, setSortKey] = useState<SortKey>('spend');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    return [...creatives].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const bestCTR = Math.max(...creatives.map(c => c.ctr));
  const highestSpend = Math.max(...creatives.map(c => c.spend));

  return (
    <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm" style={{ borderColor: COLORS.border }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: `${COLORS.terracotta}08` }}>
            {[
              { key: 'name' as SortKey, label: 'Criativo' },
              { key: 'format' as SortKey, label: 'Formato' },
              { key: 'impressions' as SortKey, label: 'Impressões' },
              { key: 'clicks' as SortKey, label: 'Cliques' },
              { key: 'ctr' as SortKey, label: 'CTR' },
              { key: 'spend' as SortKey, label: 'Gasto' },
            ].map(({ key, label }) => (
              <th
                key={key}
                onClick={() => toggleSort(key)}
                className="px-4 py-3 text-left font-medium cursor-pointer select-none whitespace-nowrap"
                style={{ color: COLORS.textMuted }}
              >
                <span className="inline-flex items-center gap-1">
                  {label} <SortIcon col={key} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, i) => (
            <tr key={i} className="border-t hover:bg-gray-50/50 transition-colors" style={{ borderColor: COLORS.border }}>
              <td className="px-4 py-3 font-medium" style={{ color: COLORS.text }}>
                <span className="flex items-center gap-2">
                  {c.name}
                  {c.ctr === bestCTR && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${COLORS.green}15`, color: COLORS.green }}>
                      Melhor CTR
                    </span>
                  )}
                  {c.spend === highestSpend && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${COLORS.yellow}15`, color: COLORS.yellow }}>
                      Mais verba
                    </span>
                  )}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs px-2 py-1 rounded-full" style={{
                  backgroundColor: c.format === 'Reels' ? `${COLORS.wine}12` : c.format === 'Carrossel' ? `${COLORS.terracotta}12` : `${COLORS.gold}20`,
                  color: c.format === 'Reels' ? COLORS.wine : c.format === 'Carrossel' ? COLORS.terracotta : COLORS.gold,
                }}>
                  {c.format}
                </span>
              </td>
              <td className="px-4 py-3 tabular-nums">{fmtNum(c.impressions)}</td>
              <td className="px-4 py-3 tabular-nums">{fmtNum(c.clicks)}</td>
              <td className="px-4 py-3 tabular-nums font-medium" style={{ color: c.ctr >= 2 ? COLORS.green : c.ctr < 1 ? COLORS.red : COLORS.text }}>
                {fmtPct(c.ctr)}
              </td>
              <td className="px-4 py-3 tabular-nums">{fmtBRL(c.spend)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function SamysamDashboard() {
  // ── KPI Data ─────────────────────────────────────────────────────────────
  const kpis = [
    { label: 'Investimento total', value: 175.69, format: 'brl' as const, icon: <DollarSign className="w-4 h-4" style={{ color: COLORS.terracotta }} /> },
    { label: 'Impressões', value: 16406, format: 'number' as const, icon: <Eye className="w-4 h-4" style={{ color: COLORS.terracotta }} /> },
    { label: 'Alcance', value: 14094, format: 'number' as const, icon: <Users className="w-4 h-4" style={{ color: COLORS.terracotta }} /> },
    { label: 'Cliques no link', value: 353, format: 'number' as const, icon: <MousePointerClick className="w-4 h-4" style={{ color: COLORS.terracotta }} /> },
    { label: 'CTR geral', value: 2.15, format: 'percent' as const, icon: <Target className="w-4 h-4" style={{ color: COLORS.terracotta }} /> },
    { label: 'CPC médio', value: 0.50, format: 'brl' as const, icon: <CreditCard className="w-4 h-4" style={{ color: COLORS.terracotta }} /> },
    { label: 'CPM médio', value: 10.71, format: 'brl' as const, icon: <BarChart3 className="w-4 h-4" style={{ color: COLORS.terracotta }} /> },
    { label: 'Adições ao carrinho', value: 16, format: 'number' as const, icon: <ShoppingCart className="w-4 h-4" style={{ color: COLORS.terracotta }} /> },
    { label: 'Checkout iniciado', value: 1, format: 'number' as const, icon: <CreditCard className="w-4 h-4" style={{ color: COLORS.terracotta }} /> },
    { label: 'Compras', value: 1, format: 'number' as const, icon: <ShoppingCart className="w-4 h-4" style={{ color: COLORS.gold }} /> },
    { label: 'Faturamento', value: 54.90, format: 'brl' as const, icon: <DollarSign className="w-4 h-4" style={{ color: COLORS.gold }} /> },
    { label: 'Seguidores ganhos', value: 91, format: 'number' as const, icon: <Users className="w-4 h-4" style={{ color: COLORS.wine }} /> },
    { label: 'ROAS geral', value: 0.31, format: 'decimal' as const, decimals: 2, icon: <TrendingDown className="w-4 h-4" style={{ color: COLORS.red }} /> },
  ];

  // ── Funnel Data ──────────────────────────────────────────────────────────
  const funnelStages = [
    { stage: 'Impressões', volume: 12649, conversion: null, color: COLORS.terracotta },
    { stage: 'Cliques no link', volume: 117, conversion: '0,92%', color: COLORS.gold },
    { stage: 'Adições ao carrinho', volume: 5, conversion: '4,3%', color: COLORS.yellow },
    { stage: 'Checkout iniciado', volume: 1, conversion: '20%', color: COLORS.wine },
    { stage: 'Compra', volume: 1, conversion: '100%', color: COLORS.green },
  ];

  // ── Comparison Data ──────────────────────────────────────────────────────
  const comparisonData = [
    { metric: 'Gasto', venda: 'R$ 136,05', trafego: 'R$ 39,64' },
    { metric: 'Impressões', venda: '12.649', trafego: '3.757' },
    { metric: 'Cliques', venda: '117', trafego: '236' },
    { metric: 'CTR', venda: '0,92%', trafego: '6,28%' },
    { metric: 'CPC', venda: '~R$ 1,16', trafego: 'R$ 0,17' },
    { metric: 'Seguidores ganhos', venda: '31', trafego: '60' },
    { metric: 'Custo por seguidor', venda: '—', trafego: 'R$ 0,66' },
  ];

  const comparisonChartData = [
    { name: 'CTR (%)', Venda: 0.92, Tráfego: 6.28 },
    { name: 'CPC (R$)', Venda: 1.16, Tráfego: 0.17 },
  ];

  // ── Diagnosis Data ───────────────────────────────────────────────────────
  const diagnoses = [
    {
      title: 'Criativo',
      severity: 'ATENÇÃO',
      severityColor: COLORS.yellow,
      severityBg: COLORS.yellowBg,
      icon: <AlertTriangle className="w-5 h-5" />,
      data: 'CTR venda = 0,92% vs 6,28% tráfego',
      problem: 'Os criativos prendem atenção (ótimo pra seguidor/alcance), mas não geram intenção de compra. Falta oferta clara, preço, senso de urgência e CTA direto pra venda. Eles vendem a marca, não o produto.',
    },
    {
      title: 'Página de Produto',
      severity: 'CRÍTICO',
      severityColor: COLORS.red,
      severityBg: COLORS.redBg,
      icon: <XCircle className="w-5 h-5" />,
      data: '117 cliques → apenas 5 adições ao carrinho (4,3%)',
      problem: 'A pessoa clica, entra na página do produto e desiste antes de colocar no carrinho. Suspeitos: fotos, preço/frete pouco claros, descrição fraca, ausência de prova social, lentidão da página ou layout pouco convincente.',
    },
    {
      title: 'Site / Checkout',
      severity: 'CRÍTICO',
      severityColor: COLORS.red,
      severityBg: COLORS.redBg,
      icon: <XCircle className="w-5 h-5" />,
      data: '5 carrinhos → 1 compra',
      problem: 'Há fricção entre o carrinho e a finalização — possível cadastro longo, frete caro, poucas opções de pagamento ou falta de confiança no momento de pagar.',
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <GoogleFont />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h1
            className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold mb-3"
            style={{ color: COLORS.wine }}
          >
            Samysam
          </h1>
          <p className="text-base md:text-lg mb-3" style={{ color: COLORS.textMuted }}>
            Análise de Tráfego Pago &middot; 01–26 jun 2026
          </p>
          <span
            className="inline-block text-xs font-medium px-4 py-1.5 rounded-full"
            style={{ backgroundColor: `${COLORS.gold}20`, color: COLORS.gold, border: `1px solid ${COLORS.gold}40` }}
          >
            ~1 semana de veiculação real
          </span>
        </motion.header>

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <Section>
          <SectionTitle>Indicadores Gerais</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {kpis.map((kpi, i) => (
              <KpiCard
                key={kpi.label}
                {...kpi}
                delay={i * 0.05}
              />
            ))}
          </div>
        </Section>

        {/* ── Sales Funnel ────────────────────────────────────────────────── */}
        <Section>
          <SectionTitle>Funil de Conversão (Campanhas de Venda)</SectionTitle>

          <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm" style={{ borderColor: COLORS.border }}>
            <div className="flex flex-wrap gap-4 mb-6 text-sm" style={{ color: COLORS.textMuted }}>
              <span>Investimento: <strong className="font-semibold" style={{ color: COLORS.text }}>R$ 136,05</strong></span>
              <span>ROAS: <strong className="font-semibold" style={{ color: COLORS.red }}>0,40</strong></span>
            </div>

            <div className="space-y-3">
              {funnelStages.map((s, i) => {
                const maxVol = funnelStages[0].volume;
                const widthPct = Math.max((s.volume / maxVol) * 100, 8);
                const isCriticalDrop = s.conversion && parseFloat(s.conversion.replace(',', '.')) < 5 && i < 3;

                return (
                  <motion.div
                    key={s.stage}
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-36 md:w-44 text-right text-sm font-medium shrink-0" style={{ color: COLORS.text }}>
                      {s.stage}
                    </div>
                    <div className="flex-1 relative">
                      <div
                        className="h-10 md:h-12 rounded-lg flex items-center px-4 transition-all relative overflow-hidden"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: `${s.color}20`,
                          border: `1.5px solid ${s.color}60`,
                        }}
                      >
                        <span className="text-sm font-bold relative z-10" style={{ color: s.color }}>
                          {fmtNum(s.volume)}
                        </span>
                      </div>
                    </div>
                    <div className="w-20 text-right shrink-0">
                      {s.conversion ? (
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: isCriticalDrop ? COLORS.redBg : `${COLORS.green}10`,
                            color: isCriticalDrop ? COLORS.red : COLORS.green,
                          }}
                        >
                          {s.conversion}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: COLORS.textMuted }}>—</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Drop-off arrows */}
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="text-xs px-3 py-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: COLORS.redBg, color: COLORS.red }}>
                <ArrowDown className="w-3 h-3" />
                Impressões → Cliques: perda de 99,1%
              </div>
              <div className="text-xs px-3 py-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: COLORS.redBg, color: COLORS.red }}>
                <ArrowDown className="w-3 h-3" />
                Cliques → Carrinho: perda de 95,7%
              </div>
              <div className="text-xs px-3 py-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: COLORS.yellowBg, color: COLORS.yellow }}>
                <ArrowDown className="w-3 h-3" />
                Carrinho → Compra: perda de 80%
              </div>
            </div>
          </div>
        </Section>

        {/* ── Sales vs Traffic Comparison ─────────────────────────────────── */}
        <Section>
          <SectionTitle>Venda vs Tráfego: Comparativo</SectionTitle>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Table comparison */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: COLORS.border }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: `${COLORS.terracotta}08` }}>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: COLORS.textMuted }}>Métrica</th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: COLORS.wine }}>
                      <span className="inline-flex items-center gap-1"><ShoppingCart className="w-3 h-3" /> Venda</span>
                    </th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: COLORS.terracotta }}>
                      <span className="inline-flex items-center gap-1"><Megaphone className="w-3 h-3" /> Tráfego</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, i) => (
                    <tr key={row.metric} className="border-t" style={{ borderColor: COLORS.border }}>
                      <td className="px-4 py-3 font-medium" style={{ color: COLORS.text }}>{row.metric}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: COLORS.wine }}>{row.venda}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: COLORS.terracotta }}>{row.trafego}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Chart comparison */}
            <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: COLORS.border }}>
              <h3 className="text-sm font-medium mb-4" style={{ color: COLORS.textMuted }}>CTR e CPC por campanha</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={comparisonChartData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: COLORS.textMuted }} />
                  <YAxis tick={{ fontSize: 12, fill: COLORS.textMuted }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: `1px solid ${COLORS.border}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Venda" fill={COLORS.wine} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Tráfego" fill={COLORS.terracotta} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insight callout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mt-4 p-4 rounded-xl border-l-4 bg-white shadow-sm"
            style={{ borderLeftColor: COLORS.gold, borderColor: COLORS.border }}
          >
            <p className="text-sm" style={{ color: COLORS.text }}>
              <strong style={{ color: COLORS.gold }}>Insight:</strong>{' '}
              Os criativos engajam muito (tráfego CTR 6,3%) mas não vendem (venda CTR 0,92%).
            </p>
          </motion.div>
        </Section>

        {/* ── Creative Performance ────────────────────────────────────────── */}
        <Section>
          <SectionTitle>Performance dos Criativos</SectionTitle>
          <CreativeTable />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mt-4 p-4 rounded-xl border-l-4 bg-white shadow-sm"
            style={{ borderLeftColor: COLORS.terracotta, borderColor: COLORS.border }}
          >
            <p className="text-sm" style={{ color: COLORS.text }}>
              <strong style={{ color: COLORS.terracotta }}>Observação:</strong>{' '}
              O criativo que recebeu MAIS verba (AD06, R$ 76) teve CTR medíocre (1,09%). O de melhor CTR (AD02 Carrossel, 2,64%) quase não recebeu verba.
            </p>
          </motion.div>
        </Section>

        {/* ── Diagnosis ───────────────────────────────────────────────────── */}
        <Section>
          <SectionTitle>Diagnóstico: 3 Gargalos Identificados</SectionTitle>

          <div className="grid md:grid-cols-3 gap-5">
            {diagnoses.map((d, i) => (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="rounded-2xl border-2 p-6 shadow-sm"
                style={{
                  borderColor: d.severityColor,
                  backgroundColor: d.severityBg,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${d.severityColor}20`, color: d.severityColor }}>
                    {d.icon}
                  </div>
                  <div>
                    <h3 className="font-playfair font-semibold text-lg" style={{ color: COLORS.text }}>{d.title}</h3>
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${d.severityColor}25`, color: d.severityColor }}
                    >
                      {d.severity}
                    </span>
                  </div>
                </div>

                <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: `${d.severityColor}08` }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: d.severityColor }}>Dados</p>
                  <p className="text-sm font-medium" style={{ color: COLORS.text }}>{d.data}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: d.severityColor }}>Problema</p>
                  <p className="text-sm leading-relaxed" style={{ color: COLORS.textMuted }}>{d.problem}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ── Strategic Question ──────────────────────────────────────────── */}
        <Section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-6 md:p-8 bg-white shadow-sm"
            style={{
              border: `2px dashed ${COLORS.gold}`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${COLORS.gold}15` }}>
                <HelpCircle className="w-6 h-6" style={{ color: COLORS.gold }} />
              </div>
              <h3 className="font-playfair text-xl font-semibold" style={{ color: COLORS.text }}>
                Ponto em aberto: vale vender pelo WhatsApp?
              </h3>
            </div>

            <div className="space-y-4 text-sm leading-relaxed" style={{ color: COLORS.textMuted }}>
              <p>
                Com ticket entre R$ 25 e R$ 40 e atrito visível no checkout do site, vale avaliar desviar parte do tráfego pago para venda assistida via WhatsApp (atendimento humano fecha a venda, tira a fricção do checkout e ajuda a montar combos pra subir o ticket).
              </p>
              <div className="p-4 rounded-xl" style={{ backgroundColor: `${COLORS.gold}08`, border: `1px solid ${COLORS.gold}25` }}>
                <p className="font-medium" style={{ color: COLORS.text }}>
                  <MessageCircle className="w-4 h-4 inline-block mr-2" style={{ color: COLORS.gold }} />
                  Pergunta a responder:
                </p>
                <p className="mt-1">
                  É possível operar venda pelo WhatsApp? Há pessoa pra atender, catálogo e link de pagamento? Se sim, pode ser um caminho mais curto até a primeira escala de vendas do que depender só do checkout do site.
                </p>
              </div>
            </div>
          </motion.div>
        </Section>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center pt-8 pb-4 border-t"
          style={{ borderColor: COLORS.border }}
        >
          <p className="text-xs" style={{ color: COLORS.textMuted }}>
            Dados de conversão originados do Pixel da Meta. Relatório gerado pela{' '}
            <strong style={{ color: COLORS.terracotta }}>LP Soluções em Tráfego</strong>.
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
