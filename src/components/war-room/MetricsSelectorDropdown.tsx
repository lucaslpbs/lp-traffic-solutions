import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, Settings2, GripVertical, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MetricConfig } from '@/types/war-room';

interface Props {
  metrics: MetricConfig[];
  onChange: (metrics: MetricConfig[]) => void;
}

function getThresholdPreview(m: MetricConfig): string {
  const fmtVal = (v: number) => {
    const n = v.toFixed(2).replace('.', ',');
    if (m.unit === 'R$') return `R$ ${n}`;
    if (m.unit === '%') return `${n}%`;
    if (m.unit === 'x') return `${n}x`;
    return n;
  };
  if (m.direction === 'lower') {
    const y = m.goal * (1 + m.yellowMargin / 100);
    const r = m.goal * (1 + m.redMargin / 100);
    return `verde ≤ ${fmtVal(m.goal)} | amarelo até ${fmtVal(y)} | vermelho > ${fmtVal(r)}`;
  } else {
    const y = m.goal * (1 - m.yellowMargin / 100);
    const r = m.goal * (1 - m.redMargin / 100);
    return `verde ≥ ${fmtVal(m.goal)} | amarelo até ${fmtVal(y)} | vermelho < ${fmtVal(r)}`;
  }
}

/** Returns true if the ID order of two metric arrays differs */
function orderChanged(a: MetricConfig[], b: MetricConfig[]): boolean {
  if (a.length !== b.length) return false; // only compare order, not additions
  return a.some((m, i) => m.id !== b[i].id);
}

export const MetricsSelectorDropdown = ({ metrics, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localMetrics, setLocalMetrics] = useState<MetricConfig[]>(metrics);
  // Track the last committed order to detect pending reorder changes
  const committedIdsRef = useRef<string[]>(metrics.map(m => m.id));
  const ref = useRef<HTMLDivElement>(null);
  const dragIdxRef = useRef<number | null>(null);

  useEffect(() => {
    setLocalMetrics(metrics);
    committedIdsRef.current = metrics.map(m => m.id);
  }, [metrics]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setEditingId(null);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const activeCount = localMetrics.filter(m => m.active).length;

  const pendingReorder = localMetrics.map(m => m.id).join(',') !== committedIdsRef.current.join(',');

  const saveOrder = () => {
    committedIdsRef.current = localMetrics.map(m => m.id);
    onChange(localMetrics);
  };

  const toggle = (id: string) => {
    const next = localMetrics.map(m => m.id === id ? { ...m, active: !m.active } : m);
    setLocalMetrics(next);
    onChange(next);
  };

  const update = (id: string, patch: Partial<MetricConfig>) => {
    const next = localMetrics.map(m => m.id === id ? { ...m, ...patch } : m);
    setLocalMetrics(next);
    onChange(next);
  };

  const handleDragStart = (idx: number) => { dragIdxRef.current = idx; };
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const from = dragIdxRef.current;
    if (from === null || from === idx) return;
    const next = [...localMetrics];
    const [item] = next.splice(from, 1);
    next.splice(idx, 0, item);
    dragIdxRef.current = idx;
    setLocalMetrics(next);
  };
  const handleDragEnd = () => { dragIdxRef.current = null; };

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(v => !v)}
        className="border-white/10 text-gray-300 hover:bg-white/5 bg-transparent"
      >
        <SlidersHorizontal className="h-4 w-4 mr-1.5" />
        Métricas
        <span className="ml-1.5 bg-blue-600 text-white rounded-full px-1.5 py-0.5 text-[10px] leading-none">
          {activeCount}
        </span>
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1d24] border border-white/10 rounded-lg shadow-2xl z-50 flex flex-col max-h-[65vh]">
          <div className="p-3 border-b border-white/10 flex-shrink-0 flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-gray-300">Configurar métricas globais</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Arraste para reordenar as colunas</p>
            </div>
            {pendingReorder && (
              <Button
                size="sm"
                onClick={saveOrder}
                className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0 gap-1"
              >
                <Save className="h-3 w-3" /> Salvar ordem
              </Button>
            )}
          </div>

          <div className="overflow-y-auto divide-y divide-white/5">
            {localMetrics.map((m, idx) => (
              <div
                key={m.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className="p-3 select-none"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <GripVertical className="h-4 w-4 text-gray-600 hover:text-gray-400 flex-shrink-0 cursor-grab active:cursor-grabbing" />
                    <Switch
                      checked={m.active}
                      onCheckedChange={() => toggle(m.id)}
                      className="scale-75 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-300 truncate">{m.label}</span>
                    <span className="text-[10px] text-gray-600 flex-shrink-0">{m.unit}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-500 hover:text-gray-300 flex-shrink-0"
                    onClick={() => setEditingId(editingId === m.id ? null : m.id)}
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {editingId === m.id && (
                  <div className="mt-3 space-y-2 pl-1">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-1">Meta</label>
                        <Input
                          type="number"
                          value={m.goal}
                          onChange={e => update(m.id, { goal: parseFloat(e.target.value) || 0 })}
                          className="h-7 text-xs bg-[#0d0f14] border-white/10 text-white px-2"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-1">Amarelo %</label>
                        <Input
                          type="number"
                          value={m.yellowMargin}
                          onChange={e => update(m.id, { yellowMargin: parseFloat(e.target.value) || 0 })}
                          className="h-7 text-xs bg-[#0d0f14] border-white/10 text-white px-2"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-1">Vermelho %</label>
                        <Input
                          type="number"
                          value={m.redMargin}
                          onChange={e => update(m.id, { redMargin: parseFloat(e.target.value) || 0 })}
                          className="h-7 text-xs bg-[#0d0f14] border-white/10 text-white px-2"
                        />
                      </div>
                    </div>
                    <Select
                      value={m.direction}
                      onValueChange={v => update(m.id, { direction: v as 'lower' | 'higher' })}
                    >
                      <SelectTrigger className="h-7 text-xs bg-[#0d0f14] border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1d24] border-white/10">
                        <SelectItem value="lower">Menor é melhor</SelectItem>
                        <SelectItem value="higher">Maior é melhor</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-gray-500 bg-[#0d0f14] p-2 rounded leading-relaxed">
                      {getThresholdPreview(m)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
