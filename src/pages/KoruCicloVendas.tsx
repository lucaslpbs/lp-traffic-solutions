import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, LabelList, Cell,
} from 'recharts';
import { Timer, Clock, TrendingDown, AlertTriangle, Users, RefreshCw, X, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  loadAllKoruData,
  computeKPIs,
  type KoruDashboardData,
  type KoruLead,
} from '@/lib/koruDataUtils';
import {
  mockCicloKPIs,
  mockCicloPorMes,
  mockDistribuicaoFaixas,
  mockCicloPorCorretor,
  mockCicloPorProduto,
  mockCicloPorCanal,
  mockDiasPorEtapa,
} from '@/lib/mockCicloVendas';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: '#1E3A5F',
  primaryLight: '#2563EB',
  accent: '#2E7D52',
  warning: '#F59E0B',
  danger: '#EF4444',
  bg: '#F0F4F8',
  card: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPICard({
  label, value, icon, color = C.primary, subLabel,
}: {
  label: string; value: string; icon: React.ReactNode; color?: string; subLabel?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textSecondary }}>
          {label}
        </span>
        <span className="rounded-xl p-2" style={{ background: `${color}18`, color }}>{icon}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color: C.textPrimary }}>{value}</div>
      {subLabel && <div className="text-xs" style={{ color: C.textMuted }}>{subLabel}</div>}
    </div>
  );
}

// ── Nav Tabs ──────────────────────────────────────────────────────────────────
function NavTabs() {
  return (
    <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
      <Link
        to="/koru-engenharia"
        className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
        style={{
          background: 'rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.85)',
          border: '1px solid rgba(255,255,255,0.2)',
          textDecoration: 'none',
        }}
      >
        Dashboard
      </Link>
      <Link
        to="/koru-engenharia/ciclo-vendas"
        className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
        style={{
          background: 'white',
          color: C.primary,
          textDecoration: 'none',
        }}
      >
        Ciclo de Vendas
      </Link>
    </div>
  );
}

