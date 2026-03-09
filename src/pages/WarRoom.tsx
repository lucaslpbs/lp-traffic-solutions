import { useState, useMemo, useEffect } from 'react';
import { Crosshair, Download, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { WarRoomTable } from '@/components/war-room/WarRoomTable';
import { MetricSettingsModal } from '@/components/war-room/MetricSettingsModal';
import { MetricConfig, DEFAULT_METRICS, MOCK_DATA, countAlerts } from '@/types/war-room';

const STORAGE_KEY = 'war-room-metrics';

const loadMetrics = (): MetricConfig[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_METRICS;
};

const WarRoom = () => {
  const [metrics, setMetrics] = useState<MetricConfig[]>(loadMetrics);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [clientFilter, setClientFilter] = useState('all');
  const [alertsOnly, setAlertsOnly] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
  }, [metrics]);

  const filteredData = useMemo(() => {
    if (clientFilter === 'all') return MOCK_DATA;
    return MOCK_DATA.filter(c => c.id === clientFilter);
  }, [clientFilter]);

  const globalCounts = useMemo(() => {
    const totals = { critical: 0, warning: 0, healthy: 0 };
    for (const node of MOCK_DATA) {
      const c = countAlerts(node, metrics);
      totals.critical += c.critical;
      totals.warning += c.warning;
      totals.healthy += c.healthy;
    }
    return totals;
  }, [metrics]);

  const exportCSV = () => {
    const activeMetrics = metrics.filter(m => m.active);
    const headers = ['Cliente', 'Campanha', 'Conjunto', 'Anúncio', ...activeMetrics.map(m => m.name)];
    const rows: string[][] = [];

    for (const client of filteredData) {
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
          <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)} className="border-white/10 text-gray-300 hover:bg-white/5 bg-transparent">
            <Settings2 className="h-4 w-4 mr-1.5" /> Configurar Métricas
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

      {/* Table */}
      <WarRoomTable data={filteredData} metrics={metrics} alertsOnly={alertsOnly} />

      <MetricSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} metrics={metrics} onSave={setMetrics} />
    </div>
  );
};

export default WarRoom;
