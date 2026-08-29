import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DegrauNivel {
  nivel: string;
  estrela: number;
  tipo_meta: 'mensal' | 'acumulado';
  valor_minimo: number;
  ordem: number;
}

export interface PlacaConfig {
  nome: string;
  valor_acumulado_minimo: number;
  ordem: number;
}

/**
 * Formato cru das linhas: numeric do Postgres chega como string no supabase-js,
 * por isso a conversao com Number() abaixo.
 */
interface LinhaNivel {
  nivel: string;
  estrela: number | string;
  tipo_meta: DegrauNivel['tipo_meta'];
  valor_minimo: number | string;
  ordem: number | string;
}

interface LinhaPlaca {
  nome: string;
  valor_acumulado_minimo: number | string;
  ordem: number | string;
}

/**
 * Os 15 degraus da regua, direto de `ranking_config_niveis`.
 *
 * Le do banco em vez de repetir os valores no codigo: o admin muda as metas
 * pela tabela, e a tela de regras precisa contar a mesma historia que a RPC
 * usa para promover o cliente. Qualquer usuario logado tem SELECT liberado.
 */
export function useRegrasNiveis() {
  return useQuery({
    queryKey: ['ranking-config-niveis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ranking_config_niveis' as never)
        .select('nivel, estrela, tipo_meta, valor_minimo, ordem')
        .order('ordem');
      if (error) throw error;
      return ((data ?? []) as unknown as LinhaNivel[]).map((r) => ({
        nivel: r.nivel,
        estrela: Number(r.estrela) || 0,
        tipo_meta: r.tipo_meta,
        valor_minimo: Number(r.valor_minimo) || 0,
        ordem: Number(r.ordem) || 0,
      })) as DegrauNivel[];
    },
    // Configuracao muda muito raramente — nao vale refazer a cada montagem.
    staleTime: 30 * 60 * 1000,
  });
}

/** Marcos de placa fisica, de `ranking_config_placas`. */
export function useRegrasPlacas() {
  return useQuery({
    queryKey: ['ranking-config-placas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ranking_config_placas' as never)
        .select('nome, valor_acumulado_minimo, ordem')
        .order('ordem');
      if (error) throw error;
      return ((data ?? []) as unknown as LinhaPlaca[]).map((r) => ({
        nome: r.nome,
        valor_acumulado_minimo: Number(r.valor_acumulado_minimo) || 0,
        ordem: Number(r.ordem) || 0,
      })) as PlacaConfig[];
    },
    staleTime: 30 * 60 * 1000,
  });
}

/** Agrupa os degraus por nivel, preservando a ordem da regua. */
export const agruparPorNivel = (degraus: DegrauNivel[]) => {
  const mapa = new Map<string, DegrauNivel[]>();
  degraus.forEach((d) => {
    const atual = mapa.get(d.nivel) ?? [];
    atual.push(d);
    mapa.set(d.nivel, atual);
  });
  return Array.from(mapa.entries()).map(([nivel, itens]) => ({ nivel, itens }));
};

/**
 * Regras gerais da regua, de `ranking_config_geral`.
 *
 * ATENCAO: hoje essa tabela so tem politica de RLS para admin — um cliente
 * comum recebe lista vazia. Por isso os padroes abaixo existem: sao exatamente
 * os mesmos COALESCE que a funcao `ranking_nivel_cliente` aplica quando nao
 * acha a chave, entao a tela nunca contradiz a regra que o banco executa.
 * Assim que a politica de leitura para `authenticated` existir, os valores
 * reais passam a valer sozinhos, sem mexer aqui.
 */
export const PADRAO_MESES_DISTINTOS = 2;
export const PADRAO_MESES_CONTRATO = 5;
export const PADRAO_TICKET_COMISSAO = 800;

export interface RegrasGerais {
  /** Meses distintos com faturamento para o acumulado valer. */
  mesesDistintosMinimo: number;
  /** Meses de contrato ativo para o acumulado valer. */
  mesesContratoMinimo: number;
  /** Ticket mensal minimo do indicado para o fechamento gerar comissao. */
  ticketComissaoMinimo: number;
  /** false quando a config nao pode ser lida e os padroes estao em uso. */
  daConfig: boolean;
}

interface LinhaConfig {
  chave: string;
  valor: string | number | null;
}

export function useRegrasGerais() {
  return useQuery({
    queryKey: ['ranking-config-geral'],
    queryFn: async (): Promise<RegrasGerais> => {
      const { data, error } = await supabase
        .from('ranking_config_geral' as never)
        .select('chave, valor');

      // Sem permissao de leitura o supabase devolve erro ou lista vazia; nos
      // dois casos seguimos com o padrao em vez de derrubar a tela.
      if (error || !data?.length) {
        return {
          mesesDistintosMinimo: PADRAO_MESES_DISTINTOS,
          mesesContratoMinimo: PADRAO_MESES_CONTRATO,
          ticketComissaoMinimo: PADRAO_TICKET_COMISSAO,
          daConfig: false,
        };
      }

      const mapa = new Map(
        (data as unknown as LinhaConfig[]).map((r) => [r.chave, Number(r.valor)])
      );
      const distintos = mapa.get('nivel_meses_distintos_minimo');
      const contrato = mapa.get('nivel_meses_contrato_minimo');
      const ticket = mapa.get('comissao_ticket_minimo');

      return {
        mesesDistintosMinimo: Number.isFinite(distintos) ? Number(distintos) : PADRAO_MESES_DISTINTOS,
        mesesContratoMinimo: Number.isFinite(contrato) ? Number(contrato) : PADRAO_MESES_CONTRATO,
        ticketComissaoMinimo: Number.isFinite(ticket) ? Number(ticket) : PADRAO_TICKET_COMISSAO,
        daConfig: true,
      };
    },
    retry: false,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * O proximo degrau de cada caminho, calculado sobre a regua completa.
 *
 * A funcao `ranking_nivel_cliente` promove pelo MAIOR degrau satisfeito por
 * qualquer um dos dois criterios (e um OR sobre a tabela inteira), mas devolve
 * so um "proximo" — o degrau seguinte na ordem. Os dois caminhos correm em
 * paralelo, entao a tela precisa calcular cada um por conta para conseguir
 * mostrar os dois lado a lado.
 */
export interface CaminhoProgresso {
  tipo: 'mensal' | 'acumulado';
  nivel: string;
  estrela: number;
  meta: number;
  atual: number;
  falta: number;
  /** 0..1 */
  pct: number;
}

export const proximoDoCaminho = (
  degraus: DegrauNivel[],
  tipo: 'mensal' | 'acumulado',
  valorAtual: number
): CaminhoProgresso | null => {
  const alvo = degraus
    .filter((d) => d.tipo_meta === tipo && d.valor_minimo > valorAtual)
    .sort((a, b) => a.ordem - b.ordem)[0];

  if (!alvo) return null;

  return {
    tipo,
    nivel: alvo.nivel,
    estrela: alvo.estrela,
    meta: alvo.valor_minimo,
    atual: valorAtual,
    falta: Math.max(0, alvo.valor_minimo - valorAtual),
    pct: alvo.valor_minimo > 0 ? Math.min(1, valorAtual / alvo.valor_minimo) : 0,
  };
};
