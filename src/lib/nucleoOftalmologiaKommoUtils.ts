import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ── Types ────────────────────────────────────────────────────────────────────

export type StatusGroup = 'convertido' | 'perdido' | 'aberto';

export interface KommoLead {
  id: string;
  etapa: string;
  funil: string;
  responsavel: string;
  dataCriada: Date | null;
  ultimaModificacao: Date | null;
  status: StatusGroup;
  categoria: string;
}

export interface MonthlyMetric {
  key: string;
  label: string;
  total: number;
  convertidos: number;
  perdidos: number;
  conversao: number;
}

export interface WeeklyMetric {
  label: string;
  total: number;
  convertidos: number;
}

export interface AttendantMetric {
  nome: string;
  iniciais: string;
  total: number;
  convertidos: number;
  conversao: number;
}

export interface FunnelMetric {
  nome: string;
  total: number;
  convertidos: number;
  perdidos: number;
  conversao: number;
}

export interface StageMetric {
  nome: string;
  total: number;
}

export interface ResponseTimeStats {
  mean: number;
  median: number;
  p25: number;
  p75: number;
  min: number;
  max: number;
}

export interface NucleoKommoData {
  totalLeads: number;
  convertidos: number;
  perdidos: number;
  abertos: number;
  taxaConversao: number;
  responseTime: ResponseTimeStats;
  attendants: AttendantMetric[];
  funnels: FunnelMetric[];
  stages: StageMetric[];
  monthly: MonthlyMetric[];
  weekly: WeeklyMetric[];
  byDayOfWeek: number[]; // Segunda..Domingo
  byHour: number[]; // 0..23
  periodoInicio: Date | null;
  periodoFim: Date | null;
  geradoEm: Date;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDateStr(raw: unknown): Date | null {
  const s = String(raw ?? '').trim();
  const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, dd, mm, yyyy, hh, min, ss] = m;
  return new Date(+yyyy, +mm - 1, +dd, +hh, +min, +ss);
}

export function classifyStatus(etapaRaw: string): StatusGroup {
  const e = etapaRaw.toLowerCase().trim();
  if (e.includes('perdid')) return 'perdido';
  if (e.includes('nao confirmad') || e.includes('não confirmad') || e.includes('nao confirmando') || e.includes('não confirmando')) {
    return 'aberto';
  }
  if (e.includes('ganh')) return 'convertido';
  if (e.includes('confirmad')) return 'convertido';
  if (e.includes('agendad')) return 'convertido';
  return 'aberto';
}

export function categorizeEtapa(etapaRaw: string): string {
  const e = etapaRaw.toLowerCase().trim();
  if (e.includes('perdid')) return 'Venda Perdida';
  if (e.includes('nao confirmad') || e.includes('não confirmad') || e.includes('nao confirmando') || e.includes('não confirmando')) {
    return 'Não Confirmado';
  }
  if (e.includes('ganh')) return 'Venda Ganha';
  if (e.includes('agendamento confirmado')) return 'Agendamento Confirmado';
  if (e.includes('consulta confirmada')) return 'Consulta Confirmada';
  if (e.includes('agendad')) return 'Agendado';
  return 'Outros';
}

const FUNNEL_DISPLAY_NAMES: Record<string, string> = {
  'confirmações amigo': 'Confirmações Amigo',
  'funil jeane': 'Funil Jeane',
  'funil carina': 'Funil Carina',
  'funil numeros novos': 'Funil Números Novos',
  'funil de vendas': 'Funil de Vendas',
};

export function prettifyFunnelName(name: string): string {
  return FUNNEL_DISPLAY_NAMES[name.toLowerCase().trim()] || name;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.floor(p * (sorted.length - 1));
  return sorted[idx];
}

