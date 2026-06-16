export type ClienteStatus = "ativo" | "inativo";

export interface Cliente {
  id: string;
  nome: string;
  logo?: string;
  status: ClienteStatus;
  periodo?: string;
  servico?: string;
}

const nomes = [
  "Livet", "Sara Rodrigues Dentista", "Clara Fashion", "Amo D'Flor",
  "Doce Encantaria", "LV3 Multimarcas", "Pretty Store", "Façanha Chik",
  "Óticas Prime", "Luiza Souza Conceito", "MsFarma", "Flavinha Paulino",
  "Bella Moda Gringa", "Thais Moda Praia", "Group Ms", "Rosa Be Boutique",
  "Óticas Visão", "NCSaude", "Traffic Solutions",
];

const slug = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const clientesMock: Cliente[] = nomes.map((nome, i) => ({
  id: slug(nome),
  nome,
  status: i % 7 === 6 ? "inativo" : "ativo",
  periodo: "2025",
  servico: "Tráfego Pago + Conteúdo",
}));

export type DemandaStatus =
  | "todo" | "doing" | "review_cliente" | "review_interno" | "ajustar" | "done";

export interface Demanda {
  id: string;
  titulo: string;
  clienteId: string;
  responsavel: string;
  entrega: string;
  prioridade: "alta" | "media" | "baixa";
  status: DemandaStatus;
}

export const demandasMock: Demanda[] = [
  { id: "d1", titulo: "Criar campanha Black Friday", clienteId: "livet", responsavel: "Ana", entrega: "20/06/26", prioridade: "alta", status: "todo" },
  { id: "d2", titulo: "Editar reels semanais", clienteId: "clara-fashion", responsavel: "Bruno", entrega: "18/06/26", prioridade: "media", status: "doing" },
  { id: "d3", titulo: "Relatório mensal", clienteId: "ncsaude", responsavel: "Carla", entrega: "30/06/26", prioridade: "alta", status: "review_interno" },
  { id: "d4", titulo: "Aprovar arte de feed", clienteId: "msfarma", responsavel: "Diego", entrega: "17/06/26", prioridade: "baixa", status: "review_cliente" },
  { id: "d5", titulo: "Ajustar copy do anúncio", clienteId: "pretty-store", responsavel: "Ana", entrega: "16/06/26", prioridade: "media", status: "ajustar" },
  { id: "d6", titulo: "Setup pixel Meta", clienteId: "oticas-visao", responsavel: "Bruno", entrega: "10/06/26", prioridade: "alta", status: "done" },
];

export const colunasKanban: { id: DemandaStatus; label: string }[] = [
  { id: "todo", label: "Para fazer" },
  { id: "doing", label: "Em andamento" },
  { id: "review_cliente", label: "Revisão do cliente" },
  { id: "review_interno", label: "Revisão interna" },
  { id: "ajustar", label: "Para ajustar" },
  { id: "done", label: "Concluído" },
];

export const mesesMetas = ["Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export interface MetaCelula {
  meta: string;
  resultado: string;
  obs: string;
}
export type MetasMap = Record<string, Record<string, MetaCelula>>;

export const metasMock: MetasMap = Object.fromEntries(
  clientesMock.map((c) => [
    c.id,
    Object.fromEntries(mesesMetas.map((m) => [m, { meta: "R$ 50k", resultado: "—", obs: "" }])),
  ])
);

export interface Fluxo {
  id: string;
  nome: string;
  descricao: string;
  responsavel: string;
  status: "ativo" | "rascunho" | "arquivado";
}

export const fluxosMock: Fluxo[] = [
  {
    id: "f1",
    nome: "Onboarding de Novos Clientes",
    descricao: "Processo padrão de boas-vindas, briefing, acessos e kick-off.",
    responsavel: "Equipe Operacional",
    status: "ativo",
  },
];

export const subAreasModal = {
  referencia: [
    "Escopo do trabalho",
    "Persona",
    "ICP",
    "Diretório de histórias do especialista",
    "Biblioteca de estudos e referências",
  ],
  fluxo: [
    "Lista de mineração",
    "Canais de comunicação",
    "Linhas editoriais",
    "Calendário editorial",
    "Relatórios",
    "Otimização",
    "Diário de Bordo",
  ],
};
