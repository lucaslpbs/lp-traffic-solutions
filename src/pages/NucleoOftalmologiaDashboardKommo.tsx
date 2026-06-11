import { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Users, CalendarCheck, XCircle, Clock, Zap, BarChart3, RefreshCw,
  AlertTriangle, CheckCircle2, Trophy, TrendingDown, Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ComposedChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  loadNucleoKommoData, formatResponseTime, dayOfWeekData, hourData,
  type NucleoKommoData,
} from '@/lib/nucleoOftalmologiaKommoUtils';

// ── Visual constants ────────────────────────────────────────────────────────

const C = {
  cyan: '#00D4FF',
  green: '#00E59B',
  coral: '#FF6B6B',
  yellow: '#FFD166',
  purple: '#9B59FF',
  gray: 'rgba(136,135,128,0.5)',
};

const tooltipStyle = {
  background: '#0B1E3D',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 12,
};

const tooltipItemStyle = { color: '#fff' };
const tooltipLabelStyle = { color: '#fff' };

const grid = { stroke: 'rgba(255,255,255,0.06)' };
const tick = { fill: 'rgba(255,255,255,0.45)', fontSize: 11 };

const FUNNEL_COLORS = [C.green, C.cyan, C.purple, C.yellow, C.coral];

const STAGE_COLORS: Record<string, string> = {
  'Agendamento Confirmado': C.green,
  'Venda Ganha': C.cyan,
  'Agendado': 'rgba(0,229,155,0.55)',
  'Consulta Confirmada': C.purple,
  'Não Confirmado': C.yellow,
  'Venda Perdida': C.coral,
  'Outros': C.gray,
};

const DAY_COLORS = [C.green, C.cyan, C.green, C.purple, C.purple, C.gray, 'rgba(136,135,128,0.3)'];

function hourColor(value: number, max: number): string {
  const ratio = max > 0 ? value / max : 0;
  if (ratio >= 0.8) return 'rgba(0,212,255,0.9)';
  if (ratio >= 0.5) return 'rgba(0,212,255,0.65)';
  if (ratio >= 0.2) return 'rgba(155,89,255,0.6)';
  if (ratio >= 0.04) return 'rgba(155,89,255,0.35)';
  return 'rgba(136,135,128,0.25)';
}

const fmtNum = (n: number) => n.toLocaleString('pt-BR');
const fmtPct = (n: number) => `${n.toFixed(1).replace('.', ',')}%`;

// ── Small building blocks ────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-2">
      <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-white/35">{children}</span>
      <span className="flex-1 h-px bg-white/10" />
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.04] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.06] transition-colors ${className}`}>
      {children}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-white/65">
      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
      {label}
    </span>
  );
}

interface KpiCardProps {
  icon: React.ElementType;
  iconColor: string;
  value: string;
  label: string;
  delta: string;
  deltaColor: 'up' | 'dn' | 'nt';
}

const DELTA_COLORS: Record<string, string> = {
  up: 'text-[#00E59B]',
  dn: 'text-[#FF6B6B]',
  nt: 'text-white/35',
};

function KpiCard({ icon: Icon, iconColor, value, label, delta, deltaColor }: KpiCardProps) {
  return (
    <div className="relative bg-white/[0.04] border border-white/10 rounded-2xl p-6 overflow-hidden hover:bg-white/[0.06] transition-colors">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${iconColor}, transparent)` }} />
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-4" style={{ background: `${iconColor}1a` }}>
        <Icon className="w-[18px] h-[18px]" style={{ color: iconColor }} />
      </div>
      <div className="font-display text-[34px] font-bold leading-none tracking-tight mb-1.5">{value}</div>
      <div className="text-xs text-white/65">{label}</div>
      <div className={`mt-3 text-[11px] ${DELTA_COLORS[deltaColor]}`}>{delta}</div>
    </div>
  );
}

interface ProgressRowProps {
  label: string;
  sublabel: string;
  pct: number;
  color: string;
  avatar?: string;
}