export function formatResponseTime(hours: number): string {
  if (hours < 1 / 60) return `${Math.max(1, Math.round(hours * 3600))} seg`;
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${hours.toFixed(1).replace('.', ',')}h`;
  return `${(hours / 24).toFixed(1).replace('.', ',')} dias`;
}

const STAGE_ORDER = [
  'Agendamento Confirmado',
  'Venda Ganha',
  'Agendado',
  'Consulta Confirmada',
  'Não Confirmado',
  'Venda Perdida',
  'Outros',
];

const DAY_LABELS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

// ── Parsing ───────────────────────────────────────────────────────────────────

function parseLeads(rawData: Record<string, unknown>[]): KommoLead[] {
  return rawData.map(row => {
    const etapa = String(row['Etapa do lead'] ?? '').trim();
    return {
      id: String(row['ID'] ?? ''),
      etapa,
      funil: String(row['Funil de vendas'] ?? '').trim(),
      responsavel: String(row['Lead usuário responsável'] ?? '').trim(),
      dataCriada: parseDateStr(row['Data Criada']),
      ultimaModificacao: parseDateStr(row['Última modificação']),
      status: classifyStatus(etapa),
      categoria: categorizeEtapa(etapa),
    };
  });
}

// ── Aggregations ──────────────────────────────────────────────────────────────

function computeResponseTime(leads: KommoLead[]): ResponseTimeStats {
  const hours = leads
    .map(l => {
      if (!l.dataCriada || !l.ultimaModificacao) return null;
      const h = (l.ultimaModificacao.getTime() - l.dataCriada.getTime()) / 3_600_000;
      return h >= 0 ? h : null;
    })
    .filter((h): h is number => h !== null)
    .sort((a, b) => a - b);

  if (hours.length === 0) {
    return { mean: 0, median: 0, p25: 0, p75: 0, min: 0, max: 0 };
  }

  return {
    mean: hours.reduce((a, b) => a + b, 0) / hours.length,
    median: percentile(hours, 0.5),
    p25: percentile(hours, 0.25),
    p75: percentile(hours, 0.75),
    min: hours[0],
    max: hours[hours.length - 1],
  };
}

function computeAttendants(leads: KommoLead[], minTotal = 5): AttendantMetric[] {
  const map = new Map<string, { total: number; convertidos: number }>();
  for (const l of leads) {
    if (!l.responsavel) continue;
    const entry = map.get(l.responsavel) || { total: 0, convertidos: 0 };
    entry.total++;
    if (l.status === 'convertido') entry.convertidos++;
    map.set(l.responsavel, entry);
  }

  return Array.from(map.entries())
    .filter(([, v]) => v.total >= minTotal)
    .map(([nome, { total, convertidos }]) => ({
      nome,
      iniciais: getInitials(nome),
      total,
      convertidos,
      conversao: total > 0 ? (convertidos / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

function computeFunnels(leads: KommoLead[]): FunnelMetric[] {
  const map = new Map<string, { total: number; convertidos: number; perdidos: number }>();
  for (const l of leads) {
    if (!l.funil) continue;
    const entry = map.get(l.funil) || { total: 0, convertidos: 0, perdidos: 0 };
    entry.total++;
    if (l.status === 'convertido') entry.convertidos++;
    if (l.status === 'perdido') entry.perdidos++;
    map.set(l.funil, entry);
  }

  return Array.from(map.entries())
    .map(([nome, { total, convertidos, perdidos }]) => ({
      nome: prettifyFunnelName(nome),
      total,
      convertidos,
      perdidos,
      conversao: total > 0 ? (convertidos / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

function computeStages(leads: KommoLead[]): StageMetric[] {
  const map = new Map<string, number>();
  for (const l of leads) {
    map.set(l.categoria, (map.get(l.categoria) || 0) + 1);
  }

  return STAGE_ORDER
    .filter(nome => (map.get(nome) || 0) > 0)
    .map(nome => ({ nome, total: map.get(nome) || 0 }));
}

function computeMonthly(leads: KommoLead[]): MonthlyMetric[] {
  const map = new Map<string, { total: number; convertidos: number; perdidos: number }>();
  for (const l of leads) {
    if (!l.dataCriada) continue;
    const key = `${l.dataCriada.getFullYear()}-${String(l.dataCriada.getMonth() + 1).padStart(2, '0')}`;
    const entry = map.get(key) || { total: 0, convertidos: 0, perdidos: 0 };
    entry.total++;
    if (l.status === 'convertido') entry.convertidos++;
    if (l.status === 'perdido') entry.perdidos++;
    map.set(key, entry);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { total, convertidos, perdidos }]) => {
      const [year, month] = key.split('-');
      const date = new Date(+year, +month - 1, 1);
      const label = format(date, 'MMM/yy', { locale: ptBR });
      return {
        key,
        label: label.charAt(0).toUpperCase() + label.slice(1),
        total,
        convertidos,
        perdidos,
        conversao: total > 0 ? (convertidos / total) * 100 : 0,
      };
    });
}

function weekStart(d: Date): Date {
  const day = (d.getDay() + 6) % 7; // Monday = 0
  const ws = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  ws.setDate(ws.getDate() - day);
  return ws;
}

function computeWeekly(leads: KommoLead[], maxWeeks = 10): WeeklyMetric[] {
  const map = new Map<string, { start: Date; total: number; convertidos: number }>();
  for (const l of leads) {
    if (!l.dataCriada) continue;
    const ws = weekStart(l.dataCriada);
    const key = ws.toISOString().slice(0, 10);
    const entry = map.get(key) || { start: ws, total: 0, convertidos: 0 };
    entry.total++;
    if (l.status === 'convertido') entry.convertidos++;
    map.set(key, entry);
  }

  return Array.from(map.values())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(-maxWeeks)
    .map(({ start, total, convertidos }) => ({
      label: format(start, 'dd/MM'),
      total,
      convertidos,
    }));
}

function computeByDayOfWeek(leads: KommoLead[]): number[] {
  const counts = new Array(7).fill(0);
  for (const l of leads) {
    if (!l.dataCriada) continue;
    const idx = (l.dataCriada.getDay() + 6) % 7; // Monday = 0
    counts[idx]++;
  }
  return counts;
}

export function dayOfWeekData(byDayOfWeek: number[]): { name: string; value: number }[] {
  return DAY_LABELS.map((name, i) => ({ name, value: byDayOfWeek[i] }));
}

function computeByHour(leads: KommoLead[]): number[] {
  const counts = new Array(24).fill(0);
  for (const l of leads) {
    if (!l.dataCriada) continue;
    counts[l.dataCriada.getHours()]++;
  }
  return counts;
}

export function hourData(byHour: number[]): { name: string; value: number }[] {
  return byHour.map((value, i) => ({ name: `${i}h`, value }));
}

// ── Main builder ──────────────────────────────────────────────────────────────

function buildDashboardFromBuffer(arrayBuffer: ArrayBuffer): NucleoKommoData {
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array', cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, unknown>[];

  const leads = parseLeads(rawData);

  const totalLeads = leads.length;
  const convertidos = leads.filter(l => l.status === 'convertido').length;
  const perdidos = leads.filter(l => l.status === 'perdido').length;
  const abertos = leads.filter(l => l.status === 'aberto').length;

  const dates = leads.map(l => l.dataCriada).filter((d): d is Date => d !== null);
  const periodoInicio = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
  const periodoFim = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

  return {
    totalLeads,
    convertidos,
    perdidos,
    abertos,
    taxaConversao: totalLeads > 0 ? (convertidos / totalLeads) * 100 : 0,
    responseTime: computeResponseTime(leads),
    attendants: computeAttendants(leads),
    funnels: computeFunnels(leads),
    stages: computeStages(leads),
    monthly: computeMonthly(leads),
    weekly: computeWeekly(leads),
    byDayOfWeek: computeByDayOfWeek(leads),
    byHour: computeByHour(leads),
    periodoInicio,
    periodoFim,
    geradoEm: new Date(),
  };
}

export async function loadNucleoKommoData(
  filePath = '/data/Dashboard Nucleo Oftalmologia.xlsx'
): Promise<NucleoKommoData> {
  const url = filePath
    .split('/')
    .map((part, i) => (i === 0 ? part : encodeURIComponent(part)))
    .join('/');
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao carregar arquivo: ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  return buildDashboardFromBuffer(arrayBuffer);
}
