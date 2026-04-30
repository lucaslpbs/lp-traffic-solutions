import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, LabelList, Cell,
} from 'recharts';
import {
  Timer, Clock, TrendingDown, Users, RefreshCw, AlertCircle,
  CalendarDays, X, ChevronRight, TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Constants ──────────────────────────────────────────────────────────────
const API_URL = 'https://n8n.trafficsolutions.cloud/webhook/buscar-leads-koru-engenharia';
const PIPELINE_ID_INTERNA = 12157328;
const PIPELINE_ID_EXTERNA = 12628095;

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  primary: '#1E3A5F', primaryLight: '#2563EB', accent: '#2E7D52',
  warning: '#F59E0B', danger: '#EF4444',
  bg: '#F0F4F8', card: '#FFFFFF', border: '#E2E8F0',
  textPrimary: '#1E293B', textSecondary: '#64748B', textMuted: '#94A3B8',
};

// ── Types ──────────────────────────────────────────────────────────────────
interface ApiRecord {
  lead_id: string | number;
  pipeline_id?: string | number;
  etapa_nome?: string;
  data_hora_etapa?: string;
  data_hora_criacao_lead?: string;
  produto?: string;
  tags?: string;
}

interface DiasPorEtapa {
  etapa: string;
  diasMedios: number | null; // null = sem transição saindo desta etapa
  leads: number;             // leads únicos que passaram por esta etapa
  isWon: boolean;
  isLost: boolean;
}
interface CicloPorMes { mes: string; diasMedios: number; total: number }
interface DistFaixa { faixa: string; leads: number }
interface CicloAgente { label: string; diasMedios: number; fechamentos: number }

// ── Utilities ──────────────────────────────────────────────────────────────
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const ETAPAS_GANHA = ['venda ganha', 'contratado'];
const isWon = (s: string) => ETAPAS_GANHA.some(x => norm(s).includes(norm(x)));
const isLost = (s: string) => norm(s).includes('venda perdida') || norm(s).includes('base de perdidos');

