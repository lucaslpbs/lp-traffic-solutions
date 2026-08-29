import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ConfigAcao {
  id: string;
  tipo_acao: string;
  descricao: string;
  pontos: number;
  ativo: boolean;
}

export interface PontoAcaoLancado {
  id: string;
  client_id: string;
  tipo_acao: string;
  pontos: number;
  data: string;
  status: 'pendente' | 'aprovado' | 'recusado';
  observacao: string | null;
  motivo_recusa: string | null;
  created_at: string;
}

/**
 * Acoes de indicacao cuja veracidade so o admin consegue checar (CRM).
 * O cliente nao tem permissao de INSERT para essas duas (RLS bloqueia) --
 * so o admin lanca, e ja entra aprovado.
 */
export const ACOES_SOMENTE_ADMIN = ['indicacao_qualificada', 'indicacao_fechada'] as const;

/** Cardapio de acoes que geram pontos (tabela de config, editavel pelo admin). */
export function useConfigAcoes() {
  return useQuery({
    queryKey: ['ranking-config-acoes'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ranking_config_acoes')
        .select('*')
        .eq('ativo', true)
        .order('descricao');
      if (error) throw error;
      return (data ?? []).map((a: any) => ({ ...a, pontos: Number(a.pontos) || 0 })) as ConfigAcao[];
    },
  });
}

/** Saldo de pontos aprovados de um cliente. */
export function useSaldoPontos(clientId?: string | null) {
  return useQuery({
    queryKey: ['ranking-saldo-pontos', clientId],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('ranking_saldo_pontos', {
        p_client_id: clientId,
      });
      if (error) throw error;
      return Number(data) || 0;
    },
    enabled: !!clientId,
  });
}

const mapPonto = (p: any): PontoAcaoLancado => ({ ...p, pontos: Number(p.pontos) || 0 });

/** Historico de lancamentos de pontos de um cliente. */
export function usePontosCliente(clientId?: string | null) {
  return useQuery({
    queryKey: ['ranking-pontos-cliente', clientId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ranking_pontos_acoes')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapPonto);
    },
    enabled: !!clientId,
  });
}

/** Lancamentos pendentes de aprovacao (visao do admin). */
export function usePontosPendentes() {
  return useQuery({
    queryKey: ['ranking-pontos-pendentes'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ranking_pontos_acoes')
        .select('*')
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapPonto);
    },
  });
}
