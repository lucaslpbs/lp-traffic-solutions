export interface MetricConfig {
  id: string;
  name: string;
  unit: 'R$' | '%' | 'número';
  goal: number;
  direction: 'lower' | 'higher';
  yellowMargin: number;
  redMargin: number;
  active: boolean;
}

export type AlertStatus = 'critical' | 'warning' | 'healthy' | 'none';

export interface AdNode {
  id: string;
  name: string;
  type: 'client' | 'campaign' | 'adset' | 'ad';
  metrics: Record<string, number | null>;
  children?: AdNode[];
}

export const DEFAULT_METRICS: MetricConfig[] = [
  { id: 'cpm', name: 'CPM', unit: 'R$', goal: 10, direction: 'lower', yellowMargin: 15, redMargin: 30, active: true },
  { id: 'ctr', name: 'CTR', unit: '%', goal: 2, direction: 'higher', yellowMargin: 20, redMargin: 40, active: true },
  { id: 'cpc', name: 'CPC', unit: 'R$', goal: 1.5, direction: 'lower', yellowMargin: 20, redMargin: 40, active: true },
  { id: 'roas', name: 'ROAS', unit: 'número', goal: 3, direction: 'higher', yellowMargin: 15, redMargin: 35, active: true },
];

const STORAGE_KEY_PREFIX = 'war-room-metrics-';

export function loadClientMetrics(clientId: string): MetricConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + clientId);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_METRICS.map(m => ({ ...m }));
}

export function saveClientMetrics(clientId: string, metrics: MetricConfig[]) {
  localStorage.setItem(STORAGE_KEY_PREFIX + clientId, JSON.stringify(metrics));
}

export function getMetricStatus(value: number | null, config: MetricConfig): AlertStatus {
  if (value === null || value === undefined) return 'none';

  if (config.direction === 'lower') {
    const yellowThreshold = config.goal * (1 + config.yellowMargin / 100);
    const redThreshold = config.goal * (1 + config.redMargin / 100);
    if (value > redThreshold) return 'critical';
    if (value > yellowThreshold) return 'warning';
    return 'healthy';
  } else {
    const yellowThreshold = config.goal * (1 - config.yellowMargin / 100);
    const redThreshold = config.goal * (1 - config.redMargin / 100);
    if (value < redThreshold) return 'critical';
    if (value < yellowThreshold) return 'warning';
    return 'healthy';
  }
}

export function getMetricTooltip(value: number | null, config: MetricConfig): string {
  if (value === null) return 'Sem dado';
  const diff = config.direction === 'lower'
    ? ((value - config.goal) / config.goal) * 100
    : ((config.goal - value) / config.goal) * 100;

  const prefix = config.unit === 'R$' ? 'R$' : '';
  const suffix = config.unit === '%' ? '%' : config.unit === 'número' ? 'x' : '';

  if (diff <= 0) return `${config.name} dentro da meta de ${prefix}${config.goal}${suffix}`;
  return `${config.name} está ${Math.round(diff)}% ${config.direction === 'lower' ? 'acima' : 'abaixo'} da meta de ${prefix}${config.goal}${suffix}`;
}

export function formatMetricValue(value: number | null, config: MetricConfig): string {
  if (value === null) return '—';
  if (config.unit === 'R$') return `R$ ${value.toFixed(2).replace('.', ',')}`;
  if (config.unit === '%') return `${value.toFixed(2).replace('.', ',')}%`;
  return `${value.toFixed(2).replace('.', ',')}x`;
}

export function getWorstStatus(statuses: AlertStatus[]): AlertStatus {
  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('warning')) return 'warning';
  if (statuses.some(s => s === 'healthy')) return 'healthy';
  return 'none';
}

export function countAlerts(node: AdNode, metrics: MetricConfig[]): { critical: number; warning: number; healthy: number } {
  const counts = { critical: 0, warning: 0, healthy: 0 };

  if (node.type === 'ad') {
    const activeMetrics = metrics.filter(m => m.active);
    const statuses = activeMetrics.map(m => getMetricStatus(node.metrics[m.id] ?? null, m));
    const worst = getWorstStatus(statuses);
    if (worst === 'critical') counts.critical++;
    else if (worst === 'warning') counts.warning++;
    else if (worst === 'healthy') counts.healthy++;
    return counts;
  }

  if (node.children) {
    for (const child of node.children) {
      const c = countAlerts(child, metrics);
      counts.critical += c.critical;
      counts.warning += c.warning;
      counts.healthy += c.healthy;
    }
  }
  return counts;
}

