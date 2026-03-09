import { useState, useMemo, useEffect } from 'react';
import { Crosshair, Download, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { WarRoomTable } from '@/components/war-room/WarRoomTable';
import { MetricSettingsModal } from '@/components/war-room/MetricSettingsModal';
import {
  MetricConfig, MOCK_DATA, countAlerts,
  loadClientMetrics, saveClientMetrics,
} from '@/types/war-room';

/** Map of clientId → MetricConfig[] */
type ClientMetricsMap = Record<string, MetricConfig[]>;

const loadAllClientMetrics = (): ClientMetricsMap => {
  const map: ClientMetricsMap = {};
  for (const client of MOCK_DATA) {
    map[client.id] = loadClientMetrics(client.id);
  }
  return map;
};

const WarRoom = () => {
  const [clientMetricsMap, setClientMetricsMap] = useState<ClientMetricsMap>(loadAllClientMetrics);
  const [settingsClientId, setSettingsClientId] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState('all');
  const [alertsOnly, setAlertsOnly] = useState(false);

  // Persist whenever map changes
  useEffect(() => {
    for (const [id, metrics] of Object.entries(clientMetricsMap)) {
      saveClientMetrics(id, metrics);
    }
  }, [clientMetricsMap]);

  const filteredData = useMemo(() => {
    if (clientFilter === 'all') return MOCK_DATA;
    return MOCK_DATA.filter(c => c.id === clientFilter);
  }, [clientFilter]);

  const globalCounts = useMemo(() => {
    const totals = { critical: 0, warning: 0, healthy: 0 };
    for (const node of MOCK_DATA) {
      const metrics = clientMetricsMap[node.id] ?? [];
      const c = countAlerts(node, metrics);
      totals.critical += c.critical;
      totals.warning += c.warning;
      totals.healthy += c.healthy;
    }
    return totals;
  }, [clientMetricsMap]);

  const handleSaveMetrics = (clientId: string, metrics: MetricConfig[]) => {
    setClientMetricsMap(prev => ({ ...prev, [clientId]: metrics }));
  };

  const openSettings = (clientId: string) => setSettingsClientId(clientId);

  const exportCSV = () => {
    const rows: string[][] = [];
    const allMetricIds = ['cpm', 'ctr', 'cpc', 'roas'];
    const headers = ['Cliente', 'Campanha', 'Conjunto', 'Anúncio', ...allMetricIds.map(id => id.toUpperCase())];

    for (const client of filteredData) {
      const activeMetrics = (clientMetricsMap[client.id] ?? []).filter(m => m.active);
      for (const camp of client.children || []) {
        for (const adset of camp.children || []) {
          for (const ad of adset.children || []) {
            rows.push([
              client.name, camp.name, adset.name, ad.name,
              ...activeMetrics.map(m => ad.metrics[m.id]?.toString() ?? ''),
            ]);
          }
        }
      }
    }

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quarto-de-guerra.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const settingsClient = settingsClientId ? MOCK_DATA.find(c => c.id === settingsClientId) : null;

  return (
    <div className="p-6 space-y-6 min-h-screen bg-[#0d0f14]">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-600/20">
            <Crosshair className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Quarto de Guerra</h1>
            <div className="flex items-center gap-3 text-xs mt-1">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500 inline-block" /> {globalCounts.critical} críticos
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-yellow-500 inline-block" /> {globalCounts.warning} atenção
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500 inline-block" /> {globalCounts.healthy} saudáveis
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} className="border-white/10 text-gray-300 hover:bg-white/5 bg-transparent">
            <Download className="h-4 w-4 mr-1.5" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-[#1a1d24] border border-white/10">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-400 whitespace-nowrap">Cliente</Label>
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-44 bg-[#0d0f14] border-white/10 text-white text-xs h-8">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1d24] border-white/10">
              <SelectItem value="all">Todos</SelectItem>
              {MOCK_DATA.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Switch id="alerts-toggle" checked={alertsOnly} onCheckedChange={setAlertsOnly} />
          <Label htmlFor="alerts-toggle" className="text-xs text-gray-400 cursor-pointer">Mostrar apenas com alertas</Label>
        </div>
      </div>

      {/* Table — per client with its own metrics */}
      <WarRoomTable
        data={filteredData}
        clientMetricsMap={clientMetricsMap}
        alertsOnly={alertsOnly}
        onOpenClientSettings={openSettings}
      />

      {/* Settings modal — opens for a specific client */}
      {settingsClient && (
        <MetricSettingsModal
          key={settingsClient.id}
          open={!!settingsClientId}
          onOpenChange={open => { if (!open) setSettingsClientId(null); }}
          clientName={settingsClient.name}
          metrics={clientMetricsMap[settingsClient.id] ?? []}
          onSave={metrics => handleSaveMetrics(settingsClient.id, metrics)}
        />
      )}
    </div>
  );
};

export default WarRoom;
