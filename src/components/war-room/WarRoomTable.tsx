import { useState, useMemo, useRef } from 'react';
import { ChevronRight, AlertTriangle, CheckCircle2, Settings2, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  AdNode, MetricConfig, AlertStatus,
  getMetricStatus, getMetricTooltip, formatMetricValue,
  getWorstStatus, countAlerts,
} from '@/types/war-room';

interface Props {
  data: AdNode[];
  clientMetricsMap: Record<string, MetricConfig[]>;
  // per-client, per-objective overrides: clientId -> objective -> MetricConfig[]
  clientObjectiveMap: Record<string, Record<string, MetricConfig[]>>;
  alertsOnly: boolean;
  onOpenClientSettings: (clientId: string) => void;
  previousMetricsMap?: Record<string, Record<string, number | null>>;
}

const INDENT = 24;
const LEVEL_BG: Record<string, string> = {
  client: 'bg-[#1f2330]',
  campaign: 'bg-[#161922]',
  adset: 'bg-[#12141b]',
  ad: 'bg-transparent',
};

// Solid background for sticky Name column (must not be transparent)
const NAME_STICKY_BG: Record<string, string> = {
  client: '#1f2330',
  campaign: '#161922',
  adset: '#12141b',
  ad: '#0d0f14',
};

const CELL_BG: Record<AlertStatus, string> = {
  critical: 'bg-red-500/15 text-red-400',
  warning: 'bg-yellow-500/15 text-yellow-400',
  healthy: 'bg-green-500/15 text-green-400',
  none: 'text-gray-600',
};

const OBJECTIVE_STYLE: Record<string, string> = {
  OUTCOME_ENGAGEMENT: 'bg-blue-500/20 text-blue-400',
  OUTCOME_TRAFFIC: 'bg-green-500/20 text-green-400',
  OUTCOME_SALES: 'bg-orange-500/20 text-orange-400',
  OUTCOME_AWARENESS: 'bg-purple-500/20 text-purple-400',
};

const OBJECTIVE_LABEL: Record<string, string> = {
  OUTCOME_ENGAGEMENT: 'Engajamento',
  OUTCOME_TRAFFIC: 'Tráfego',
  OUTCOME_SALES: 'Vendas',
  OUTCOME_AWARENESS: 'Reconhecimento',
};

const TIPO_STYLE: Record<string, string> = {
  engajamento: 'bg-blue-500/20 text-blue-400',
  trafego: 'bg-green-500/20 text-green-400',
  vendas: 'bg-orange-500/20 text-orange-400',
  reconhecimento: 'bg-purple-500/20 text-purple-400',
};

const TIPO_LABEL: Record<string, string> = {
  engajamento: 'Engajamento',
  trafego: 'Tráfego',
  vendas: 'Vendas',
  reconhecimento: 'Reconhecimento',
};

function StatusIcon({ status }: { status: AlertStatus }) {
  if (status === 'critical') return (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
    </span>
  );
  if (status === 'warning') return <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />;
  if (status === 'healthy') return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
  return <span className="h-3 w-3 rounded-full bg-gray-700 inline-block" />;
}

function AlertBadges({ counts }: { counts: { critical: number; warning: number; healthy: number } }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {counts.critical > 0 && <span className="text-red-400">🔴{counts.critical}</span>}
      {counts.warning > 0 && <span className="text-yellow-400">🟡{counts.warning}</span>}
    </div>
  );
}

