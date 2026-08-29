import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ACOES_SOMENTE_ADMIN, useConfigAcoes, useSaldoPontos, usePontosCliente } from './pontos';
import { formatDataBR } from './types';
import { cn } from '@/lib/utils';

const PontosStatusBadge = ({ status }: { status: 'pendente' | 'aprovado' | 'recusado' }) => {
  if (status === 'aprovado') {
    return (
      <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap bg-success/15 text-success border-success/30">
        Aprovado
      </span>
    );
  }
  if (status === 'recusado') {
    return (
      <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap bg-destructive/15 text-destructive border-destructive/30">
        Recusado
      </span>
    );
  }
  return (
    <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap bg-warning/15 text-warning border-warning/30">
      Em análise
    </span>
  );
};

export const PontosPanel = ({ clientId }: { clientId: string }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: acoes = [] } = useConfigAcoes();
  const { data: saldo = 0 } = useSaldoPontos(clientId);
  const { data: lancamentos = [], isLoading } = usePontosCliente(clientId);

  const [tipoAcao, setTipoAcao] = useState('');
  const [observacao, setObservacao] = useState('');
  const [enviando, setEnviando] = useState(false);

  // indicacao_qualificada/indicacao_fechada so o admin pode lancar (o
  // cliente nao tem visibilidade de CRM pra confirmar se uma indicacao
  // realmente fechou) -- nao aparecem como opcao de autolancamento aqui.
  const acoesLancaveis = acoes.filter((a) => !ACOES_SOMENTE_ADMIN.includes(a.tipo_acao as any));
  const acaoSelecionada = acoes.find((a) => a.tipo_acao === tipoAcao);

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['ranking-pontos-cliente', clientId] });
    qc.invalidateQueries({ queryKey: ['ranking-saldo-pontos', clientId] });
  };

  const lancar = async () => {
    if (!tipoAcao) {
      toast.error('Selecione a ação realizada');
      return;
    }
    setEnviando(true);
    try {
      const { error } = await (supabase as any).from('ranking_pontos_acoes').insert({
        client_id: clientId,
        tipo_acao: tipoAcao,
        observacao: observacao.trim() || null,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
      toast.success('Ação enviada para análise! Os pontos entram no saldo assim que forem aprovados.');
      setTipoAcao('');
      setObservacao('');
      invalidar();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Erro ao lançar a ação');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="rounded-xl border border-foreground/10 bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-foreground/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-light" />
          <h2 className="text-lg font-semibold text-foreground">Pontos de indicação e engajamento</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          Saldo: <span className="font-bold text-primary-light tabular-nums">{saldo} pts</span>
        </span>
      </div>

      <div className="px-4 py-4 border-b border-foreground/5 bg-foreground/[0.03] grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
        <div className="space-y-1.5">
          <Select value={tipoAcao} onValueChange={setTipoAcao}>
            <SelectTrigger className="bg-foreground/5 border-foreground/10 text-foreground">
              <SelectValue placeholder="O que você fez?" />
            </SelectTrigger>
            <SelectContent className="bg-surface-1 border-foreground/10 text-foreground max-h-64">
              {acoesLancaveis.map((a) => (
                <SelectItem key={a.tipo_acao} value={a.tipo_acao} className="focus:bg-foreground/10 focus:text-foreground">
                  {a.descricao} ({a.pontos} pts)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {acaoSelecionada && (
            <p className="text-xs text-muted-foreground">Vale {acaoSelecionada.pontos} pontos, após aprovação.</p>
          )}
        </div>
        <Textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Observação (opcional) — ex.: link do story, nome do indicado..."
          className="bg-foreground/5 border-foreground/10 text-foreground placeholder:text-muted-foreground/80 min-h-[40px]"
        />
        <Button
          onClick={lancar}
          disabled={enviando || !tipoAcao}
          className="bg-gradient-to-r from-primary-dark to-primary hover:from-primary-darker hover:to-primary-hover text-foreground"
        >
          {enviando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Lançar
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : lancamentos.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhuma ação lançada ainda.</p>
      ) : (
        <div className="divide-y divide-foreground/5">
          {lancamentos.map((l) => {
            const acao = acoes.find((a) => a.tipo_acao === l.tipo_acao);
            return (
              <div key={l.id} className="flex items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">
                    {acao?.descricao ?? l.tipo_acao}
                    <span className="ml-2 text-sm font-normal text-primary-light">{l.pontos} pts</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDataBR(l.data)}
                    {l.observacao ? ` • ${l.observacao}` : ''}
                  </p>
                  {l.status === 'recusado' && l.motivo_recusa && (
                    <p className="text-xs text-destructive mt-0.5">Motivo: {l.motivo_recusa}</p>
                  )}
                </div>
                <PontosStatusBadge status={l.status} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
