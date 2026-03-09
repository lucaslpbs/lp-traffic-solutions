import { useState, useMemo } from 'react';
import { ChevronRight, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AdNode, MetricConfig, AlertStatus,
  getMetricStatus, getMetricTooltip, formatMetricValue,
  getWorstStatus, countAlerts,
} from '@/types/war-room';

interface Props {
  data: AdNode[];
  metrics: MetricConfig[];
  alertsOnly: boolean;
}

const INDENT = 24;
const LEVEL_BG: Record<string, string> = {
  client: 'bg-[#1f2330]',
  campaign: 'bg-[#161922]',
  adset: 'bg-[#12141b]',
  ad: 'bg-transparent',
};

const STATUS_COLORS: Record<AlertStatus, string> = {
  critical: 'text-red-500',
  warning: 'text-yellow-500',
  healthy: 'text-green-500',
  none: 'text-gray-600',
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

const Row = ({ node, depth, metrics, alertsOnly }: { node: AdNode; depth: number; metrics: MetricConfig[]; alertsOnly: boolean }) => {
  const [expanded, setExpanded] = useState(node.type === 'client');
  const activeMetrics = useMemo(() => metrics.filter(m => m.active), [metrics]);
  const hasChildren = node.children && node.children.length > 0;
  const counts = useMemo(() => countAlerts(node, metrics), [node, metrics]);
  const worstStatus = useMemo(() => getNodeWorstStatus(node, metrics), [node, metrics]);

  if (!shouldShow(node, metrics, alertsOnly)) return null;

  const visibleChildren = node.children?.filter(c => shouldShow(c, metrics, alertsOnly));

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
        <td className="py-2.5 pr-3 whitespace-nowrap sticky left-0 z-10" style={{ paddingLeft: depth * INDENT + 12 }}>
          <div className="flex items-center gap-2">
            {/* Tree connector */}
            {depth > 0 && (
              <div className="flex items-center" style={{ width: 16 }}>
                <div className="border-l border-b border-white/10 h-3 w-3 rounded-bl-sm" />
              </div>
            )}
            {/* Chevron */}
            {hasChildren ? (
              <ChevronRight className={cn('h-4 w-4 text-gray-500 transition-transform duration-200 flex-shrink-0', expanded && 'rotate-90')} />
            ) : (
              <span className="w-4" />
            )}
            <span className={cn(
              'font-medium truncate max-w-[240px]',
              node.type === 'client' ? 'text-white text-sm' : node.type === 'ad' ? 'text-gray-300 text-xs' : 'text-gray-400 text-xs'
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

        {/* Metrics */}
        {activeMetrics.map(m => {
          if (node.type !== 'ad') return <td key={m.id} className="py-2.5 px-3" />;
          const val = node.metrics[m.id] ?? null;
          const status = getMetricStatus(val, m);
          const tooltip = getMetricTooltip(val, m);
          return (
            <td key={m.id} className="py-2.5 px-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn('text-xs font-mono px-2 py-1 rounded', CELL_BG[status])}>
                    {formatMetricValue(val, m)}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-[#1a1d24] border-white/10 text-gray-200 text-xs">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            </td>
          );
        })}
      </tr>

      {expanded && visibleChildren?.map(child => (
        <Row key={child.id} node={child} depth={depth + 1} metrics={metrics} alertsOnly={alertsOnly} />
      ))}
    </>
  );
};

export const WarRoomTable = ({ data, metrics, alertsOnly }: Props) => {
  const activeMetrics = useMemo(() => metrics.filter(m => m.active), [metrics]);

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-[#0d0f14]">
            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 z-10 bg-[#0d0f14] min-w-[300px]">Nome</th>
            <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">Status</th>
            {activeMetrics.map(m => (
              <th key={m.id} className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center min-w-[100px]">{m.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(node => (
            <Row key={node.id} node={node} depth={0} metrics={metrics} alertsOnly={alertsOnly} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
