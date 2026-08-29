import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NivelCliente {
  nivel_atual: string | null;
  estrela_atual: number | null;
  ordem_atual: number | null;
  proximo_nivel: string | null;
  proximo_estrela: number | null;
  proximo_tipo_meta: 'mensal' | 'acumulado' | null;
  proximo_valor_minimo: number | null;
  faturamento_mes_atual: number;
  maior_faturamento_mensal: number;
  faturamento_acumulado: number;
  meses_com_faturamento: number;
  meses_contrato_ativo: number;
}

/** Nivel/estrela atual do cliente na regua (via RPC ranking_nivel_cliente). */
export function useNivelCliente(clientId?: string | null) {
  return useQuery({
    queryKey: ['ranking-nivel', clientId],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('ranking_nivel_cliente', {
        p_client_id: clientId,
      });
      if (error) throw error;
      const row = data?.[0];
      if (!row) return null;
      return {
        nivel_atual: row.nivel_atual,
        estrela_atual: row.estrela_atual != null ? Number(row.estrela_atual) : null,
        ordem_atual: row.ordem_atual != null ? Number(row.ordem_atual) : null,
        proximo_nivel: row.proximo_nivel,
        proximo_estrela: row.proximo_estrela != null ? Number(row.proximo_estrela) : null,
        proximo_tipo_meta: row.proximo_tipo_meta,
        proximo_valor_minimo:
          row.proximo_valor_minimo != null ? Number(row.proximo_valor_minimo) : null,
        faturamento_mes_atual: Number(row.faturamento_mes_atual) || 0,
        maior_faturamento_mensal: Number(row.maior_faturamento_mensal) || 0,
        faturamento_acumulado: Number(row.faturamento_acumulado) || 0,
        meses_com_faturamento: Number(row.meses_com_faturamento) || 0,
        meses_contrato_ativo: Number(row.meses_contrato_ativo) || 0,
      } as NivelCliente;
    },
    enabled: !!clientId,
  });
}

export interface PlacaCliente {
  id: string;
  client_id: string;
  placa_id: string;
  nome: string;
  valor_acumulado_minimo: number;
  atingido_em: string;
  entregue: boolean;
  entregue_em: string | null;
  observacao: string | null;
}

const mapPlaca = (r: any): PlacaCliente => ({
  id: r.id,
  client_id: r.client_id,
  placa_id: r.placa_id,
  nome: r.ranking_config_placas?.nome ?? '—',
  valor_acumulado_minimo: Number(r.ranking_config_placas?.valor_acumulado_minimo) || 0,
  atingido_em: r.atingido_em,
  entregue: r.entregue,
  entregue_em: r.entregue_em,
  observacao: r.observacao,
});

/** Placas ja conquistadas por um cliente (visao do proprio cliente). */
export function usePlacasCliente(clientId?: string | null) {
  return useQuery({
    queryKey: ['ranking-placas-cliente', clientId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ranking_placas_clientes')
        .select('id, client_id, placa_id, atingido_em, entregue, entregue_em, observacao, ranking_config_placas(nome, valor_acumulado_minimo, ordem)')
        .eq('client_id', clientId)
        .order('atingido_em');
      if (error) throw error;
      return (data ?? []).map(mapPlaca);
    },
    enabled: !!clientId,
  });
}

/** Placas pendentes de entrega em qualquer cliente (visao do admin). */
export function usePlacasPendentes() {
  return useQuery({
    queryKey: ['ranking-placas-pendentes'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ranking_placas_clientes')
        .select('id, client_id, placa_id, atingido_em, entregue, entregue_em, observacao, ranking_config_placas(nome, valor_acumulado_minimo, ordem)')
        .eq('entregue', false)
        .order('atingido_em');
      if (error) throw error;
      return (data ?? []).map(mapPlaca);
    },
  });
}
