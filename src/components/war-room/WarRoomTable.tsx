import { useState, useMemo } from 'react';
import { ChevronRight, AlertTriangle, CheckCircle2, Settings2 } from 'lucide-react';
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

// Row for campaign / adset / ad levels (uses parent-passed metrics)
const Row = ({
  node, depth, metrics, alertsOnly, allMetricIds,
}: {
  node: AdNode;
  depth: number;
  metrics: MetricConfig[];
  alertsOnly: boolean;
  allMetricIds: string[];
}) => {
  const [expanded, setExpanded] = useState(false);
  const activeMetrics = useMemo(() => metrics.filter(m => m.active), [metrics]);
  const hasChildren = node.children && node.children.length > 0;
  const counts = useMemo(() => countAlerts(node, metrics), [node, metrics]);
  const worstStatus = useMemo(() => getNodeWorstStatus(node, metrics), [node, metrics]);

  if (!shouldShow(node, metrics, alertsOnly)) return null;

  const visibleChildren = node.children?.filter(c => shouldShow(c, metrics, alertsOnly));

  // Show metrics for ALL levels (not just ad), using averaged values stored in node.metrics
  const showMetrics = true;

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
              <span className="w-4" />
            )}
            <span className={cn(
              'font-medium truncate max-w-[240px]',
              node.type === 'campaign' ? 'text-gray-300 text-xs' :
              node.type === 'adset' ? 'text-gray-400 text-xs' :
              'text-gray-300 text-xs'
            )}>
              {node.name}
            </span>
            {hasChildren && <AlertBadges counts={counts} />}
          </div>
        </td>

        {/* Status */}
        <td className="py-2.5 px-3">
          <StatusIcon status={worstStatus} />
        </td>

        {/* Metrics — shown at all levels, using averaged values */}
        {allMetricIds.map(mid => {
          const metricCfg = activeMetrics.find(m => m.id === mid);
          if (!metricCfg) return <td key={mid} className="py-2.5 px-3" />;
          const val = node.metrics[mid] ?? null;
          const status = getMetricStatus(val, metricCfg);
          const tooltip = getMetricTooltip(val, metricCfg);
          return (
            <td key={mid} className="py-2.5 px-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    'text-xs font-mono px-2 py-1 rounded',
                    node.type === 'ad' ? CELL_BG[status] : `${CELL_BG[status]} opacity-70`
                  )}>
                    {formatMetricValue(val, metricCfg)}
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
        <Row key={child.id} node={child} depth={depth + 1} metrics={metrics} alertsOnly={alertsOnly} allMetricIds={allMetricIds} />
      ))}
    </>
  );
};

// Client-level row (has its own metrics config)
const ClientRow = ({
  node, metrics, alertsOnly, allMetricIds, onOpenSettings,
}: {
  node: AdNode;
  metrics: MetricConfig[];
  alertsOnly: boolean;
  allMetricIds: string[];
  onOpenSettings: () => void;
}) => {
  const [expanded, setExpanded] = useState(true);
  const activeMetrics = useMemo(() => metrics.filter(m => m.active), [metrics]);
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
        {/* Name */}
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

        {/* Status */}
        <td className="py-3 px-3">
          <StatusIcon status={worstStatus} />
        </td>

        {/* Client-level averaged metrics */}
        {allMetricIds.map(mid => {
          const metricCfg = activeMetrics.find(m => m.id === mid);
          if (!metricCfg) return <td key={mid} className="py-3 px-3" />;
          const val = node.metrics[mid] ?? null;
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
        />
      ))}
    </>
  );
};

export const WarRoomTable = ({ data, clientMetricsMap, alertsOnly, onOpenClientSettings }: Props) => {
  // Build union of all active metric ids across all clients for column headers
  const allMetricIds = useMemo(() => {
    const seen = new Set<string>();
    const ids: string[] = [];
    for (const client of data) {
      const metrics = clientMetricsMap[client.id] ?? [];
      for (const m of metrics) {
        if (m.active && !seen.has(m.id)) {
          seen.add(m.id);
          ids.push(m.id);
        }
      }
    }
    return ids;
  }, [data, clientMetricsMap]);

  // Build a map of metricId → name for the header (use first client that has it)
  const metricNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const client of data) {
      const metrics = clientMetricsMap[client.id] ?? [];
      for (const m of metrics) {
        if (!map[m.id]) map[m.id] = m.name;
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
            {allMetricIds.map(id => (
              <th key={id} className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center min-w-[100px]">
                {metricNameMap[id] ?? id}
              </th>
            ))}
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
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
