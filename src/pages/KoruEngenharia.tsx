import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, LabelList,
} from 'recharts';
import {
  Building2, Users, UserCheck, FileCheck, TrendingUp, DollarSign,
  ReceiptText, UserX, RefreshCw, Upload, ChevronUp, ChevronDown,
  ChevronsUpDown, Search, ChevronLeft, ChevronRight, Lightbulb,
  CalendarDays,
} from 'lucide-react';
import {
  loadKoruData,
  loadKoruDataFromFile,
  formatCurrency,
  formatCurrencyFull,
  type KoruDashboardData,
  type KoruLead,
  computeKPIs,
  computeFunil,
  computeLeadsPorMes,
  computePorCorretor,
  computePorCanal,
  computePorProduto,
  generateInsights,
} from '@/lib/koruDataUtils';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: '#1E3A5F',
  primaryLight: '#2563EB',
  accent: '#2E7D52',
  accentLight: '#34D399',
  warning: '#F59E0B',
  danger: '#EF4444',
  bg: '#F0F4F8',
  card: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
};

const ETAPA_COLORS: Record<string, string> = {
  'Contato inicial': '#94A3B8',
  'Corretor nomeado': '#3B82F6',
  'Visita REALIZADA': '#F59E0B',
  'DOCUMENTOS PENDENTES': '#F97316',
  'contratado': '#10B981',
};

const CANAL_COLORS = ['#1E3A5F', '#2563EB', '#60A5FA', '#93C5FD', '#BFDBFE'];

// ── Utility ────────────────────────────────────────────────────────────────────
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  sparkData?: number[];
  subLabel?: string;
}

function KPICard({ label, value, icon, color = C.primary, sparkData, subLabel }: KPICardProps) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textSecondary }}>
          {label}
        </span>
        <span
          className="rounded-xl p-2"
          style={{ background: `${color}18`, color }}
        >
          {icon}
        </span>
      </div>
      <div className="text-2xl font-bold" style={{ color: C.textPrimary }}>
        {value}
      </div>
      {subLabel && (
        <div className="text-xs" style={{ color: C.textMuted }}>
          {subLabel}
        </div>
      )}
      {sparkData && sparkData.length > 1 && (
        <div className="h-10 mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData.map((v, i) => ({ v, i }))}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── Funil ─────────────────────────────────────────────────────────────────────
function FunilChart({ data }: { data: FunilStep[] }) {
  const max = data[0]?.total || 1;

  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <h2 className="text-base font-bold mb-5" style={{ color: C.textPrimary }}>
        Funil de Vendas
      </h2>
      <div className="space-y-3">
        {data.map((step, i) => {
          const pct = (step.total / max) * 100;
          const colors = ['#1E3A5F', '#1D4ED8', '#F59E0B', '#F97316', '#10B981'];
          const color = colors[i] || C.primary;

          return (
            <div key={step.etapa}>
              <div className="flex items-center gap-3 mb-1">
                <span
                  className="text-xs font-medium w-44 truncate text-right"
                  style={{ color: C.textSecondary }}
                >
                  {step.etapa}
                </span>
                <div className="flex-1 relative h-9 rounded-md overflow-hidden" style={{ background: C.bg }}>
                  <div
                    className="h-full rounded-md flex items-center px-3 transition-all duration-700"
                    style={{
                      width: `${Math.max(pct, 2)}%`,
                      background: color,
                    }}
                  >
                    {pct > 15 && (
                      <span className="text-white text-xs font-bold whitespace-nowrap">
                        {step.total.toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                  {pct <= 15 && (
                    <span
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold"
                      style={{ color: C.textSecondary }}
                    >
                      {step.total}
                    </span>
                  )}
                </div>
                <div className="w-16 text-right">
                  {step.conversaoPrev !== null ? (
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: `${color}22`, color }}
                    >
                      {step.conversaoPrev}%
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: C.textMuted }}>100%</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
        <p className="text-xs" style={{ color: C.textMuted }}>
          % = conversão da etapa anterior → etapa atual
        </p>
      </div>
    </div>
  );
}

// ── Leads por Mês ─────────────────────────────────────────────────────────────
function LeadsPorMesChart({ data }: { data: { mes: string; total: number; contratados: number }[] }) {
  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <h2 className="text-base font-bold mb-5" style={{ color: C.textPrimary }}>
        Leads por Mês
      </h2>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: C.textSecondary }} />
          <YAxis tick={{ fontSize: 11, fill: C.textSecondary }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
            formatter={(val: number, name: string) => [
              val.toLocaleString('pt-BR'),
              name === 'total' ? 'Total de leads' : 'Contratados',
            ]}
          />
          <Bar dataKey="total" fill={C.primary} radius={[4, 4, 0, 0]} name="total" />
          <Bar dataKey="contratados" fill={C.accent} radius={[4, 4, 0, 0]} name="contratados" />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: C.primary }} />
          <span className="text-xs" style={{ color: C.textSecondary }}>Total</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: C.accent }} />
          <span className="text-xs" style={{ color: C.textSecondary }}>Contratados</span>
        </div>
      </div>
    </div>
  );
}

