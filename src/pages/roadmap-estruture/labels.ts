import type {
  Canal,
  Controle,
  Diagnostico,
  FaixaFaturamento,
  FaixaFuncionarios,
  FaixaInvestimento,
  FaixaPedidos,
  FonteCliente,
  Operacao,
  PapelNegocio,
  Segmento,
  TipoCnpj,
} from "./types";

export const segmentoLabel: Record<Segmento, string> = {
  moda_feminina: "Moda feminina",
  moda_masculina: "Moda masculina",
  multimarcas: "Multimarcas",
  calcados: "Calçados",
  cosmeticos: "Cosméticos",
  alimentos: "Alimentos",
  outro: "Outro segmento",
};

export const operacaoLabel: Record<Operacao, string> = {
  atacado: "Atacado",
  varejo: "Varejo",
  ambos: "Atacado e varejo",
};

export const canalLabel: Record<Canal, string> = {
  presencial_feira: "Presencial / feira",
  online: "Online",
  ambos: "Presencial e online",
};

export const tipoCnpjLabel: Record<TipoCnpj, string> = {
  mei: "MEI",
  me_simples: "ME — Simples Nacional",
  nao_sei: "Enquadramento não identificado",
};

export const papelLabel: Record<PapelNegocio, string> = {
  revendedor: "Revendedor",
  fabricante: "Fabricante",
};

export const faturamentoLabel: Record<FaixaFaturamento, string> = {
  ate_3k: "até R$3 mil",
  "3k_6k": "R$3 mil a R$6 mil",
  "6k_15k": "R$6 mil a R$15 mil",
  "15k_30k": "R$15 mil a R$30 mil",
  acima_30k: "acima de R$30 mil",
};

export const pedidosLabel: Record<FaixaPedidos, string> = {
  ate_20: "até 20 pedidos",
  "20_50": "20 a 50 pedidos",
  "50_100": "50 a 100 pedidos",
  "100_300": "100 a 300 pedidos",
  acima_300: "acima de 300 pedidos",
};

export const funcionariosLabel: Record<FaixaFuncionarios, string> = {
  "0": "Nenhum funcionário",
  "1_2": "1 a 2 funcionários",
  "3_5": "3 a 5 funcionários",
  mais_5: "mais de 5 funcionários",
};

export const controleLabel: Record<Controle, string> = {
  crm: "CRM",
  planilha: "Planilha",
  caderno: "Caderno",
  whatsapp_sem_controle: "WhatsApp sem controle",
};

export const fonteLabel: Record<FonteCliente, string> = {
  indicacao: "Indicação",
  instagram_organico: "Instagram orgânico",
  trafego_pago: "Tráfego pago",
  feira_presencial: "Feira / presencial",
  nao_sabe: "Origem desconhecida",
};

export const investimentoLabel: Record<FaixaInvestimento, string> = {
  ate_300: "até R$300/mês",
  "300_1k": "R$300 a R$1 mil/mês",
  "1k_3k": "R$1 mil a R$3 mil/mês",
  "3k_10k": "R$3 mil a R$10 mil/mês",
  acima_10k: "acima de R$10 mil/mês",
};

export function primeiroNome(nome?: string) {
  if (!nome) return "";
  return nome.trim().split(/\s+/)[0];
}

export function custoLabel(papel: PapelNegocio) {
  return papel === "fabricante" ? "Custo de produção" : "Preço de compra";
}

/** Margem efetiva a exibir: a informada ou a agregada calculada. */
export function margemExibida(d: Diagnostico): number | undefined {
  const { margem } = d;
  if (margem.sabeMargemReal && typeof margem.margemPercentual === "number") {
    return margem.margemPercentual;
  }
  if (typeof margem.margemAgregada === "number") return margem.margemAgregada;
  return undefined;
}

export function formatarBRL(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });
}

export function formatarDataBR(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}