function parseDateBR(s: string): number {
  if (!s) return 0;
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:${m[6]}`).getTime();
  return new Date(s).getTime();
}

const IGNORE_TAGS = [
  'fb885641647415719', 'meta ads forms 1', 'meta ads', 'vianna',
  'arruda imovéis', 'arruda imóveis', 'furtado', 'jordan imóveis',
  'apê story', 'ape story', 'agir', 'acacio',
];

function extractCorretor(tags: string): string | null {
  if (!tags.trim()) return null;
  const candidates = tags.split(',').map(t => t.trim()).filter(
    t => t && !IGNORE_TAGS.some(ig => t.toLowerCase().includes(ig))
  );
  return candidates[0] || null;
}

function normProduto(p: string): string {
  const l = p.toLowerCase();
  if (l.includes('alameda') && (l.includes('ipê') || l.includes('ipe'))) return 'Alameda dos Ipês';
  return p || 'Sem produto';
}

const FUNNEL_SORT = [
  'incoming leads', 'contato inicial', 'em atendimento', 'corretor nomeado',
  'vista agendada', 'visita realizada', 'documentos pendentes', 'analise de credito',
  'negociacao',
  // etapas externas / outras pipelines
  'corretores', 'contatos', 'geral',
  // terminais — sempre por último
  'venda ganha', 'contratado', 'venda perdida', 'base de perdidos',
];
function etapaOrder(e: string): number {
  const n = norm(e);
  const i = FUNNEL_SORT.findIndex(s => n.includes(s));
  return i >= 0 ? i : 50; // etapas desconhecidas antes das terminais
}

const MONTH_NAMES: Record<string, number> = {
  jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
  jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11,
};
function parseMesLabel(s: string): number {
  const parts = s.toLowerCase().split('/');
  return (parseInt('20' + parts[1]) || 2025) * 100 + (MONTH_NAMES[parts[0]] ?? 0);
}

// ── Core computations ──────────────────────────────────────────────────────
function computeDiasPorEtapa(records: ApiRecord[]): DiasPorEtapa[] {
  const now = Date.now();

  const byLead = new Map<string, ApiRecord[]>();
  const leadsByStage = new Map<string, Set<string>>();
  for (const r of records) {
    const id = String(r.lead_id);
    if (!byLead.has(id)) byLead.set(id, []);
    byLead.get(id)!.push(r);
    const etapa = r.etapa_nome?.trim();
    if (etapa) {
      if (!leadsByStage.has(etapa)) leadsByStage.set(etapa, new Set());
      leadsByStage.get(etapa)!.add(id);
    }
  }

  const acc = new Map<string, { totalMs: number; count: number }>();

  for (const events of byLead.values()) {
    events.sort((a, b) => parseDateBR(a.data_hora_etapa ?? '') - parseDateBR(b.data_hora_etapa ?? ''));

    for (let i = 0; i < events.length; i++) {
      const etapa = events[i].etapa_nome ?? '';
      if (!etapa) continue;
      const t1 = parseDateBR(events[i].data_hora_etapa ?? '');
      if (t1 <= 0) continue;

      let t2: number;
      if (i < events.length - 1) {
        t2 = parseDateBR(events[i + 1].data_hora_etapa ?? '');
        if (t2 <= t1) continue;
      } else {
        if (isWon(etapa) || isLost(etapa)) continue;
        t2 = now;
      }

      const e = acc.get(etapa) ?? { totalMs: 0, count: 0 };
      e.totalMs += t2 - t1;
      e.count++;
      acc.set(etapa, e);
    }
  }

  return Array.from(leadsByStage.entries())
    .map(([etapa, leadSet]) => {
      const a = acc.get(etapa);
      return {
        etapa,
        diasMedios: a && a.count > 0
          ? parseFloat((a.totalMs / a.count / 86_400_000).toFixed(2))
          : null,
        leads: leadSet.size,
        isWon: isWon(etapa),
        isLost: isLost(etapa),
      };
    })
    .sort((a, b) => etapaOrder(a.etapa) - etapaOrder(b.etapa));
}

interface CicloEntry { dias: number; produto: string; corretor: string; mes: string }

function computeCicloEntries(records: ApiRecord[]): CicloEntry[] {
  const data = new Map<string, {
    createdAt: number; wonAt: number; produto: string; tags: string;
  }>();

  for (const r of records) {
    const id = String(r.lead_id);
    const created = parseDateBR(r.data_hora_criacao_lead ?? '');
    const evt = parseDateBR(r.data_hora_etapa ?? '');

    if (!data.has(id)) data.set(id, { createdAt: 0, wonAt: 0, produto: '', tags: '' });
    const d = data.get(id)!;
    if (created > 0 && (d.createdAt === 0 || created < d.createdAt)) d.createdAt = created;
    if (r.produto) d.produto = r.produto;
    if (r.tags) d.tags = r.tags;
    if (isWon(r.etapa_nome ?? '') && evt > 0) d.wonAt = evt;
  }

  const entries: CicloEntry[] = [];
  for (const d of data.values()) {
    if (d.wonAt > 0 && d.createdAt > 0) {
      const dias = Math.round((d.wonAt - d.createdAt) / 86_400_000);
      if (dias >= 0) {
        const dt = new Date(d.createdAt);
        const rawMes = dt.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
        entries.push({
          dias,
          produto: normProduto(d.produto),
          corretor: extractCorretor(d.tags) ?? 'Sem corretor',
          mes: rawMes.charAt(0).toUpperCase() + rawMes.slice(1).replace('.', ''),
        });
      }
    }
  }
  return entries;
}

function computeCicloPorMes(entries: CicloEntry[]): CicloPorMes[] {
  const map = new Map<string, number[]>();
  for (const e of entries) {
    if (!map.has(e.mes)) map.set(e.mes, []);
    map.get(e.mes)!.push(e.dias);
  }
  return Array.from(map.entries())
    .map(([mes, dias]) => ({
      mes,
      diasMedios: Math.round(dias.reduce((s, d) => s + d, 0) / dias.length),
      total: dias.length,
    }))
    .sort((a, b) => parseMesLabel(a.mes) - parseMesLabel(b.mes));
}

function computeDistribuicao(entries: CicloEntry[]): DistFaixa[] {
  const faixas: { faixa: string; min: number; max: number }[] = [
    { faixa: '0–15 dias', min: 0, max: 15 },
    { faixa: '15–30 dias', min: 15, max: 30 },
    { faixa: '30–45 dias', min: 30, max: 45 },
    { faixa: '45–60 dias', min: 45, max: 60 },
    { faixa: '60–90 dias', min: 60, max: 90 },
    { faixa: '90+ dias', min: 90, max: Infinity },
  ];
  return faixas.map(f => ({
    faixa: f.faixa,
    leads: entries.filter(e => e.dias >= f.min && e.dias < f.max).length,
  }));
}

function computePorAgente(
  entries: CicloEntry[],
  key: keyof Pick<CicloEntry, 'corretor' | 'produto'>
): CicloAgente[] {
  const map = new Map<string, number[]>();
  for (const e of entries) {
    const k = e[key];
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(e.dias);
  }
  return Array.from(map.entries())
    .map(([label, dias]) => ({
      label,
      diasMedios: Math.round(dias.reduce((s, d) => s + d, 0) / dias.length),
      fechamentos: dias.length,
    }))
    .sort((a, b) => a.diasMedios - b.diasMedios);
}

function filterByDate(records: ApiRecord[], start: string, end: string): ApiRecord[] {
  if (!start || !end) return records;
  const s = new Date(start).getTime();
  const e = new Date(end + 'T23:59:59').getTime();
  return records.filter(r => {
    const t = parseDateBR(r.data_hora_criacao_lead ?? '');
    return t > 0 && t >= s && t <= e;
  });
}

// ── Sub-components ─────────────────────────────────────────────────────────
function KPICard({ label, value, icon, color = C.primary, sub }: {
  label: string; value: string; icon: React.ReactNode; color?: string; sub?: string;
}) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow"
      style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textSecondary }}>{label}</span>
        <span className="rounded-xl p-2" style={{ background: `${color}18`, color }}>{icon}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color: C.textPrimary }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: C.textMuted }}>{sub}</div>}
    </div>
  );
}

const FAIXA_COLORS = ['#10B981', '#34D399', '#F59E0B', '#F97316', '#EF4444', '#B91C1C'];

function stageColor(row: DiasPorEtapa): string {
  if (row.isWon) return '#10B981';
  if (row.isLost) return '#EF4444';
  if (row.diasMedios === null) return '#94A3B8';
  const d = row.diasMedios;
  return d <= 1 ? '#10B981' : d <= 3 ? '#F59E0B' : d <= 7 ? '#F97316' : '#EF4444';
}

function formatDias(d: number | null): string {
  if (d === null) return '—';
  return d < 1 ? `${(d * 24).toFixed(0)}h` : `${d}d`;
}

function DiasPorEtapaChart({ data }: { data: DiasPorEtapa[] }) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-32" style={{ color: C.textMuted }}>
      Sem dados para exibir.
    </div>
  );

  const numericOnly = data.filter(d => d.diasMedios !== null);
  const max = numericOnly.length > 0 ? Math.max(...numericOnly.map(d => d.diasMedios as number), 0.1) : 1;

  return (
    <div className="space-y-2">
      {data.map((row, i) => {
        const color = stageColor(row);
        const pct = row.diasMedios !== null ? (row.diasMedios / max) * 100 : 0;
        const label = formatDias(row.diasMedios);
        const badge = row.isWon ? '✅' : row.isLost ? '❌' : null;

        return (
          <div key={row.etapa} className="flex items-center gap-3">
            {/* número */}
            <span className="inline-block w-5 text-center font-mono text-xs flex-shrink-0" style={{ color: C.textMuted }}>
              {i + 1}.
            </span>
            {/* nome da etapa */}
            <span className="text-xs font-medium w-44 truncate text-right flex-shrink-0"
              style={{ color: row.isWon ? '#10B981' : row.isLost ? '#EF4444' : C.textSecondary }}
              title={row.etapa}>
              {badge && <span className="mr-1">{badge}</span>}
              {row.etapa}
            </span>
            {/* barra */}
            <div className="flex-1 relative h-9 rounded-md overflow-hidden" style={{ background: C.bg }}>
              {row.diasMedios !== null ? (
                <>
                  <div className="h-full rounded-md flex items-center px-3 transition-all duration-700"
                    style={{ width: `${Math.max(pct, 3)}%`, background: color, opacity: 0.85 }}>
                    {pct > 30 && (
                      <span className="text-white text-xs font-bold whitespace-nowrap">{label}</span>
                    )}
                  </div>
                  {pct <= 30 && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold"
                      style={{ color: C.textSecondary }}>{label}</span>
                  )}
                </>
              ) : (
                <div className="h-full flex items-center px-3">
                  <span className="text-xs italic" style={{ color: C.textMuted }}>
                    {row.isWon ? 'venda fechada' : row.isLost ? 'descartado' : 'sem transição registrada'}
                  </span>
                </div>
              )}
            </div>
            {/* contagem de leads */}
            <span className="text-xs w-20 text-right flex-shrink-0 font-semibold"
              style={{ color: row.isWon ? '#10B981' : row.isLost ? '#EF4444' : C.textMuted }}>
              {row.leads} lead{row.leads !== 1 ? 's' : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalCicloChart({ title, sub, data, color = C.primaryLight }: {
  title: string; sub: string; data: CicloAgente[]; color?: string;
}) {
  if (!data.length) return (
    <div className="rounded-2xl p-6 shadow-sm" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <h2 className="text-base font-bold mb-1" style={{ color: C.textPrimary }}>{title}</h2>
      <div className="flex items-center justify-center h-32" style={{ color: C.textMuted }}>Sem dados suficientes.</div>
    </div>
  );
  const max = data[data.length - 1]?.diasMedios || 1;
  return (
    <div className="rounded-2xl p-6 shadow-sm" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <h2 className="text-base font-bold mb-1" style={{ color: C.textPrimary }}>{title}</h2>
      <p className="text-xs mb-5" style={{ color: C.textMuted }}>{sub}</p>
      <div className="space-y-3">
        {data.map(row => {
          const pct = (row.diasMedios / max) * 100;
          return (
            <div key={row.label} className="flex items-center gap-3">
              <span className="text-xs font-medium w-36 truncate text-right flex-shrink-0"
                style={{ color: C.textSecondary }} title={row.label}>{row.label}</span>
              <div className="flex-1 relative h-8 rounded-md overflow-hidden" style={{ background: C.bg }}>
                <div className="h-full rounded-md flex items-center px-3 transition-all duration-700"
                  style={{ width: `${Math.max(pct, 4)}%`, background: color }}>
                  {pct > 25 && <span className="text-white text-xs font-bold whitespace-nowrap">{row.diasMedios}d</span>}
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
      <p className="text-xs mt-4 pt-3" style={{ borderTop: `1px solid ${C.border}`, color: C.textMuted }}>
        Ordenado do menor para o maior ciclo
      </p>
    </div>
  );
}

// ── Nav ────────────────────────────────────────────────────────────────────
function NavTabs() {
  return (
    <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
      {[
        { to: '/koru-engenharia', label: 'Dashboard' },
        { to: '/koru-engenharia/vendas', label: 'Vendas' },
        { to: '/koru-engenharia/ciclo-vendas', label: 'Ciclo de Vendas', active: true },
      ].map(({ to, label, active }) => (
        <Link key={to} to={to}
          className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
          style={active
            ? { background: 'white', color: C.primary, textDecoration: 'none' }
            : { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none' }
          }
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function KoruCicloVendas() {
  const [rawData, setRawData] = useState<ApiRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pipelineFilter, setPipelineFilter] = useState<'todos' | 'interna' | 'externa'>('interna');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [corretorFilter, setCorretorFilter] = useState('Todos');

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setRawData(Array.isArray(json) ? json : (json?.data ?? []));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados da API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 1. pipeline filter
  const pipelineRecords = useMemo(() => {
    if (!rawData) return [];
    if (pipelineFilter === 'todos') return rawData;
    const pid = pipelineFilter === 'interna' ? PIPELINE_ID_INTERNA : PIPELINE_ID_EXTERNA;
    return rawData.filter(r => Number(r.pipeline_id) === pid);
  }, [rawData, pipelineFilter]);

  // 2. corretor list (from unique extractCorretor across pipeline records)
  const corretores = useMemo(() => {
    const set = new Set<string>();
    for (const r of pipelineRecords) {
      const c = extractCorretor(r.tags ?? '');
      if (c) set.add(c);
    }
    return ['Todos', ...Array.from(set).sort()];
  }, [pipelineRecords]);

  // 3. apply date + corretor filters
  const filtered = useMemo(() => {
    let recs = filterByDate(pipelineRecords, dateStart, dateEnd);
    if (corretorFilter !== 'Todos') {
      const leadIds = new Set<string>();
      for (const r of recs) {
        if (extractCorretor(r.tags ?? '') === corretorFilter) leadIds.add(String(r.lead_id));
      }
      recs = recs.filter(r => leadIds.has(String(r.lead_id)));
    }
    return recs;
  }, [pipelineRecords, dateStart, dateEnd, corretorFilter]);

  // 4. computed metrics
  const diasPorEtapa = useMemo(() => computeDiasPorEtapa(filtered), [filtered]);
  const cicloEntries = useMemo(() => computeCicloEntries(filtered), [filtered]);
  const cicloPorMes = useMemo(() => computeCicloPorMes(cicloEntries), [cicloEntries]);
  const distribuicao = useMemo(() => computeDistribuicao(cicloEntries), [cicloEntries]);
  const cicloPorCorretor = useMemo(() => computePorAgente(cicloEntries, 'corretor'), [cicloEntries]);
  const cicloPorProduto = useMemo(() => computePorAgente(cicloEntries, 'produto'), [cicloEntries]);

  const cicloMedio = cicloEntries.length > 0
    ? Math.round(cicloEntries.reduce((s, e) => s + e.dias, 0) / cicloEntries.length) : -1;
  const menorCiclo = cicloEntries.length > 0 ? Math.min(...cicloEntries.map(e => e.dias)) : -1;
  const uniqueLeads = useMemo(() => new Set(filtered.map(r => String(r.lead_id))).size, [filtered]);
  const maiorCiclo = cicloEntries.length > 0 ? Math.max(...cicloEntries.map(e => e.dias)) : -1;

  const hasFilters = !!dateStart || !!dateEnd || corretorFilter !== 'Todos';

  const selectStyle: React.CSSProperties = {
    background: 'white', border: `1px solid ${C.border}`, borderRadius: 10,
    padding: '6px 10px', fontSize: 13, color: C.textPrimary, outline: 'none',
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: C.primary }}>
        <div className="max-w-screen-xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.9)', padding: 5 }}>
                <img src="/logo koru.jpg" alt="Koru Engenharia" className="h-14 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Koru Engenharia</h1>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>Ciclo de Vendas · dados via API</p>
              </div>
            </div>
            <button onClick={fetchData} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/20"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>
          </div>
          <NavTabs />
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">

        {/* Error */}
        {error && (
          <div className="rounded-xl px-5 py-4 flex items-center gap-3"
            style={{ background: `${C.danger}18`, border: `1px solid ${C.danger}55` }}>
            <AlertCircle size={18} style={{ color: C.danger }} />
            <p className="text-sm" style={{ color: C.danger }}>{error}</p>
          </div>
        )}

        {/* Pipeline + filters */}
        <div className="rounded-2xl px-6 py-4 shadow-sm" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="flex flex-wrap items-center gap-4">
            {/* Pipeline */}
            <div className="flex items-center gap-2">
              <ChevronRight size={14} style={{ color: C.textMuted }} />
              <span className="text-xs font-semibold" style={{ color: C.textSecondary }}>Funil:</span>
              {([['todos', 'Todos'], ['interna', 'Interno'], ['externa', 'Externo']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setPipelineFilter(v)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={pipelineFilter === v
                    ? { background: C.primary, color: 'white' }
                    : { background: C.bg, color: C.textSecondary, border: `1px solid ${C.border}` }
                  }>
                  {l}
                </button>
              ))}
            </div>

            {/* Period */}
            <div className="flex items-center gap-2">
              <CalendarDays size={14} style={{ color: C.textMuted }} />
              <span className="text-xs font-semibold" style={{ color: C.textSecondary }}>Período:</span>
              <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)}
                className="text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.textPrimary }} />
              <span className="text-xs" style={{ color: C.textMuted }}>até</span>
              <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)}
                className="text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.textPrimary }} />
            </div>

            {/* Corretor */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: C.textSecondary }}>Corretor:</span>
              <select value={corretorFilter} onChange={e => setCorretorFilter(e.target.value)} style={selectStyle}>
                {corretores.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Clear */}
            {hasFilters && (
              <button onClick={() => { setDateStart(''); setDateEnd(''); setCorretorFilter('Todos'); }}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-80"
                style={{ background: `${C.danger}18`, color: C.danger }}>
                <X size={12} /> Limpar filtros
              </button>
            )}

            {!loading && rawData && (
              <span className="text-xs ml-auto" style={{ color: C.textMuted }}>
                <span className="font-semibold" style={{ color: C.textPrimary }}>{uniqueLeads.toLocaleString('pt-BR')}</span> leads
              </span>
            )}
          </div>
        </div>

        {/* KPIs */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={32} className="animate-spin" style={{ color: C.primary }} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard label="Leads no Período" value={uniqueLeads.toLocaleString('pt-BR')}
                icon={<Users size={18} />} color={C.primary} sub="leads únicos" />
              <KPICard label="Ciclo Médio"
                value={cicloMedio >= 0 ? `${cicloMedio} dias` : '—'}
                icon={<Timer size={18} />} color={C.primaryLight}
                sub={cicloEntries.length > 0 ? `${cicloEntries.length} fechamentos` : 'sem fechamentos'} />
              <KPICard label="Menor Ciclo"
                value={menorCiclo >= 0 ? `${menorCiclo} dias` : '—'}
                icon={<TrendingDown size={18} />} color="#10B981"
                sub="fechamento mais rápido" />
              <KPICard label="Maior Ciclo"
                value={maiorCiclo >= 0 ? `${maiorCiclo} dias` : '—'}
                icon={<Clock size={18} />} color={C.warning}
                sub="fechamento mais demorado" />
            </div>

            {/* Dias por etapa */}
            <div className="rounded-2xl p-6 shadow-sm" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h2 className="text-base font-bold" style={{ color: C.textPrimary }}>
                    Tempo Médio por Etapa do Funil
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                    Calculado a partir das transições registradas na API · dias corridos entre eventos consecutivos
                  </p>
                </div>
                {cicloMedio >= 0 && (
                  <div className="text-xs px-3 py-1.5 rounded-lg font-semibold flex-shrink-0"
                    style={{ background: `${C.primaryLight}15`, color: C.primaryLight }}>
                    Ciclo total médio: {cicloMedio} dias ({cicloEntries.length} fechamento{cicloEntries.length !== 1 ? 's' : ''})
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mb-5 mt-3">
                {[['≤ 1 dia', '#10B981'], ['1–3 dias', '#F59E0B'], ['3–7 dias', '#F97316'], ['> 7 dias', '#EF4444']].map(([l, c]) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
                    <span className="text-xs" style={{ color: C.textSecondary }}>{l}</span>
                  </div>
                ))}
              </div>

              <DiasPorEtapaChart data={diasPorEtapa} />

              {diasPorEtapa.length > 0 && (
                <div className="mt-4 pt-3 flex justify-between" style={{ borderTop: `1px solid ${C.border}` }}>
                  <p className="text-xs" style={{ color: C.textMuted }}>Baseado em transições reais da API</p>
                  {diasPorEtapa.some(d => d.diasMedios !== null && !d.isWon && !d.isLost) && (
                    <p className="text-xs" style={{ color: C.textMuted }}>
                      Gargalo: <span style={{ color: '#EF4444', fontWeight: 600 }}>
                        {diasPorEtapa
                          .filter(d => d.diasMedios !== null && !d.isWon && !d.isLost)
                          .reduce((a, b) => (a.diasMedios ?? 0) > (b.diasMedios ?? 0) ? a : b).etapa}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Ciclo por mês + distribuição */}
            {cicloEntries.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ciclo por mês */}
                <div className="rounded-2xl p-6 shadow-sm" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                  <h2 className="text-base font-bold mb-1" style={{ color: C.textPrimary }}>Ciclo Médio por Mês</h2>
                  <p className="text-xs mb-5" style={{ color: C.textMuted }}>
                    Dias médios do lead desde criação até fechamento · {cicloEntries.length} fechamentos
                  </p>
                  {cicloPorMes.length > 1 ? (
                    <ResponsiveContainer width="100%" height={230}>
                      <LineChart data={cicloPorMes} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: C.textSecondary }} />
                        <YAxis tick={{ fontSize: 11, fill: C.textSecondary }} tickFormatter={v => `${v}d`} domain={[0, 'auto']} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
                          formatter={(val: number) => [`${val} dias`, 'Ciclo médio']} />
                        <ReferenceLine y={cicloMedio} stroke={C.warning} strokeDasharray="4 3"
                          label={{ value: `Média: ${cicloMedio}d`, position: 'insideTopRight', fontSize: 11, fill: C.warning }} />
                        <Line type="monotone" dataKey="diasMedios" stroke={C.primaryLight} strokeWidth={2.5}
                          dot={{ r: 4, fill: C.primaryLight }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-40">
                      <div className="text-center">
                        <TrendingUp size={28} className="mx-auto mb-2" style={{ color: C.primaryLight }} />
                        <p className="text-sm font-bold" style={{ color: C.textPrimary }}>
                          {cicloMedio >= 0 ? `${cicloMedio} dias` : '—'}
                        </p>
                        <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                          {cicloEntries.length} fechamento{cicloEntries.length !== 1 ? 's' : ''} · múltiplos meses necessários para o gráfico
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Distribuição */}
                <div className="rounded-2xl p-6 shadow-sm" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                  <h2 className="text-base font-bold mb-1" style={{ color: C.textPrimary }}>Distribuição do Ciclo</h2>
                  <p className="text-xs mb-5" style={{ color: C.textMuted }}>Fechamentos por faixa de tempo</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={distribuicao} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                      <XAxis dataKey="faixa" tick={{ fontSize: 10, fill: C.textSecondary }} />
                      <YAxis tick={{ fontSize: 11, fill: C.textSecondary }} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
                        formatter={(val: number) => [`${val} fechamentos`, 'Leads']} />
                      <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
                        {distribuicao.map((_, i) => <Cell key={i} fill={FAIXA_COLORS[i % FAIXA_COLORS.length]} />)}
                        <LabelList dataKey="leads" position="top" style={{ fontSize: 10, fill: C.textSecondary }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="rounded-xl px-5 py-4 flex items-center gap-3"
                style={{ background: `${C.warning}18`, border: `1px solid ${C.warning}55` }}>
                <AlertCircle size={18} style={{ color: C.warning }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.warning }}>
                    Sem fechamentos no período selecionado
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
                    Os gráficos de ciclo por mês e distribuição aparecem quando houver leads com venda ganha registrada.
                  </p>
                </div>
              </div>
            )}

            {/* Corretor + Produto */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HorizontalCicloChart
                title="Ciclo por Corretor"
                sub="Tempo médio de fechamento por corretor (extraído das tags)"
                data={cicloPorCorretor}
                color={C.primaryLight}
              />
              <HorizontalCicloChart
                title="Ciclo por Produto"
                sub="Tempo médio de fechamento por empreendimento"
                data={cicloPorProduto}
                color={C.accent}
              />
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs" style={{ color: C.textMuted }}>
            Koru Engenharia · Ciclo de Vendas · dados em tempo real via API ·{' '}
            {rawData ? `${rawData.length.toLocaleString('pt-BR')} registros carregados` : 'Carregando...'}
          </p>
        </div>

      </div>
    </div>
  );
}
