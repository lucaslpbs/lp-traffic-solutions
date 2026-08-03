// Tipagem do diagnóstico + roadmap gerado pela IA.
// A página apenas renderiza o que vier pronto no JSON — não impõe lógica de priorização.

export type Segmento =
  | "moda_feminina"
  | "moda_masculina"
  | "multimarcas"
  | "calcados"
  | "cosmeticos"
  | "alimentos"
  | "outro";

export type Operacao = "atacado" | "varejo" | "ambos";
export type TipoCnpj = "mei" | "me_simples" | "nao_sei";
export type Canal = "presencial_feira" | "online" | "ambos";
export type PapelNegocio = "revendedor" | "fabricante";

export type FaixaFaturamento =
  | "ate_3k"
  | "3k_6k"
  | "6k_15k"
  | "15k_30k"
  | "acima_30k";

export type FaixaPedidos = "ate_20" | "20_50" | "50_100" | "100_300" | "acima_300";
export type FaixaFuncionarios = "0" | "1_2" | "3_5" | "mais_5";
export type Controle = "crm" | "planilha" | "caderno" | "whatsapp_sem_controle";

export type FonteCliente =
  | "indicacao"
  | "instagram_organico"
  | "trafego_pago"
  | "feira_presencial"
  | "nao_sabe";

export type FaixaInvestimento =
  | "ate_300"
  | "300_1k"
  | "1k_3k"
  | "3k_10k"
  | "acima_10k";

export interface Cadastro {
  nomeCompleto: string;
  documento?: string; // CPF ou CNPJ
  nomeEmpresa?: string;
  email?: string;
  telefone?: string;
}

export interface PerfilNegocio {
  segmento: Segmento;
  segmentoOutro?: string;
  operacao: Operacao;
  temCnpj: boolean;
  tipoCnpj?: TipoCnpj;
  canal: Canal;
  instagram?: string;
  papel: PapelNegocio;
}

export interface NumerosNegocio {
  faturamentoMensal: FaixaFaturamento;
  pedidosMes: FaixaPedidos;
  funcionarios: FaixaFuncionarios;
  temVendedores: boolean;
  quantidadeVendedores?: number;
  controle: Controle;
}

export interface ProdutoMargem {
  nome: string;
  /** preço de compra (revendedor) ou custo de produção (fabricante) */
  custo: number;
  precoVenda: number;
  /** margem calculada em %, quando o backend já calcular */
  margemCalculada?: number;
}

export interface Margem {
  sabeMargemReal: boolean;
  /** informada pela pessoa quando sabeMargemReal = true */
  margemPercentual?: number;
  descontaCustosVariaveis?: boolean; // frete / embalagem / taxa de cartão
  produtos?: ProdutoMargem[];
  /** margem agregada calculada a partir dos produtos */
  margemAgregada?: number;
}

export interface Aquisicao {
  fontes: FonteCliente[];
  fazTrafegoPago: boolean;
  gestaoTrafego?: "sozinho" | "contrata";
  investimentoMensal?: FaixaInvestimento;
}

export interface Diagnostico {
  cadastro: Cadastro;
  perfil: PerfilNegocio;
  numeros: NumerosNegocio;
  margem: Margem;
  aquisicao: Aquisicao;
  respondidoEm?: string; // ISO
}

export interface RoadmapPasso {
  id?: string;
  titulo: string;
  explicacao: string;
  /** o "porquê", ligado aos números da pessoa */
  porque?: string;
  prioridade?: "alta" | "media" | "baixa";
  /** rótulo curto opcional, ex: "Precificação", "Formalização" */
  tema?: string;
  /** ganho/impacto estimado em texto livre, ex: "+8 p.p. de margem" */
  impacto?: string;
}

export interface RoadmapAlerta {
  titulo: string;
  descricao: string;
  /** critico = escarlate; atencao = laranja */
  severidade?: "critico" | "atencao";
}

export interface RoadmapDestaque {
  label: string;
  valor: string;
  /** valor numérico opcional para animar a contagem */
  valorNumerico?: number;
  sufixo?: string;
  prefixo?: string;
  observacao?: string;
  tom?: "neutro" | "alerta" | "critico";
}

export interface Roadmap {
  resumo: string;
  /** frase curta de abertura, opcional */
  chamada?: string;
  destaques?: RoadmapDestaque[];
  passos: RoadmapPasso[];
  alertas?: RoadmapAlerta[];
  cta?: {
    titulo?: string;
    texto?: string;
    botao?: string;
    url?: string;
  };
  geradoEm?: string;
}

export interface RoadmapPayload {
  diagnostico: Diagnostico;
  roadmap: Roadmap;
}
