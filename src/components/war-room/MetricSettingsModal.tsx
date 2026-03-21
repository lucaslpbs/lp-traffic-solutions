import { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MetricConfig, TIPO_LABELS, TIPO_KEYS } from '@/types/war-room';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  metrics: MetricConfig[];
  objectiveMetrics: Record<string, MetricConfig[]>;
  onSave: (general: MetricConfig[], objectives: Record<string, MetricConfig[]>) => void;
}

// Per-tipo sparse override: only active/goal/margins differ from general
type TipoOverride = { active: boolean; goal: number; yellowMargin: number; redMargin: number };

function fromMetricConfigs(saved: MetricConfig[]): Record<string, TipoOverride> {
  const result: Record<string, TipoOverride> = {};
  for (const m of saved) {
    result[m.id] = { active: m.active, goal: m.goal, yellowMargin: m.yellowMargin, redMargin: m.redMargin };
  }
  return result;
}

function toMetricConfigs(general: MetricConfig[], overrides: Record<string, TipoOverride>): MetricConfig[] {
  return general.map(m => ({ ...m, ...(overrides[m.id] ?? {}) }));
}

// Full editor for the Geral tab (add, remove, reorder, all fields)
function MetricEditor({ metrics, onChange }: { metrics: MetricConfig[]; onChange: (m: MetricConfig[]) => void }) {
  const dragIdxRef = useRef<number | null>(null);

  const update = (idx: number, patch: Partial<MetricConfig>) =>
    onChange(metrics.map((m, i) => i === idx ? { ...m, ...patch } : m));
  const remove = (idx: number) => onChange(metrics.filter((_, i) => i !== idx));
  const add = () => onChange([...metrics, {
    id: `metric-${Date.now()}`,
    label: '',
    unit: 'número' as const,
    goal: 0,
    direction: 'lower' as const,
    yellowMargin: 15,
    redMargin: 30,
    active: true,
  }]);

  const handleDragStart = (idx: number) => { dragIdxRef.current = idx; };
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const from = dragIdxRef.current;
    if (from === null || from === idx) return;
    const next = [...metrics];
    const [item] = next.splice(from, 1);
    next.splice(idx, 0, item);
    dragIdxRef.current = idx;
    onChange(next);
  };
  const handleDragEnd = () => { dragIdxRef.current = null; };

  return (
    <div className="space-y-4">
      {metrics.map((m, idx) => (
        <div
          key={m.id}
          draggable
          onDragStart={() => handleDragStart(idx)}
          onDragOver={e => handleDragOver(e, idx)}
          onDragEnd={handleDragEnd}
          className="p-4 rounded-lg bg-[#111318] border border-white/10 space-y-3"
        >
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-gray-600 hover:text-gray-400 cursor-grab flex-shrink-0" />
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              <Input
                value={m.label}
                onChange={e => update(idx, { label: e.target.value })}
                placeholder="Nome da métrica"
                className="bg-[#0d0f14] border-white/10 text-white w-32"
              />
              <Select value={m.unit} onValueChange={v => update(idx, { unit: v as MetricConfig['unit'] })}>
                <SelectTrigger className="w-24 bg-[#0d0f14] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1d24] border-white/10">
                  <SelectItem value="R$">R$</SelectItem>
                  <SelectItem value="%">%</SelectItem>
                  <SelectItem value="x">x</SelectItem>
                  <SelectItem value="número">número</SelectItem>
                </SelectContent>
              </Select>
              <Select value={m.direction} onValueChange={v => update(idx, { direction: v as 'lower' | 'higher' })}>
                <SelectTrigger className="w-40 bg-[#0d0f14] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1d24] border-white/10">
                  <SelectItem value="lower">Menor é melhor</SelectItem>
                  <SelectItem value="higher">Maior é melhor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Switch checked={m.active} onCheckedChange={v => update(idx, { active: v })} />
              <Button variant="ghost" size="icon" onClick={() => remove(idx)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-gray-400">Meta</Label>
              <Input type="number" value={m.goal} onChange={e => update(idx, { goal: parseFloat(e.target.value) || 0 })} className="bg-[#0d0f14] border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-xs text-gray-400">Margem amarela (%)</Label>
              <Input type="number" value={m.yellowMargin} onChange={e => update(idx, { yellowMargin: parseFloat(e.target.value) || 0 })} className="bg-[#0d0f14] border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-xs text-gray-400">Margem vermelha (%)</Label>
              <Input type="number" value={m.redMargin} onChange={e => update(idx, { redMargin: parseFloat(e.target.value) || 0 })} className="bg-[#0d0f14] border-white/10 text-white" />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={add} className="border-white/10 text-gray-300 hover:bg-white/5 w-full">
        <Plus className="h-4 w-4 mr-2" /> Adicionar Métrica
      </Button>
    </div>
  );
}

// Simplified editor for tipo tabs — same metrics as Geral, só ajusta active/meta/margens
function TipoMetricEditor({
  generalMetrics,
  overrides,
  onChange,
}: {
  generalMetrics: MetricConfig[];
  overrides: Record<string, TipoOverride>;
  onChange: (overrides: Record<string, TipoOverride>) => void;
}) {
  const update = (id: string, patch: Partial<TipoOverride>) => {
    const base = generalMetrics.find(m => m.id === id)!;
    const current = overrides[id] ?? { active: base.active, goal: base.goal, yellowMargin: base.yellowMargin, redMargin: base.redMargin };
    onChange({ ...overrides, [id]: { ...current, ...patch } });
  };

  return (
    <div className="space-y-2">
      {generalMetrics.map(m => {
        const ov = overrides[m.id];
        const active = ov?.active ?? m.active;
        const goal = ov?.goal ?? m.goal;
        const yellowMargin = ov?.yellowMargin ?? m.yellowMargin;
        const redMargin = ov?.redMargin ?? m.redMargin;
        return (
          <div key={m.id} className="p-3 rounded-lg bg-[#111318] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white font-medium">{m.label}</span>
              <Switch checked={active} onCheckedChange={v => update(m.id, { active: v })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-gray-400">Meta</Label>
                <Input type="number" value={goal} onChange={e => update(m.id, { goal: parseFloat(e.target.value) || 0 })} className="bg-[#0d0f14] border-white/10 text-white" />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Margem amarela (%)</Label>
                <Input type="number" value={yellowMargin} onChange={e => update(m.id, { yellowMargin: parseFloat(e.target.value) || 0 })} className="bg-[#0d0f14] border-white/10 text-white" />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Margem vermelha (%)</Label>
                <Input type="number" value={redMargin} onChange={e => update(m.id, { redMargin: parseFloat(e.target.value) || 0 })} className="bg-[#0d0f14] border-white/10 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const MetricSettingsModal = ({ open, onOpenChange, clientName, metrics, objectiveMetrics, onSave }: Props) => {
  const [generalDraft, setGeneralDraft] = useState<MetricConfig[]>(metrics);

  // Per-tipo overrides: sparse (only what differs from general)
  const [tipoDrafts, setTipoDrafts] = useState<Record<string, Record<string, TipoOverride>>>(() => {
    const drafts: Record<string, Record<string, TipoOverride>> = {};
    for (const tipo of TIPO_KEYS) {
      drafts[tipo] = objectiveMetrics[tipo] ? fromMetricConfigs(objectiveMetrics[tipo]) : {};
    }
    return drafts;
  });

  const hasOverride = (tipo: string) => Object.keys(tipoDrafts[tipo] ?? {}).length > 0;

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setGeneralDraft(metrics);
      const drafts: Record<string, Record<string, TipoOverride>> = {};
      for (const tipo of TIPO_KEYS) {
        drafts[tipo] = objectiveMetrics[tipo] ? fromMetricConfigs(objectiveMetrics[tipo]) : {};
      }
      setTipoDrafts(drafts);
    }
    onOpenChange(o);
  };

  const handleSave = () => {
    const objectives: Record<string, MetricConfig[]> = {};
    for (const tipo of TIPO_KEYS) {
      if (Object.keys(tipoDrafts[tipo] ?? {}).length > 0) {
        objectives[tipo] = toMetricConfigs(generalDraft, tipoDrafts[tipo]);
      }
    }
    onSave(generalDraft, objectives);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1a1d24] border-white/10 text-white max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">
            Métricas — <span className="text-blue-400">{clientName}</span>
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-1">
            Aba "Geral" define as métricas e colunas. Tabs de tipo permitem ajustar meta, margens e ativar/desativar por tipo de campanha.
          </p>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-2">
          <TabsList className="bg-[#111318] border border-white/10 w-full h-auto flex flex-wrap">
            <TabsTrigger
              value="general"
              className="flex-1 text-xs py-2 data-[state=active]:bg-[#1a1d24] text-gray-400 data-[state=active]:text-white"
            >
              Geral
            </TabsTrigger>
            {TIPO_KEYS.map(tipo => (
              <TabsTrigger
                key={tipo}
                value={tipo}
                className="flex-1 text-xs py-2 data-[state=active]:bg-[#1a1d24] text-gray-400 data-[state=active]:text-white"
              >
                {TIPO_LABELS[tipo]}
                {hasOverride(tipo) && (
                  <span className="ml-1 h-1.5 w-1.5 rounded-full bg-blue-400 inline-block" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="general" className="mt-4">
            <MetricEditor metrics={generalDraft} onChange={setGeneralDraft} />
          </TabsContent>

          {TIPO_KEYS.map(tipo => (
            <TabsContent key={tipo} value={tipo} className="mt-4">
              <p className="text-[11px] text-gray-500 mb-3">
                Ajuste ativo/inativo, meta e margens para campanhas de{' '}
                <span className="text-gray-300">{TIPO_LABELS[tipo]}</span>.
                {!hasOverride(tipo) && ' Usando valores do Geral.'}
              </p>
              <TipoMetricEditor
                generalMetrics={generalDraft}
                overrides={tipoDrafts[tipo] ?? {}}
                onChange={ov => setTipoDrafts(d => ({ ...d, [tipo]: ov }))}
              />
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end mt-4 pt-4 border-t border-white/10">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
