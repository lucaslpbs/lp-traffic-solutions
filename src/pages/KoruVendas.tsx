import { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LabelList,
  LineChart, Line, ReferenceLine,
} from 'recharts';
import {
  DollarSign, BarChart2, Calendar, RefreshCw, AlertCircle,
  ChevronRight, Home, Calculator, Timer, TrendingDown, Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Constants ──────────────────────────────────────────────────────────────
const API_URL = 'https://n8n.trafficsolutions.cloud/webhook/buscar-leads-koru-engenharia';
const XLSX_INTERNA = '/data/Funil%20Vendas%20Internas.xlsx';
const XLSX_EXTERNA = '/data/Funil%20Vendas%20Externas.xlsx';
const DEFAULT_TICKET = 245000;
const PIPELINE_ID_INTERNA = 12157328;
const PIPELINE_ID_EXTERNA = 12628095;
const ETAPAS_GANHA = ['venda ganha', 'contratado'];
const ETAPAS_PERDIDA = ['venda perdida', 'descartado'];

// ── Design Tokens ──────────────────────────────────────────────────────────
const D = {
  bg: '#07080F', card: '#0E1020', cardHover: '#141628',
  border: '#1A1E35', borderLight: '#252A45',
  text: '#E2E8F0', textSec: '#8892B0', textMuted: '#4A5568',
  blue: '#4F8EF7', blueGlow: '#3B82F6', green: '#34D399',
  amber: '#FBBF24', red: '#F87171', purple: '#A78BFA',
  cyan: '#22D3EE', pink: '#F472B6', orange: '#FB923C',
};
const CC = [D.blue, D.cyan, D.purple, D.amber, D.orange, D.pink, D.green, D.red];

// ── Types ──────────────────────────────────────────────────────────────────
interface LeadRecord {
  lead_id: string | number;
  pipeline_id?: string | number;
  etapa_nome?: string;
  data_hora_criacao_lead?: string;
  data_hora_etapa?: string;
  produto?: string;
  tags?: string;
  [key: string]: unknown;
}
interface EtapaRow { etapa: string; quantidade: number }
interface Metricas {
  totalCriados: number; atendidos: number; corretorNomeado: number;
  visitasRealizadas: number; analisesCredito: number; negociacoes: number;
  descartados: number; vendasFechadas: number;
}

// ── Utilities ──────────────────────────────────────────────────────────────
const fmtBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
const fmtPct = (v: number) => `${v.toFixed(2)}%`;
const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

function parseDateBR(s: string): number {
  if (!s) return 0;
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:${m[6]}`).getTime();
  return new Date(s).getTime();
}

function filterByDate(records: LeadRecord[], start: string, end: string): LeadRecord[] {
  if (!start || !end) return records;
  const s = new Date(start).getTime();
  const e = new Date(end + 'T23:59:59').getTime();
  return records.filter(r => {
    const t = parseDateBR(r.data_hora_criacao_lead ?? '');
    return t > 0 && t >= s && t <= e;
  });
}

function uniqueInStage(records: LeadRecord[], stage: string): number {
  const s = norm(stage);
  const ids = new Set<string>();
  for (const r of records) {
    if (norm(r.etapa_nome ?? '').includes(s)) ids.add(String(r.lead_id));
  }
  return ids.size;
}

function uniqueLeads(records: LeadRecord[]): number {
  return new Set(records.map(r => String(r.lead_id))).size;
}

function computeMetricas(records: LeadRecord[]): Metricas {
  const ganhaIds = new Set<string>();
  const perdidaIds = new Set<string>();
  for (const r of records) {
    const e = norm(r.etapa_nome ?? '');
    if (ETAPAS_GANHA.some(x => e.includes(norm(x)))) ganhaIds.add(String(r.lead_id));
    if (ETAPAS_PERDIDA.some(x => e.includes(norm(x)))) perdidaIds.add(String(r.lead_id));
  }
  return {
    totalCriados: uniqueLeads(records),
    atendidos: uniqueInStage(records, 'atendimento'),
    corretorNomeado: uniqueInStage(records, 'corretor'),
    visitasRealizadas: uniqueInStage(records, 'visita realizada'),
    analisesCredito: uniqueInStage(records, 'analise'),
    negociacoes: uniqueInStage(records, 'negociacao'),
    descartados: perdidaIds.size,
    vendasFechadas: ganhaIds.size,
  };
}

// ── Ciclo de Vendas — types ────────────────────────────────────────────────
interface CicloEtapaRow {
  etapa: string;
  diasMedios: number | null;
  leads: number;
  isWon: boolean;
  isLost: boolean;
}
interface CicloEntry { dias: number; produto: string; corretor: string; mes: string }
interface CicloPorMes { mes: string; diasMedios: number; total: number }
interface DistFaixa { faixa: string; leads: number }
interface CicloAgente { label: string; diasMedios: number; fechamentos: number }

// ── Ciclo de Vendas — utilities ────────────────────────────────────────────
const isWonStage = (s: string) => ETAPAS_GANHA.some(x => norm(s).includes(norm(x)));
const isLostStage = (s: string) =>
  norm(s).includes('venda perdida') || norm(s).includes('base de perdidos');

const IGNORE_TAGS_CORRETOR = [
  'fb885641647415719', 'meta ads forms 1', 'meta ads', 'vianna',
  'arruda imovéis', 'arruda imóveis', 'furtado', 'jordan imóveis',
  'apê story', 'ape story', 'agir', 'acacio',
];
function extractCorretor(tags: string): string | null {
  if (!tags.trim()) return null;
  const candidates = tags.split(',').map(t => t.trim())
    .filter(t => t && !IGNORE_TAGS_CORRETOR.some(ig => t.toLowerCase().includes(ig)));
  return candidates[0] || null;
}
function normProduto(p: string): string {
  const l = (p ?? '').toLowerCase();
  if (l.includes('alameda') && (l.includes('ipê') || l.includes('ipe'))) return 'Alameda dos Ipês';
  return p || 'Sem produto';
}

const CICLO_FUNNEL_SORT = [
  'incoming leads', 'contato inicial', 'em atendimento', 'corretor nomeado',
  'vista agendada', 'visita realizada', 'documentos pendentes', 'analise de credito',
  'negociacao', 'corretores', 'contatos', 'geral',
  'venda ganha', 'contratado', 'venda perdida', 'base de perdidos',
];
const cicloEtapaOrder = (e: string) => {
  const n = norm(e);
  const i = CICLO_FUNNEL_SORT.findIndex(s => n.includes(s));
  return i >= 0 ? i : 50;
};

const MONTH_NUM: Record<string, number> = {
  jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
  jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11,
};
const parseMesLabel = (s: string) => {
  const p = s.toLowerCase().split('/');
  return (parseInt('20' + p[1]) || 2025) * 100 + (MONTH_NUM[p[0]] ?? 0);
};

function computeCicloEtapas(records: LeadRecord[]): CicloEtapaRow[] {
  const now = Date.now();

  // Agrupa todos os eventos por lead e coleta leads únicos por etapa
  const byLead = new Map<string, LeadRecord[]>();
  const leadsByStage = new Map<string, Set<string>>();
  for (const r of records) {
    const id = String(r.lead_id);
    if (!byLead.has(id)) byLead.set(id, []);
    byLead.get(id)!.push(r);
    const e = r.etapa_nome?.trim();
    if (e) {
      if (!leadsByStage.has(e)) leadsByStage.set(e, new Set());
      leadsByStage.get(e)!.add(id);
    }
  }

  // Acumula tempo real por etapa
  const acc = new Map<string, { totalMs: number; count: number }>();

  for (const events of byLead.values()) {
    // Ordena do evento mais antigo para o mais recente
    events.sort((a, b) => parseDateBR(a.data_hora_etapa ?? '') - parseDateBR(b.data_hora_etapa ?? ''));

    for (let i = 0; i < events.length; i++) {
      const etapa = events[i].etapa_nome ?? '';
      if (!etapa) continue;
      const t1 = parseDateBR(events[i].data_hora_etapa ?? '');
      if (t1 <= 0) continue;

      let t2: number;
      if (i < events.length - 1) {
        // Lead avançou para próxima etapa: usa data do próximo evento
        t2 = parseDateBR(events[i + 1].data_hora_etapa ?? '');
        if (t2 <= t1) continue; // timestamp inválido
      } else {
        // Último evento conhecido do lead (etapa atual)
        // Terminais (venda ganha/perdida) não têm "tempo de espera"
        if (isWonStage(etapa) || isLostStage(etapa)) continue;
        // Lead ainda está nessa etapa: conta até agora
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
        // diasMedios = null apenas para terminais (sem barra de tempo)
        diasMedios: a && a.count > 0
          ? parseFloat((a.totalMs / a.count / 86_400_000).toFixed(2))
          : null,
        leads: leadSet.size,
        isWon: isWonStage(etapa),
        isLost: isLostStage(etapa),
      };
    })
    .sort((a, b) => cicloEtapaOrder(a.etapa) - cicloEtapaOrder(b.etapa));
}

function computeCicloEntries(records: LeadRecord[]): CicloEntry[] {
  const data = new Map<string, { createdAt: number; wonAt: number; produto: string; tags: string }>();
  for (const r of records) {
    const id = String(r.lead_id);
    const created = parseDateBR(r.data_hora_criacao_lead ?? '');
    const evt = parseDateBR(r.data_hora_etapa ?? '');
    if (!data.has(id)) data.set(id, { createdAt: 0, wonAt: 0, produto: '', tags: '' });
    const d = data.get(id)!;
    if (created > 0 && (d.createdAt === 0 || created < d.createdAt)) d.createdAt = created;
    if (r.produto) d.produto = r.produto;
    if (r.tags) d.tags = r.tags;
    if (isWonStage(r.etapa_nome ?? '') && evt > 0) d.wonAt = evt;
  }
  const entries: CicloEntry[] = [];
  for (const d of data.values()) {
    if (d.wonAt > 0 && d.createdAt > 0) {
      const dias = Math.round((d.wonAt - d.createdAt) / 86_400_000);
      if (dias >= 0) {
        const dt = new Date(d.createdAt);
        const raw = dt.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
        entries.push({
          dias,
          produto: normProduto(d.produto),
          corretor: extractCorretor(d.tags) ?? 'Sem corretor',
          mes: raw.charAt(0).toUpperCase() + raw.slice(1).replace('.', ''),
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
      mes, total: dias.length,
      diasMedios: Math.round(dias.reduce((s, d) => s + d, 0) / dias.length),
    }))
    .sort((a, b) => parseMesLabel(a.mes) - parseMesLabel(b.mes));
}

function computeDistribuicao(entries: CicloEntry[]): DistFaixa[] {
  return [
    { faixa: '0–15d', min: 0, max: 15 },
    { faixa: '15–30d', min: 15, max: 30 },
    { faixa: '30–45d', min: 30, max: 45 },
    { faixa: '45–60d', min: 45, max: 60 },
    { faixa: '60–90d', min: 60, max: 90 },
    { faixa: '90+d', min: 90, max: Infinity },
  ].map(({ faixa, min, max }) => ({
    faixa,
    leads: entries.filter(e => e.dias >= min && e.dias < max).length,
  }));
}

function computeCicloAgente(
  entries: CicloEntry[], key: 'corretor' | 'produto'
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

// ── Ciclo de Vendas — components ───────────────────────────────────────────
function cicloStageColor(row: CicloEtapaRow): string {
  if (row.isWon) return D.green;
  if (row.isLost) return D.red;
  if (row.diasMedios === null) return D.textMuted;
  const d = row.diasMedios;
  return d <= 1 ? D.green : d <= 3 ? D.amber : d <= 7 ? D.orange : D.red;
}

function CicloKPICard({ label, value, icon, color = D.blue, sub }: {
  label: string; value: string; icon: React.ReactNode; color?: string; sub?: string;
}) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-2"
      style={{ background: D.card, border: `1px solid ${D.border}` }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: D.textSec }}>{label}</span>
        <span className="rounded-xl p-2" style={{ background: `${color}22`, color }}>{icon}</span>
      </div>
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: D.textMuted }}>{sub}</div>}
    </div>
  );
}

function CicloEtapaChart({ data }: { data: CicloEtapaRow[] }) {
  if (!data.length)
    return <p className="text-center py-8" style={{ color: D.textMuted }}>Sem dados de etapas.</p>;

  const numericRows = data.filter(r => r.diasMedios !== null);
  const max = numericRows.length > 0 ? Math.max(...numericRows.map(r => r.diasMedios as number), 0.1) : 1;

  return (
    <div className="space-y-2">
      {data.map((row, i) => {
        const color = cicloStageColor(row);
        const pct = row.diasMedios !== null ? (row.diasMedios / max) * 100 : 0;
        const label = row.diasMedios === null ? null
          : row.diasMedios < 1 ? `${(row.diasMedios * 24).toFixed(0)}h`
          : `${row.diasMedios}d`;
        return (
          <div key={row.etapa} className="flex items-center gap-3">
            <span className="text-xs font-mono w-5 text-center flex-shrink-0" style={{ color: D.textMuted }}>
              {i + 1}.
            </span>
            <span className="text-xs font-medium w-44 truncate text-right flex-shrink-0"
              style={{ color: row.isWon ? D.green : row.isLost ? D.red : D.textSec }}
              title={row.etapa}>
              {row.isWon ? '✅ ' : row.isLost ? '❌ ' : ''}{row.etapa}
            </span>
            <div className="flex-1 relative h-8 rounded-lg overflow-hidden"
              style={{ background: D.cardHover, border: `1px solid ${D.border}` }}>
              {row.diasMedios !== null ? (
                <>
                  <div className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                    style={{ width: `${Math.max(pct, 3)}%`, background: color, opacity: 0.85 }}>
                    {pct > 28 && <span className="text-xs font-bold whitespace-nowrap" style={{ color: D.bg }}>{label}</span>}
                  </div>
                  {pct <= 28 && label && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold"
                      style={{ color: D.textSec }}>{label}</span>
                  )}
                </>
              ) : (
                <div className="h-full flex items-center px-3">
                  <span className="text-xs italic" style={{ color: D.textMuted }}>
                    {row.isWon ? 'venda fechada' : row.isLost ? 'descartado' : 'sem transição registrada'}
                  </span>
                </div>
              )}
            </div>
            <span className="text-xs w-16 text-right font-semibold flex-shrink-0"
              style={{ color: row.isWon ? D.green : row.isLost ? D.red : D.textMuted }}>
              {row.leads} lead{row.leads !== 1 ? 's' : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CicloHBarChart({ data, color = D.blue }: { data: CicloAgente[]; color?: string }) {
  if (!data.length)
    return <p className="text-center py-8 text-sm" style={{ color: D.textMuted }}>Sem fechamentos suficientes.</p>;
  const max = data[data.length - 1]?.diasMedios || 1;
  return (
    <div className="space-y-2">
      {data.map(row => {
        const pct = (row.diasMedios / max) * 100;
        return (
          <div key={row.label} className="flex items-center gap-3">
            <span className="text-xs font-medium w-36 truncate text-right flex-shrink-0"
              style={{ color: D.textSec }} title={row.label}>{row.label}</span>
            <div className="flex-1 relative h-8 rounded-lg overflow-hidden"
              style={{ background: D.cardHover, border: `1px solid ${D.border}` }}>
              <div className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                style={{ width: `${Math.max(pct, 4)}%`, background: color, opacity: 0.85 }}>
                {pct > 25 && <span className="text-xs font-bold" style={{ color: D.bg }}>{row.diasMedios}d</span>}
              </div>
              {pct <= 25 && (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold"
                  style={{ color: D.textSec }}>{row.diasMedios}d</span>
              )}
            </div>
            <span className="text-xs w-16 text-right flex-shrink-0" style={{ color: D.textMuted }}>
              {row.fechamentos} fecham.
            </span>
          </div>
        );
      })}
    </div>
  );
}

const FAIXA_CC = [D.green, D.cyan, D.amber, D.orange, D.red, '#B91C1C'];

// ── Hooks ──────────────────────────────────────────────────────────────────
function useXlsx(tab: 'interna' | 'externa') {
  const [rows, setRows] = useState<EtapaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = tab === 'interna' ? XLSX_INTERNA : XLSX_EXTERNA;
    setLoading(true); setError(null);
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.arrayBuffer(); })
      .then(buf => {
        const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
        if (!json.length) { setRows([]); return; }
        const key = Object.keys(json[0]).find(k => norm(k).includes('etapa do lead')) ?? '';
        if (!key) { setRows([]); return; }
        const map = new Map<string, number>();
        for (const row of json) {
          const e = String(row[key] ?? '').trim();
          if (e) map.set(e, (map.get(e) ?? 0) + 1);
        }
        setRows(Array.from(map.entries())
          .map(([etapa, quantidade]) => ({ etapa, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade));
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Erro ao carregar planilha'))
      .finally(() => setLoading(false));
  }, [tab]);

  return { rows, loading, error };
}

// ── Shared UI ──────────────────────────────────────────────────────────────
function FunilTabs({ active, onChange }: { active: 'interna' | 'externa'; onChange: (v: 'interna' | 'externa') => void }) {
  return (
    <div className="inline-flex rounded-xl p-1 gap-1" style={{ background: D.card, border: `1px solid ${D.border}` }}>
      {(['interna', 'externa'] as const).map(t => (
        <button key={t} onClick={() => onChange(t)}
          className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
          style={active === t ? { background: D.blueGlow, color: '#fff' } : { color: D.textSec }}>
          Funil {t === 'interna' ? 'Interno' : 'Externo'}
        </button>
      ))}
    </div>
  );
}

function Card({ title, sub, icon, children }: { title: string; sub: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: D.card, border: `1px solid ${D.border}` }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: D.text }}>{title}</h2>
          <p className="text-xs mt-1" style={{ color: D.textSec }}>{sub}</p>
        </div>
        {icon}
      </div>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <RefreshCw size={32} className="animate-spin" style={{ color: D.blue }} />
      <p style={{ color: D.textSec }}>Carregando dados...</p>
    </div>
  );
}

function ErrBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: `${D.red}18`, border: `1px solid ${D.red}55` }}>
      <AlertCircle size={18} style={{ color: D.red }} />
      <p className="text-sm" style={{ color: D.red }}>{msg}</p>
    </div>
  );
}

const TTip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 shadow-xl" style={{ background: D.cardHover, border: `1px solid ${D.borderLight}`, color: D.text }}>
      <p className="text-sm font-semibold mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} className="text-sm" style={{ color: p.color ?? D.blue }}>{p.name}: <strong>{p.value}</strong></p>)}
    </div>
  );
};

const PTip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; fill: string; payload: { percent: number } }[] }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl px-4 py-3 shadow-xl" style={{ background: D.cardHover, border: `1px solid ${D.borderLight}`, color: D.text }}>
      <p className="text-sm font-semibold">{p.name}</p>
      <p className="text-sm" style={{ color: p.fill }}>{p.value} ({fmtPct(p.payload.percent * 100)})</p>
    </div>
  );
};

// ── Section I ──────────────────────────────────────────────────────────────
function SecaoEstatica({ tab }: { tab: 'interna' | 'externa' }) {
  const { rows, loading, error } = useXlsx(tab);
  const total = rows.reduce((s, r) => s + r.quantidade, 0);
  const chartH = Math.max(rows.length * 52 + 20, 180);
  const pieData = rows.filter(r => r.quantidade > 0);

  if (loading) return <Spinner />;
  if (error) return <ErrBanner msg={error} />;
  if (!rows.length) return <p className="text-center py-16" style={{ color: D.textSec }}>Nenhum dado encontrado na planilha.</p>;

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${D.border}` }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: D.cardHover }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: D.textSec }}>ETAPA | DESCRIÇÃO</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: D.textSec }}>QUANT. (ATUAL)</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: D.textSec }}>%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.etapa} style={{ background: i % 2 === 0 ? D.card : D.cardHover, borderTop: `1px solid ${D.border}` }}>
                <td className="px-4 py-3" style={{ color: D.text }}>{row.etapa}</td>
                <td className="px-4 py-3 text-right font-bold" style={{ color: D.blue }}>{row.quantidade}</td>
                <td className="px-4 py-3 text-right" style={{ color: D.textSec }}>
                  {total > 0 ? fmtPct((row.quantidade / total) * 100) : '—'}
                </td>
              </tr>
            ))}
            <tr style={{ background: D.cardHover, borderTop: `1px solid ${D.borderLight}` }}>
              <td className="px-4 py-3 font-bold" style={{ color: D.text }}>TOTAL GERAL (LEADS ATIVOS)</td>
              <td className="px-4 py-3 text-right font-black text-base" style={{ color: D.green }}>{total}</td>
              <td className="px-4 py-3 text-right font-bold" style={{ color: D.green }}>100,00%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: D.textSec }}>Quantidade por Etapa</p>
          <ResponsiveContainer width="100%" height={chartH}>
            <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 48, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={D.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: D.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="etapa" width={160} tick={{ fill: D.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TTip />} />
              <Bar dataKey="quantidade" radius={[0, 6, 6, 0]} name="Leads">
                {rows.map((_, i) => <Cell key={i} fill={CC[i % CC.length]} />)}
                <LabelList dataKey="quantidade" position="right" style={{ fill: D.text, fontSize: 12, fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: D.textSec }}>Distribuição %</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="quantidade" nameKey="etapa" cx="50%" cy="50%" outerRadius={100} innerRadius={50}>
                {pieData.map((_, i) => <Cell key={i} fill={CC[i % CC.length]} />)}
              </Pie>
              <Tooltip content={<PTip />} />
              <Legend formatter={v => <span style={{ color: D.textSec, fontSize: 11 }}>{v}</span>} wrapperStyle={{ paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── Section II ─────────────────────────────────────────────────────────────
function SecaoPeriodica({ metricas }: { metricas: Metricas }) {
  const { totalCriados: tc } = metricas;
  const rows = [
    { label: 'Total de Leads Criados',             qty: metricas.totalCriados,    color: D.blue },
    { label: 'Total de Leads Atendidos',            qty: metricas.atendidos,       color: D.cyan },
    { label: 'Total de Leads c/ Corretor Nomeado',  qty: metricas.corretorNomeado, color: D.purple },
    { label: 'Total de Visitas Realizadas',          qty: metricas.visitasRealizadas, color: D.amber },
    { label: 'Total de Análises de Crédito',         qty: metricas.analisesCredito, color: D.orange },
    { label: 'Total de Negociações',                 qty: metricas.negociacoes,    color: D.pink },
    { label: 'Total de Leads Descartados',           qty: metricas.descartados,    color: D.red },
    { label: 'Total de Vendas Fechadas',             qty: metricas.vendasFechadas, color: D.green },
  ];

  const funnelData = rows.slice(0, 6).filter(r => r.qty > 0);
  const chartH = Math.max(funnelData.length * 52 + 20, 180);
  const maxVal = rows[0].qty || 1;

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${D.border}` }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: D.cardHover }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: D.textSec }}>ETAPA | DESCRIÇÃO</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: D.textSec }}>QUANT. (POR PERÍODO)</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: D.textSec }}>%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} style={{ background: i % 2 === 0 ? D.card : D.cardHover, borderTop: `1px solid ${D.border}` }}>
                <td className="px-4 py-3 font-medium" style={{ color: D.text }}>{row.label}</td>
                <td className="px-4 py-3 text-right font-bold" style={{ color: row.color }}>{row.qty}</td>
                <td className="px-4 py-3 text-right" style={{ color: D.textSec }}>
                  {tc > 0 ? fmtPct((row.qty / tc) * 100) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: D.textSec }}>Performance por Etapa</p>
          <ResponsiveContainer width="100%" height={chartH}>
            <BarChart data={funnelData} layout="vertical" margin={{ left: 8, right: 48, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={D.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: D.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="etapa" width={160} tick={{ fill: D.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TTip />} />
              <Bar dataKey="quantidade" radius={[0, 6, 6, 0]} name="Leads">
                {funnelData.map((_, i) => <Cell key={i} fill={CC[i % CC.length]} />)}
                <LabelList dataKey="quantidade" position="right" style={{ fill: D.text, fontSize: 12, fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: D.textSec }}>Funil de Conversão</p>
          <div className="space-y-3">
            {funnelData.map((step, i) => {
              const pct = (step.qty / maxVal) * 100;
              const conv = i > 0 && funnelData[i - 1].qty > 0
                ? ((step.qty / funnelData[i - 1].qty) * 100).toFixed(1) : null;
              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm" style={{ color: D.textSec }}>{step.label.replace('Total de ', '').replace('Total d', '')}</span>
                    <div className="flex items-center gap-3">
                      {conv && <span className="text-xs" style={{ color: D.textMuted }}>↓ {conv}%</span>}
                      <span className="text-base font-bold" style={{ color: step.color }}>{step.qty}</span>
                    </div>
                  </div>
                  <div className="h-7 rounded-lg overflow-hidden" style={{ background: D.cardHover, border: `1px solid ${D.border}` }}>
                    <div className="h-full rounded-lg transition-all duration-700"
                      style={{ width: `${Math.max(pct, step.qty > 0 ? 2 : 0)}%`, background: step.color, opacity: 0.85 }} />
                  </div>
                </div>
              );
            })}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl"
                style={{ background: `${D.red}18`, border: `1px solid ${D.red}44` }}>
                <span className="text-xs font-semibold" style={{ color: D.red }}>❌ Descartados</span>
                <span className="text-sm font-black" style={{ color: D.red }}>{metricas.descartados}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl"
                style={{ background: `${D.green}18`, border: `1px solid ${D.green}44` }}>
                <span className="text-xs font-semibold" style={{ color: D.green }}>✅ Fechadas</span>
                <span className="text-sm font-black" style={{ color: D.green }}>{metricas.vendasFechadas}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section III ────────────────────────────────────────────────────────────
function SecaoInvestimento({ metricas, inv, ticket }: { metricas: Metricas; inv: number; ticket: number }) {
  const costRows = [
    { label: 'Custo por Lead Criado',             qty: metricas.totalCriados },
    { label: 'Custo por Lead Atendido',            qty: metricas.atendidos },
    { label: 'Custo por Lead c/ Corretor Nomeado', qty: metricas.corretorNomeado },
    { label: 'Custo por Visita Realizada',          qty: metricas.visitasRealizadas },
    { label: 'Custo por Análise de Crédito',        qty: metricas.analisesCredito },
    { label: 'Custo por Negociação',                qty: metricas.negociacoes },
    { label: 'Custo por Venda Fechada',             qty: metricas.vendasFechadas },
  ];

  const chartData = costRows.filter(r => r.qty > 0).map(r => ({
    name: r.label.replace('Custo por ', '').replace('Lead ', '').replace('Análise de ', ''),
    value: inv / r.qty,
  }));

  const roi = inv > 0 && metricas.vendasFechadas > 0
    ? ((metricas.vendasFechadas * ticket - inv) / inv) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Investment header + ROI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl px-5 py-4" style={{ background: `${D.amber}18`, border: `1px solid ${D.amber}44` }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: D.amber }}>Valor Investido no Período</p>
          <p className="text-2xl font-black" style={{ color: D.amber }}>{fmtBRL(inv)}</p>
        </div>
        <div className="rounded-xl px-5 py-4" style={{ background: `${roi >= 0 ? D.green : D.red}18`, border: `1px solid ${roi >= 0 ? D.green : D.red}44` }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: roi >= 0 ? D.green : D.red }}>ROI Estimado</p>
          <p className="text-2xl font-black" style={{ color: roi >= 0 ? D.green : D.red }}>
            {roi.toFixed(1)}% · {metricas.vendasFechadas} vendas × {fmtBRL(ticket)}
          </p>
        </div>
      </div>

      {/* Quantities + cost table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${D.border}` }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: D.cardHover }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: D.textSec }}>ETAPA | DESCRIÇÃO</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: D.textSec }}>TOTAL (QTD)</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: D.textSec }}>R$/LEAD</th>
            </tr>
          </thead>
          <tbody>
            {costRows.map((row, i) => {
              const cost = row.qty > 0 ? inv / row.qty : null;
              return (
                <tr key={row.label} style={{ background: i % 2 === 0 ? D.card : D.cardHover, borderTop: `1px solid ${D.border}` }}>
                  <td className="px-4 py-3" style={{ color: D.text }}>{row.label}</td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: D.blue }}>{row.qty}</td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: cost !== null ? D.amber : D.textMuted }}>
                    {cost !== null ? fmtBRL(cost) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cost bar chart */}
      {chartData.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: D.textSec }}>Custo por Etapa (R$)</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ left: 8, right: 24, top: 4, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={D.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: D.textSec, fontSize: 10 }} axisLine={false} tickLine={false}
                interval={0} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: D.textSec, fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: number) => [fmtBRL(v), 'Custo']}
                contentStyle={{ background: D.cardHover, border: `1px solid ${D.borderLight}`, borderRadius: 12, color: D.text }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Custo">
                {chartData.map((_, i) => <Cell key={i} fill={CC[i % CC.length]} />)}
                <LabelList dataKey="value" position="top"
                  formatter={(v: number) => fmtBRL(v)}
                  style={{ fill: D.textSec, fontSize: 10 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Period quantities breakdown */}
      <div>
        <p className="text-sm font-bold mb-3" style={{ color: D.textSec }}>Análise de Investimento — Quantidades por Período</p>
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${D.border}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: D.cardHover }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: D.textSec }}>#</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: D.textSec }}>ETAPA | DESCRIÇÃO</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: D.textSec }}>QUANT. (POR PERÍODO)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { n: 1, label: 'Total de Leads Criados',            qty: metricas.totalCriados },
                { n: 2, label: 'Total de Leads Atendidos',          qty: metricas.atendidos },
                { n: 3, label: 'Total de Leads c/ Corretor Nomeado', qty: metricas.corretorNomeado },
                { n: 4, label: 'Total de Visitas Realizadas',        qty: metricas.visitasRealizadas },
                { n: 5, label: 'Total de Análises de Crédito',       qty: metricas.analisesCredito },
                { n: 6, label: 'Total de Vendas Fechadas',           qty: metricas.vendasFechadas },
                { n: 7, label: 'Total de Leads Descartados',         qty: metricas.descartados },
              ].map((row, i) => (
                <tr key={row.n} style={{ background: i % 2 === 0 ? D.card : D.cardHover, borderTop: `1px solid ${D.border}` }}>
                  <td className="px-4 py-3 font-bold" style={{ color: D.textMuted }}>{row.n}</td>
                  <td className="px-4 py-3" style={{ color: D.text }}>{row.label}</td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: D.blue }}>{row.qty.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function KoruVendas() {
  const [activeTab, setActiveTab] = useState<'interna' | 'externa'>('interna');

  const today = new Date();
  const [dateStart, setDateStart] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  );
  const [dateEnd, setDateEnd] = useState(today.toISOString().split('T')[0]);
  const [rawData, setRawData] = useState<LeadRecord[] | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [investimento, setInvestimento] = useState('');
  const [ticketMedio, setTicketMedio] = useState(String(DEFAULT_TICKET));

  const fetchData = useCallback(async () => {
    setApiLoading(true); setApiError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setRawData(Array.isArray(json) ? json : (json?.data ?? []));
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Erro ao buscar dados da API.');
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredRecords = useMemo(() => {
    if (!rawData) return [];
    const pid = activeTab === 'interna' ? PIPELINE_ID_INTERNA : PIPELINE_ID_EXTERNA;
    return filterByDate(rawData.filter(r => Number(r.pipeline_id) === pid), dateStart, dateEnd);
  }, [rawData, activeTab, dateStart, dateEnd]);

  const metricas = useMemo(() => computeMetricas(filteredRecords), [filteredRecords]);

  // Seção IV — usa TODOS os registros do pipeline (sem filtro de data) para ciclo de vendas
  const pipelineAllRecords = useMemo(() => {
    if (!rawData) return [];
    const pid = activeTab === 'interna' ? PIPELINE_ID_INTERNA : PIPELINE_ID_EXTERNA;
    return rawData.filter(r => Number(r.pipeline_id) === pid);
  }, [rawData, activeTab]);

  const cicloEtapas = useMemo(() => computeCicloEtapas(pipelineAllRecords), [pipelineAllRecords]);
  const cicloEntries = useMemo(() => computeCicloEntries(pipelineAllRecords), [pipelineAllRecords]);
  const cicloPorMes = useMemo(() => computeCicloPorMes(cicloEntries), [cicloEntries]);
  const distribuicao = useMemo(() => computeDistribuicao(cicloEntries), [cicloEntries]);
  const cicloPorCorretor = useMemo(() => computeCicloAgente(cicloEntries, 'corretor'), [cicloEntries]);
  const cicloPorProduto = useMemo(() => computeCicloAgente(cicloEntries, 'produto'), [cicloEntries]);
  const cicloMedio = cicloEntries.length > 0
    ? Math.round(cicloEntries.reduce((s, e) => s + e.dias, 0) / cicloEntries.length) : -1;
  const menorCiclo = cicloEntries.length > 0 ? Math.min(...cicloEntries.map(e => e.dias)) : -1;
  const maiorCiclo = cicloEntries.length > 0 ? Math.max(...cicloEntries.map(e => e.dias)) : -1;

  const inv = parseFloat(investimento.replace(/\./g, '').replace(',', '.')) || 0;
  const ticket = parseFloat(ticketMedio.replace(/\./g, '').replace(',', '.')) || DEFAULT_TICKET;

  return (
    <div className="min-h-screen" style={{ background: D.bg, color: D.text }}>

      {/* Header */}
      <div className="sticky top-0 z-30" style={{ background: D.card, borderBottom: `1px solid ${D.border}` }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/koru-engenharia" className="flex items-center gap-1 hover:opacity-80" style={{ color: D.textSec }}>
              <Home size={14} /> Koru Engenharia
            </Link>
            <ChevronRight size={13} style={{ color: D.textMuted }} />
            <span className="font-semibold" style={{ color: D.text }}>Dashboard de Vendas</span>
            <span style={{ color: D.textMuted }}>·</span>
            <Link
              to="/koru-engenharia/ciclo-vendas"
              className="px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: `${D.purple}22`, color: D.purple, border: `1px solid ${D.purple}44` }}
            >
              Ciclo de Vendas →
            </Link>
          </div>
          <FunilTabs active={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/* Title */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-2">
        <h1 className="text-3xl font-black mb-1" style={{ color: D.text }}>🏢 Koru Engenharia — Dashboard de Vendas</h1>
        <p className="text-sm" style={{ color: D.textSec }}>Análise de funil · Performance periódica · Métricas de investimento</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* I — Static */}
        <Card
          title="(I) Análise Estática — Situação Atual do Funil"
          sub="Dados da planilha exportada do Kommo · Arquivo em /data/"
          icon={<BarChart2 size={20} style={{ color: D.blue }} />}
        >
          <SecaoEstatica tab={activeTab} />
        </Card>

        {/* II — Periodic */}
        <Card
          title="(II) Análise Periódica"
          sub="Dados via API · Filtrados por data de criação do lead"
          icon={<Calendar size={20} style={{ color: D.purple }} />}
        >
          {/* Date controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar size={14} style={{ color: D.textSec }} />
              <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: D.cardHover, border: `1px solid ${D.border}`, color: D.text, colorScheme: 'dark' }} />
              <span style={{ color: D.textSec }}>até</span>
              <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: D.cardHover, border: `1px solid ${D.border}`, color: D.text, colorScheme: 'dark' }} />
            </div>
            <button onClick={fetchData} disabled={apiLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: D.blueGlow, color: '#fff', opacity: apiLoading ? 0.65 : 1 }}>
              <RefreshCw size={14} className={apiLoading ? 'animate-spin' : ''} />
              {apiLoading ? 'Carregando...' : 'Atualizar'}
            </button>
          </div>

          {apiError && <ErrBanner msg={apiError} />}
          {apiLoading && <Spinner />}
          {!apiLoading && rawData !== null && <SecaoPeriodica metricas={metricas} />}
          {!apiLoading && rawData === null && !apiError && (
            <p className="text-center py-16" style={{ color: D.textSec }}>
              Clique em <strong>Atualizar</strong> para carregar os dados.
            </p>
          )}
        </Card>

        {/* III — Investment */}
        <Card
          title="(III) Análise de Investimento"
          sub="Insira o valor investido no período para calcular custos por etapa"
          icon={<Calculator size={20} style={{ color: D.amber }} />}
        >
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: D.textSec }}>
                Valor Investido no Período (R$)
              </label>
              <input type="text" value={investimento} onChange={e => setInvestimento(e.target.value)}
                placeholder="Ex: 10000"
                className="w-full rounded-xl px-4 py-3 text-lg font-bold outline-none"
                style={{ background: D.cardHover, border: `1px solid ${D.borderLight}`, color: D.text }} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: D.textSec }}>
                Ticket Médio (R$)
              </label>
              <input type="text" value={ticketMedio} onChange={e => setTicketMedio(e.target.value)}
                placeholder="Ex: 245000"
                className="w-full rounded-xl px-4 py-3 text-lg font-bold outline-none"
                style={{ background: D.cardHover, border: `1px solid ${D.borderLight}`, color: D.text }} />
              <p className="text-xs mt-1" style={{ color: D.textMuted }}>Padrão: Alameda dos Ipês ≈ R$ 245.000</p>
            </div>
          </div>

          {inv === 0 ? (
            <div className="rounded-xl p-8 text-center" style={{ background: D.cardHover, border: `1px dashed ${D.border}` }}>
              <DollarSign size={32} className="mx-auto mb-3" style={{ color: D.textMuted }} />
              <p style={{ color: D.textSec }}>
                Preencha o <strong style={{ color: D.text }}>Valor Investido</strong> e selecione um período para ver as métricas de custo.
              </p>
            </div>
          ) : rawData === null ? (
            <ErrBanner msg="Aguardando dados da API para calcular métricas." />
          ) : (
            <SecaoInvestimento metricas={metricas} inv={inv} ticket={ticket} />
          )}
        </Card>

        {/* IV — Ciclo de Vendas */}
        <Card
          title="(IV) Ciclo de Vendas"
          sub="Tempo médio desde criação até fechamento · transições reais via API · todos os períodos"
          icon={<Timer size={20} style={{ color: D.cyan }} />}
        >
          {apiLoading && <Spinner />}
          {!apiLoading && rawData !== null && (
            <div className="space-y-8">

              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CicloKPICard
                  label="Ciclo Médio Total"
                  value={cicloMedio >= 0 ? `${cicloMedio} dias` : '—'}
                  icon={<Timer size={16} />} color={D.cyan}
                  sub={cicloEntries.length > 0
                    ? `${cicloEntries.length} fechamento${cicloEntries.length !== 1 ? 's' : ''} · criação → venda ganha`
                    : 'sem fechamentos registrados'}
                />
                <CicloKPICard label="Menor Ciclo"
                  value={menorCiclo >= 0 ? `${menorCiclo} dias` : '—'}
                  icon={<TrendingDown size={16} />} color={D.green}
                  sub="fechamento mais rápido"
                />
                <CicloKPICard label="Maior Ciclo"
                  value={maiorCiclo >= 0 ? `${maiorCiclo} dias` : '—'}
                  icon={<Clock size={16} />} color={D.amber}
                  sub="fechamento mais demorado"
                />
              </div>

              {/* Tempo por etapa */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold" style={{ color: D.text }}>Tempo Médio por Etapa</p>
                    <p className="text-xs mt-0.5" style={{ color: D.textMuted }}>
                      Dias entre eventos consecutivos · ✅ venda ganha · ❌ descartado
                    </p>
                  </div>
                  {cicloMedio >= 0 && (
                    <div className="text-xs px-3 py-1.5 rounded-lg font-semibold flex-shrink-0"
                      style={{ background: `${D.cyan}18`, color: D.cyan, border: `1px solid ${D.cyan}33` }}>
                      Ciclo total médio: {cicloMedio} dias
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mb-4">
                  {([[`≤ 1 dia`, D.green], [`1–3 dias`, D.amber], [`3–7 dias`, D.orange], [`> 7 dias`, D.red]] as const).map(([l, c]) => (
                    <div key={l} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
                      <span className="text-xs" style={{ color: D.textSec }}>{l}</span>
                    </div>
                  ))}
                </div>
                <CicloEtapaChart data={cicloEtapas} />
                {cicloEtapas.some(r => r.diasMedios !== null && !r.isWon && !r.isLost) && (
                  <p className="text-xs mt-3 text-right" style={{ color: D.textMuted }}>
                    Gargalo:{' '}
                    <span style={{ color: D.red, fontWeight: 700 }}>
                      {cicloEtapas
                        .filter(r => r.diasMedios !== null && !r.isWon && !r.isLost)
                        .reduce((a, b) => (a.diasMedios ?? 0) > (b.diasMedios ?? 0) ? a : b).etapa}
                    </span>
                  </p>
                )}
              </div>

              {/* Ciclo por mês + distribuição */}
              {cicloEntries.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: D.textSec }}>
                      Ciclo Médio por Mês
                    </p>
                    {cicloPorMes.length > 1 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={cicloPorMes} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={D.border} />
                          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: D.textSec }} />
                          <YAxis tick={{ fontSize: 11, fill: D.textSec }} tickFormatter={v => `${v}d`} domain={[0, 'auto']} />
                          <Tooltip contentStyle={{ background: D.cardHover, border: `1px solid ${D.borderLight}`, borderRadius: 8, color: D.text, fontSize: 12 }}
                            formatter={(v: number) => [`${v} dias`, 'Ciclo médio']} />
                          <ReferenceLine y={cicloMedio} stroke={D.amber} strokeDasharray="4 3"
                            label={{ value: `Média: ${cicloMedio}d`, position: 'insideTopRight', fontSize: 10, fill: D.amber }} />
                          <Line type="monotone" dataKey="diasMedios" stroke={D.cyan} strokeWidth={2.5}
                            dot={{ r: 4, fill: D.cyan }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-40 rounded-xl"
                        style={{ background: D.cardHover, border: `1px dashed ${D.border}` }}>
                        <p className="text-sm text-center" style={{ color: D.textSec }}>
                          <span className="text-2xl font-black block mb-1" style={{ color: D.cyan }}>
                            {cicloMedio >= 0 ? `${cicloMedio} dias` : '—'}
                          </span>
                          {cicloEntries.length} fechamento{cicloEntries.length !== 1 ? 's' : ''} · múltiplos meses para gráfico
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: D.textSec }}>
                      Distribuição do Ciclo
                    </p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={distribuicao} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={D.border} />
                        <XAxis dataKey="faixa" tick={{ fontSize: 10, fill: D.textSec }} />
                        <YAxis tick={{ fontSize: 11, fill: D.textSec }} />
                        <Tooltip contentStyle={{ background: D.cardHover, border: `1px solid ${D.borderLight}`, borderRadius: 8, color: D.text, fontSize: 12 }}
                          formatter={(v: number) => [`${v} fechamentos`, 'Leads']} />
                        <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
                          {distribuicao.map((_, i) => <Cell key={i} fill={FAIXA_CC[i % FAIXA_CC.length]} />)}
                          <LabelList dataKey="leads" position="top" style={{ fontSize: 10, fill: D.textSec }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl p-4 flex items-center gap-3"
                  style={{ background: `${D.amber}12`, border: `1px solid ${D.amber}33` }}>
                  <AlertCircle size={16} style={{ color: D.amber }} />
                  <p className="text-sm" style={{ color: D.amber }}>
                    Gráficos de ciclo por mês e distribuição aparecem quando houver leads com venda ganha registrada.
                  </p>
                </div>
              )}

              {/* Por corretor + por produto */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: D.textSec }}>
                    Ciclo por Corretor
                  </p>
                  <CicloHBarChart data={cicloPorCorretor} color={D.blue} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: D.textSec }}>
                    Ciclo por Produto
                  </p>
                  <CicloHBarChart data={cicloPorProduto} color={D.purple} />
                </div>
              </div>

            </div>
          )}
          {!apiLoading && rawData === null && !apiError && (
            <p className="text-center py-12" style={{ color: D.textSec }}>
              Clique em <strong>Atualizar</strong> na Seção II para carregar os dados.
            </p>
          )}
        </Card>

      </div>
    </div>
  );
}