// ── Corretor Chart ────────────────────────────────────────────────────────────
function CorretorChart({ data }: { data: { corretor: string; total: number; contratados: number }[] }) {
  const top = data.slice(0, 8);
  const max = top[0]?.total || 1;

  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <h2 className="text-base font-bold mb-5" style={{ color: C.textPrimary }}>
        Performance por Corretor
      </h2>
      <div className="space-y-2">
        {top.map(row => (
          <div key={row.corretor} className="flex items-center gap-2">
            <span
              className="text-xs w-28 truncate text-right"
              style={{ color: C.textSecondary }}
              title={row.corretor}
            >
              {row.corretor}
            </span>
            <div className="flex-1 relative h-6 rounded overflow-hidden" style={{ background: C.bg }}>
              {/* Base bar */}
              <div
                className="absolute inset-y-0 left-0 rounded"
                style={{
                  width: `${(row.total / max) * 100}%`,
                  background: `${C.primaryLight}40`,
                }}
              />
              {/* Converted */}
              {row.contratados > 0 && (
                <div
                  className="absolute inset-y-0 left-0 rounded"
                  style={{
                    width: `${(row.contratados / max) * 100}%`,
                    background: C.accent,
                  }}
                />
              )}
              <span
                className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold"
                style={{ color: C.textPrimary }}
              >
                {row.total}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-4 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: `${C.primaryLight}40` }} />
          <span className="text-xs" style={{ color: C.textSecondary }}>Em andamento</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: C.accent }} />
          <span className="text-xs" style={{ color: C.textSecondary }}>Contratados</span>
        </div>
      </div>
    </div>
  );
}

