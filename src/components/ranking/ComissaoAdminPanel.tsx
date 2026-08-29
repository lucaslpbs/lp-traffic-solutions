import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Banknote, Check, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useResgatesComissaoPendentes, useFechamentosTodos } from './comissao';
import { formatBRL, formatDataBR } from './types';

interface ClienteOption {
  id: string;
  nome_cliente: string;
}

export const ComissaoAdminPanel = ({
  clientes,
  nomePorId,
}: {
  clientes: ClienteOption[];
  nomePorId: Map<string, string>;
}) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: resgatesPendentes = [], isLoading: loadingResgates } = useResgatesComissaoPendentes();
  const { data: fechamentos = [], isLoading: loadingFechamentos } = useFechamentosTodos();

  const [indicador, setIndicador] = useState('');
  const [clienteFechado, setClienteFechado] = useState('');
  const [ticket, setTicket] = useState('');
  const [lancando, setLancando] = useState(false);
  const [pagando, setPagando] = useState<string | null>(null);

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['ranking-fechamentos-todos'] });
    qc.invalidateQueries({ queryKey: ['ranking-fechamentos-cliente'] });
    qc.invalidateQueries({ queryKey: ['ranking-saldo-fechamentos'] });
    qc.invalidateQueries({ queryKey: ['ranking-resgates-comissao-pendentes'] });
    qc.invalidateQueries({ queryKey: ['ranking-resgates-comissao-cliente'] });
  };

  const lancarFechamento = async () => {
    const ticketNum = Number(ticket.replace(/\./g, '').replace(',', '.'));
    if (!indicador) {
      toast.error('Selecione o cliente indicador');
      return;
    }
    if (!clienteFechado) {
      toast.error('Selecione o cliente que fechou');
      return;
    }
    if (!ticketNum || ticketNum <= 0) {
      toast.error('Informe um ticket válido');
      return;
    }
    setLancando(true);
    try {
      const { error } = await (supabase as any).from('ranking_comissoes_indicacao').insert({
        indicador_client_id: indicador,
        cliente_fechado_id: clienteFechado,
        ticket_valor: ticketNum,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
      toast.success('Fechamento elegível registrado');
      setIndicador('');
      setClienteFechado('');
      setTicket('');
      invalidar();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Erro ao registrar o fechamento');
    } finally {
      setLancando(false);
    }
  };

  const marcarPago = async (id: string) => {
    setPagando(id);
    const { error } = await (supabase as any)
      .from('ranking_resgates_comissao')
      .update({ status: 'pago', pago_em: new Date().toISOString() })
      .eq('id', id);
    setPagando(null);
    if (error) {
      toast.error('Erro ao marcar como pago');
      return;
    }
    toast.success('Resgate marcado como pago');
    invalidar();
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f0f] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <Banknote className="h-5 w-5 text-emerald-400" />
        <h2 className="text-lg font-semibold text-white">Comissão por indicação</h2>
      </div>

      {/* Lancar fechamento elegivel */}
      <div className="px-4 py-4 border-b border-white/5 bg-white/[0.03] grid gap-3 sm:grid-cols-[1fr_1fr_140px_auto] sm:items-end">
        <div className="space-y-1.5">
          <span className="text-xs text-zinc-500 font-medium">Indicador (cliente)</span>
          <Select value={indicador} onValueChange={setIndicador}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Quem indicou" />
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
          <span className="text-xs text-zinc-500 font-medium">Cliente que fechou</span>
          <Select value={clienteFechado} onValueChange={setClienteFechado}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Quem fechou contrato" />
            </SelectTrigger>
            <SelectContent className="bg-[#111] border-white/10 text-white max-h-64">
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.id} className="focus:bg-white/10 focus:text-white">
                  {c.nome_cliente}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-zinc-600">
            Precisa já existir em Gestão de Clientes — cadastre lá primeiro se ainda não existir.
          </p>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs text-zinc-500 font-medium">Ticket mensal</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">R$</span>
            <Input
              value={ticket}
              onChange={(e) => setTicket(e.target.value.replace(/[^\d.,]/g, ''))}
              placeholder="0,00"
              inputMode="decimal"
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
            />
          </div>
        </div>
        <Button
          onClick={lancarFechamento}
          disabled={lancando}
          className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e3a8a] hover:to-[#2563eb] text-white"
        >
          {lancando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Lançar
        </Button>
      </div>

      {/* Resgates aguardando pagamento */}
      <div className="border-t border-white/5">
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Resgates aguardando pagamento (Pix)
          </h3>
        </div>
        {loadingResgates ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#3b82f6]" />
          </div>
        ) : resgatesPendentes.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-zinc-500">Nenhum resgate aguardando pagamento.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {resgatesPendentes.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-200 truncate">
                    {nomePorId.get(r.indicador_client_id) ?? r.indicador_client_id} —{' '}
                    {r.quantidade_fechamentos} {r.quantidade_fechamentos === 1 ? 'fechamento' : 'fechamentos'}
                    <span className="ml-2 text-sm font-normal text-emerald-400">{formatBRL(r.valor_reais)}</span>
                  </p>
                  <p className="text-xs text-zinc-500">Solicitado em {formatDataBR(r.data.slice(0, 10))}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => marcarPago(r.id)}
                  disabled={pagando === r.id}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white h-8"
                >
                  {pagando === r.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  <span className="ml-1">Marcar pago</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historico de fechamentos lancados */}
      <div className="border-t border-white/5">
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Fechamentos elegíveis lançados
          </h3>
        </div>
        {loadingFechamentos ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#3b82f6]" />
          </div>
        ) : fechamentos.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-zinc-500">Nenhum fechamento lançado ainda.</p>
        ) : (
          <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
            {fechamentos.map((f) => (
              <div key={f.id} className="flex items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-200 truncate">
                    {nomePorId.get(f.indicador_client_id) ?? f.indicador_client_id} → {f.cliente_fechado_nome}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatDataBR(f.data)} · Ticket {formatBRL(f.ticket_valor)}
                  </p>
                </div>
                <span
                  className={
                    f.status === 'disponivel'
                      ? 'rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap bg-white/10 text-zinc-400 border-white/10'
                  }
                >
                  {f.status === 'disponivel' ? 'Disponível' : 'Já resgatado'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
