import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ConfigPremio {
  id: string;
  nome: string;
  pontos_custo: number;
  custo_real: number;
  ativo: boolean;
}

export interface ResgateCliente {
  id: string;
  client_id: string;
  premio_id: string;
  premio_nome: string;
  pontos_gastos: number;
  data: string;
  status: 'solicitado' | 'entregue';
  entregue_em: string | null;
  observacao: string | null;
}

/** Cardapio de premios resgataveis (tabela de config, editavel pelo admin). */
export function useConfigPremios() {
  return useQuery({
    queryKey: ['ranking-config-premios'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ranking_config_premios')
        .select('*')
        .eq('ativo', true)
        .order('pontos_custo');
      if (error) throw error;
      return (data ?? []).map((p: any) => ({
        ...p,
        pontos_custo: Number(p.pontos_custo) || 0,
        custo_real: Number(p.custo_real) || 0,
      })) as ConfigPremio[];
    },
  });
}

/** Saldo de pontos disponivel para resgate (aprovados - ja resgatados). */
export function useSaldoDisponivel(clientId?: string | null) {
  return useQuery({
    queryKey: ['ranking-saldo-disponivel', clientId],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('ranking_saldo_pontos_disponivel', {
        p_client_id: clientId,
      });
      if (error) throw error;
      return Number(data) || 0;
    },
    enabled: !!clientId,
  });
}

const mapResgate = (r: any): ResgateCliente => ({ ...r, pontos_gastos: Number(r.pontos_gastos) || 0 });

/** Historico de resgates de um cliente. */
export function useResgatesCliente(clientId?: string | null) {
  return useQuery({
    queryKey: ['ranking-resgates-cliente', clientId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ranking_resgates')
        .select('*')
        .eq('client_id', clientId)
        .order('data', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapResgate);
    },
    enabled: !!clientId,
  });
}

/** Resgates pendentes de entrega (visao do admin). */
export function useResgatesPendentes() {
  return useQuery({
    queryKey: ['ranking-resgates-pendentes'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ranking_resgates')
        .select('*')
        .eq('status', 'solicitado')
        .order('data', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapResgate);
    },
  });
}
