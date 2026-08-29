import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Gift, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useConfigPremios, useSaldoDisponivel, useResgatesCliente } from './resgates';
import { formatDataBR } from './types';
import { cn } from '@/lib/utils';

const ResgateStatusBadge = ({ status }: { status: 'solicitado' | 'entregue' }) => (
  <span
    className={cn(
      'rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
      status === 'entregue'
        ? 'bg-success/15 text-success border-success/30'
        : 'bg-warning/15 text-warning border-warning/30'
    )}
  >
    {status === 'entregue' ? 'Entregue' : 'Solicitado'}
  </span>
);

export const CardapioResgate = ({ clientId }: { clientId: string }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: premios = [] } = useConfigPremios();
  const { data: saldo = 0 } = useSaldoDisponivel(clientId);
  const { data: resgates = [], isLoading } = useResgatesCliente(clientId);

  const [resgatando, setResgatando] = useState<string | null>(null);

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['ranking-resgates-cliente', clientId] });
    qc.invalidateQueries({ queryKey: ['ranking-saldo-disponivel', clientId] });
    qc.invalidateQueries({ queryKey: ['ranking-saldo-pontos', clientId] });
  };

  const resgatar = async (premioId: string, nome: string, custo: number) => {
    if (!window.confirm(`Resgatar "${nome}" por ${custo} pontos?`)) return;
    setResgatando(premioId);
    try {
      const { error } = await (supabase as any).from('ranking_resgates').insert({
        client_id: clientId,
        premio_id: premioId,
        premio_nome: nome,
        pontos_gastos: custo,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
      toast.success('Resgate solicitado! O time vai entrar em contato para combinar a entrega.');
      invalidar();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Erro ao solicitar o resgate');
    } finally {
      setResgatando(null);
    }
  };

  return (
    <div className="rounded-xl border border-foreground/10 bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-foreground/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary-light" />
          <h2 className="text-lg font-semibold text-foreground">Cardápio de resgate</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          Saldo disponível: <span className="font-bold text-primary-light tabular-nums">{saldo} pts</span>
        </span>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {premios.map((p) => {
          const podeResgatar = saldo >= p.pontos_custo;
          return (
            <div
              key={p.id}
              className={cn(
                'rounded-xl border p-4 flex flex-col justify-between gap-3',
                podeResgatar ? 'border-foreground/10 bg-foreground/[0.02]' : 'border-foreground/5 bg-foreground/[0.01] opacity-60'
              )}
            >
              <div>
                <p className="font-semibold text-foreground">{p.nome}</p>
                <p className="text-sm text-primary-light font-bold tabular-nums mt-1">{p.pontos_custo} pts</p>
              </div>
              <Button
                size="sm"
                onClick={() => resgatar(p.id, p.nome, p.pontos_custo)}
                disabled={!podeResgatar || !!resgatando}
                className="bg-gradient-to-r from-primary-dark to-primary hover:from-primary-darker hover:to-primary-hover text-foreground disabled:opacity-40"
              >
                {resgatando === p.id && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
                {podeResgatar ? 'Resgatar' : 'Pontos insuficientes'}
              </Button>
            </div>
          );
        })}
      </div>

      {(resgates.length > 0 || isLoading) && (
        <div className="border-t border-foreground/5">
          <div className="px-4 py-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Meus resgates</h3>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="divide-y divide-foreground/5">
              {resgates.map((r) => (
                <div key={r.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {r.premio_nome}
                      <span className="ml-2 text-sm font-normal text-primary-light">{r.pontos_gastos} pts</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDataBR(r.data.slice(0, 10))}</p>
                  </div>
                  <ResgateStatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
