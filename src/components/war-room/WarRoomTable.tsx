import { useState, useMemo } from 'react';
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
};

const OBJECTIVE_LABEL: Record<string, string> = {
  OUTCOME_ENGAGEMENT: 'Engajamento',
  OUTCOME_TRAFFIC: 'Tráfego',
  OUTCOME_SALES: 'Vendas',
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
        <td className="py-2.5 pr-3 whitespace-nowrap sticky left-0 z-10" style={{ paddingLeft: depth * INDENT + 12, background: 'inherit' }}>
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
              'font-medium truncate max-w-[240px]',
              node.type === 'campaign' ? 'text-gray-300 text-xs' :
              node.type === 'adset' ? 'text-gray-400 text-xs' :
              'text-gray-300 text-xs'
            )}>
              {node.name}
            </span>

            {node.type === 'campaign' && node.objective && (
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0',
                OBJECTIVE_STYLE[node.objective] ?? 'bg-gray-500/20 text-gray-400'
              )}>
                {OBJECTIVE_LABEL[node.objective] ?? node.objective}
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
                <span className="text-xs font-mono px-2 py-1 rounded text-gray-600">
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
  node, metrics, alertsOnly, allMetricIds, onOpenSettings, previousMetricsMap,
}: {
  node: AdNode;
  metrics: MetricConfig[];
  alertsOnly: boolean;
  allMetricIds: string[];
  onOpenSettings: () => void;
  previousMetricsMap?: Record<string, Record<string, number | null>>;
}) => {
  const [expanded, setExpanded] = useState(true);
  const counts = useMemo(() => countAlerts(node, metrics), [node, metrics]);
  const worstStatus = useMemo(() => getNodeWorstStatus(node, metrics), [node, metrics]);

  if (alertsOnly && worstStatus !== 'critical' && worstStatus !== 'warning') return null;

  const visibleChildren = node.children?.filter(c => shouldShow(c, metrics, alertsOnly));

  return (
    <>
      <tr
        className="border-b border-white/10 bg-[#1f2330] hover:bg-[#242840] transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="py-3 pr-3 whitespace-nowrap sticky left-0 z-10 bg-[#1f2330]" style={{ paddingLeft: 12 }}>
          <div className="flex items-center gap-2">
            <ChevronRight className={cn('h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0', expanded && 'rotate-90')} />
            <span className="font-semibold text-white text-sm truncate max-w-[200px]">{node.name}</span>
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
                <span className="text-xs font-mono px-2 py-1 rounded text-gray-700">
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
          metrics={metrics}
          alertsOnly={alertsOnly}
          allMetricIds={allMetricIds}
          previousMetricsMap={previousMetricsMap}
        />
      ))}
    </>
  );
};

export const WarRoomTable = ({ data, clientMetricsMap, alertsOnly, onOpenClientSettings, previousMetricsMap }: Props) => {
  const allMetricIds = useMemo(() => {
    const seen = new Set<string>();
    const ids: string[] = [];
    for (const client of data) {
      const metrics = clientMetricsMap[client.id] ?? [];
      for (const m of metrics) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          ids.push(m.id);
        }
      }
    }
    return ids;
  }, [data, clientMetricsMap]);

  const metricLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const client of data) {
      const metrics = clientMetricsMap[client.id] ?? [];
      for (const m of metrics) {
        if (!map[m.id]) map[m.id] = m.label;
      }
    }
    return map;
  }, [data, clientMetricsMap]);

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-[#0d0f14]">
            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 z-10 bg-[#0d0f14] min-w-[300px]">Nome</th>
            <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">Status</th>
            {allMetricIds.map(id => {
              const isActive = data.some(c => (clientMetricsMap[c.id] ?? []).find(m => m.id === id)?.active);
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
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
