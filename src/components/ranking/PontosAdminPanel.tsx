import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, Plus, ShieldCheck, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ACOES_SOMENTE_ADMIN, usePontosPendentes, useConfigAcoes } from './pontos';
import { formatDataBR } from './types';

interface ClienteOption {
  id: string;
  nome_cliente: string;
}

export const PontosAdminPanel = ({
  clientes,
  nomePorId,
}: {
  clientes: ClienteOption[];
  nomePorId: Map<string, string>;
}) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: pendentes = [], isLoading } = usePontosPendentes();
  const { data: acoes = [] } = useConfigAcoes();
  const [processando, setProcessando] = useState<string | null>(null);

  const [indicadorCliente, setIndicadorCliente] = useState('');
  const [tipoAcaoIndicacao, setTipoAcaoIndicacao] = useState('');
  const [lancando, setLancando] = useState(false);

  const acoesIndicacao = acoes.filter((a) => ACOES_SOMENTE_ADMIN.includes(a.tipo_acao as any));

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['ranking-pontos-pendentes'] });
    qc.invalidateQueries({ queryKey: ['ranking-pontos-cliente'] });
    qc.invalidateQueries({ queryKey: ['ranking-saldo-pontos'] });
  };

  const aprovar = async (id: string) => {
    setProcessando(id);
    const { error } = await (supabase as any)
      .from('ranking_pontos_acoes')
      .update({
        status: 'aprovado',
        motivo_recusa: null,
        aprovado_por: user?.id ?? null,
        aprovado_em: new Date().toISOString(),
      })
      .eq('id', id);
    setProcessando(null);
    if (error) {
      toast.error('Erro ao aprovar');
      return;
    }
    toast.success('Ação aprovada — pontos liberados');
    invalidar();
  };

  const recusar = async (id: string) => {
    const motivo = window.prompt('Motivo da recusa (obrigatório):')?.trim();
    if (!motivo) {
      if (motivo === '') toast.error('Informe o motivo da recusa');
      return;
    }
    setProcessando(id);
    const { error } = await (supabase as any)
      .from('ranking_pontos_acoes')
      .update({
        status: 'recusado',
        motivo_recusa: motivo,
        aprovado_por: user?.id ?? null,
        aprovado_em: new Date().toISOString(),
      })
      .eq('id', id);
    setProcessando(null);
    if (error) {
      toast.error('Erro ao recusar');
      return;
    }
    toast.success('Lançamento recusado');
    invalidar();
  };

  const lancarIndicacao = async () => {
    if (!indicadorCliente || !tipoAcaoIndicacao) {
      toast.error('Selecione o cliente e a ação de indicação');
      return;
    }
    setLancando(true);
    try {
      const { error } = await (supabase as any).from('ranking_pontos_acoes').insert({
        client_id: indicadorCliente,
        tipo_acao: tipoAcaoIndicacao,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
      toast.success('Indicação registrada — pontos já aprovados');
      setIndicadorCliente('');
      setTipoAcaoIndicacao('');
      invalidar();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Erro ao lançar a indicação');
    } finally {
      setLancando(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f0f] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[#60a5fa]" />
        <h2 className="text-lg font-semibold text-white">Pontos de indicação e engajamento</h2>
      </div>

      {/* Lancamento de indicacao -- exclusivo do admin, ja entra aprovado */}
      <div className="px-4 py-4 border-b border-white/5 bg-white/[0.03] grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Cliente indicador
          </span>
          <Select value={indicadorCliente} onValueChange={setIndicadorCliente}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent className="bg-[#111] border-white/10 text-white max-h-64">
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.id} className="focus:bg-white/10 focus:text-white">
                  {c.nome_cliente}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs text-zinc-500 font-medium">Ação de indicação (confirmada no CRM)</span>
          <Select value={tipoAcaoIndicacao} onValueChange={setTipoAcaoIndicacao}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Selecione a ação" />
            </SelectTrigger>
            <SelectContent className="bg-[#111] border-white/10 text-white">
              {acoesIndicacao.map((a) => (
                <SelectItem key={a.tipo_acao} value={a.tipo_acao} className="focus:bg-white/10 focus:text-white">
                  {a.descricao} ({a.pontos} pts)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={lancarIndicacao}
          disabled={lancando}
          className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e3a8a] hover:to-[#2563eb] text-white"
        >
          {lancando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Lançar já aprovado
        </Button>
      </div>

      {/* Fila de aprovacao das demais 8 acoes (autolancadas pelo cliente) */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#3b82f6]" />
        </div>
      ) : pendentes.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-zinc-500">Nenhum lançamento aguardando aprovação.</p>
      ) : (
        <div className="divide-y divide-white/5">
          {pendentes.map((p) => {
            const acao = acoes.find((a) => a.tipo_acao === p.tipo_acao);
            return (
              <div key={p.id} className="flex items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-200 truncate">
                    {nomePorId.get(p.client_id) ?? p.client_id} — {acao?.descricao ?? p.tipo_acao}
                    <span className="ml-2 text-sm font-normal text-[#60a5fa]">{p.pontos} pts</span>
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatDataBR(p.data)}
                    {p.observacao ? ` • ${p.observacao}` : ''}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => aprovar(p.id)}
                  disabled={!!processando}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white h-8"
                >
                  {processando === p.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  <span className="ml-1 hidden sm:inline">Aprovar</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => recusar(p.id)}
                  disabled={!!processando}
                  className="h-8 bg-white/5 border-white/10 text-zinc-300 hover:bg-red-500/10 hover:text-red-400"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="ml-1 hidden sm:inline">Recusar</span>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