function VariationBadge({ current, previous, config }: {
  current: number | null;
  previous: number | null;
  config: MetricConfig;
}) {
  if (current === null || previous === null || previous === 0) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  if (Math.abs(pct) < 0.1) return null;
  const isUp = pct > 0;
  const isGood = config.direction === 'lower' ? !isUp : isUp;
  return (
    <span className={cn('text-[10px] font-mono ml-1 flex-shrink-0', isGood ? 'text-green-400' : 'text-red-400')}>
      {isUp ? '▲' : '▼'}{Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function AdThumbnail({ node }: { node: AdNode }) {
  if (node.type !== 'ad') return null;
  if (node.creative?.thumbnailUrl) {
    return (
      <img
        src={node.creative.thumbnailUrl}
        alt=""
        className="h-8 w-8 rounded object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div className="h-8 w-8 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
      <Image className="h-4 w-4 text-gray-600" />
    </div>
  );
}

function getNodeWorstStatus(node: AdNode, metrics: MetricConfig[]): AlertStatus {
  if (node.type === 'ad') {
    const active = metrics.filter(m => m.active);
    return getWorstStatus(active.map(m => getMetricStatus(node.metrics[m.id] ?? null, m)));
  }
  if (!node.children) return 'none';
  return getWorstStatus(node.children.map(c => getNodeWorstStatus(c, metrics)));
}

function shouldShow(node: AdNode, metrics: MetricConfig[], alertsOnly: boolean): boolean {
  if (!alertsOnly) return true;
  const status = getNodeWorstStatus(node, metrics);
  return status === 'critical' || status === 'warning';
}

const Row = ({
  node, depth, metrics, alertsOnly, allMetricIds, previousMetricsMap,
}: {
  node: AdNode;
  depth: number;
  metrics: MetricConfig[];
  alertsOnly: boolean;
  allMetricIds: string[];
  previousMetricsMap?: Record<string, Record<string, number | null>>;
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const counts = useMemo(() => countAlerts(node, metrics), [node, metrics]);
  const worstStatus = useMemo(() => getNodeWorstStatus(node, metrics), [node, metrics]);

  if (!shouldShow(node, metrics, alertsOnly)) return null;

  const visibleChildren = node.children?.filter(c => shouldShow(c, metrics, alertsOnly));
  const prevMetrics = node.type === 'ad' ? (previousMetricsMap?.[node.id] ?? null) : null;

  return (
    <>
      <tr
        className={cn(
          'border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer',
          LEVEL_BG[node.type]
        )}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Name */}
        <td className="py-2.5 pr-3 sticky left-0 z-20" style={{ paddingLeft: depth * INDENT + 12, background: NAME_STICKY_BG[node.type] }}>
          <div className="flex items-center gap-2">
            {depth > 0 && (
              <div className="flex items-center" style={{ width: 16 }}>
                <div className="border-l border-b border-white/10 h-3 w-3 rounded-bl-sm" />
              </div>
            )}
            {hasChildren ? (
              <ChevronRight className={cn('h-4 w-4 text-gray-500 transition-transform duration-200 flex-shrink-0', expanded && 'rotate-90')} />
            ) : (
              <span className="w-4 flex-shrink-0" />
            )}

            {node.type === 'ad' && <AdThumbnail node={node} />}

            {node.type === 'ad' && node.status && (
              <span className={cn(
                'h-2 w-2 rounded-full inline-block flex-shrink-0',
                node.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-600'
              )} />
            )}

            <span className={cn(
              'font-medium break-words max-w-[280px]',
              node.type === 'campaign' ? 'text-gray-300 text-xs' :
              node.type === 'adset' ? 'text-gray-400 text-xs' :
              'text-gray-300 text-xs'
            )}>
              {node.name}
            </span>

            {node.type === 'campaign' && (node.tipo || node.objective) && (
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0',
                node.tipo
                  ? (TIPO_STYLE[node.tipo] ?? 'bg-gray-500/20 text-gray-400')
                  : (OBJECTIVE_STYLE[node.objective!] ?? 'bg-gray-500/20 text-gray-400')
              )}>
                {node.tipo
                  ? (TIPO_LABEL[node.tipo] ?? node.tipo)
                  : (OBJECTIVE_LABEL[node.objective!] ?? node.objective)}
              </span>
            )}

            {hasChildren && <AlertBadges counts={counts} />}
          </div>
        </td>

        {/* Status */}
        <td className="py-2.5 px-3">
          <StatusIcon status={worstStatus} />
        </td>

        {/* Metrics */}
        {allMetricIds.map(mid => {
          const metricCfg = metrics.find(m => m.id === mid);
          if (!metricCfg) return <td key={mid} className="py-2.5 px-3" />;
          const val = node.metrics[mid] ?? null;
          const prevVal = prevMetrics?.[mid] ?? null;
          if (!metricCfg.active) {
            return (
              <td key={mid} className="py-2.5 px-3">
                <span className="text-xs font-mono px-2 py-1 rounded bg-white text-gray-900">
                  {formatMetricValue(val, metricCfg)}
                </span>
              </td>
            );
          }
          const status = getMetricStatus(val, metricCfg);
          const tooltip = getMetricTooltip(val, metricCfg);
          return (
            <td key={mid} className="py-2.5 px-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    'text-xs font-mono px-2 py-1 rounded inline-flex items-center gap-0.5',
                    node.type === 'ad' ? CELL_BG[status] : `${CELL_BG[status]} opacity-70`
                  )}>
                    {formatMetricValue(val, metricCfg)}
                    {node.type === 'ad' && (
                      <VariationBadge current={val} previous={prevVal} config={metricCfg} />
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-[#1a1d24] border-white/10 text-gray-200 text-xs">
                  {node.type !== 'ad' ? `Média: ${tooltip}` : tooltip}
                </TooltipContent>
              </Tooltip>
            </td>
          );
        })}
      </tr>

      {expanded && visibleChildren?.map(child => (
        <Row
          key={child.id}
          node={child}
          depth={depth + 1}
          metrics={metrics}
          alertsOnly={alertsOnly}
          allMetricIds={allMetricIds}
          previousMetricsMap={previousMetricsMap}
        />
      ))}
    </>
  );
};

const ClientRow = ({
  node, metrics, alertsOnly, allMetricIds, onOpenSettings, previousMetricsMap, objectiveMetrics,
}: {
  node: AdNode;
  metrics: MetricConfig[];
  alertsOnly: boolean;
  allMetricIds: string[];
  onOpenSettings: () => void;
  previousMetricsMap?: Record<string, Record<string, number | null>>;
  objectiveMetrics: Record<string, MetricConfig[]>;
}) => {
  const [expanded, setExpanded] = useState(true);

  // Map Facebook objective → tipo key (fallback when campaign.tipo not set)
  const OBJECTIVE_TO_TIPO: Record<string, string> = {
    OUTCOME_ENGAGEMENT: 'engajamento',
    OUTCOME_TRAFFIC: 'trafego',
    OUTCOME_SALES: 'vendas',
    OUTCOME_AWARENESS: 'reconhecimento',
  };

  // Resolve metrics per campaign: prefer campaign.tipo, fallback to derived from objective
  const campaignMetrics = (campaign: AdNode): MetricConfig[] => {
    const tipo = campaign.tipo ?? (campaign.objective ? OBJECTIVE_TO_TIPO[campaign.objective] : undefined);
    return (tipo && objectiveMetrics[tipo]) || metrics;
  };

  const counts = useMemo(() => {
    const totals = { critical: 0, warning: 0, healthy: 0 };
    for (const campaign of node.children ?? []) {
      const c = countAlerts(campaign, campaignMetrics(campaign));
      totals.critical += c.critical;
      totals.warning += c.warning;
      totals.healthy += c.healthy;
    }
    return totals;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, metrics, objectiveMetrics]);

  const worstStatus = useMemo(() =>
    getWorstStatus((node.children ?? []).map(c => getNodeWorstStatus(c, campaignMetrics(c))))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , [node, metrics, objectiveMetrics]);

  if (alertsOnly && worstStatus !== 'critical' && worstStatus !== 'warning') return null;

  const visibleChildren = node.children?.filter(campaign => {
    if (!alertsOnly) return true;
    const status = getNodeWorstStatus(campaign, campaignMetrics(campaign));
    return status === 'critical' || status === 'warning';
  });

  return (
    <>
      <tr
        className="border-b border-white/10 bg-[#1f2330] hover:bg-[#242840] transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="py-3 pr-3 sticky left-0 z-20" style={{ paddingLeft: 12, background: NAME_STICKY_BG.client }}>
          <div className="flex items-center gap-2">
            <ChevronRight className={cn('h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0', expanded && 'rotate-90')} />
            <span className="font-semibold text-white text-sm break-words max-w-[280px]">{node.name}</span>
            <AlertBadges counts={counts} />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 ml-1"
              onClick={e => { e.stopPropagation(); onOpenSettings(); }}
              title="Configurar métricas"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </td>

        <td className="py-3 px-3">
          <StatusIcon status={worstStatus} />
        </td>

        {allMetricIds.map(mid => {
          const metricCfg = metrics.find(m => m.id === mid);
          if (!metricCfg) return <td key={mid} className="py-3 px-3" />;
          const val = node.metrics[mid] ?? null;
          if (!metricCfg.active) {
            return (
              <td key={mid} className="py-3 px-3">
                <span className="text-xs font-mono px-2 py-1 rounded bg-white text-gray-900">
                  {formatMetricValue(val, metricCfg)}
                </span>
              </td>
            );
          }
          const status = getMetricStatus(val, metricCfg);
          const tooltip = getMetricTooltip(val, metricCfg);
          return (
            <td key={mid} className="py-3 px-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn('text-xs font-mono px-2 py-1 rounded opacity-70', CELL_BG[status])}>
                    {formatMetricValue(val, metricCfg)}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-[#1a1d24] border-white/10 text-gray-200 text-xs">
                  Média: {tooltip}
                </TooltipContent>
              </Tooltip>
            </td>
          );
        })}
      </tr>

      {expanded && visibleChildren?.map(child => (
        <Row
          key={child.id}
          node={child}
          depth={1}
          metrics={campaignMetrics(child)}
          alertsOnly={alertsOnly}
          allMetricIds={allMetricIds}
          previousMetricsMap={previousMetricsMap}
        />
      ))}
    </>
  );
};

const NAME_COL_STORAGE_KEY = 'war-room-name-col-width';

export const WarRoomTable = ({ data, clientMetricsMap, clientObjectiveMap, alertsOnly, onOpenClientSettings, previousMetricsMap }: Props) => {
  const [nameColWidth, setNameColWidth] = useState(() => {
    const stored = localStorage.getItem(NAME_COL_STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 300;
  });
  const resizeRef = useRef<{ startX: number; startW: number } | null>(null);

  const onResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    resizeRef.current = { startX: e.clientX, startW: nameColWidth };
    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const next = Math.max(160, resizeRef.current.startW + (ev.clientX - resizeRef.current.startX));
      setNameColWidth(next);
    };
    const onUp = () => {
      setNameColWidth(prev => {
        localStorage.setItem(NAME_COL_STORAGE_KEY, String(prev));
        return prev;
      });
      resizeRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const allMetricIds = useMemo(() => {
    const seen = new Set<string>();
    const ids: string[] = [];
    const add = (m: MetricConfig) => { if (!seen.has(m.id)) { seen.add(m.id); ids.push(m.id); } };
    for (const client of data) {
      (clientMetricsMap[client.id] ?? []).forEach(add);
      Object.values(clientObjectiveMap[client.id] ?? {}).forEach((ms: MetricConfig[]) => ms.forEach(add));
    }
    return ids;
  }, [data, clientMetricsMap, clientObjectiveMap]);

  const metricLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    const add = (m: MetricConfig) => { if (!map[m.id]) map[m.id] = m.label; };
    for (const client of data) {
      (clientMetricsMap[client.id] ?? []).forEach(add);
      Object.values(clientObjectiveMap[client.id] ?? {}).forEach((ms: MetricConfig[]) => ms.forEach(add));
    }
    return map;
  }, [data, clientMetricsMap, clientObjectiveMap]);

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-[#0d0f14]">
            <th
              className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 z-30 bg-[#0d0f14] relative select-none"
              style={{ width: nameColWidth, minWidth: nameColWidth }}
            >
              Nome
              <div
                onMouseDown={onResizeStart}
                className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-500/40 active:bg-blue-500/60 transition-colors"
              />
            </th>
            <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">Status</th>
            {allMetricIds.map(id => {
              const isActive =
                data.some(c => (clientMetricsMap[c.id] ?? []).find(m => m.id === id)?.active) ||
                data.some(c => Object.values(clientObjectiveMap[c.id] ?? {}).some((ms: MetricConfig[]) => ms.find(m => m.id === id)?.active));
              return (
                <th key={id} className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider text-center min-w-[100px] ${isActive ? 'text-gray-500' : 'text-gray-700'}`}>
                  {metricLabelMap[id] ?? id}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map(client => (
            <ClientRow
              key={client.id}
              node={client}
              metrics={clientMetricsMap[client.id] ?? []}
              alertsOnly={alertsOnly}
              allMetricIds={allMetricIds}
              onOpenSettings={() => onOpenClientSettings(client.id)}
              previousMetricsMap={previousMetricsMap}
              objectiveMetrics={clientObjectiveMap[client.id] ?? {}}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