// Compute average metrics for parent nodes from children ads
export function aggregateMetrics(node: AdNode): Record<string, number | null> {
  if (node.type === 'ad') return node.metrics;

  const allAds: AdNode[] = [];
  const collect = (n: AdNode) => {
    if (n.type === 'ad') allAds.push(n);
    n.children?.forEach(collect);
  };
  collect(node);

  if (allAds.length === 0) return {};

  const keys = Object.keys(allAds[0].metrics);
  const result: Record<string, number | null> = {};
  for (const key of keys) {
    const vals = allAds.map(a => a.metrics[key]).filter(v => v !== null) as number[];
    result[key] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }
  return result;
}

// Mock data — metrics populated at ALL levels (ad values, parent = average)
function avg(arr: number[]) { return arr.reduce((a, b) => a + b, 0) / arr.length; }

const c1_camp1_as1_ads: AdNode[] = [
  { id: 'c1-c1-as1-ad1', name: 'Carrossel Looks', type: 'ad', metrics: { cpm: 8.5, ctr: 2.4, cpc: 1.2, roas: 3.8 } },
  { id: 'c1-c1-as1-ad2', name: 'Vídeo Coleção', type: 'ad', metrics: { cpm: 12.5, ctr: 1.1, cpc: 2.3, roas: 1.5 } },
  { id: 'c1-c1-as1-ad3', name: 'Stories Promo', type: 'ad', metrics: { cpm: 9.8, ctr: 1.7, cpc: 1.6, roas: 2.7 } },
];
const c1_camp1_as2_ads: AdNode[] = [
  { id: 'c1-c1-as2-ad1', name: 'Imagem Única', type: 'ad', metrics: { cpm: 7.2, ctr: 2.8, cpc: 0.9, roas: 4.2 } },
  { id: 'c1-c1-as2-ad2', name: 'Reels Dinâmico', type: 'ad', metrics: { cpm: 14.0, ctr: 0.9, cpc: 2.8, roas: 1.2 } },
];
const c1_camp2_as1_ads: AdNode[] = [
  { id: 'c1-c2-as1-ad1', name: 'DPA Catálogo', type: 'ad', metrics: { cpm: 11.0, ctr: 3.1, cpc: 1.0, roas: 5.1 } },
  { id: 'c1-c2-as1-ad2', name: 'Cupom 10%', type: 'ad', metrics: { cpm: 15.0, ctr: 1.4, cpc: 2.1, roas: 1.8 } },
];

const c2_camp1_as1_ads: AdNode[] = [
  { id: 'c2-c1-as1-ad1', name: 'Vídeo Brincos', type: 'ad', metrics: { cpm: 6.5, ctr: 3.2, cpc: 0.7, roas: 5.5 } },
  { id: 'c2-c1-as1-ad2', name: 'Carrossel Mix', type: 'ad', metrics: { cpm: 11.8, ctr: 1.5, cpc: 1.9, roas: 2.1 } },
];
const c2_camp1_as2_ads: AdNode[] = [
  { id: 'c2-c1-as2-ad1', name: 'DPA Produtos', type: 'ad', metrics: { cpm: 9.0, ctr: 2.1, cpc: 1.3, roas: 3.2 } },
  { id: 'c2-c1-as2-ad2', name: 'Stories Depoimento', type: 'ad', metrics: { cpm: 13.5, ctr: 0.8, cpc: 2.5, roas: 1.0 } },
];
const c2_camp2_as1_ads: AdNode[] = [
  { id: 'c2-c2-as1-ad1', name: 'Post Tendências', type: 'ad', metrics: { cpm: 5.0, ctr: 4.0, cpc: 0.5, roas: null } },
  { id: 'c2-c2-as1-ad2', name: 'Guia de Presentes', type: 'ad', metrics: { cpm: 7.8, ctr: 2.5, cpc: 1.1, roas: null } },
];

const c3_camp1_as1_ads: AdNode[] = [
  { id: 'c3-c1-as1-ad1', name: 'Oferta Multifocal', type: 'ad', metrics: { cpm: 16.0, ctr: 0.7, cpc: 3.2, roas: 0.8 } },
  { id: 'c3-c1-as1-ad2', name: 'Solar 2por1', type: 'ad', metrics: { cpm: 10.2, ctr: 1.9, cpc: 1.5, roas: 2.9 } },
  { id: 'c3-c1-as1-ad3', name: 'Consulta Grátis', type: 'ad', metrics: { cpm: 8.0, ctr: 2.6, cpc: 1.0, roas: 3.5 } },
];
const c3_camp1_as2_ads: AdNode[] = [
  { id: 'c3-c1-as2-ad1', name: 'Vídeo Exame', type: 'ad', metrics: { cpm: 18.0, ctr: 0.5, cpc: 4.0, roas: 0.5 } },
  { id: 'c3-c1-as2-ad2', name: 'Imagem Armação', type: 'ad', metrics: { cpm: 9.5, ctr: 2.2, cpc: 1.2, roas: 3.1 } },
];