// ── Canal Chart ───────────────────────────────────────────────────────────────
function CanalChart({ data }: { data: { canal: string; total: number }[] }) {
  const total = data.reduce((s, d) => s + d.total, 0);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <h2 className="text-base font-bold mb-5" style={{ color: C.textPrimary }}>
        Leads por Canal
      </h2>
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="canal"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CANAL_COLORS[i % CANAL_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: number) => [
                `${val.toLocaleString('pt-BR')} (${((val / total) * 100).toFixed(1)}%)`,
                'Leads',
              ]}
              contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1.5 mt-2">
        {data.map((row, i) => (
          <div key={row.canal} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: CANAL_COLORS[i % CANAL_COLORS.length] }}
              />
              <span className="text-xs truncate max-w-[130px]" style={{ color: C.textSecondary }}>
                {row.canal}
              </span>
            </div>
            <span className="text-xs font-semibold" style={{ color: C.textPrimary }}>
              {((row.total / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Produto Chart ─────────────────────────────────────────────────────────────
function ProdutoChart({ data }: { data: { produto: string; total: number; contratados: number }[] }) {
  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <h2 className="text-base font-bold mb-5" style={{ color: C.textPrimary }}>
        Leads por Produto
      </h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: C.textSecondary }} />
          <YAxis
            type="category"
            dataKey="produto"
            tick={{ fontSize: 10, fill: C.textSecondary }}
            width={90}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
            formatter={(val: number, name: string) => [
              val.toLocaleString('pt-BR'),
              name === 'total' ? 'Total' : 'Contratados',
            ]}
          />
          <Bar dataKey="total" fill={`${C.primary}80`} radius={[0, 4, 4, 0]} name="total" />
          <Bar dataKey="contratados" fill={C.accent} radius={[0, 4, 4, 0]} name="contratados" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Insights Panel ────────────────────────────────────────────────────────────
function InsightsPanel({ insights }: { insights: string[] }) {
  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={18} style={{ color: C.warning }} />
        <h2 className="text-base font-bold" style={{ color: C.textPrimary }}>
          Insights Automáticos
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="rounded-xl p-3 text-sm"
            style={{ background: C.bg, color: C.textPrimary }}
          >
            {insight}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Etapa Badge ───────────────────────────────────────────────────────────────
function EtapaBadge({ etapa }: { etapa: string }) {
  const color = ETAPA_COLORS[etapa] || C.textMuted;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ background: `${color}22`, color }}
    >
      {etapa}
    </span>
  );
}

// ── Leads Table ───────────────────────────────────────────────────────────────
type SortDir = 'asc' | 'desc' | null;
type SortKey = keyof KoruLead | null;

function LeadsTable({ leads }: { leads: KoruLead[] }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('dataCriada');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const PER_PAGE = 10;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter(l =>
      !q ||
      l.contato.toLowerCase().includes(q) ||
      l.titulo.toLowerCase().includes(q) ||
      (l.corretor || '').toLowerCase().includes(q)
    );
  }, [leads, search]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      let cmp: number;
      if (av instanceof Date && bv instanceof Date) {
        cmp = av.getTime() - bv.getTime();
      } else if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv), 'pt-BR');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc');
      if (sortDir === null) setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronsUpDown size={12} className="opacity-30" />;
    if (sortDir === 'asc') return <ChevronUp size={12} />;
    if (sortDir === 'desc') return <ChevronDown size={12} />;
    return <ChevronsUpDown size={12} />;
  };

  const Th = ({ label, sortK }: { label: string; sortK?: SortKey }) => (
    <th
      className={cn(
        'px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider',
        sortK ? 'cursor-pointer select-none hover:opacity-80' : ''
      )}
      style={{ color: C.textSecondary }}
      onClick={sortK ? () => handleSort(sortK) : undefined}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortK && <SortIcon k={sortK} />}
      </div>
    </th>
  );

  return (
    <div
      className="rounded-2xl shadow-sm overflow-hidden"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      {/* Table header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
        <h2 className="text-base font-bold" style={{ color: C.textPrimary }}>
          Leads Recentes
        </h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }} />
          <input
            className="pl-8 pr-3 py-1.5 text-sm rounded-lg focus:outline-none"
            style={{
              background: C.bg,
              border: `1px solid ${C.border}`,
              color: C.textPrimary,
            }}
            placeholder="Buscar contato..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ background: C.bg }}>
            <tr>
              <Th label="#" sortK="id" />
              <Th label="Contato" sortK="contato" />
              <Th label="Etapa" sortK="etapa" />
              <Th label="Produto" sortK="produto" />
              <Th label="Corretor" sortK="corretor" />
              <Th label="Canal" sortK="canalOrigem" />
              <Th label="Valor" sortK="venda" />
              <Th label="Data" sortK="dataCriada" />
            </tr>
          </thead>
          <tbody>
            {paginated.map((lead, i) => (
              <tr
                key={lead.id}
                className="hover:bg-opacity-50 transition-colors"
                style={{
                  borderTop: `1px solid ${C.border}`,
                  background: i % 2 === 0 ? C.card : `${C.bg}88`,
                }}
              >
                <td className="px-3 py-3 text-xs font-mono" style={{ color: C.textMuted }}>
                  {lead.id}
                </td>
                <td className="px-3 py-3">
                  <span className="text-sm font-medium" style={{ color: C.textPrimary }}>
                    {lead.contato || lead.titulo || '—'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <EtapaBadge etapa={lead.etapa} />
                </td>
                <td className="px-3 py-3 text-xs" style={{ color: C.textSecondary }}>
                  {lead.produto && lead.produto !== 'Sem produto' ? lead.produto : '—'}
                </td>
                <td className="px-3 py-3 text-xs" style={{ color: C.textSecondary }}>
                  {lead.corretor || '—'}
                </td>
                <td className="px-3 py-3 text-xs" style={{ color: C.textSecondary }}>
                  {lead.canalOrigem || '—'}
                </td>
                <td className="px-3 py-3 text-xs font-semibold" style={{ color: lead.venda > 0 ? C.accent : C.textMuted }}>
                  {lead.venda > 0 ? formatCurrencyFull(lead.venda) : '—'}
                </td>
                <td className="px-3 py-3 text-xs" style={{ color: C.textMuted }}>
                  {lead.dataCriada
                    ? lead.dataCriada.toLocaleDateString('pt-BR')
                    : '—'}
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-sm" style={{ color: C.textMuted }}>
                  Nenhum lead encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        className="px-6 py-3 flex items-center justify-between"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <span className="text-xs" style={{ color: C.textMuted }}>
          {sorted.length.toLocaleString('pt-BR')} leads · página {page} de {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={14} style={{ color: C.textSecondary }} />
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let p: number;
            if (totalPages <= 7) p = i + 1;
            else if (page <= 4) p = i + 1;
            else if (page >= totalPages - 3) p = totalPages - 6 + i;
            else p = page - 3 + i;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-7 h-7 text-xs rounded-lg font-medium transition-colors"
                style={{
                  background: page === p ? C.primary : 'transparent',
                  color: page === p ? '#fff' : C.textSecondary,
                }}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight size={14} style={{ color: C.textSecondary }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-2xl animate-pulse', className)}
      style={{ background: '#E2E8F0' }}
    />
  );
}

// ── Filters ───────────────────────────────────────────────────────────────────
interface Filters {
  produto: string;
  corretor: string;
  canal: string;
}

function FilterBar({
  leads,
  filters,
  onChange,
}: {
  leads: KoruLead[];
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const produtos = useMemo(() => {
    const set = new Set(leads.map(l => l.produto).filter(Boolean));
    return ['Todos', ...Array.from(set).sort()];
  }, [leads]);

  const corretores = useMemo(() => {
    const set = new Set(leads.map(l => l.corretor || '').filter(Boolean));
    return ['Todos', ...Array.from(set).sort()];
  }, [leads]);

  const canais = useMemo(() => {
    const set = new Set(leads.map(l => l.canalOrigem || 'Não informado'));
    return ['Todos', ...Array.from(set).sort()];
  }, [leads]);

  const selectStyle = {
    background: 'white',
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: '6px 10px',
    fontSize: 13,
    color: C.textPrimary,
    outline: 'none',
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: C.textSecondary }}>Produto:</span>
        <select
          style={selectStyle}
          value={filters.produto}
          onChange={e => onChange({ ...filters, produto: e.target.value })}
        >
          {produtos.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: C.textSecondary }}>Corretor:</span>
        <select
          style={selectStyle}
          value={filters.corretor}
          onChange={e => onChange({ ...filters, corretor: e.target.value })}
        >
          {corretores.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: C.textSecondary }}>Canal:</span>
        <select
          style={selectStyle}
          value={filters.canal}
          onChange={e => onChange({ ...filters, canal: e.target.value })}
        >
          {canais.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {(filters.produto !== 'Todos' || filters.corretor !== 'Todos' || filters.canal !== 'Todos') && (
        <button
          onClick={() => onChange({ produto: 'Todos', corretor: 'Todos', canal: 'Todos' })}
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors hover:opacity-80"
          style={{ background: `${C.danger}18`, color: C.danger }}
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function KoruEngenharia() {
  const [data, setData] = useState<KoruDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filters, setFilters] = useState<Filters>({ produto: 'Todos', corretor: 'Todos', canal: 'Todos' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async (file?: File) => {
    setLoading(true);
    setError(null);
    try {
      let result: KoruDashboardData;
      if (file) {
        result = await loadKoruDataFromFile(file);
      } else {
        result = await loadKoruData();
      }
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await loadData(file);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Apply filters
  const filteredLeads = useMemo(() => {
    if (!data) return [];
    return data.leads.filter(l => {
      if (filters.produto !== 'Todos' && l.produto !== filters.produto) return false;
      if (filters.corretor !== 'Todos' && (l.corretor || '') !== filters.corretor) return false;
      if (filters.canal !== 'Todos') {
        const canal = l.canalOrigem || 'Não informado';
        if (canal !== filters.canal) return false;
      }
      return true;
    });
  }, [data, filters]);

  const filteredKpis = useMemo(() => computeKPIs(filteredLeads), [filteredLeads]);
  const filteredFunil = useMemo(() => computeFunil(filteredLeads), [filteredLeads]);
  const filteredLeadsPorMes = useMemo(() => computeLeadsPorMes(filteredLeads), [filteredLeads]);
  const filteredPorCorretor = useMemo(() => computePorCorretor(filteredLeads), [filteredLeads]);
  const filteredPorCanal = useMemo(() => computePorCanal(filteredLeads), [filteredLeads]);
  const filteredPorProduto = useMemo(() => computePorProduto(filteredLeads), [filteredLeads]);
  const filteredInsights = useMemo(
    () => generateInsights(filteredLeads, filteredKpis, filteredLeadsPorMes, filteredPorCorretor),
    [filteredLeads, filteredKpis, filteredLeadsPorMes, filteredPorCorretor]
  );

  const sparkLeadsPorMes = filteredLeadsPorMes.map(m => m.total);

  const kpiCards = [
    {
      label: 'Total de Leads',
      value: filteredKpis.totalLeads.toLocaleString('pt-BR'),
      icon: <Users size={18} />,
      color: C.primary,
      sparkData: sparkLeadsPorMes,
    },
    {
      label: 'Em Atendimento',
      value: filteredKpis.emAtendimento.toLocaleString('pt-BR'),
      icon: <UserCheck size={18} />,
      color: '#3B82F6',
      subLabel: `${filteredKpis.totalLeads > 0 ? ((filteredKpis.emAtendimento / filteredKpis.totalLeads) * 100).toFixed(1) : 0}% do total`,
    },
    {
      label: 'Corretores Nomeados',
      value: filteredKpis.corretoresNomeados.toLocaleString('pt-BR'),
      icon: <UserCheck size={18} />,
      color: C.warning,
    },
    {
      label: 'Contratos Fechados',
      value: filteredKpis.contratosFechados.toLocaleString('pt-BR'),
      icon: <FileCheck size={18} />,
      color: C.accent,
    },
    {
      label: 'Taxa de Conversão',
      value: `${filteredKpis.taxaConversao.toFixed(2)}%`,
      icon: <TrendingUp size={18} />,
      color: C.accent,
    },
    {
      label: 'VGV Total',
      value: formatCurrency(filteredKpis.vgvTotal),
      icon: <DollarSign size={18} />,
      color: C.primary,
    },
    {
      label: 'Ticket Médio',
      value: filteredKpis.ticketMedio > 0 ? formatCurrency(filteredKpis.ticketMedio) : '—',
      icon: <ReceiptText size={18} />,
      color: '#7C3AED',
    },
    {
      label: 'Sem Corretor',
      value: filteredKpis.semCorretor.toLocaleString('pt-BR'),
      icon: <UserX size={18} />,
      color: C.danger,
      subLabel: 'leads em Contato Inicial',
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ── Header ── */}
      <div style={{ background: C.primary }}>
        <div className="max-w-screen-xl mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <div
                className="rounded-xl p-2.5"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <Building2 size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Koru Engenharia</h1>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  Dashboard de Vendas
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex flex-wrap items-center gap-3">
              {data && (
                <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <CalendarDays size={13} />
                  <span className="text-xs">Atualizado em {data.dataAtualizacao}</span>
                </div>
              )}
              <button
                onClick={() => loadData()}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/20"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                Atualizar
              </button>
              <label
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors hover:bg-white/20"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
              >
                <Upload size={13} />
                {uploading ? 'Carregando...' : 'Importar XLSX'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleUpload}
                />
              </label>
            </div>
          </div>

          {/* Filters */}
          {data && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <FilterBar leads={data.leads} filters={filters} onChange={setFilters} />
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">
        {/* Error */}
        {error && (
          <div
            className="rounded-xl p-4 text-sm"
            style={{ background: `${C.danger}18`, color: C.danger, border: `1px solid ${C.danger}40` }}
          >
            <strong>Erro:</strong> {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
            </div>
            <Skeleton className="h-96" />
          </>
        )}

        {/* Dashboard content */}
        {!loading && data && (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {kpiCards.map(card => (
                <KPICard key={card.label} {...card} />
              ))}
            </div>

            {/* Funil + Leads por Mês */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FunilChart data={filteredFunil} />
              <LeadsPorMesChart data={filteredLeadsPorMes} />
            </div>

            {/* Secondary charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CorretorChart data={filteredPorCorretor} />
              <CanalChart data={filteredPorCanal} />
              <ProdutoChart data={filteredPorProduto} />
            </div>

            {/* Leads table */}
            <LeadsTable leads={filteredLeads} />

            {/* Insights */}
            <InsightsPanel insights={filteredInsights} />

            {/* Footer */}
            <div className="text-center py-4">
              <p className="text-xs" style={{ color: C.textMuted }}>
                Fonte: Kommo CRM · {filteredLeads.length.toLocaleString('pt-BR')} leads carregados ·{' '}
                Última atualização: {data.dataAtualizacao}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
