import { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MetricConfig } from '@/types/war-room';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export const OBJECTIVES = [
  { key: 'OUTCOME_ENGAGEMENT', label: 'Engajamento', color: 'text-blue-400' },
  { key: 'OUTCOME_TRAFFIC',    label: 'Tráfego',      color: 'text-green-400' },
  { key: 'OUTCOME_SALES',      label: 'Vendas',        color: 'text-orange-400' },
  { key: 'OUTCOME_AWARENESS',  label: 'Reconhecimento', color: 'text-purple-400' },
] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objectiveMetricsMap: Record<string, MetricConfig[]>;
  onSave: (map: Record<string, MetricConfig[]>) => void;
}

function MetricList({ metrics, onChange }: { metrics: MetricConfig[]; onChange: (m: MetricConfig[]) => void }) {
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
    <div className="space-y-3">
      {metrics.length === 0 && (
        <p className="text-xs text-gray-500 text-center py-6 bg-[#111318] rounded-lg border border-white/5">
          Nenhuma métrica configurada. Adicione métricas específicas para este tipo de campanha.
        </p>
      )}
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

export const ObjectiveMetricsModal = ({ open, onOpenChange, objectiveMetricsMap, onSave }: Props) => {
  const [draft, setDraft] = useState<Record<string, MetricConfig[]>>(objectiveMetricsMap);

  const handleOpenChange = (o: boolean) => {
    if (o) setDraft(objectiveMetricsMap);
    onOpenChange(o);
  };

  const handleSave = () => {
    onSave(draft);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1a1d24] border-white/10 text-white max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Métricas por tipo de campanha</DialogTitle>
          <p className="text-xs text-gray-500 mt-1">
            Métricas configuradas aqui têm prioridade sobre as globais para campanhas do tipo correspondente.
          </p>
        </DialogHeader>

        <Tabs defaultValue="OUTCOME_ENGAGEMENT" className="mt-2">
          <TabsList className="bg-[#111318] border border-white/10 w-full h-auto flex">
            {OBJECTIVES.map(obj => {
              const count = draft[obj.key]?.filter(m => m.active).length ?? 0;
              return (
                <TabsTrigger
                  key={obj.key}
                  value={obj.key}
                  className="flex-1 text-xs py-2 data-[state=active]:bg-[#1a1d24] text-gray-500 data-[state=active]:text-white"
                >
                  <span className={obj.color}>{obj.label}</span>
                  {count > 0 && (
                    <span className="ml-1 text-[10px] text-gray-500">{count}</span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {OBJECTIVES.map(obj => (
            <TabsContent key={obj.key} value={obj.key} className="mt-4">
              <MetricList
                metrics={draft[obj.key] ?? []}
                onChange={metrics => setDraft(d => ({ ...d, [obj.key]: metrics }))}
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
