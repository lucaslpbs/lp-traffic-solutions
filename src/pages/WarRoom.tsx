import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Crosshair, Download, RefreshCw, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { WarRoomTable } from '@/components/war-room/WarRoomTable';
import { MetricSettingsModal } from '@/components/war-room/MetricSettingsModal';
import { MetricsSelectorDropdown } from '@/components/war-room/MetricsSelectorDropdown';
import {
  AdNode, MetricConfig, DateRange,
  countAlerts, detectAvailableMetrics, buildMetricsFromIds,
  getPreviousPeriod, getCurrentPeriodDates, buildWarRoomUrl, fmtDateBR,
  MOCK_DATA, DEFAULT_METRICS, TIPO_KEYS,
} from '@/types/war-room';

type ClientMetricsMap = Record<string, MetricConfig[]>;

const API_BASE = 'https://n8n.trafficsolutions.cloud/webhook';

const DATE_PRESET_LABELS: Record<string, string> = {
  today: 'Hoje',
  last_7d: '7 dias',
  last_15d: '15 dias',
  last_30d: '30 dias',
};

const WarRoom = () => {
  // Data
  const [data, setData] = useState<AdNode[]>([]);
  const [previousData, setPreviousData] = useState<AdNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Metrics config
  const [globalMetrics, setGlobalMetrics] = useState<MetricConfig[]>([]);
  const [clientMetricsMap, setClientMetricsMap] = useState<ClientMetricsMap>({});
  // Per-client, per-objective overrides: clientId -> objective -> MetricConfig[]
  const [clientObjectiveMetrics, setClientObjectiveMetrics] = useState<Record<string, Record<string, MetricConfig[]>>>({});

  // UI
  const [dateRange, setDateRange] = useState<DateRange>({ preset: 'last_7d' });
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [settingsClientId, setSettingsClientId] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState('all');
  const [alertsOnly, setAlertsOnly] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const metricsInitialized = useRef(false);

  const buildEffectiveRange = useCallback((): DateRange => {
    if (dateRange.preset === 'custom' && customStart && customEnd) {
      return { preset: 'custom', customStart, customEnd };
    }
    return dateRange;
  }, [dateRange, customStart, customEnd]);

  const fetchWarRoom = useCallback(async (range: DateRange, initMetrics: boolean) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);

    try {
      const { start: curStart, end: curEnd } = getCurrentPeriodDates(range);
      const { start: prevStart, end: prevEnd } = getPreviousPeriod(range);

      const currentUrl = buildWarRoomUrl(curStart, curEnd);
      const previousUrl = buildWarRoomUrl(prevStart, prevEnd);

      const fetches: Promise<Response | null>[] = [
        fetch(currentUrl, { signal: ctrl.signal }),
        fetch(previousUrl, { signal: ctrl.signal }).catch(() => null),
      ];

      if (initMetrics) {
        fetches.push(
          fetch(`${API_BASE}/get-metrics`, { signal: ctrl.signal }).catch(() => null)
        );
      }

      const results = await Promise.all(fetches);
      if (ctrl.signal.aborted) return;

      const [currentRes, previousRes, metricsRes] = results;

      const currentData: AdNode[] = currentRes?.ok ? await currentRes.json() : MOCK_DATA;
      const prevData: AdNode[] = previousRes?.ok ? await previousRes.json() : [];

      setData(currentData);
      setPreviousData(prevData);

      if (initMetrics) {
        // Load all metrics from API only (no localStorage)
        let apiMetrics: Record<string, MetricConfig[]> = {};
        if (metricsRes?.ok) {
          try { apiMetrics = await metricsRes.json(); } catch {}
        }

        const availableIds = detectAvailableMetrics(currentData);
        const globalOverrides = apiMetrics['global'] ?? [];

        const newGlobal = availableIds.length > 0
          ? buildMetricsFromIds(availableIds, globalOverrides)
          : (globalOverrides.length > 0 ? globalOverrides : DEFAULT_METRICS);
        setGlobalMetrics(newGlobal);

        // Per-client overrides from API response
        const newClientMap: ClientMetricsMap = {};
        const newClientObjMetrics: Record<string, Record<string, MetricConfig[]>> = {};
        for (const client of currentData) {
          const clientApi = apiMetrics[client.id];
          if (clientApi) {
            newClientMap[client.id] = availableIds.length > 0
              ? buildMetricsFromIds(availableIds, clientApi)
              : clientApi;
          }
          // Per-client, per-tipo overrides (key: clientId__tipo)
          for (const tipoKey of TIPO_KEYS) {
            const apiKey = `${client.id}__${tipoKey}`;
            if (apiMetrics[apiKey]) {
              if (!newClientObjMetrics[client.id]) newClientObjMetrics[client.id] = {};
              newClientObjMetrics[client.id][tipoKey] = apiMetrics[apiKey];
            }
          }
        }
        setClientMetricsMap(newClientMap);
        setClientObjectiveMetrics(newClientObjMetrics);
        metricsInitialized.current = true;
      }
    } catch (e: unknown) {
      if (ctrl.signal.aborted) return;
      setError('Erro ao carregar dados. Verifique a conexão.');
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchWarRoom({ preset: 'last_7d' }, true);
    return () => abortRef.current?.abort();
  }, [fetchWarRoom]);

  const applyDateRange = (range: DateRange) => {
    setDateRange(range);
    fetchWarRoom(range, false);
  };

  const handlePresetClick = (preset: DateRange['preset']) => {
    if (preset === 'custom') {
      setShowCustomDate(v => !v);
      return;
    }
    setShowCustomDate(false);
    applyDateRange({ preset });
  };

  const handleCustomApply = () => {
    if (!customStart || !customEnd) return;
    applyDateRange({ preset: 'custom', customStart, customEnd });
    setShowCustomDate(false);
  };

  // Effective metrics map: per-client override or global
  const effectiveMetricsMap = useMemo<ClientMetricsMap>(() => {
    const map: ClientMetricsMap = {};
    for (const client of data) {
      map[client.id] = clientMetricsMap[client.id] ?? globalMetrics;
    }
    return map;
  }, [data, clientMetricsMap, globalMetrics]);

  const filteredData = useMemo(() => {
    if (clientFilter === 'all') return data;
    return data.filter(c => c.id === clientFilter);
  }, [data, clientFilter]);

  const globalCounts = useMemo(() => {
    const totals = { critical: 0, warning: 0, healthy: 0 };
    for (const node of data) {
      const metrics = effectiveMetricsMap[node.id] ?? globalMetrics;
      const c = countAlerts(node, metrics);
      totals.critical += c.critical;
      totals.warning += c.warning;
      totals.healthy += c.healthy;
    }
    return totals;
  }, [data, effectiveMetricsMap, globalMetrics]);

  const previousMetricsMap = useMemo(() => {
    const map: Record<string, Record<string, number | null>> = {};
    const collectAds = (nodes: AdNode[]) => {
      for (const node of nodes) {
        if (node.type === 'ad') map[node.id] = node.metrics;
        if (node.children) collectAds(node.children);
      }
    };
    collectAds(previousData);
    return map;
  }, [previousData]);

  const handleGlobalMetricsChange = (metrics: MetricConfig[]) => {
    setGlobalMetrics(metrics);
    fetch(`${API_BASE}/save-metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: 'global', metrics }),
    }).catch(() => {});
  };

  const handleSaveClientMetrics = (
    clientId: string,
    general: MetricConfig[],
    objectives: Record<string, MetricConfig[]>,
  ) => {
    setClientMetricsMap(prev => ({ ...prev, [clientId]: general }));
    fetch(`${API_BASE}/save-metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, metrics: general }),
    }).catch(() => {});

    setClientObjectiveMetrics(prev => ({ ...prev, [clientId]: objectives }));
    for (const [tipo, metrics] of Object.entries(objectives)) {
      fetch(`${API_BASE}/save-metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: `${clientId}__${tipo}`, metrics }),
      }).catch(() => {});
    }
  };

  const exportCSV = () => {
    const activeMetrics = globalMetrics.filter(m => m.active);
    const headers = ['Cliente', 'Campanha', 'Conjunto', 'Anúncio', ...activeMetrics.map(m => m.label)];
    const rows: string[][] = [];

    for (const client of filteredData) {
      const clientMetrics = effectiveMetricsMap[client.id] ?? globalMetrics;
      const clientActive = clientMetrics.filter(m => m.active);
      for (const camp of client.children || []) {
        for (const adset of camp.children || []) {
          for (const ad of adset.children || []) {
            rows.push([
              client.name, camp.name, adset.name, ad.name,
              ...clientActive.map(m => ad.metrics[m.id]?.toString() ?? ''),
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

  const settingsClient = settingsClientId ? data.find(c => c.id === settingsClientId) : null;

  // Comparison label
  const { start: prevStart, end: prevEnd } = getPreviousPeriod(buildEffectiveRange());
  const comparisonLabel = `${fmtDateBR(prevStart)} – ${fmtDateBR(prevEnd)}`;

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
            {!loading && !error && (
              <div className="flex items-center gap-3 text-xs mt-1 text-white">
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
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MetricsSelectorDropdown metrics={globalMetrics} onChange={handleGlobalMetricsChange} />
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={loading} className="border-white/10 text-gray-300 hover:bg-white/5 bg-transparent">
            <Download className="h-4 w-4 mr-1.5" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-[#1a1d24] border border-white/10">
        {/* Date presets */}
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
          {(['today', 'last_7d', 'last_15d', 'last_30d'] as const).map(preset => (
            <button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                dateRange.preset === preset && !showCustomDate
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {DATE_PRESET_LABELS[preset]}
            </button>
          ))}
          <button
            onClick={() => handlePresetClick('custom')}
            className={`text-xs px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              showCustomDate || dateRange.preset === 'custom'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Customizar <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Custom date picker */}
        {showCustomDate && (
          <div className="flex items-center gap-2 w-full mt-1">
            <Input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="h-7 text-xs w-36 bg-[#0d0f14] border-white/10 text-white"
            />
            <span className="text-gray-500 text-xs">até</span>
            <Input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="h-7 text-xs w-36 bg-[#0d0f14] border-white/10 text-white"
            />
            <Button size="sm" onClick={handleCustomApply} disabled={!customStart || !customEnd} className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              Aplicar
            </Button>
          </div>
        )}

        {/* Comparison period label */}
        {!loading && previousData.length > 0 && (
          <span className="text-[11px] text-gray-500 ml-auto">
            Comparando com: {comparisonLabel}
          </span>
        )}

        {/* Divider */}
        <div className="h-4 w-px bg-white/10 hidden lg:block" />

        {/* Client filter */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-400 whitespace-nowrap">Cliente</Label>
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-44 bg-[#0d0f14] border-white/10 text-white text-xs h-8">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1d24] border-white/10 text-white">
              <SelectItem value="all" className="text-white focus:bg-white/10 focus:text-white">Todos</SelectItem>
              {data.map(c => (
                <SelectItem key={c.id} value={c.id} className="text-white focus:bg-white/10 focus:text-white">{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Switch id="alerts-toggle" checked={alertsOnly} onCheckedChange={setAlertsOnly} />
          <Label htmlFor="alerts-toggle" className="text-xs text-gray-400 cursor-pointer">Mostrar apenas com alertas</Label>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
          <p className="text-gray-400 text-sm">Carregando dados das campanhas…</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-red-400 text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchWarRoom(buildEffectiveRange(), !metricsInitialized.current)}
            className="border-white/10 text-gray-300 hover:bg-white/5"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Tentar novamente
          </Button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <WarRoomTable
          data={filteredData}
          clientMetricsMap={effectiveMetricsMap}
          clientObjectiveMap={clientObjectiveMetrics}
          alertsOnly={alertsOnly}
          onOpenClientSettings={id => setSettingsClientId(id)}
          previousMetricsMap={previousMetricsMap}
        />
      )}

      {/* Settings modal */}
      {settingsClient && (
        <MetricSettingsModal
          key={settingsClient.id}
          open={!!settingsClientId}
          onOpenChange={open => { if (!open) setSettingsClientId(null); }}
          clientName={settingsClient.name}
          metrics={effectiveMetricsMap[settingsClient.id] ?? globalMetrics}
          objectiveMetrics={clientObjectiveMetrics[settingsClient.id] ?? {}}
          onSave={(general, objectives) => handleSaveClientMetrics(settingsClient.id, general, objectives)}
        />
      )}
    </div>
  );
};

export default WarRoom;
