import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Banknote, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  useConfigPacotesComissao,
  useSaldoFechamentos,
  useFechamentosCliente,
  useResgatesComissaoCliente,
} from './comissao';
import { formatBRL, formatDataBR } from './types';
import { cn } from '@/lib/utils';

export const ComissaoPanel = ({ clientId }: { clientId: string }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: pacotes = [] } = useConfigPacotesComissao();
  const { data: saldo = 0 } = useSaldoFechamentos(clientId);
  const { data: fechamentos = [] } = useFechamentosCliente(clientId);
  const { data: resgates = [], isLoading } = useResgatesComissaoCliente(clientId);

  const [resgatando, setResgatando] = useState<string | null>(null);

  // Nada a mostrar se o cliente nunca teve fechamento elegivel nem resgate.
  if (fechamentos.length === 0 && resgates.length === 0) return null;

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['ranking-resgates-comissao-cliente', clientId] });
    qc.invalidateQueries({ queryKey: ['ranking-saldo-fechamentos', clientId] });
    qc.invalidateQueries({ queryKey: ['ranking-fechamentos-cliente', clientId] });
  };

  const resgatar = async (pacoteId: string, quantidade: number, valor: number) => {
    if (!window.confirm(`Resgatar ${quantidade} fechamento(s) por ${formatBRL(valor)}?`)) return;
    setResgatando(pacoteId);
    try {
      const { error } = await (supabase as any).from('ranking_resgates_comissao').insert({
        indicador_client_id: clientId,
        pacote_id: pacoteId,
        quantidade_fechamentos: quantidade,
        valor_reais: valor,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
      toast.success('Resgate solicitado! O pagamento é feito manualmente via Pix pelo time.');
      invalidar();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Erro ao solicitar o resgate');
    } finally {
      setResgatando(null);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f0f] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Banknote className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Comissão por indicação</h2>
        </div>
        <span className="text-sm text-zinc-400">
          Fechamentos disponíveis:{' '}
          <span className="font-bold text-emerald-400 tabular-nums">{saldo}</span>
        </span>
      </div>

      {pacotes.length > 0 && (
        <div className="grid gap-3 p-4 sm:grid-cols-3">
          {pacotes.map((p) => {
            const pode = saldo >= p.quantidade_fechamentos;
            return (
              <div
                key={p.id}
                className={cn(
                  'rounded-xl border p-4 flex flex-col justify-between gap-3',
                  pode ? 'border-white/10 bg-white/[0.02]' : 'border-white/5 bg-white/[0.01] opacity-60'
                )}
              >
                <div>
                  <p className="font-semibold text-white">
                    {p.quantidade_fechamentos} {p.quantidade_fechamentos === 1 ? 'fechamento' : 'fechamentos'}
                  </p>
                  <p className="text-sm text-emerald-400 font-bold tabular-nums mt-1">
                    {formatBRL(p.valor_reais)}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => resgatar(p.id, p.quantidade_fechamentos, p.valor_reais)}
                  disabled={!pode || !!resgatando}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40"
                >
                  {resgatando === p.id && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
                  {pode ? 'Resgatar' : 'Saldo insuficiente'}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-white/5">
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Fechamentos elegíveis</h3>
        </div>
        {fechamentos.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-zinc-500">Nenhum fechamento elegível registrado ainda.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {fechamentos.map((f) => (
              <div key={f.id} className="flex items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-200 truncate">{f.cliente_fechado_nome}</p>
                  <p className="text-xs text-zinc-500">
                    {formatDataBR(f.data)} · Ticket {formatBRL(f.ticket_valor)}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
                    f.status === 'disponivel'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-white/10 text-zinc-400 border-white/10'
                  )}
                >
                  {f.status === 'disponivel' ? 'Disponível' : 'Já resgatado'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {(resgates.length > 0 || isLoading) && (
        <div className="border-t border-white/5">
          <div className="px-4 py-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Resgates de comissão</h3>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#3b82f6]" />
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {resgates.map((r) => (
                <div key={r.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-200 truncate">
                      {r.quantidade_fechamentos} {r.quantidade_fechamentos === 1 ? 'fechamento' : 'fechamentos'}
                      <span className="ml-2 text-sm font-normal text-emerald-400">{formatBRL(r.valor_reais)}</span>
                    </p>
                    <p className="text-xs text-zinc-500">{formatDataBR(r.data.slice(0, 10))}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
                      r.status === 'pago'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    )}
                  >
                    {r.status === 'pago' ? 'Pago' : 'Aguardando Pix'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