function ProgressRow({ label, sublabel, pct, color, avatar }: ProgressRowProps) {
  return (
    <div className="flex items-center gap-3 mb-4 last:mb-0">
      {avatar && (
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
          style={{ background: `${color}26`, color }}
        >
          {avatar}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium truncate">{label}</div>
        <div className="text-[11px] text-white/35 truncate">{sublabel}</div>
        <div className="h-1 bg-white/[0.06] rounded-full mt-1.5 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
        </div>
      </div>
      <div className="text-[13px] font-bold flex-shrink-0" style={{ color }}>{fmtPct(pct)}</div>
    </div>
  );
}

interface AlertItem {
  variant: 'red' | 'yellow' | 'green' | 'blue';
  icon: React.ElementType;
  title: string;
  value: string;
  desc: string;
}

const ALERT_STYLES: Record<AlertItem['variant'], { bg: string; border: string; color: string }> = {
  red: { bg: 'rgba(255,107,107,0.06)', border: 'rgba(255,107,107,0.18)', color: C.coral },
  yellow: { bg: 'rgba(255,209,102,0.06)', border: 'rgba(255,209,102,0.18)', color: C.yellow },
  green: { bg: 'rgba(0,229,155,0.06)', border: 'rgba(0,229,155,0.18)', color: C.green },
  blue: { bg: 'rgba(0,212,255,0.06)', border: 'rgba(0,212,255,0.18)', color: C.cyan },
};

function AlertCard({ alert }: { alert: AlertItem }) {
  const style = ALERT_STYLES[alert.variant];
  const Icon = alert.icon;
  return (
    <div className="rounded-[10px] px-4 py-3 mb-2.5 last:mb-0 border" style={{ background: style.bg, borderColor: style.border }}>
      <div className="flex items-center justify-between mb-0.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: style.color }}>
          <Icon className="w-3.5 h-3.5" />
          {alert.title}
        </span>
        <span className="text-sm font-bold" style={{ color: style.color }}>{alert.value}</span>
      </div>
      <div className="text-[11px] text-white/35">{alert.desc}</div>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#050E1C] text-white p-6 md:p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white/[0.04] rounded-2xl p-6 border border-white/10 h-32 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white/[0.04] rounded-2xl p-6 border border-white/10 h-64 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NucleoOftalmologiaDashboardKommo() {
  const [data, setData] = useState<NucleoKommoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loadNucleoKommoData();
      setData(result);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError('Não foi possível carregar a planilha de dados.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const dailyData = useMemo(() => {
    if (!data) return [];
    return data.daily.filter(d => (!dateFrom || d.key >= dateFrom) && (!dateTo || d.key <= dateTo));
  }, [data, dateFrom, dateTo]);

  const dowData = useMemo(() => (data ? dayOfWeekData(data.byDayOfWeek) : []), [data]);
  const hrData = useMemo(() => (data ? hourData(data.byHour) : []), [data]);
  const maxHour = useMemo(() => Math.max(1, ...hrData.map(h => h.value)), [hrData]);

  const growth = useMemo(() => {
    if (!data || data.monthly.length < 2) return null;
    let best: { pct: number; from: string; to: string; fromVal: number; toVal: number } | null = null;
    for (let i = 1; i < data.monthly.length; i++) {
      const prev = data.monthly[i - 1];
      const curr = data.monthly[i];
      if (prev.total < 20) continue;
      const pct = ((curr.total - prev.total) / prev.total) * 100;
      if (!best || pct > best.pct) {
        best = { pct, from: prev.label, to: curr.label, fromVal: prev.total, toVal: curr.total };
      }
    }
    return best;
  }, [data]);

  const alerts = useMemo<AlertItem[]>(() => {
    if (!data) return [];
    const list: AlertItem[] = [];

    const abertoPct = data.totalLeads > 0 ? (data.abertos / data.totalLeads) * 100 : 0;
    list.push({
      variant: abertoPct > 30 ? 'red' : 'yellow',
      icon: AlertTriangle,
      title: 'Leads em aberto',
      value: fmtNum(data.abertos),
      desc: `${fmtPct(abertoPct)} da base ainda sem agendamento ou perda registrados`,
    });

    if (data.responseTime.median > 1) {
      list.push({
        variant: 'yellow',
        icon: Clock,
        title: 'Tempo de resposta acima da meta',
        value: formatResponseTime(data.responseTime.median),
        desc: 'Mediana acima da meta ideal de 1 hora de resposta',
      });
    }

    const relevantFunnels = data.funnels.filter(f => f.total >= 10);
    const worst = [...relevantFunnels].sort((a, b) => a.conversao - b.conversao)[0];
    const best = [...relevantFunnels].sort((a, b) => b.conversao - a.conversao)[0];

    if (worst && best && worst.nome !== best.nome) {
      list.push({
        variant: 'yellow',
        icon: TrendingDown,
        title: 'Funil com baixa conversão',
        value: fmtPct(worst.conversao),
        desc: `"${worst.nome}" – ${fmtNum(worst.convertidos)} de ${fmtNum(worst.total)} leads convertidos`,
      });
    }

    if (growth && growth.pct > 50) {
      list.push({
        variant: 'green',
        icon: CheckCircle2,
        title: 'Crescimento acelerado',
        value: `+${Math.round(growth.pct)}%`,
        desc: `Volume de ${growth.to} (${fmtNum(growth.toVal)}) vs ${growth.from} (${fmtNum(growth.fromVal)})`,
      });
    }

    if (best) {
      list.push({
        variant: 'blue',
        icon: Trophy,
        title: 'Melhor funil',
        value: fmtPct(best.conversao),
        desc: `"${best.nome}" – ${fmtNum(best.convertidos)} de ${fmtNum(best.total)} leads convertidos`,
      });
    }

    return list;
  }, [data, growth]);

  // ── Render states ─────────────────────────────────────────────────────────

  if (loading) return <LoadingSkeleton />;

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#050E1C] text-white flex flex-col items-center justify-center gap-4 p-6 text-center">
        <Activity className="w-10 h-10 text-white/30" />
        <p className="text-white/60">{error || 'Sem dados disponíveis.'}</p>
        <Button onClick={fetchData} variant="outline" className="border-white/10 text-white/70 hover:bg-white/5 gap-2">
          <RefreshCw className="w-4 h-4" /> Tentar novamente
        </Button>
      </div>
    );
  }

  const periodoLabel = data.periodoInicio && data.periodoFim
    ? `${format(data.periodoInicio, 'dd MMM', { locale: ptBR })} – ${format(data.periodoFim, 'dd MMM yyyy', { locale: ptBR })}`
    : '';

  const atendentesNomes = data.attendants.map(a => a.nome.split(' ')[0]).join(' · ');
  const funisNomes = data.funnels.slice(0, 2).map(f => f.nome).join(' · ') + (data.funnels.length > 2 ? '…' : '');
  const benchmarkConversao = 70;

  return (
    <div className="relative min-h-screen bg-[#050E1C] text-white overflow-x-hidden font-sans">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed -top-[30%] -left-[20%] w-[70%] h-[70%] rounded-full opacity-60"
        style={{ background: 'radial-gradient(ellipse, rgba(26,74,138,0.25) 0%, transparent 70%)' }} />
      <div className="pointer-events-none fixed -bottom-[20%] -right-[15%] w-[55%] h-[55%] rounded-full opacity-60"
        style={{ background: 'radial-gradient(ellipse, rgba(155,89,255,0.12) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 pb-16 pt-6 md:pt-10">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-lg font-extrabold font-display"
              style={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})` }}>
              👁
            </div>
            <div>
              <div className="font-display font-bold text-xl tracking-tight">Dashboard CRM Kommo</div>
              <div className="text-[11px] text-white/35 uppercase tracking-[0.08em] mt-0.5">
                Núcleo de Oftalmologia – Leads &amp; Conversão
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {periodoLabel && (
              <div className="bg-white/[0.04] border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/65">
                Período: <span className="text-[#00D4FF] font-medium">{periodoLabel}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-[#00E59B]/[0.08] border border-[#00E59B]/20 rounded-full px-3.5 py-1.5 text-xs font-medium text-[#00E59B]">
              <span className="w-[7px] h-[7px] rounded-full bg-[#00E59B] animate-pulse" />
              {fmtNum(data.totalLeads)} leads únicos
            </div>
            <Button onClick={fetchData} variant="outline" size="icon" className="border-white/10 text-white/70 hover:bg-white/5 hover:text-white h-8 w-8">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </header>

        {/* KPIs row 1 */}
        <SectionLabel>Indicadores Principais</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard
            icon={Users} iconColor={C.cyan}
            value={fmtNum(data.totalLeads)}
            label="Total de Leads Únicos"
            delta={growth ? `▲ +${Math.round(growth.pct)}% em ${growth.to} vs ${growth.from}` : 'Volume acumulado no período'}
            deltaColor={growth ? 'up' : 'nt'}
          />
          <KpiCard
            icon={CalendarCheck} iconColor={C.green}
            value={fmtNum(data.convertidos)}
            label="Agendados / Convertidos"
            delta={`▲ ${fmtPct(data.taxaConversao)} de conversão`}
            deltaColor="up"
          />
          <KpiCard
            icon={XCircle} iconColor={C.coral}
            value={fmtNum(data.perdidos)}
            label="Leads Perdidos"
            delta={`▼ ${fmtPct((data.perdidos / data.totalLeads) * 100)} da base total`}
            deltaColor="dn"
          />
          <KpiCard
            icon={Clock} iconColor={C.yellow}
            value={fmtNum(data.abertos)}
            label="Leads em Aberto"
            delta={`${fmtPct((data.abertos / data.totalLeads) * 100)} ainda em aberto`}
            deltaColor="nt"
          />
        </div>

        {/* KPIs row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <KpiCard
            icon={Zap} iconColor={C.green}
            value={fmtPct(data.taxaConversao)}
            label="Taxa de Conversão Real"
            delta={data.taxaConversao >= benchmarkConversao ? '▲ Acima da média do setor' : '▼ Abaixo da média do setor'}
            deltaColor={data.taxaConversao >= benchmarkConversao ? 'up' : 'dn'}
          />
          <KpiCard
            icon={Clock} iconColor={C.cyan}
            value={formatResponseTime(data.responseTime.median)}
            label="Tempo Médio de Resposta"
            delta={data.responseTime.median > 1 ? '▼ Mediana · Meta: <1h' : '▲ Mediana · dentro da meta'}
            deltaColor={data.responseTime.median > 1 ? 'dn' : 'up'}
          />
          <KpiCard
            icon={Users} iconColor={C.purple}
            value={fmtNum(data.attendants.length)}
            label="Atendentes Ativos"
            delta={atendentesNomes || '—'}
            deltaColor="nt"
          />
          <KpiCard
            icon={BarChart3} iconColor={C.yellow}
            value={fmtNum(data.funnels.length)}
            label="Funis Ativos no Kommo"
            delta={funisNomes || '—'}
            deltaColor="nt"
          />
        </div>

        {/* Evolução temporal */}
        <SectionLabel>Evolução Temporal</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <Card className="lg:col-span-2">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="font-display text-[15px] font-semibold">Volume de Leads por Mês</div>
                <div className="text-[11px] text-white/35 mt-0.5">Total recebido, convertidos e perdidos</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3.5 mb-3">
              <LegendDot color={C.cyan} label="Total de leads" />
              <LegendDot color={C.green} label="Convertidos" />
              <LegendDot color={C.coral} label="Perdidos" />
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly}>
                  <CartesianGrid {...grid} vertical={false} />
                  <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} />
                  <YAxis tick={tick} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  <Bar dataKey="total" name="Total" fill="rgba(0,212,255,0.25)" stroke={C.cyan} strokeWidth={2} radius={[6, 6, 0, 0]} barSize={22} />
                  <Bar dataKey="convertidos" name="Convertidos" fill="rgba(0,229,155,0.25)" stroke={C.green} strokeWidth={2} radius={[6, 6, 0, 0]} barSize={22} />
                  <Bar dataKey="perdidos" name="Perdidos" fill="rgba(255,107,107,0.25)" stroke={C.coral} strokeWidth={2} radius={[6, 6, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="font-display text-[15px] font-semibold mb-1">Taxa de Conversão</div>
            <div className="text-[11px] text-white/35 mb-2">% convertidos por mês</div>
            <div className="text-center py-3">
              <div className="font-display text-[48px] font-extrabold leading-none tracking-tight bg-gradient-to-br from-[#00D4FF] to-[#00E59B] bg-clip-text text-transparent">
                {fmtPct(data.taxaConversao)}
              </div>
              <div className="text-[11px] text-white/35 mt-1.5 uppercase tracking-[0.1em]">Conversão Real</div>
            </div>
            <div className="h-32 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthly}>
                  <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} />
                  <YAxis tick={tick} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} formatter={(v: number) => fmtPct(v)} />
                  <Line type="monotone" dataKey="conversao" name="Conversão" stroke={C.green} fill="rgba(0,229,155,0.1)" strokeWidth={2} dot={{ r: 4, fill: C.green }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Volume semanal */}
        <Card className="mb-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-display text-[15px] font-semibold">Volume Semanal de Leads</div>
              <div className="text-[11px] text-white/35 mt-0.5">Total de leads por semana – últimas {data.weekly.length} semanas</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3.5 mb-3">
            <LegendDot color={C.cyan} label="Leads na semana" />
            <LegendDot color={C.green} label="Convertidos" />
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weekly}>
                <CartesianGrid {...grid} vertical={false} />
                <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} />
                <YAxis tick={tick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                <Bar dataKey="total" name="Total" fill="rgba(0,212,255,0.2)" stroke={C.cyan} strokeWidth={1.5} radius={[5, 5, 0, 0]} />
                <Bar dataKey="convertidos" name="Convertidos" fill="rgba(0,229,155,0.2)" stroke={C.green} strokeWidth={1.5} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Conversas por dia */}
        <Card className="mb-5">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div>
              <div className="font-display text-[15px] font-semibold">Conversas por Dia</div>
              <div className="text-[11px] text-white/35 mt-0.5">Quantidade de leads/conversas iniciadas por dia</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                min={data.daily[0]?.key}
                max={data.daily[data.daily.length - 1]?.key}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/80 [color-scheme:dark] focus:outline-none focus:border-[#00D4FF]/40"
              />
              <span className="text-white/25 text-xs">até</span>
              <input
                type="date"
                value={dateTo}
                min={data.daily[0]?.key}
                max={data.daily[data.daily.length - 1]?.key}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/80 [color-scheme:dark] focus:outline-none focus:border-[#00D4FF]/40"
              />
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(''); setDateTo(''); }}
                  className="text-[11px] text-white/35 hover:text-white/65 underline underline-offset-2"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
          {dailyData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid {...grid} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ ...tick, fontSize: 10 }}
                    interval={Math.max(0, Math.floor(dailyData.length / 14))}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={tick} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  <Bar dataKey="total" name="Conversas" fill="rgba(0,212,255,0.25)" stroke={C.cyan} strokeWidth={1.5} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-white/35">
              Nenhuma conversa no período selecionado.
            </div>
          )}
        </Card>

        {/* Atendentes + Funis + Etapas */}
        <SectionLabel>Performance por Atendente &amp; Funil</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <Card>
            <div className="font-display text-[15px] font-semibold mb-1">Performance por Atendente</div>
            <div className="text-[11px] text-white/35 mb-5">Leads, convertidos e taxa de conversão</div>
            {data.attendants.map((a, i) => (
              <ProgressRow
                key={a.nome}
                avatar={a.iniciais}
                label={a.nome}
                sublabel={`${fmtNum(a.total)} leads · ${fmtNum(a.convertidos)} convertidos`}
                pct={a.conversao}
                color={FUNNEL_COLORS[i % FUNNEL_COLORS.length]}
              />
            ))}
            <div className="h-36 mt-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.attendants}>
                  <CartesianGrid {...grid} vertical={false} />
                  <XAxis dataKey={(a: { nome: string }) => a.nome.split(' ')[0]} tick={tick} axisLine={false} tickLine={false} />
                  <YAxis tick={tick} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  <Bar dataKey="total" name="Total" fill="rgba(0,212,255,0.25)" stroke={C.cyan} strokeWidth={1.5} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="convertidos" name="Convertidos" fill="rgba(0,229,155,0.4)" stroke={C.green} strokeWidth={1.5} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="font-display text-[15px] font-semibold mb-1">Performance por Funil</div>
            <div className="text-[11px] text-white/35 mb-5">Volume e taxa de conversão</div>
            {data.funnels.map((f, i) => (
              <ProgressRow
                key={f.nome}
                label={f.nome}
                sublabel={`${fmtNum(f.total)} leads`}
                pct={f.conversao}
                color={FUNNEL_COLORS[i % FUNNEL_COLORS.length]}
              />
            ))}
            <div className="h-40 mt-5">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.funnels} dataKey="total" nameKey="nome" cx="50%" cy="50%" innerRadius={42} outerRadius={66} paddingAngle={2}>
                    {data.funnels.map((f, i) => (
                      <Cell key={f.nome} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="font-display text-[15px] font-semibold mb-1">Etapas dos Leads</div>
            <div className="text-[11px] text-white/35 mb-5">Distribuição por status atual</div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.stages} dataKey="total" nameKey="nome" cx="50%" cy="50%" innerRadius={48} outerRadius={78} paddingAngle={2}>
                    {data.stages.map(s => (
                      <Cell key={s.nome} fill={STAGE_COLORS[s.nome] || C.gray} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/65">Convertidos / Confirmados</span>
                <span className="font-semibold text-[#00E59B]">{fmtNum(data.convertidos)} ({fmtPct((data.convertidos / data.totalLeads) * 100)})</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/65">Perdidos</span>
                <span className="font-semibold text-[#FF6B6B]">{fmtNum(data.perdidos)} ({fmtPct((data.perdidos / data.totalLeads) * 100)})</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/65">Em aberto</span>
                <span className="font-semibold text-[#FFD166]">{fmtNum(data.abertos)} ({fmtPct((data.abertos / data.totalLeads) * 100)})</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Padrões de demanda */}
        <SectionLabel>Padrões de Demanda</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <Card>
            <div className="font-display text-[15px] font-semibold mb-1">Leads por Dia da Semana</div>
            <div className="text-[11px] text-white/35 mb-5">Concentração de demanda – Seg a Dom</div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dowData}>
                  <CartesianGrid {...grid} vertical={false} />
                  <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} />
                  <YAxis tick={tick} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  <Bar dataKey="value" name="Leads" radius={[6, 6, 0, 0]}>
                    {dowData.map((d, i) => (
                      <Cell key={d.name} fill={DAY_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="font-display text-[15px] font-semibold mb-1">Leads por Hora do Dia</div>
            <div className="text-[11px] text-white/35 mb-5">Horários de pico de contato dos pacientes</div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hrData}>
                  <CartesianGrid {...grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ ...tick, fontSize: 10 }} interval={1} axisLine={false} tickLine={false} />
                  <YAxis tick={tick} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  <Bar dataKey="value" name="Leads" radius={[4, 4, 0, 0]}>
                    {hrData.map(h => (
                      <Cell key={h.name} fill={hourColor(h.value, maxHour)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Eficiência & Alertas */}
        <SectionLabel>Eficiência &amp; Alertas</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <Card>
            <div className="font-display text-[15px] font-semibold mb-1">Análise de Tempo de Resposta</div>
            <div className="text-[11px] text-white/35 mb-5">Distribuição do tempo de atualização dos leads</div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/65">⚡ Média geral</span>
                <span className="text-[13px] font-semibold text-[#FF6B6B]">{formatResponseTime(data.responseTime.mean)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/65">📍 Mediana (50% dos leads)</span>
                <span className="text-[13px] font-semibold text-[#FFD166]">{formatResponseTime(data.responseTime.median)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/65">✅ 25% mais rápidos</span>
                <span className="text-[13px] font-semibold text-[#00E59B]">até {formatResponseTime(data.responseTime.p25)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/65">🔴 25% mais lentos</span>
                <span className="text-[13px] font-semibold text-[#FF6B6B]">mais de {formatResponseTime(data.responseTime.p75)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/65">🏆 Mais rápido registrado</span>
                <span className="text-[13px] font-semibold text-[#00D4FF]">{formatResponseTime(data.responseTime.min)}</span>
              </div>
            </div>
            <div className="h-36 mt-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[
                    { name: '25% mais rápidos', value: data.responseTime.p25, color: C.green },
                    { name: '50% (mediana)', value: data.responseTime.median, color: C.yellow },
                    { name: '75% quartil', value: data.responseTime.p75, color: C.coral },
                    { name: 'Máximo (outlier)', value: data.responseTime.max, color: C.coral },
                  ]}
                >
                  <XAxis type="number" scale="log" domain={[1, 'dataMax']} allowDataOverflow tick={tick} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v)}h`} />
                  <YAxis type="category" dataKey="name" tick={{ ...tick, fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} formatter={(v: number) => formatResponseTime(v)} />
                  <Bar dataKey="value" radius={[0, 5, 5, 0]}>
                    {[C.green, C.yellow, C.coral, C.coral].map((c, i) => (
                      <Cell key={i} fill={c} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="font-display text-[15px] font-semibold mb-1">Alertas &amp; Oportunidades</div>
            <div className="text-[11px] text-white/35 mb-4">Pontos críticos que exigem ação</div>
            {alerts.map((a, i) => <AlertCard key={i} alert={a} />)}
          </Card>
        </div>

        {/* Leads perdidos */}
        <SectionLabel>Leads Perdidos – Detalhamento</SectionLabel>
        <Card className="mb-5">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
            <div>
              <div className="font-display text-[15px] font-semibold">Lista de Leads Perdidos</div>
              <div className="text-[11px] text-white/35 mt-0.5">Nome, telefone e motivo da perda (quando informado)</div>
            </div>
            <div className="flex items-center gap-1.5 bg-[#FF6B6B]/[0.08] border border-[#FF6B6B]/20 rounded-full px-3.5 py-1.5 text-xs font-medium text-[#FF6B6B]">
              {fmtNum(data.lostLeads.length)} leads perdidos
            </div>
          </div>
          <div className="max-h-[480px] overflow-y-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-[13px]">
              <thead className="sticky top-0 bg-[#0B1E3D] z-10">
                <tr className="text-[11px] uppercase tracking-[0.08em] text-white/35">
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Telefone</th>
                  <th className="px-4 py-3 font-medium">Motivo</th>
                  <th className="px-4 py-3 font-medium">Funil</th>
                  <th className="px-4 py-3 font-medium">Responsável</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {data.lostLeads.map((lead, i) => (
                  <tr key={lead.id} className={`border-t border-white/5 ${i % 2 === 0 ? 'bg-white/[0.015]' : ''}`}>
                    <td className="px-4 py-2.5 font-medium">{lead.nome}</td>
                    <td className="px-4 py-2.5 text-white/65 whitespace-nowrap">{lead.telefone || '—'}</td>
                    <td className="px-4 py-2.5">
                      {lead.motivo ? (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ background: 'rgba(255,107,107,0.1)', color: C.coral }}>
                          {lead.motivo}
                        </span>
                      ) : (
                        <span className="text-white/25">Não informado</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-white/65 whitespace-nowrap">{lead.funil}</td>
                    <td className="px-4 py-2.5 text-white/65 whitespace-nowrap">{lead.responsavel}</td>
                    <td className="px-4 py-2.5 text-white/35 whitespace-nowrap">
                      {lead.data ? format(lead.data, 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Visão consolidada */}
        <SectionLabel>Visão Consolidada Mensal</SectionLabel>
        <Card>
          <div className="font-display text-[15px] font-semibold mb-1">Evolução da Taxa de Conversão e Volume por Mês</div>
          <div className="text-[11px] text-white/35 mb-3">Leads totais (barras) e % de conversão (linha)</div>
          <div className="flex flex-wrap gap-3.5 mb-3">
            <LegendDot color={C.cyan} label="Total leads (eixo esq.)" />
            <LegendDot color={C.green} label="Taxa de conversão %" />
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.monthly}>
                <CartesianGrid {...grid} vertical={false} />
                <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={tick} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={tick} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                <Bar yAxisId="left" dataKey="total" name="Total de leads" fill="rgba(0,212,255,0.15)" stroke={C.cyan} strokeWidth={1.5} radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="conversao" name="Taxa de conversão %" stroke={C.green} strokeWidth={2} dot={{ r: 6, fill: C.green }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Footer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mt-12 pt-6 border-t border-white/10">
          <div className="font-display text-[13px] font-semibold text-white/35">
            Dashboard <span className="text-[#00D4FF]">CRM Kommo</span> – Núcleo de Oftalmologia
          </div>
          <div className="text-[11px] text-white/35">
            Dados atualizados em {format(data.geradoEm, 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })} · {fmtNum(data.totalLeads)} leads únicos
            {periodoLabel && ` · Período: ${periodoLabel}`}
          </div>
        </div>
      </div>
    </div>
  );
}