// ── Dias por Etapa (gráfico principal) ────────────────────────────────────────
function DiasPorEtapaChart() {
  const max = Math.max(...mockDiasPorEtapa.map(e => e.diasMedios));

  // Cores por faixa de tempo
  const getColor = (dias: number) => {
    if (dias <= 7)  return '#10B981';
    if (dias <= 14) return '#F59E0B';
    if (dias <= 21) return '#F97316';
    return '#EF4444';
  };

  const totalDias = mockDiasPorEtapa.reduce((s, e) => s + e.diasMedios, 0);

  return (
    <div className="rounded-2xl p-6 shadow-sm" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-base font-bold" style={{ color: C.textPrimary }}>
            Tempo Médio por Etapa do Funil
          </h2>
          <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
            Quantos dias, em média, um lead fica em cada etapa antes de avançar
          </p>
        </div>
        <div
          className="text-xs px-3 py-1.5 rounded-lg font-semibold flex-shrink-0"
          style={{ background: `${C.primaryLight}15`, color: C.primaryLight }}
        >
          Ciclo total estimado: {totalDias} dias
        </div>
      </div>

      {/* Legenda de cores */}
      <div className="flex flex-wrap gap-3 mb-5 mt-3">
        {[
          { label: '≤ 7 dias', color: '#10B981' },
          { label: '8–14 dias', color: '#F59E0B' },
          { label: '15–21 dias', color: '#F97316' },
          { label: '> 21 dias', color: '#EF4444' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
            <span className="text-xs" style={{ color: C.textSecondary }}>{label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {mockDiasPorEtapa.map((row, i) => {
          const pct = (row.diasMedios / max) * 100;
          const color = getColor(row.diasMedios);
          const showInside = pct > 30;

          return (
            <div key={row.etapa} className="flex items-center gap-3">
              <span
                className="text-xs font-medium w-44 truncate text-right flex-shrink-0"
                style={{ color: C.textSecondary }}
                title={row.etapa}
              >
                <span
                  className="inline-block w-5 text-center font-mono mr-1"
                  style={{ color: C.textMuted }}
                >
                  {i + 1}.
                </span>
                {row.etapa}
              </span>
              <div
                className="flex-1 relative h-9 rounded-md overflow-hidden"
                style={{ background: C.bg }}
              >
                <div
                  className="h-full rounded-md flex items-center px-3 transition-all duration-700"
                  style={{ width: `${Math.max(pct, 3)}%`, background: color }}
                >
                  {showInside && (
                    <span className="text-white text-xs font-bold whitespace-nowrap">
                      {row.diasMedios} dias
                    </span>
                  )}
                </div>
                {!showInside && (
                  <span
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold"
                    style={{ color: C.textSecondary }}
                  >
                    {row.diasMedios} dias
                  </span>
                )}
              </div>
              <span
                className="text-xs w-20 text-right flex-shrink-0"
                style={{ color: C.textMuted }}
              >
                {row.leads.toLocaleString('pt-BR')} leads
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 flex justify-between" style={{ borderTop: `1px solid ${C.border}` }}>
        <p className="text-xs" style={{ color: C.textMuted }}>
          Dias corridos · baseado em dados simulados
        </p>
        <p className="text-xs" style={{ color: C.textMuted }}>
          Gargalo: <span style={{ color: '#EF4444', fontWeight: 600 }}>
            {mockDiasPorEtapa.reduce((a, b) => a.diasMedios > b.diasMedios ? a : b).etapa}
          </span>
        </p>
      </div>
    </div>
  );
}

// ── Ciclo por Mês ─────────────────────────────────────────────────────────────
function CicloPorMesChart() {
  const avg = mockCicloKPIs.cicloMedio;
  return (
    <div className="rounded-2xl p-6 shadow-sm" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <h2 className="text-base font-bold mb-1" style={{ color: C.textPrimary }}>Ciclo Médio por Mês</h2>
      <p className="text-xs mb-5" style={{ color: C.textMuted }}>Dias médios desde criação até fechamento</p>
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={mockCicloPorMes} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: C.textSecondary }} />
          <YAxis tick={{ fontSize: 11, fill: C.textSecondary }} tickFormatter={v => `${v}d`} domain={[0, 'auto']} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
            formatter={(val: number) => [`${val} dias`, 'Ciclo médio']}
          />
          <ReferenceLine
            y={avg}
            stroke={C.warning}
            strokeDasharray="4 3"
            label={{ value: `Média: ${avg}d`, position: 'insideTopRight', fontSize: 11, fill: C.warning }}
          />
          <Line
            type="monotone"
            dataKey="diasMedios"
            stroke={C.primaryLight}
            strokeWidth={2.5}
            dot={{ r: 4, fill: C.primaryLight }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Distribuição de Faixas ────────────────────────────────────────────────────
function DistribuicaoFaixasChart() {
  const FAIXA_COLORS = ['#10B981', '#34D399', '#F59E0B', '#F97316', '#EF4444', '#B91C1C'];
  const total = mockDistribuicaoFaixas.reduce((s, d) => s + d.leads, 0);
  return (
    <div className="rounded-2xl p-6 shadow-sm" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <h2 className="text-base font-bold mb-1" style={{ color: C.textPrimary }}>Distribuição do Ciclo</h2>
      <p className="text-xs mb-5" style={{ color: C.textMuted }}>Fechamentos por faixa de tempo</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={mockDistribuicaoFaixas} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="faixa" tick={{ fontSize: 10, fill: C.textSecondary }} />
          <YAxis tick={{ fontSize: 11, fill: C.textSecondary }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
            formatter={(val: number) => [
              `${val} fechamentos (${((val / total) * 100).toFixed(1)}%)`,
              'Leads',
            ]}
          />
          <Bar dataKey="leads" radius={[4, 4, 0, 0]} name="leads">
            {mockDistribuicaoFaixas.map((_, i) => (
              <Cell key={i} fill={FAIXA_COLORS[i % FAIXA_COLORS.length]} />
            ))}
            <LabelList dataKey="leads" position="top" style={{ fontSize: 10, fill: C.textSecondary }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Horizontal Bar Chart genérico (mock) ──────────────────────────────────────
function HorizontalCicloChart({
  title, subtitle, data, color = C.primaryLight,
}: {
  title: string; subtitle: string;
  data: { label: string; diasMedios: number; fechamentos: number }[];
  color?: string;
}) {
  const sorted = [...data].sort((a, b) => a.diasMedios - b.diasMedios);
  const max = sorted[sorted.length - 1]?.diasMedios || 1;

  return (
    <div className="rounded-2xl p-6 shadow-sm" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <h2 className="text-base font-bold mb-1" style={{ color: C.textPrimary }}>{title}</h2>
      <p className="text-xs mb-5" style={{ color: C.textMuted }}>{subtitle}</p>
      <div className="space-y-3">
        {sorted.map(row => {
          const pct = (row.diasMedios / max) * 100;
          return (
            <div key={row.label} className="flex items-center gap-3">
              <span
                className="text-xs font-medium w-36 truncate text-right flex-shrink-0"
                style={{ color: C.textSecondary }}
                title={row.label}
              >
                {row.label}
              </span>
              <div className="flex-1 relative h-8 rounded-md overflow-hidden" style={{ background: C.bg }}>
                <div
                  className="h-full rounded-md flex items-center px-3 transition-all duration-700"
                  style={{ width: `${Math.max(pct, 4)}%`, background: color }}
                >
                  {pct > 25 && (
                    <span className="text-white text-xs font-bold whitespace-nowrap">{row.diasMedios}d</span>
                  )}
                </div>
                {pct <= 25 && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: C.textSecondary }}>
                    {row.diasMedios}d
                  </span>
                )}
              </div>
              <span className="text-xs w-16 text-right flex-shrink-0" style={{ color: C.textMuted }}>
                {row.fechamentos} fecham.
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
        <p className="text-xs" style={{ color: C.textMuted }}>Ordenado do menor para o maior ciclo</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function KoruCicloVendas() {
  const [data, setData] = useState<KoruDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [selCorretor, setSelCorretor] = useState('Todos');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await loadAllKoruData();
      setData(result);
    } catch {
      // sem dados — continua com mock
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Lista de corretores disponíveis nos dados reais
  const corretores = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.leads.map(l => l.corretor || '').filter(Boolean));
    return ['Todos', ...Array.from(set).sort()];
  }, [data]);

  // Leads filtrados pelos filtros do painel
  const filteredLeads = useMemo((): KoruLead[] => {
    if (!data) return [];
    return data.leads.filter(l => {
      if (dataInicio && l.dataCriada && l.dataCriada < new Date(dataInicio)) return false;
      if (dataFim && l.dataCriada && l.dataCriada > new Date(`${dataFim}T23:59:59`)) return false;
      if (selCorretor !== 'Todos' && (l.corretor || '') !== selCorretor) return false;
      return true;
    });
  }, [data, dataInicio, dataFim, selCorretor]);

  const filteredKpis = useMemo(() => computeKPIs(filteredLeads), [filteredLeads]);

  const hasFilters = !!dataInicio || !!dataFim || selCorretor !== 'Todos';

  const selectStyle: React.CSSProperties = {
    background: 'white',
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: '6px 10px',
    fontSize: 13,
    color: C.textPrimary,
    outline: 'none',
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ── Header ── */}
      <div style={{ background: C.primary }}>
        <div className="max-w-screen-xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.9)', padding: 5 }}>
                <img src="/logo koru.jpg" alt="Koru Engenharia" className="h-14 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Koru Engenharia</h1>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>Ciclo de Vendas</p>
              </div>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/20"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>
          </div>
          <NavTabs />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">

        {/* Banner de dados simulados */}
        <div
          className="rounded-xl px-5 py-4 flex items-start gap-3"
          style={{ background: `${C.warning}18`, border: `1px solid ${C.warning}55` }}
        >
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" style={{ color: C.warning }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: C.warning }}>
              Dados simulados — aguardando volume suficiente de fechamentos reais
            </p>
            <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
              Os gráficos de ciclo (por mês, por corretor, por produto, por canal e dias por etapa)
              utilizam dados mockados. Os KPIs de leads e ciclo médio já refletem dados reais
              conforme os filtros abaixo.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div
          className="rounded-2xl px-6 py-4 shadow-sm"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex flex-wrap items-center gap-4">
            {/* Período */}
            <div className="flex items-center gap-2">
              <CalendarDays size={14} style={{ color: C.textMuted }} />
              <span className="text-xs font-semibold" style={{ color: C.textSecondary }}>Período:</span>
              <input
                type="date"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.textPrimary }}
                title="Data início"
              />
              <span className="text-xs" style={{ color: C.textMuted }}>até</span>
              <input
                type="date"
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
                className="text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.textPrimary }}
                title="Data fim"
              />
            </div>

            {/* Corretor */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: C.textSecondary }}>Corretor:</span>
              <select
                value={selCorretor}
                onChange={e => setSelCorretor(e.target.value)}
                style={selectStyle}
              >
                {corretores.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Limpar */}
            {hasFilters && (
              <button
                onClick={() => { setDataInicio(''); setDataFim(''); setSelCorretor('Todos'); }}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-80 transition-colors"
                style={{ background: `${C.danger}18`, color: C.danger }}
              >
                <X size={12} />
                Limpar filtros
              </button>
            )}

            {/* Contagem */}
            {!loading && data && (
              <span className="text-xs ml-auto" style={{ color: C.textMuted }}>
                <span className="font-semibold" style={{ color: C.textPrimary }}>
                  {filteredLeads.length.toLocaleString('pt-BR')}
                </span>{' '}
                leads no período
              </span>
            )}
          </div>
        </div>

        {/* KPI cards (dados reais) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            label="Leads no Período"
            value={loading ? '—' : filteredLeads.length.toLocaleString('pt-BR')}
            icon={<Users size={18} />}
            color={C.primary}
            subLabel="criados no período selecionado"
          />
          <KPICard
            label="Ciclo Médio (real)"
            value={
              loading
                ? '—'
                : filteredKpis.cicloMedioVendas >= 0
                  ? `${filteredKpis.cicloMedioVendas} dias`
                  : '—'
            }
            icon={<Timer size={18} />}
            color={C.primaryLight}
            subLabel="média dos leads fechados"
          />
          <KPICard
            label="Ciclo Médio (mock)"
            value={`${mockCicloKPIs.cicloMedio} dias`}
            icon={<Clock size={18} />}
            color={C.accent}
            subLabel="referência simulada"
          />
          <KPICard
            label="Menor Ciclo (mock)"
            value={`${mockCicloKPIs.menorCiclo} dias`}
            icon={<TrendingDown size={18} />}
            color="#10B981"
            subLabel="fechamento mais rápido"
          />
        </div>

        {/* Gráfico principal: dias por etapa */}
        <DiasPorEtapaChart />

        {/* Divisor mock */}
        <div
          className="flex items-center gap-3"
          style={{ color: C.textMuted }}
        >
          <div className="flex-1 h-px" style={{ background: C.border }} />
          <span className="text-xs font-semibold uppercase tracking-wider">Análises simuladas</span>
          <div className="flex-1 h-px" style={{ background: C.border }} />
        </div>

        {/* Ciclo por mês + Distribuição */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CicloPorMesChart />
          <DistribuicaoFaixasChart />
        </div>

        {/* Corretor + Produto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HorizontalCicloChart
            title="Ciclo por Corretor"
            subtitle="Tempo médio de fechamento por corretor"
            data={mockCicloPorCorretor}
            color={C.primaryLight}
          />
          <HorizontalCicloChart
            title="Ciclo por Produto"
            subtitle="Tempo médio de fechamento por empreendimento"
            data={mockCicloPorProduto}
            color={C.accent}
          />
        </div>

        {/* Canal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HorizontalCicloChart
            title="Ciclo por Canal de Origem"
            subtitle="Tempo médio de fechamento por canal de captação"
            data={mockCicloPorCanal}
            color="#7C3AED"
          />
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs" style={{ color: C.textMuted }}>
            Koru Engenharia · Ciclo de Vendas ·{' '}
            {data ? `${data.leads.length.toLocaleString('pt-BR')} leads carregados` : 'Carregando dados...'}
          </p>
        </div>
      </div>
    </div>
  );
}
