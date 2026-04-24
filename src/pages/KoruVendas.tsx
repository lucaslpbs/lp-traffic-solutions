import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LabelList,
} from 'recharts';
import {
  TrendingUp, Users, Target, DollarSign, BarChart2,
  Calendar, RefreshCw, AlertCircle, ChevronRight, Home,
  Percent, Activity, Award, Zap, Calculator, UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ════════════════════════════════════════════════════════════════════════════
// ✏️ ATUALIZE ESTES DADOS MANUALMENTE COM OS DADOS DAS PLANILHAS
// ════════════════════════════════════════════════════════════════════════════

const funil_internas_estatico = [
  { etapa: 'Contato Inicial',      quantidade: 434 },
  { etapa: 'Em Atendimento',       quantidade: 6   },
  { etapa: 'Corretor Nomeado',     quantidade: 7   },
  { etapa: 'Vista Agendada',       quantidade: 0   },
  { etapa: 'Visita Realizada',     quantidade: 2   },
  { etapa: 'Documentos Pendentes', quantidade: 0   },
  { etapa: 'Análise de Crédito',   quantidade: 0   },
  { etapa: 'Negociação',           quantidade: 0   },
];

const funil_externas_estatico = [
  { etapa: 'Pasta Recebida',    quantidade: 0 },
  { etapa: 'Análise de Crédito', quantidade: 1 },
  { etapa: 'Negociação',        quantidade: 3 },
  { etapa: 'No Kommo',          quantidade: 0 },
];

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

const API_URL = 'https://n8n.trafficsolutions.cloud/webhook/buscar-leads-koru-engenharia';
const DEFAULT_TICKET_MEDIO = 245000;

// pipeline_nome vem vazio da API — usar pipeline_id para distinguir os funis
const PIPELINE_ID_INTERNA = 12157328;

// Etapas exclusivas do funil externo (usadas como fallback quando pipeline_id é desconhecido)
const ETAPAS_EXCLUSIVAS_EXTERNA = ['pasta recebida', 'no kommo'];

const ETAPAS_VENDA_GANHA = ['venda ganha', 'contratado'];
const ETAPAS_VENDA_PERDIDA = ['venda perdida'];

// ════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS — dark mode
// ════════════════════════════════════════════════════════════════════════════

const D = {
  bg: '#07080F',
  card: '#0E1020',
  cardHover: '#141628',
  border: '#1A1E35',
  borderLight: '#252A45',
  text: '#E2E8F0',
  textSec: '#8892B0',
  textMuted: '#4A5568',
  blue: '#4F8EF7',
  blueGlow: '#3B82F6',
  green: '#34D399',
  amber: '#FBBF24',
  red: '#F87171',
  purple: '#A78BFA',
  cyan: '#22D3EE',
  pink: '#F472B6',
  orange: '#FB923C',
};

const CHART_COLORS = [D.blue, D.green, D.amber, D.red, D.purple, D.cyan, D.pink, D.orange];

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

interface LeadRecord {
  lead_id: string | number;
  pipeline_id?: string | number;
  etapa_nome?: string;
  pipeline_nome?: string;
  data_hora_etapa?: string;
  data_hora_criacao_lead?: string;
  account_subdomain?: string;
  [key: string]: unknown;
}

interface EtapaRow { etapa: string; quantidade: number }

interface MetricasInternas {
  totalCriados: number;
  atendidos: number;
  corretorNomeado: number;
  vistaAgendada: number;
  visitasRealizadas: number;
  documentosPendentes: number;
  analisesCredito: number;
  negociacoes: number;
  vendasFechadas: number;
  descartados: number;
}

interface MetricasExternas {
  totalCriados: number;
  pastaRecebida: number;
  analisesCredito: number;
  negociacoes: number;
  noKommo: number;
  vendasFechadas: number;
}

// ════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════════════════════

const fmtBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

const fmtPct = (v: number) => `${v.toFixed(2)}%`;

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

const isVendaGanha = (etapa: string) => ETAPAS_VENDA_GANHA.some(e => norm(etapa).includes(norm(e)));
const isVendaPerdida = (etapa: string) => ETAPAS_VENDA_PERDIDA.some(e => norm(etapa).includes(norm(e)));

function countByEtapa(leads: LeadRecord[], search: string): number {
  const s = norm(search);
  return leads.filter(l => norm(l.etapa_nome ?? '').includes(s)).length;
}

// API retorna datas no formato DD/MM/YYYY HH:MM:SS — new Date() não parseia esse formato
function parseDateBR(s: string): number {
  if (!s) return 0;
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:${m[6]}`).getTime();
  return new Date(s).getTime();
}

function filterByDateRange(records: LeadRecord[], start: string, end: string): LeadRecord[] {
  if (!start || !end) return records;
  const s = new Date(start).getTime();
  const e = new Date(end + 'T23:59:59').getTime();
  return records.filter(r => {
    const t = parseDateBR(r.data_hora_criacao_lead ?? '');
    return t > 0 && t >= s && t <= e;
  });
}

function deduplicateLeads(records: LeadRecord[]): LeadRecord[] {
  const map = new Map<string, LeadRecord>();
  for (const r of records) {
    const id = String(r.lead_id);
    const ex = map.get(id);
    if (!ex) { map.set(id, r); continue; }
    const t1 = parseDateBR(ex.data_hora_etapa ?? '');
    const t2 = parseDateBR(r.data_hora_etapa ?? '');
    if (t2 > t1) map.set(id, r);
  }
  return Array.from(map.values());
}

function computeMetricasInternas(leads: LeadRecord[]): MetricasInternas {
  return {
    totalCriados:       leads.length,
    atendidos:          countByEtapa(leads, 'em atendimento'),
    corretorNomeado:    countByEtapa(leads, 'corretor nomeado'),
    vistaAgendada:      countByEtapa(leads, 'vista agendada'),
    visitasRealizadas:  countByEtapa(leads, 'visita realizada'),
    documentosPendentes:countByEtapa(leads, 'documentos pendentes'),
    analisesCredito:    countByEtapa(leads, 'analise de credito'),
    negociacoes:        countByEtapa(leads, 'negociacao'),
    vendasFechadas:     leads.filter(l => isVendaGanha(l.etapa_nome ?? '')).length,
    descartados:        leads.filter(l => isVendaPerdida(l.etapa_nome ?? '')).length,
  };
}

function computeMetricasExternas(leads: LeadRecord[]): MetricasExternas {
  return {
    totalCriados:    leads.length,
    pastaRecebida:   countByEtapa(leads, 'pasta recebida'),
    analisesCredito: countByEtapa(leads, 'analise de credito'),
    negociacoes:     countByEtapa(leads, 'negociacao'),
    noKommo:         countByEtapa(leads, 'no kommo'),
    vendasFechadas:  leads.filter(l => isVendaGanha(l.etapa_nome ?? '')).length,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

function FunilTabs({ active, onChange }: { active: 'interna' | 'externa'; onChange: (v: 'interna' | 'externa') => void }) {
  return (
    <div className="inline-flex rounded-xl p-1 gap-1" style={{ background: D.card, border: `1px solid ${D.border}` }}>
      {(['interna', 'externa'] as const).map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
          style={active === tab ? { background: D.blueGlow, color: '#fff' } : { color: D.textSec }}
        >
          Funil {tab === 'interna' ? 'Interno' : 'Externo'}
        </button>
      ))}
    </div>
  );
}

function KPICard({ label, value, icon, color = D.blue, sub }: {
  label: string; value: string; icon: React.ReactNode; color?: string; sub?: string;
}) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: D.card, border: `1px solid ${D.border}` }}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: D.textSec }}>{label}</span>
        <span className="rounded-xl p-2" style={{ background: `${color}22`, color }}>{icon}</span>
      </div>
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: D.textMuted }}>{sub}</div>}
    </div>
  );
}

function EtapaTable({ rows, totalForPct, footerLabel }: {
  rows: EtapaRow[]; totalForPct: number; footerLabel: string;
}) {
  const activeTotal = rows.reduce((s, r) => s + r.quantidade, 0);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${D.border}` }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: D.cardHover }}>
            <th className="text-left px-4 py-3 font-semibold" style={{ color: D.textSec }}>ETAPA</th>
            <th className="text-right px-4 py-3 font-semibold" style={{ color: D.textSec }}>{footerLabel}</th>
            <th className="text-right px-4 py-3 font-semibold" style={{ color: D.textSec }}>%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.etapa} style={{ background: i % 2 === 0 ? D.card : D.cardHover, borderTop: `1px solid ${D.border}` }}>
              <td className="px-4 py-3" style={{ color: D.text }}>{row.etapa}</td>
              <td className="px-4 py-3 text-right font-bold" style={{ color: D.blue }}>{row.quantidade}</td>
              <td className="px-4 py-3 text-right" style={{ color: D.textSec }}>
                {totalForPct > 0 ? fmtPct((row.quantidade / totalForPct) * 100) : '—'}
              </td>
            </tr>
          ))}
          <tr style={{ background: D.cardHover, borderTop: `1px solid ${D.borderLight}` }}>
            <td className="px-4 py-3 font-bold" style={{ color: D.text }}>Total Leads Ativos</td>
            <td className="px-4 py-3 text-right font-black text-base" style={{ color: D.green }}>{activeTotal}</td>
            <td className="px-4 py-3 text-right font-bold" style={{ color: D.green }}>
              {totalForPct > 0 ? fmtPct((activeTotal / totalForPct) * 100) : '100%'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 shadow-xl" style={{ background: D.cardHover, border: `1px solid ${D.borderLight}`, color: D.text }}>
      <p className="text-sm font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm" style={{ color: p.color ?? D.blue }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; fill: string; payload: { percent: number } }[] }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl px-4 py-3 shadow-xl" style={{ background: D.cardHover, border: `1px solid ${D.borderLight}`, color: D.text }}>
      <p className="text-sm font-semibold">{p.name}</p>
      <p className="text-sm" style={{ color: p.fill }}>{p.value} ({fmtPct(p.payload.percent * 100)})</p>
    </div>
  );
};

