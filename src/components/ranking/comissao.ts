import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ConfigPacoteComissao {
  id: string;
  quantidade_fechamentos: number;
  valor_reais: number;
}

export interface FechamentoIndicacao {
  id: string;
  indicador_client_id: string;
  cliente_fechado_id: string;
  cliente_fechado_nome: string;
  ticket_valor: number;
  data: string;
  status: 'disponivel' | 'resgatado';
  resgate_id: string | null;
  observacao: string | null;
}

export interface ResgateComissao {
  id: string;
  indicador_client_id: string;
  quantidade_fechamentos: number;
  valor_reais: number;
  data: string;
  status: 'solicitado' | 'pago';
  pago_em: string | null;
}

/** Pacotes de resgate de comissao (tabela de config, editavel pelo admin). */
export function useConfigPacotesComissao() {
  return useQuery({
    queryKey: ['ranking-config-pacotes-comissao'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ranking_config_pacotes_comissao')
        .select('*')
        .order('quantidade_fechamentos');
      if (error) throw error;
      return (data ?? []).map((p: any) => ({
        ...p,
        quantidade_fechamentos: Number(p.quantidade_fechamentos) || 0,
        valor_reais: Number(p.valor_reais) || 0,
      })) as ConfigPacoteComissao[];
    },
  });
}

/** Saldo de fechamentos elegiveis ainda nao resgatados de um indicador. */
export function useSaldoFechamentos(clientId?: string | null) {
  return useQuery({
    queryKey: ['ranking-saldo-fechamentos', clientId],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('ranking_saldo_fechamentos_indicacao', {
        p_client_id: clientId,
      });
      if (error) throw error;
      return Number(data) || 0;
    },
    enabled: !!clientId,
  });
}

const mapFechamento = (f: any): FechamentoIndicacao => ({
  ...f,
  cliente_fechado_nome: f.gestao_clientes?.nome_cliente ?? '—',
  ticket_valor: Number(f.ticket_valor) || 0,
});

/** Fechamentos elegiveis registrados para um indicador (proprio cliente). */
export function useFechamentosCliente(clientId?: string | null) {
  return useQuery({
    queryKey: ['ranking-fechamentos-cliente', clientId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ranking_comissoes_indicacao')
        .select('*, gestao_clientes(nome_cliente)')
        .eq('indicador_client_id', clientId)
        .order('data', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapFechamento);
    },
    enabled: !!clientId,
  });
}

const mapResgateComissao = (r: any): ResgateComissao => ({
  ...r,
  quantidade_fechamentos: Number(r.quantidade_fechamentos) || 0,
  valor_reais: Number(r.valor_reais) || 0,
});

/** Resgates de comissao de um indicador (proprio cliente). */
export function useResgatesComissaoCliente(clientId?: string | null) {
  return useQuery({
    queryKey: ['ranking-resgates-comissao-cliente', clientId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ranking_resgates_comissao')
        .select('*')
        .eq('indicador_client_id', clientId)
        .order('data', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapResgateComissao);
    },
    enabled: !!clientId,
  });
}

/** Resgates de comissao aguardando pagamento (visao do admin). */
export function useResgatesComissaoPendentes() {
  return useQuery({
    queryKey: ['ranking-resgates-comissao-pendentes'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ranking_resgates_comissao')
        .select('*')
        .eq('status', 'solicitado')
        .order('data', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapResgateComissao);
    },
  });
}

/** Todos os fechamentos elegiveis lancados (visao do admin, todos os indicadores). */
export function useFechamentosTodos() {
  return useQuery({
    queryKey: ['ranking-fechamentos-todos'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ranking_comissoes_indicacao')
        .select('*, gestao_clientes(nome_cliente)')
        .order('data', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []).map(mapFechamento);
    },
  });
}
