import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Banknote, Loader2, UserPlus, Handshake, Gift } from 'lucide-react';
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
import { useRegrasGerais } from './regras';
import { formatBRL, formatDataBR } from './types';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import { ListSkeleton } from '@/components/dashboard/Skeletons';
import { cn } from '@/lib/utils';

/**
 * Como o programa funciona — mostrado quando o cliente ainda nao tem nenhum
 * fechamento nem resgate.
 *
 * Antes o painel inteiro retornava null nesse caso. Isso funcionava enquanto
 * ele era um bloco empilhado numa rolagem unica (sem dados, so nao aparecia),
 * mas depois que virou uma aba propria o resultado era uma tela em branco: o
 * cliente clicava em "Comissao" e nao via absolutamente nada. E justamente
 * quem ainda nao indicou ninguem que precisa saber que o programa existe.
 */
const ComoFunciona = ({ ticketMinimo }: { ticketMinimo: number }) => {
  const passos = [
    {
      icone: UserPlus,
      titulo: 'Você indica',
      texto: 'Apresenta alguém que precisa de tráfego e gestão para a Traffic Solutions.',
    },
    {
      icone: Handshake,
      titulo: 'A pessoa fecha',
      texto: `O fechamento entra como elegível quando o ticket mensal é de ${formatBRL(ticketMinimo)} ou mais.`,
    },
    {
      icone: Gift,
      titulo: 'Você resgata',
      texto: 'Acumule fechamentos e troque por dinheiro nos pacotes abaixo. O pagamento sai via Pix.',
    },
  ];

  return (
    <div className="px-4 pb-5 pt-1 sm:px-6">
      <ol className="grid gap-4 sm:grid-cols-3">
        {passos.map((p, i) => {
          const Icone = p.icone;
          return (
            <RevealOnScroll
              as="li"
              key={p.titulo}
              delay={70 * i}
              deslocamento="sm"
              className="rounded-xl border border-border bg-surface-2/40 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/15 text-success">
                  <Icone className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Passo {i + 1}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground">{p.titulo}</p>
              <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{p.texto}</p>
            </RevealOnScroll>
          );
        })}
      </ol>
    </div>
  );
};

export const ComissaoPanel = ({ clientId }: { clientId: string }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: pacotes = [] } = useConfigPacotesComissao();
  const { data: saldo = 0 } = useSaldoFechamentos(clientId);
  const { data: fechamentos = [], isLoading: carregandoFechamentos } = useFechamentosCliente(clientId);
  const { data: resgates = [], isLoading } = useResgatesComissaoCliente(clientId);
  const { data: regras } = useRegrasGerais();

  const [resgatando, setResgatando] = useState<string | null>(null);

  const semAtividade = fechamentos.length === 0 && resgates.length === 0;
  const ticketMinimo = regras?.ticketComissaoMinimo ?? 800;

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

  if (carregandoFechamentos) {
    return <ListSkeleton rows={3} />;
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* ── Cabecalho ── */}
      <div className="px-4 py-3 sm:px-6 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Banknote className="h-5 w-5 text-success" />
          <h2 className="text-lg font-semibold text-foreground">Comissão por indicação</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          Fechamentos disponíveis:{' '}
          <span className="font-bold text-success tabular-nums">{saldo}</span>
        </span>
      </div>

      {/* ── Sem atividade: explica o programa em vez de sumir ── */}
      {semAtividade && <ComoFunciona ticketMinimo={ticketMinimo} />}

      {/* ── Pacotes de resgate ── */}
      {pacotes.length > 0 && (
        <div className={cn('grid gap-3 p-4 sm:grid-cols-3 sm:p-6', semAtividade && 'pt-0 sm:pt-0')}>
          {semAtividade && (
            <p className="sm:col-span-3 -mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              O que você pode resgatar
            </p>
          )}
          {pacotes.map((p) => {
            const pode = saldo >= p.quantidade_fechamentos;
            return (
              <div
                key={p.id}
                className={cn(
                  'rounded-xl border p-4 flex flex-col justify-between gap-3 transition-colors',
                  pode
                    ? 'border-success/30 bg-success/[0.06]'
                    : 'border-border bg-surface-2/30'
                )}
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {p.quantidade_fechamentos}{' '}
                    {p.quantidade_fechamentos === 1 ? 'fechamento' : 'fechamentos'}
                  </p>
                  <p className="text-lg text-success font-bold tabular-nums mt-0.5">
                    {formatBRL(p.valor_reais)}
                  </p>
                </div>

                {/*
                  Sem nenhuma indicacao ainda, os pacotes sao um cardapio do que
                  da para ganhar — nao tres botoes bloqueados. Um "Faltam 5" em
                  verde forte para quem nunca indicou ninguem desanima em vez de
                  convidar.
                */}
                {semAtividade ? (
                  <p className="text-xs text-muted-foreground">
                    {p.quantidade_fechamentos === 1
                      ? 'Com a primeira indicação fechada'
                      : `Ao acumular ${p.quantidade_fechamentos} indicações fechadas`}
                  </p>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => resgatar(p.id, p.quantidade_fechamentos, p.valor_reais)}
                    disabled={!pode || !!resgatando}
                    className="bg-success text-success-foreground hover:brightness-110 disabled:opacity-40"
                  >
                    {resgatando === p.id && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
                    {pode ? 'Resgatar' : `Faltam ${p.quantidade_fechamentos - saldo}`}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Fechamentos elegiveis ── */}
      {!semAtividade && (
        <div className="border-t border-border">
          <div className="px-4 py-3 sm:px-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Fechamentos elegíveis
            </h3>
          </div>
          {fechamentos.length === 0 ? (
            <p className="px-4 pb-4 sm:px-6 text-sm text-muted-foreground">
              Nenhum fechamento elegível registrado ainda.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {fechamentos.map((f) => (
                <div key={f.id} className="flex items-center gap-4 px-4 py-3 sm:px-6">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{f.cliente_fechado_nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDataBR(f.data)} · Ticket {formatBRL(f.ticket_valor)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
                      f.status === 'disponivel'
                        ? 'bg-success/15 text-success border-success/30'
                        : 'bg-foreground/10 text-muted-foreground border-border'
                    )}
                  >
                    {f.status === 'disponivel' ? 'Disponível' : 'Já resgatado'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Resgates solicitados ── */}
      {(resgates.length > 0 || isLoading) && (
        <div className="border-t border-border">
          <div className="px-4 py-3 sm:px-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Resgates de comissão
            </h3>
          </div>
          {isLoading ? (
            <div className="px-4 pb-4 sm:px-6">
              <ListSkeleton rows={2} />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {resgates.map((r) => (
                <div key={r.id} className="flex items-center gap-4 px-4 py-3 sm:px-6">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {r.quantidade_fechamentos}{' '}
                      {r.quantidade_fechamentos === 1 ? 'fechamento' : 'fechamentos'}
                      <span className="ml-2 text-sm font-normal text-success">
                        {formatBRL(r.valor_reais)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDataBR(r.data.slice(0, 10))}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
                      r.status === 'pago'
                        ? 'bg-success/15 text-success border-success/30'
                        : 'bg-warning/15 text-warning border-warning/30'
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
