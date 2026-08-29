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
      <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
        Aprovado
      </span>
    );
  }
  if (status === 'recusado') {
    return (
      <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap bg-red-500/15 text-red-400 border-red-500/30">
        Recusado
      </span>
    );
  }
  return (
    <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap bg-amber-500/15 text-amber-400 border-amber-500/30">
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
    <div className="rounded-xl border border-white/10 bg-[#0f0f0f] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#60a5fa]" />
          <h2 className="text-lg font-semibold text-white">Pontos de indicação e engajamento</h2>
        </div>
        <span className="text-sm text-zinc-400">
          Saldo: <span className="font-bold text-[#60a5fa] tabular-nums">{saldo} pts</span>
        </span>
      </div>

      <div className="px-4 py-4 border-b border-white/5 bg-white/[0.03] grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
        <div className="space-y-1.5">
          <Select value={tipoAcao} onValueChange={setTipoAcao}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="O que você fez?" />
            </SelectTrigger>
            <SelectContent className="bg-[#111] border-white/10 text-white max-h-64">
              {acoesLancaveis.map((a) => (
                <SelectItem key={a.tipo_acao} value={a.tipo_acao} className="focus:bg-white/10 focus:text-white">
                  {a.descricao} ({a.pontos} pts)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {acaoSelecionada && (
            <p className="text-xs text-zinc-500">Vale {acaoSelecionada.pontos} pontos, após aprovação.</p>
          )}
        </div>
        <Textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Observação (opcional) — ex.: link do story, nome do indicado..."
          className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 min-h-[40px]"
        />
        <Button
          onClick={lancar}
          disabled={enviando || !tipoAcao}
          className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e3a8a] hover:to-[#2563eb] text-white"
        >
          {enviando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Lançar
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#3b82f6]" />
        </div>
      ) : lancamentos.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-zinc-500">Nenhuma ação lançada ainda.</p>
      ) : (
        <div className="divide-y divide-white/5">
          {lancamentos.map((l) => {
            const acao = acoes.find((a) => a.tipo_acao === l.tipo_acao);
            return (
              <div key={l.id} className="flex items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-200 truncate">
                    {acao?.descricao ?? l.tipo_acao}
                    <span className="ml-2 text-sm font-normal text-[#60a5fa]">{l.pontos} pts</span>
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatDataBR(l.data)}
                    {l.observacao ? ` • ${l.observacao}` : ''}
                  </p>
                  {l.status === 'recusado' && l.motivo_recusa && (
                    <p className="text-xs text-red-400 mt-0.5">Motivo: {l.motivo_recusa}</p>
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
