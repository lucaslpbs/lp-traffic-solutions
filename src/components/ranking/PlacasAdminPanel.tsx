import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Award, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { usePlacasPendentes } from './nivel';
import { formatBRL, formatDataBR } from './types';

export const PlacasAdminPanel = ({ nomePorId }: { nomePorId: Map<string, string> }) => {
  const qc = useQueryClient();
  const { data: pendentes = [], isLoading } = usePlacasPendentes();
  const [marcando, setMarcando] = useState<string | null>(null);

  const marcarEntregue = async (id: string) => {
    setMarcando(id);
    const { error } = await (supabase as any)
      .from('ranking_placas_clientes')
      .update({ entregue: true, entregue_em: new Date().toISOString() })
      .eq('id', id);
    setMarcando(null);
    if (error) {
      toast.error('Erro ao marcar placa como entregue');
      return;
    }
    toast.success('Placa marcada como entregue');
    qc.invalidateQueries({ queryKey: ['ranking-placas-pendentes'] });
  };

  if (!isLoading && pendentes.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f0f] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <Award className="h-5 w-5 text-amber-400" />
        <h2 className="text-lg font-semibold text-white">Placas pendentes de entrega</h2>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#3b82f6]" />
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {pendentes.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-200 truncate">
                  {nomePorId.get(p.client_id) ?? p.client_id} — Placa {p.nome}
                </p>
                <p className="text-xs text-zinc-500">
                  Atingido em {formatDataBR(p.atingido_em.slice(0, 10))} · Marco: {formatBRL(p.valor_acumulado_minimo)}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => marcarEntregue(p.id)}
                disabled={marcando === p.id}
                className="bg-emerald-600 hover:bg-emerald-500 text-white h-8"
              >
                {marcando === p.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span className="ml-1">Marcar entregue</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
