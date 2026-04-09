import * as XLSX from 'xlsx';
import { parse, format, isValid, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ── Types ────────────────────────────────────────────────────────────────────

export interface KoruLead {
  id: string;
  titulo: string;
  contato: string;
  responsavel: string;
  etapa: string;
  funil: string;
  venda: number;
  dataCriada: Date | null;
  ultimaModificacao: Date | null;
  tags: string;
  canalOrigem: string;
  produto: string;
  fechadaEm: string;
  corretor: string | null;
  imobiliaria: string | null;
}

export interface FunilStep {
  etapa: string;
  total: number;
  conversaoPrev: number | null; // % from previous step
  conversaoTotal: number | null; // % from first step
}

export interface LeadsPorMes {
  mes: string; // "Nov/25"
  total: number;
  contratados: number;
}

export interface CorretorData {
  corretor: string;
  total: number;
  contratados: number;
}

export interface CanalData {
  canal: string;
  total: number;
}

export interface ProdutoData {
  produto: string;
  total: number;
  contratados: number;
  vgv: number;
}

export interface KoruKPIs {
  totalLeads: number;
  emAtendimento: number;
  corretoresNomeados: number;
  contratosFechados: number;
  taxaConversao: number;
  vgvTotal: number;
  ticketMedio: number;
  semCorretor: number;
}

export interface KoruDashboardData {
  leads: KoruLead[];
  kpis: KoruKPIs;
  funil: FunilStep[];
  leadsPorMes: LeadsPorMes[];
  porCorretor: CorretorData[];
  porCanal: CanalData[];
  porProduto: ProdutoData[];
  insights: string[];
  dataAtualizacao: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const IGNORE_TAGS = [
  'fb885641647415719',
  'meta ads forms 1',
  'meta ads - alameda dos ipês',
  'meta ads - alameda dos ipes',
  'meta ads',
  'vem ser feliz de casa nova',
  'arruda imovéis',
  'arruda imóveis',
  'furtado oliv. imóveis',
  'jordan imóveis',
  'jordan imóveis',
  'apê story',
  'ape story',
  'vianna',
];

const IMOBILIARIAS = [
  'arruda imóveis',
  'arruda imovéis',
  'furtado oliv. imóveis',
  'jordan imóveis',
  'apê story',
  'ape story',
  'vianna',
];

const FUNIL_ORDER = [
  'Contato inicial',
  'Em Atendimento',
  'Corretor nomeado',
  'Visita REALIZADA',
  'Venda Ganha',
  'Venda Perdida',
];

// Stages that represent a closed/won deal
const WON_STAGES = new Set(['contratado', 'Venda Ganha']);
export const isWonLead = (etapa: string) => WON_STAGES.has(etapa);

// ── Helpers ───────────────────────────────────────────────────────────────────

export function extractCorretor(tagString: string | null | undefined): string | null {
  if (!tagString || tagString.trim() === '') return null;
  const tags = tagString.split(',').map(t => t.trim()).filter(Boolean);
  const candidates = tags.filter(tag =>
    !IGNORE_TAGS.some(ig => tag.toLowerCase().includes(ig.toLowerCase()))
  );
  return candidates[0] || null;
}

export function extractImobiliaria(tagString: string | null | undefined): string | null {
  if (!tagString || tagString.trim() === '') return null;
  const tags = tagString.split(',').map(t => t.trim()).filter(Boolean);
  const found = tags.find(tag =>
    IMOBILIARIAS.some(ig => tag.toLowerCase().includes(ig.toLowerCase()))
  );
  return found || null;
}

function parseDateStr(dateStr: unknown): Date | null {
  if (!dateStr || dateStr === 'não fechado' || dateStr === '') return null;
  const str = String(dateStr);
  try {
    const d = parse(str, 'dd.MM.yyyy HH:mm:ss', new Date());
    if (isValid(d)) return d;
    // Try alternate format
    const d2 = parse(str, 'dd.MM.yyyy', new Date());
    if (isValid(d2)) return d2;
  } catch {
    // ignore
  }
  return null;
}

function normalizeEtapa(etapa: string): string {
  const lower = etapa.toLowerCase().trim();
  if (lower === 'contato inicial') return 'Contato inicial';
  if (lower.includes('em atendimento') || lower === 'atendimento') return 'Em Atendimento';
  if (lower === 'corretor nomeado') return 'Corretor nomeado';
  if (lower.includes('visita')) return 'Visita REALIZADA';
  if (lower.includes('document')) return 'DOCUMENTOS PENDENTES'; // kept for legacy data
  if (lower === 'contratado') return 'contratado'; // legacy
  if (lower.includes('venda ganha') || lower === 'ganha') return 'Venda Ganha';
  if (lower.includes('venda perdida') || lower === 'perdida') return 'Venda Perdida';
  return etapa.trim();
}

function normalizeProduto(produto: unknown): string {
  if (!produto) return 'Sem produto';
  const str = String(produto).trim();
  if (!str) return 'Sem produto';
  const lower = str.toLowerCase();
  if (lower.includes('alameda') && (lower.includes('ipê') || lower.includes('ipe'))) {
    return 'Alameda dos Ipês';
  }
  if (lower.includes('bela sintra')) return 'Bela Sintra';
  return str;
}

function parseVenda(raw: unknown): number {
  if (typeof raw === 'number') return raw;
  if (!raw || raw === '' || raw === 'não fechado') return 0;
  const str = String(raw).replace(/[^0-9.,]/g, '').replace(',', '.');
  return parseFloat(str) || 0;
}

// ── Main parser ───────────────────────────────────────────────────────────────

export function parseKoruLeads(rawData: Record<string, unknown>[], defaultFunil = ''): KoruLead[] {
  return rawData.map(row => {
    const tags = String(row['Lead tags'] ?? '');
    const etapaRaw = String(row['Etapa do lead'] ?? '');
    return {
      id: String(row['ID'] ?? ''),
      titulo: String(row['Lead título'] ?? ''),
      contato: String(row['Contato principal'] ?? ''),
      responsavel: String(row['Lead usuário responsável'] ?? ''),
      etapa: normalizeEtapa(etapaRaw),
      funil: String(row['Funil de vendas'] ?? '') || defaultFunil,
      venda: parseVenda(row['Venda']),
      dataCriada: parseDateStr(row['Data Criada']),
      ultimaModificacao: parseDateStr(row['Última modificação']),
      tags,
      canalOrigem: String(row['Canal de Origem'] ?? ''),
      produto: normalizeProduto(row['Produto']),
      fechadaEm: String(row['Fechada em'] ?? ''),
      corretor: extractCorretor(tags),
      imobiliaria: extractImobiliaria(tags),
    };
  });
}

// ── Data aggregations ─────────────────────────────────────────────────────────

export function computeKPIs(leads: KoruLead[]): KoruKPIs {
  const totalLeads = leads.length;
  const emAtendimento = leads.filter(l => l.etapa === 'Contato inicial').length;
  const corretoresNomeados = leads.filter(l => l.etapa === 'Corretor nomeado').length;
  const contratosFechados = leads.filter(l => isWonLead(l.etapa)).length;
  const taxaConversao = totalLeads > 0 ? (contratosFechados / totalLeads) * 100 : 0;
  const vgvTotal = leads.reduce((sum, l) => sum + l.venda, 0);
  const leadsComVenda = leads.filter(l => l.venda > 0).length;
  const ticketMedio = leadsComVenda > 0 ? vgvTotal / leadsComVenda : 0;
  const semCorretor = leads.filter(l => l.etapa === 'Contato inicial' && !l.corretor).length;

  return {
    totalLeads,
    emAtendimento,
    corretoresNomeados,
    contratosFechados,
    taxaConversao,
    vgvTotal,
    ticketMedio,
    semCorretor,
  };
}

export function computeFunil(leads: KoruLead[]): FunilStep[] {
  const countByEtapa: Record<string, number> = {};
  for (const l of leads) {
    countByEtapa[l.etapa] = (countByEtapa[l.etapa] || 0) + 1;
  }

  // Known stages first, then any extra stages found in this funnel's data
  const extraStages = Object.keys(countByEtapa).filter(e => !FUNIL_ORDER.includes(e));
  const fullOrder = [...FUNIL_ORDER, ...extraStages];

  const steps = fullOrder
    .filter(etapa => (countByEtapa[etapa] || 0) > 0)
    .map(etapa => ({ etapa, total: countByEtapa[etapa] || 0 }));

  const first = steps[0]?.total || 1;

  return steps.map((step, i) => ({
    etapa: step.etapa,
    total: step.total,
    // conversaoPrev kept for type compatibility but chart uses conversaoTotal
    conversaoPrev: i > 0 && steps[i - 1].total > 0
      ? parseFloat(((step.total / steps[i - 1].total) * 100).toFixed(1))
      : null,
    // % relative to the first step — never exceeds 100%
    conversaoTotal: first > 0
      ? parseFloat(((step.total / first) * 100).toFixed(1))
      : null,
  }));
}

export function computeLeadsPorMes(leads: KoruLead[]): LeadsPorMes[] {
  const map = new Map<string, { total: number; contratados: number }>();

  for (const l of leads) {
    if (!l.dataCriada) continue;
    const key = format(startOfMonth(l.dataCriada), 'MMM/yy', { locale: ptBR });
    const keyCapitalized = key.charAt(0).toUpperCase() + key.slice(1);
    const entry = map.get(keyCapitalized) || { total: 0, contratados: 0 };
    entry.total++;
    if (isWonLead(l.etapa)) entry.contratados++;
    map.set(keyCapitalized, entry);
  }

  return Array.from(map.entries())
    .map(([mes, { total, contratados }]) => ({ mes, total, contratados }))
    .sort((a, b) => {
      // Sort by parsing the month label
      const parseLabel = (s: string) => {
        const months: Record<string, number> = {
          jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
          jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11,
        };
        const parts = s.toLowerCase().split('/');
        const m = months[parts[0]] ?? 0;
        const y = parseInt('20' + parts[1]) || 2025;
        return y * 100 + m;
      };
      return parseLabel(a.mes) - parseLabel(b.mes);
    });
}

export function computePorCorretor(leads: KoruLead[]): CorretorData[] {
  const map = new Map<string, { total: number; contratados: number }>();

  for (const l of leads) {
    const key = l.corretor || 'Sem corretor';
    const entry = map.get(key) || { total: 0, contratados: 0 };
    entry.total++;
    if (isWonLead(l.etapa)) entry.contratados++;
    map.set(key, entry);
  }

  return Array.from(map.entries())
    .map(([corretor, { total, contratados }]) => ({ corretor, total, contratados }))
    .sort((a, b) => b.total - a.total);
}

export function computePorCanal(leads: KoruLead[]): CanalData[] {
  const map = new Map<string, number>();

  for (const l of leads) {
    const key = l.canalOrigem && l.canalOrigem !== '' ? l.canalOrigem : 'Não informado';
    map.set(key, (map.get(key) || 0) + 1);
  }

  return Array.from(map.entries())
    .map(([canal, total]) => ({ canal, total }))
    .sort((a, b) => b.total - a.total);
}

export function computePorProduto(leads: KoruLead[]): ProdutoData[] {
  const map = new Map<string, { total: number; contratados: number; vgv: number }>();

  for (const l of leads) {
    const key = l.produto || 'Sem produto';
    const entry = map.get(key) || { total: 0, contratados: 0, vgv: 0 };
    entry.total++;
    if (isWonLead(l.etapa)) entry.contratados++;
    entry.vgv += l.venda;
    map.set(key, entry);
  }

  return Array.from(map.entries())
    .map(([produto, { total, contratados, vgv }]) => ({ produto, total, contratados, vgv }))
    .sort((a, b) => b.total - a.total);
}

export function generateInsights(
  leads: KoruLead[],
  kpis: KoruKPIs,
  leadsPorMes: LeadsPorMes[],
  porCorretor: CorretorData[]
): string[] {
  const insights: string[] = [];

  // Melhor mês
  const bestMes = [...leadsPorMes].sort((a, b) => b.total - a.total)[0];
  if (bestMes) {
    insights.push(`🔥 ${bestMes.mes} foi o mês com mais leads: ${bestMes.total}`);
  }

  // Gargalo em contato inicial
  if (kpis.totalLeads > 0) {
    const pct = ((kpis.emAtendimento / kpis.totalLeads) * 100).toFixed(1);
    insights.push(`⚠️ ${pct}% dos leads ainda estão em Contato Inicial — considere aumentar a capacidade de atendimento`);
  }

  // Melhor corretor
  const topCorretor = porCorretor.filter(c => c.corretor !== 'Sem corretor')[0];
  if (topCorretor) {
    insights.push(`🏆 ${topCorretor.corretor} é o corretor com mais leads: ${topCorretor.total}`);
  }

  // Taxa de conversão
  insights.push(`📉 Taxa de conversão geral: ${kpis.taxaConversao.toFixed(2)}%`);

  // VGV médio
  if (kpis.contratosFechados > 0 && kpis.vgvTotal > 0) {
    insights.push(`💰 VGV médio por contrato: ${formatCurrency(kpis.ticketMedio)}`);
  }

  // Sem corretor
  if (kpis.semCorretor > 0) {
    insights.push(`📋 ${kpis.semCorretor} leads em Contato Inicial ainda não têm corretor atribuído`);
  }

  return insights;
}

// ── Vendas Ganhas ─────────────────────────────────────────────────────────────

export interface VendaGanhaRow {
  mes: string;
  total: number;
  vgv: number;
  [produto: string]: string | number;
}

export function computeVendasGanhas(leads: KoruLead[]): { data: VendaGanhaRow[]; produtos: string[] } {
  const wonLeads = leads.filter(l => isWonLead(l.etapa) && l.dataCriada);

  const produtos = [...new Set(wonLeads.map(l => l.produto || 'Sem produto'))].sort();

  const map = new Map<string, VendaGanhaRow>();

  const parseLabel = (s: string) => {
    const months: Record<string, number> = {
      jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
      jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11,
    };
    const parts = s.toLowerCase().split('/');
    const m = months[parts[0]] ?? 0;
    const y = parseInt('20' + parts[1]) || 2025;
    return y * 100 + m;
  };

  for (const lead of wonLeads) {
    if (!lead.dataCriada) continue;
    const raw = format(startOfMonth(lead.dataCriada), 'MMM/yy', { locale: ptBR });
    const key = raw.charAt(0).toUpperCase() + raw.slice(1);

    if (!map.has(key)) {
      const entry: VendaGanhaRow = { mes: key, total: 0, vgv: 0 };
      for (const p of produtos) entry[p] = 0;
      map.set(key, entry);
    }

    const entry = map.get(key)!;
    entry.total++;
    entry.vgv += lead.venda;
    const pk = lead.produto || 'Sem produto';
    entry[pk] = ((entry[pk] as number) || 0) + lead.venda;
  }

  const data = Array.from(map.values()).sort((a, b) => parseLabel(a.mes) - parseLabel(b.mes));

  return { data, produtos };
}

// ── VGV por Etapa ─────────────────────────────────────────────────────────────

export interface VgvEtapaRow {
  etapa: string;
  vgv: number;
  count: number;
}

export function computeVgvPorEtapa(leads: KoruLead[]): VgvEtapaRow[] {
  const countMap: Record<string, number> = {};
  const vgvMap: Record<string, number> = {};

  for (const l of leads) {
    countMap[l.etapa] = (countMap[l.etapa] || 0) + 1;
    vgvMap[l.etapa] = (vgvMap[l.etapa] || 0) + l.venda;
  }

  const extraStages = Object.keys(countMap).filter(e => !FUNIL_ORDER.includes(e));
  const fullOrder = [...FUNIL_ORDER, ...extraStages];

  return fullOrder
    .filter(s => (countMap[s] || 0) > 0)
    .map(s => ({ etapa: s, vgv: vgvMap[s] || 0, count: countMap[s] || 0 }));
}

// ── Formatters ────────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `R$ ${(value / 1_000_000_000).toFixed(2).replace('.', ',')} Bi`;
  }
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(2).replace('.', ',')} Mi`;
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1).replace('.', ',')} mil`;
  }
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatCurrencyFull(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ── XLSX loader ───────────────────────────────────────────────────────────────

async function buildDashboardFromBuffer(arrayBuffer: ArrayBuffer, defaultFunil = ''): Promise<KoruDashboardData> {
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array', cellDates: false });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, unknown>[];

  const leads = parseKoruLeads(rawData, defaultFunil);
  const kpis = computeKPIs(leads);
  const funil = computeFunil(leads);
  const leadsPorMes = computeLeadsPorMes(leads);
  const porCorretor = computePorCorretor(leads);
  const porCanal = computePorCanal(leads);
  const porProduto = computePorProduto(leads);
  const insights = generateInsights(leads, kpis, leadsPorMes, porCorretor);

  // Try to get last modification date from leads
  const dates = leads.map(l => l.ultimaModificacao || l.dataCriada).filter(Boolean) as Date[];
  const lastDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date();
  const dataAtualizacao = format(lastDate, "dd/MM/yyyy", { locale: ptBR });

  return {
    leads,
    kpis,
    funil,
    leadsPorMes,
    porCorretor,
    porCanal,
    porProduto,
    insights,
    dataAtualizacao,
  };
}

export async function loadKoruData(filePath = '/data/kommo_export_leads_2026-04-02.xlsx'): Promise<KoruDashboardData> {
  const response = await fetch(filePath);
  if (!response.ok) throw new Error(`Falha ao carregar arquivo: ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  return buildDashboardFromBuffer(arrayBuffer);
}

export async function loadKoruDataFromFile(file: File): Promise<KoruDashboardData> {
  const arrayBuffer = await file.arrayBuffer();
  return buildDashboardFromBuffer(arrayBuffer, file.name);
}

export async function loadAllKoruData(): Promise<KoruDashboardData> {
  const sources = [
    { fileName: 'Funil Vendas Internas.xlsx', defaultFunil: 'Vendas Internas' },
    { fileName: 'Funil Vendas Externas.xlsx', defaultFunil: 'Vendas Externas' },
  ];

  const allLeads: KoruLead[] = [];
  let latestDate = new Date(0);

  for (const { fileName, defaultFunil } of sources) {
    try {
      const response = await fetch(`/data/${encodeURIComponent(fileName)}`);
      if (!response.ok) continue;
      const arrayBuffer = await response.arrayBuffer();
      const dashData = await buildDashboardFromBuffer(arrayBuffer, defaultFunil);
      allLeads.push(...dashData.leads);
      const dates = dashData.leads
        .map(l => l.ultimaModificacao || l.dataCriada)
        .filter(Boolean) as Date[];
      if (dates.length > 0) {
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        if (maxDate > latestDate) latestDate = maxDate;
      }
    } catch {
      // ignore individual file failures
    }
  }

  const kpis = computeKPIs(allLeads);
  const funil = computeFunil(allLeads);
  const leadsPorMes = computeLeadsPorMes(allLeads);
  const porCorretor = computePorCorretor(allLeads);
  const porCanal = computePorCanal(allLeads);
  const porProduto = computePorProduto(allLeads);
  const insights = generateInsights(allLeads, kpis, leadsPorMes, porCorretor);
  const dataAtualizacao = latestDate > new Date(0)
    ? format(latestDate, 'dd/MM/yyyy', { locale: ptBR })
    : format(new Date(), 'dd/MM/yyyy', { locale: ptBR });

  return { leads: allLeads, kpis, funil, leadsPorMes, porCorretor, porCanal, porProduto, insights, dataAtualizacao };
}
