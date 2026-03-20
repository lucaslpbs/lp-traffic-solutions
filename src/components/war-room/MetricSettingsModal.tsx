import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MetricConfig, saveClientMetrics } from '@/types/war-room';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  metrics: MetricConfig[];
  onSave: (metrics: MetricConfig[]) => void;
}

export const MetricSettingsModal = ({ open, onOpenChange, clientId, clientName, metrics, onSave }: Props) => {
  const [draft, setDraft] = useState<MetricConfig[]>(metrics);

  const update = (idx: number, patch: Partial<MetricConfig>) => {
    setDraft(d => d.map((m, i) => i === idx ? { ...m, ...patch } : m));
  };

  const addMetric = () => {
    setDraft(d => [...d, {
      id: `metric-${Date.now()}`,
      label: '',
      unit: 'número',
      goal: 0,
      direction: 'lower',
      yellowMargin: 15,
      redMargin: 30,
      active: true,
    }]);
  };

  const remove = (idx: number) => setDraft(d => d.filter((_, i) => i !== idx));

  const handleSave = () => {
    onSave(draft);
    saveClientMetrics(clientId, draft);
    // POST in background — non-blocking
    fetch('https://n8n.trafficsolutions.cloud/webhook/save-metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, metrics: draft }),
    }).catch(() => {});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1a1d24] border-white/10 text-white max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">
            Métricas — <span className="text-blue-400">{clientName}</span>
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-1">Configurações exclusivas para este cliente.</p>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {draft.map((m, idx) => (
            <div key={m.id} className="p-4 rounded-lg bg-[#111318] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
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
                <div className="flex items-center gap-2">
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
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={addMetric} className="border-white/10 text-gray-300 hover:bg-white/5">
            <Plus className="h-4 w-4 mr-2" /> Adicionar Métrica
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
