import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/** Comprador cadastrado por um cliente (o "cliente do cliente"). */
export interface ClienteFinal {
  id: string;
  client_id: string;
  nome: string;
  telefone: string | null;
  created_at: string;
}

export interface ResumoClienteFinal {
  total: number;
  qtd: number;
  ultima: string | null;
}

/** Lista de compradores cadastrados pelo cliente. */
export function useClientesFinais(clientId?: string | null) {
  return useQuery({
    queryKey: ['clientes-finais', clientId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ranking_clientes_finais')
        .select('*')
        .eq('client_id', clientId)
        .order('nome');
      if (error) throw error;
      return (data ?? []) as ClienteFinal[];
    },
    enabled: !!clientId,
  });
}

/**
 * Quanto cada comprador ja comprou (todas as vendas, sem filtro de periodo).
 * Retorna um Map cliente_final_id -> { total, qtd, ultima }.
 */
export function useResumoClientesFinais(clientId?: string | null) {
  return useQuery({
    queryKey: ['clientes-finais-resumo', clientId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ranking_vendas')
        .select('cliente_final_id, valor, data')
        .eq('client_id', clientId)
        .not('cliente_final_id', 'is', null);
      if (error) throw error;

      const mapa = new Map<string, ResumoClienteFinal>();
      (data ?? []).forEach((v: any) => {
        const atual = mapa.get(v.cliente_final_id) ?? { total: 0, qtd: 0, ultima: null };
        atual.total += Number(v.valor) || 0;
        atual.qtd += 1;
        if (!atual.ultima || v.data > atual.ultima) atual.ultima = v.data;
        mapa.set(v.cliente_final_id, atual);
      });
      return mapa;
    },
    enabled: !!clientId,
  });
}

export const RESUMO_VAZIO: ResumoClienteFinal = { total: 0, qtd: 0, ultima: null };

/** Normaliza telefone para comparacao (so digitos). */
export const soDigitos = (v: string) => v.replace(/\D/g, '');
