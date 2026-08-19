// Estado do formulário de diagnóstico + ordem dinâmica das perguntas.
// A ordem muda conforme respostas de ramificação (CNPJ, margem, tráfego pago).

import type {
  Canal,
  Controle,
  FaixaFaturamento,
  FaixaFuncionarios,
  FaixaInvestimento,
  FaixaPedidos,
  FonteCliente,
  Operacao,
  PapelNegocio,
  Segmento,
  TipoCnpj,
} from "../roadmap-estruture/types";

export interface ProdutoInput {
  nome: string;
  custo: string;
  precoVenda: string;
}

export interface FormState {
  nomeCompleto: string;
  documento: string;
  nomeEmpresa: string;
  email: string;
  telefone: string;

  segmento: Segmento | "";
  segmentoOutro: string;
  operacao: Operacao | "";
  temCnpj: boolean | null;
  tipoCnpj: TipoCnpj | "";
  canal: Canal | "";
  instagram: string;

  papel: PapelNegocio | "";

  faturamentoMensal: FaixaFaturamento | "";
  pedidosMes: FaixaPedidos | "";
  funcionarios: FaixaFuncionarios | "";
  temVendedores: boolean | null;
  quantidadeVendedores: string;
  controle: Controle | "";

  sabeMargemReal: boolean | null;
  margemPercentual: string;
  descontaCustosVariaveis: boolean | null;
  produtos: ProdutoInput[];

  fonteCliente: FonteCliente | "";
  fazTrafegoPago: boolean | null;
  gestaoTrafego: "sozinho" | "contrata" | "";
  investimentoMensal: FaixaInvestimento | "";
}

export const initialFormState: FormState = {
  nomeCompleto: "",
  documento: "",
  nomeEmpresa: "",
  email: "",
  telefone: "",
  segmento: "",
  segmentoOutro: "",
  operacao: "",
  temCnpj: null,
  tipoCnpj: "",
  canal: "",
  instagram: "",
  papel: "",
  faturamentoMensal: "",
  pedidosMes: "",
  funcionarios: "",
  temVendedores: null,
  quantidadeVendedores: "",
  controle: "",
  sabeMargemReal: null,
  margemPercentual: "",
  descontaCustosVariaveis: null,
  produtos: [{ nome: "", custo: "", precoVenda: "" }],
  fonteCliente: "",
  fazTrafegoPago: null,
  gestaoTrafego: "",
  investimentoMensal: "",
};

export type StepId =
  | "nome"
  | "documento"
  | "empresa"
  | "email"
  | "telefone"
  | "segmento"
  | "operacao"
  | "cnpj"
  | "tipoCnpj"
  | "canal"
  | "instagram"
  | "papel"
  | "faturamento"
  | "pedidos"
  | "funcionarios"
  | "vendedores"
  | "controle"
  | "sabeMargem"
  | "margemPercentual"
  | "margemDesconta"
  | "produtos"
  | "fonteCliente"
  | "trafegoPago"
  | "gestaoTrafego"
  | "investimento";

/** Monta a sequência de perguntas de acordo com as respostas de ramificação já dadas. */
export function buildStepOrder(f: FormState): StepId[] {
  const steps: StepId[] = ["nome", "documento", "empresa", "email", "telefone", "segmento", "operacao", "cnpj"];

  if (f.temCnpj) steps.push("tipoCnpj");

  steps.push(
    "canal",
    "instagram",
    "papel",
    "faturamento",
    "pedidos",
    "funcionarios",
    "vendedores",
    "controle",
    "sabeMargem",
  );

  if (f.sabeMargemReal === true) {
    steps.push("margemPercentual", "margemDesconta");
  } else if (f.sabeMargemReal === false) {
    steps.push("produtos");
  }

  steps.push("fonteCliente", "trafegoPago");

  if (f.fazTrafegoPago === true) {
    steps.push("gestaoTrafego", "investimento");
  }

  return steps;
}