function adsetMetrics(ads: AdNode[]): Record<string, number | null> {
  const keys = ['cpm', 'ctr', 'cpc', 'roas'];
  const r: Record<string, number | null> = {};
  for (const k of keys) {
    const vals = ads.map(a => a.metrics[k]).filter(v => v !== null) as number[];
    r[k] = vals.length ? avg(vals) : null;
  }
  return r;
}

function campaignMetrics(adsets: AdNode[]): Record<string, number | null> {
  const allAds: AdNode[] = adsets.flatMap(as => as.children ?? []);
  return adsetMetrics(allAds);
}

function clientMetrics(campaigns: AdNode[]): Record<string, number | null> {
  const allAds: AdNode[] = campaigns.flatMap(c => (c.children ?? []).flatMap(as => as.children ?? []));
  return adsetMetrics(allAds);
}

const c1_camp1_as1: AdNode = { id: 'c1-c1-as1', name: 'Conjunto - Interesse Moda', type: 'adset', metrics: adsetMetrics(c1_camp1_as1_ads), children: c1_camp1_as1_ads };
const c1_camp1_as2: AdNode = { id: 'c1-c1-as2', name: 'Conjunto - Lookalike', type: 'adset', metrics: adsetMetrics(c1_camp1_as2_ads), children: c1_camp1_as2_ads };
const c1_camp1: AdNode = { id: 'c1-c1', name: 'Campanha Verão 2025', type: 'campaign', metrics: campaignMetrics([c1_camp1_as1, c1_camp1_as2]), children: [c1_camp1_as1, c1_camp1_as2] };

const c1_camp2_as1: AdNode = { id: 'c1-c2-as1', name: 'Conjunto - Visitantes 7d', type: 'adset', metrics: adsetMetrics(c1_camp2_as1_ads), children: c1_camp2_as1_ads };
const c1_camp2: AdNode = { id: 'c1-c2', name: 'Remarketing Carrinho', type: 'campaign', metrics: campaignMetrics([c1_camp2_as1]), children: [c1_camp2_as1] };

const c2_camp1_as1: AdNode = { id: 'c2-c1-as1', name: 'Conjunto - Mulheres 25-45', type: 'adset', metrics: adsetMetrics(c2_camp1_as1_ads), children: c2_camp1_as1_ads };
const c2_camp1_as2: AdNode = { id: 'c2-c1-as2', name: 'Conjunto - Remarketing', type: 'adset', metrics: adsetMetrics(c2_camp1_as2_ads), children: c2_camp1_as2_ads };
const c2_camp1: AdNode = { id: 'c2-c1', name: 'Lançamento Acessórios', type: 'campaign', metrics: campaignMetrics([c2_camp1_as1, c2_camp1_as2]), children: [c2_camp1_as1, c2_camp1_as2] };

const c2_camp2_as1: AdNode = { id: 'c2-c2-as1', name: 'Conjunto - Aberto', type: 'adset', metrics: adsetMetrics(c2_camp2_as1_ads), children: c2_camp2_as1_ads };
const c2_camp2: AdNode = { id: 'c2-c2', name: 'Tráfego Blog', type: 'campaign', metrics: campaignMetrics([c2_camp2_as1]), children: [c2_camp2_as1] };

const c3_camp1_as1: AdNode = { id: 'c3-c1-as1', name: 'Conjunto - Região Sul', type: 'adset', metrics: adsetMetrics(c3_camp1_as1_ads), children: c3_camp1_as1_ads };
const c3_camp1_as2: AdNode = { id: 'c3-c1-as2', name: 'Conjunto - Capital', type: 'adset', metrics: adsetMetrics(c3_camp1_as2_ads), children: c3_camp1_as2_ads };
const c3_camp1: AdNode = { id: 'c3-c1', name: 'Promoção Lentes', type: 'campaign', metrics: campaignMetrics([c3_camp1_as1, c3_camp1_as2]), children: [c3_camp1_as1, c3_camp1_as2] };

export const MOCK_DATA: AdNode[] = [
  {
    id: 'c1', name: 'Lívet', type: 'client',
    metrics: clientMetrics([c1_camp1, c1_camp2]),
    children: [c1_camp1, c1_camp2],
  },
  {
    id: 'c2', name: 'Gata Estilosa', type: 'client',
    metrics: clientMetrics([c2_camp1, c2_camp2]),
    children: [c2_camp1, c2_camp2],
  },
  {
    id: 'c3', name: 'Óticas Visão', type: 'client',
    metrics: clientMetrics([c3_camp1]),
    children: [c3_camp1],
  },
];