function SectionCard({ title, sub, icon, children }: {
  title: string; sub: string; icon: React.ReactNode; children: React.ReactNode;
}) {
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

// ════════════════════════════════════════════════════════════════════════════
// STATIC CHARTS
// ════════════════════════════════════════════════════════════════════════════

function StaticCharts({ data }: { data: EtapaRow[] }) {
  const total = data.reduce((s, r) => s + r.quantidade, 0);
  const chartH = Math.max(data.length * 48 + 20, 200);

  if (total === 0) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: D.cardHover, border: `1px dashed ${D.border}` }}>
        <p style={{ color: D.textSec }}>
          ✏️ Atualize <code style={{ color: D.blue }}>funil_internas_estatico</code> /{' '}
          <code style={{ color: D.blue }}>funil_externas_estatico</code> com os valores da planilha do Kommo.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <EtapaTable rows={data} totalForPct={total} footerLabel="QUANT. (ATUAL)" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: D.textSec }}>Quantidade por etapa</p>
        <ResponsiveContainer width="100%" height={chartH}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={D.border} horizontal={false} />
            <XAxis type="number" tick={{ fill: D.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="etapa" width={140} tick={{ fill: D.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="quantidade" radius={[0, 6, 6, 0]} name="Leads">
              {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              <LabelList dataKey="quantidade" position="right" style={{ fill: D.text, fontSize: 12, fontWeight: 700 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: D.textSec }}>Distribuição %</p>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={data} dataKey="quantidade" nameKey="etapa" cx="50%" cy="50%" outerRadius={100} innerRadius={50}>
              {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip content={<PieTooltip />} />
            <Legend formatter={(v) => <span style={{ color: D.textSec, fontSize: 11 }}>{v}</span>} wrapperStyle={{ paddingTop: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PERIODIC CHARTS
// ════════════════════════════════════════════════════════════════════════════

function PeriodicCharts({
  activeRows, totalForPct, closedCount, lostCount, showLost,
}: {
  activeRows: EtapaRow[]; totalForPct: number; closedCount: number; lostCount?: number; showLost?: boolean;
}) {
  const chartH = Math.max(activeRows.length * 52 + 20, 180);
  const pieData = activeRows.filter(r => r.quantidade > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <div className="rounded-xl px-4 py-2 mb-3 text-xs" style={{ background: D.cardHover, color: D.textSec, border: `1px solid ${D.border}` }}>
          <strong style={{ color: D.text }}>{totalForPct}</strong> leads no período
        </div>
        <EtapaTable rows={activeRows} totalForPct={totalForPct} footerLabel="QUANT. (PERÍODO)" />
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: `${D.green}18`, border: `1px solid ${D.green}44` }}>
            <span className="text-sm font-semibold" style={{ color: D.green }}>✅ Vendas Fechadas</span>
            <span className="text-lg font-black" style={{ color: D.green }}>{closedCount}</span>
          </div>
          {showLost && lostCount !== undefined && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: `${D.red}18`, border: `1px solid ${D.red}44` }}>
              <span className="text-sm font-semibold" style={{ color: D.red }}>❌ Leads Descartados</span>
              <span className="text-lg font-black" style={{ color: D.red }}>{lostCount}</span>
            </div>
          )}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: D.textSec }}>Performance por etapa</p>
        <ResponsiveContainer width="100%" height={chartH}>
          <BarChart data={activeRows} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={D.border} horizontal={false} />
            <XAxis type="number" tick={{ fill: D.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="etapa" width={140} tick={{ fill: D.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="quantidade" radius={[0, 6, 6, 0]} name="Leads">
              {activeRows.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              <LabelList dataKey="quantidade" position="right" style={{ fill: D.text, fontSize: 12, fontWeight: 700 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: D.textSec }}>Distribuição % no período</p>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={pieData} dataKey="quantidade" nameKey="etapa" cx="50%" cy="50%" outerRadius={100} innerRadius={50}>
              {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip content={<PieTooltip />} />
            <Legend formatter={(v) => <span style={{ color: D.textSec, fontSize: 11 }}>{v}</span>} wrapperStyle={{ paddingTop: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// INVESTMENT SECTION
// ════════════════════════════════════════════════════════════════════════════

function InvestmentAnalysis({ mi, inv, ticket }: { mi: MetricasInternas; inv: number; ticket: number }) {
  const { totalCriados, atendidos, visitasRealizadas, vendasFechadas } = mi;

  const cpl         = inv > 0 && totalCriados > 0    ? inv / totalCriados    : 0;
  const cpa         = inv > 0 && atendidos > 0        ? inv / atendidos        : 0;
  const custoVisita = inv > 0 && visitasRealizadas > 0 ? inv / visitasRealizadas : 0;
  const custoVenda  = inv > 0 && vendasFechadas > 0   ? inv / vendasFechadas  : 0;
  const taxaConv    = totalCriados > 0  ? (vendasFechadas / totalCriados) * 100  : 0;
  const taxaAtend   = totalCriados > 0  ? (atendidos / totalCriados) * 100        : 0;
  const taxaLV      = totalCriados > 0  ? (visitasRealizadas / totalCriados) * 100 : 0;
  const taxaVV      = visitasRealizadas > 0 ? (vendasFechadas / visitasRealizadas) * 100 : 0;
  const roi         = inv > 0 ? ((vendasFechadas * ticket - inv) / inv) * 100 : 0;

  const funnelSteps = [
    { name: 'Leads Criados',     value: totalCriados,    color: D.blue },
    { name: 'Leads Atendidos',   value: atendidos,        color: D.cyan },
    { name: 'Visitas Realizadas', value: visitasRealizadas, color: D.amber },
    { name: 'Vendas Fechadas',   value: vendasFechadas,  color: D.green },
  ];

  const costData = [
    { name: 'CPL',         value: cpl },
    { name: 'CPA',         value: cpa },
    { name: 'Custo/Visita', value: custoVisita },
    { name: 'Custo/Venda', value: custoVenda },
  ];

  return (
    <>
      {/* KPI row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KPICard label="CPL" value={fmtBRL(cpl)} icon={<Users size={16} />} color={D.blue} sub="Custo por Lead" />
        <KPICard label="CPA" value={fmtBRL(cpa)} icon={<UserCheck size={16} />} color={D.cyan} sub="Custo por Atendimento" />
        <KPICard label="Custo / Visita" value={fmtBRL(custoVisita)} icon={<Target size={16} />} color={D.amber} sub="Custo por Visita Realizada" />
        <KPICard label="Custo / Venda" value={fmtBRL(custoVenda)} icon={<DollarSign size={16} />} color={D.green} sub="Custo por Venda Fechada" />
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KPICard label="Taxa Conversão" value={fmtPct(taxaConv)} icon={<TrendingUp size={16} />} color={D.green} sub="Leads → Vendas" />
        <KPICard label="Taxa Atendimento" value={fmtPct(taxaAtend)} icon={<Activity size={16} />} color={D.blue} sub="Leads → Atendimento" />
        <KPICard label="Lead → Visita" value={fmtPct(taxaLV)} icon={<Percent size={16} />} color={D.purple} sub="Taxa Lead para Visita" />
        <KPICard label="Visita → Venda" value={fmtPct(taxaVV)} icon={<Award size={16} />} color={D.amber} sub="Taxa Visita para Venda" />
        <KPICard
          label="ROI Estimado"
          value={`${roi.toFixed(1)}%`}
          icon={<Zap size={16} />}
          color={roi >= 0 ? D.green : D.red}
          sub={`${vendasFechadas} vendas × ${fmtBRL(ticket)}`}
        />
      </div>

      {/* Funnel + costs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custom funnel bars */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: D.textSec }}>Funil de Conversão</p>
          <div className="space-y-3">
            {funnelSteps.map((step, i) => {
              const maxVal = funnelSteps[0].value || 1;
              const pct = (step.value / maxVal) * 100;
              const convRate = i > 0 && funnelSteps[i - 1].value > 0
                ? ((step.value / funnelSteps[i - 1].value) * 100).toFixed(1)
                : null;
              return (
                <div key={step.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm" style={{ color: D.textSec }}>{step.name}</span>
                    <div className="flex items-center gap-3">
                      {convRate && <span className="text-xs" style={{ color: D.textMuted }}>↓ {convRate}%</span>}
                      <span className="text-base font-bold" style={{ color: step.color }}>{step.value}</span>
                    </div>
                  </div>
                  <div className="h-8 rounded-lg overflow-hidden" style={{ background: D.cardHover, border: `1px solid ${D.border}` }}>
                    <div
                      className="h-full rounded-lg transition-all duration-700"
                      style={{ width: `${Math.max(pct, step.value > 0 ? 2 : 0)}%`, background: step.color, opacity: 0.85 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost per stage bar chart */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: D.textSec }}>Custo por Etapa (R$)</p>
          {costData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={costData} margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={D.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: D.textSec, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: D.textSec, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number) => [fmtBRL(v), 'Custo']}
                  contentStyle={{ background: D.cardHover, border: `1px solid ${D.borderLight}`, borderRadius: 12, color: D.text }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Custo">
                  {costData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(v: number) => fmtBRL(v)}
                    style={{ fill: D.textSec, fontSize: 10 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48" style={{ color: D.textMuted }}>
              Sem dados suficientes para calcular custos por etapa.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export default function KoruVendas() {
  const [activeTab, setActiveTab] = useState<'interna' | 'externa'>('interna');

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const [dateStart, setDateStart] = useState(firstOfMonth);
  const [dateEnd, setDateEnd] = useState(todayStr);
  const [rawData, setRawData] = useState<LeadRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [investimento, setInvestimento] = useState('');
  const [ticketMedio, setTicketMedio] = useState(String(DEFAULT_TICKET_MEDIO));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
      const json = await res.json();
      const arr: LeadRecord[] = Array.isArray(json) ? json : (json?.data ?? []);
      setRawData(arr);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados da API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Processed data for Section II
  const { internasLeads, externasLeads } = useMemo(() => {
    if (!rawData) return { internasLeads: [], externasLeads: [] };
    const filtered = filterByDateRange(rawData, dateStart, dateEnd);

    const internas = deduplicateLeads(filtered.filter(r => {
      // 1. pipeline_nome preenchido → usar texto
      const pn = norm(r.pipeline_nome ?? '');
      if (pn.includes('interna')) return true;
      if (pn.includes('externa')) return false;
      // 2. pipeline_nome vazio → usar pipeline_id (12157328 = Funil Vendas Internas)
      if (r.pipeline_id !== undefined && r.pipeline_id !== '') {
        return Number(r.pipeline_id) === PIPELINE_ID_INTERNA;
      }
      // 3. Fallback: etapa pertence exclusivamente ao funil externo → não é interna
      const etapa = norm(r.etapa_nome ?? '');
      return !ETAPAS_EXCLUSIVAS_EXTERNA.some(e => etapa.includes(e));
    }));

    const externas = deduplicateLeads(filtered.filter(r => {
      const pn = norm(r.pipeline_nome ?? '');
      if (pn.includes('externa')) return true;
      if (pn.includes('interna')) return false;
      if (r.pipeline_id !== undefined && r.pipeline_id !== '') {
        return Number(r.pipeline_id) !== PIPELINE_ID_INTERNA;
      }
      const etapa = norm(r.etapa_nome ?? '');
      return ETAPAS_EXCLUSIVAS_EXTERNA.some(e => etapa.includes(e));
    }));

    return { internasLeads: internas, externasLeads: externas };
  }, [rawData, dateStart, dateEnd]);

  const mi = useMemo(() => computeMetricasInternas(internasLeads), [internasLeads]);
  const me = useMemo(() => computeMetricasExternas(externasLeads), [externasLeads]);

  // Rows for periodic analysis (active stages only — no closed/lost per user requirement)
  const internasActiveRows: EtapaRow[] = [
    { etapa: 'Contato Inicial',      quantidade: countByEtapa(internasLeads, 'contato inicial') },
    { etapa: 'Em Atendimento',       quantidade: mi.atendidos },
    { etapa: 'Corretor Nomeado',     quantidade: mi.corretorNomeado },
    { etapa: 'Vista Agendada',       quantidade: mi.vistaAgendada },
    { etapa: 'Visita Realizada',     quantidade: mi.visitasRealizadas },
    { etapa: 'Documentos Pendentes', quantidade: mi.documentosPendentes },
    { etapa: 'Análise de Crédito',   quantidade: mi.analisesCredito },
    { etapa: 'Negociação',           quantidade: mi.negociacoes },
  ];

  const externasActiveRows: EtapaRow[] = [
    { etapa: 'Pasta Recebida',    quantidade: me.pastaRecebida },
    { etapa: 'Análise de Crédito', quantidade: me.analisesCredito },
    { etapa: 'Negociação',        quantidade: me.negociacoes },
    { etapa: 'No Kommo',          quantidade: me.noKommo },
  ];

  const staticData = activeTab === 'interna' ? funil_internas_estatico : funil_externas_estatico;
  const activeRows = activeTab === 'interna' ? internasActiveRows : externasActiveRows;
  const totalCriados = activeTab === 'interna' ? mi.totalCriados : me.totalCriados;
  const closedCount = activeTab === 'interna' ? mi.vendasFechadas : me.vendasFechadas;

  const inv    = parseFloat(investimento.replace(/\./g, '').replace(',', '.')) || 0;
  const ticket = parseFloat(ticketMedio.replace(/\./g, '').replace(',', '.')) || DEFAULT_TICKET_MEDIO;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: D.bg, color: D.text }}>

      {/* ── Header ── */}
      <div className="sticky top-0 z-30" style={{ background: D.card, borderBottom: `1px solid ${D.border}` }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/koru-engenharia" className="flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: D.textSec }}>
              <Home size={14} /> Koru Engenharia
            </Link>
            <ChevronRight size={13} style={{ color: D.textMuted }} />
            <span className="font-semibold" style={{ color: D.text }}>Dashboard de Vendas</span>
          </div>
          <FunilTabs active={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/* ── Title ── */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-2">
        <h1 className="text-3xl font-black mb-1" style={{ color: D.text }}>
          🏢 Koru Engenharia — Dashboard de Vendas
        </h1>
        <p className="text-sm" style={{ color: D.textSec }}>
          Análise de funil · Performance periódica · Métricas de investimento
        </p>
      </div>

      {/* ── Sections ── */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ─ SEÇÃO I: ANÁLISE ESTÁTICA ─ */}
        <SectionCard
          title="(I) Análise Estática — Situação Atual do Funil"
          sub="Dados atualizados manualmente conforme exportação do Kommo"
          icon={<BarChart2 size={20} style={{ color: D.blue }} />}
        >
          <StaticCharts data={staticData} />
        </SectionCard>

        {/* ─ SEÇÃO II: ANÁLISE PERIÓDICA ─ */}
        <SectionCard
          title="(II) Análise Periódica"
          sub="Dados via API · Filtrados por data de criação do lead"
          icon={<Calendar size={20} style={{ color: D.purple }} />}
        >
          {/* Date controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar size={14} style={{ color: D.textSec }} />
              <input
                type="date"
                value={dateStart}
                onChange={e => setDateStart(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: D.cardHover, border: `1px solid ${D.border}`, color: D.text, colorScheme: 'dark' }}
              />
              <span style={{ color: D.textSec }}>até</span>
              <input
                type="date"
                value={dateEnd}
                onChange={e => setDateEnd(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: D.cardHover, border: `1px solid ${D.border}`, color: D.text, colorScheme: 'dark' }}
              />
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: D.blueGlow, color: '#fff', opacity: loading ? 0.65 : 1 }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Carregando...' : 'Atualizar'}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-xl p-4 mb-4" style={{ background: `${D.red}18`, border: `1px solid ${D.red}55` }}>
              <AlertCircle size={18} style={{ color: D.red }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: D.red }}>Erro ao buscar dados</p>
                <p className="text-xs mt-0.5" style={{ color: D.textSec }}>{error}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <RefreshCw size={32} className="animate-spin" style={{ color: D.blue }} />
              <p style={{ color: D.textSec }}>Buscando dados da API...</p>
            </div>
          )}

          {!loading && rawData !== null && (
            <PeriodicCharts
              activeRows={activeRows}
              totalForPct={totalCriados}
              closedCount={closedCount}
              lostCount={mi.descartados}
              showLost={activeTab === 'interna'}
            />
          )}

          {!loading && rawData === null && !error && (
            <div className="text-center py-16" style={{ color: D.textSec }}>
              Clique em <strong>Atualizar</strong> para carregar os dados.
            </div>
          )}
        </SectionCard>

        {/* ─ SEÇÃO III: ANÁLISE DE INVESTIMENTO ─ */}
        <SectionCard
          title="(III) Análise de Investimento"
          sub="Baseado nos dados do Funil Interno do período selecionado"
          icon={<Calculator size={20} style={{ color: D.amber }} />}
        >
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: D.textSec }}>
                Valor Investido no Período (R$)
              </label>
              <input
                type="text"
                value={investimento}
                onChange={e => setInvestimento(e.target.value)}
                placeholder="Ex: 5000"
                className="w-full rounded-xl px-4 py-3 text-lg font-bold outline-none"
                style={{ background: D.cardHover, border: `1px solid ${D.borderLight}`, color: D.text }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: D.textSec }}>
                Ticket Médio (R$)
              </label>
              <input
                type="text"
                value={ticketMedio}
                onChange={e => setTicketMedio(e.target.value)}
                placeholder="Ex: 245000"
                className="w-full rounded-xl px-4 py-3 text-lg font-bold outline-none"
                style={{ background: D.cardHover, border: `1px solid ${D.borderLight}`, color: D.text }}
              />
              <p className="text-xs mt-1" style={{ color: D.textMuted }}>Padrão: Alameda dos Ipês ≈ R$ 245.000</p>
            </div>
          </div>

          {inv === 0 ? (
            <div className="rounded-xl p-8 text-center" style={{ background: D.cardHover, border: `1px dashed ${D.border}` }}>
              <DollarSign size={32} className="mx-auto mb-3" style={{ color: D.textMuted }} />
              <p style={{ color: D.textSec }}>
                Preencha o <strong style={{ color: D.text }}>Valor Investido</strong> e selecione um período para ver as métricas de ROI.
              </p>
            </div>
          ) : (
            <InvestmentAnalysis mi={mi} inv={inv} ticket={ticket} />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
