import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Gift, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useResgatesPendentes } from './resgates';
import { formatDataBR } from './types';

export const ResgatesAdminPanel = ({ nomePorId }: { nomePorId: Map<string, string> }) => {
  const qc = useQueryClient();
  const { data: pendentes = [], isLoading } = useResgatesPendentes();
  const [marcando, setMarcando] = useState<string | null>(null);

  const marcarEntregue = async (id: string) => {
    setMarcando(id);
    const { error } = await (supabase as any)
      .from('ranking_resgates')
      .update({ status: 'entregue', entregue_em: new Date().toISOString() })
      .eq('id', id);
    setMarcando(null);
    if (error) {
      toast.error('Erro ao marcar resgate como entregue');
      return;
    }
    toast.success('Resgate marcado como entregue');
    qc.invalidateQueries({ queryKey: ['ranking-resgates-pendentes'] });
  };

  if (!isLoading && pendentes.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f0f] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <Gift className="h-5 w-5 text-amber-400" />
        <h2 className="text-lg font-semibold text-white">Resgates pendentes de entrega</h2>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#3b82f6]" />
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {pendentes.map((r) => (
            <div key={r.id} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-200 truncate">
                  {nomePorId.get(r.client_id) ?? r.client_id} — {r.premio_nome}
                  <span className="ml-2 text-sm font-normal text-[#60a5fa]">{r.pontos_gastos} pts</span>
                </p>
                <p className="text-xs text-zinc-500">Solicitado em {formatDataBR(r.data.slice(0, 10))}</p>
              </div>
              <Button
                size="sm"
                onClick={() => marcarEntregue(r.id)}
                disabled={marcando === r.id}
                className="bg-emerald-600 hover:bg-emerald-500 text-white h-8"
              >
                {marcando === r.id ? (
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
