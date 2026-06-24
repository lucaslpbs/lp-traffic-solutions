export interface Module {
  id: number;
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  highlight?: boolean;
}

export const modules: Module[] = [
  {
    id: 1,
    slug: "relatorios",
    eyebrow: "01 · Relatórios",
    title: "Relatório pronto, todo dia, sem ninguém pedir",
    description:
      "Meta Ads e Google Ads consolidados automaticamente. O cliente recebe o relatório certo, na hora certa, sem sua equipe abrir planilha.",
  },
  {
    id: 2,
    slug: "quarto-de-guerra",
    eyebrow: "02 · Quarto de Guerra",
    title: "Todas as campanhas de todos os clientes, numa tela só",
    description:
      "Criativo, conjunto de anúncio, campanha ativa, quanto está gastando — e alerta antes do custo sair do padrão.",
    highlight: true,
  },
  {
    id: 3,
    slug: "gestao-clientes",
    eyebrow: "03 · Gestão de Clientes",
    title: "Cadastra uma vez. O sistema monta tudo.",
    description:
      "Ao cadastrar um cliente novo, todas as automações dele são criadas automaticamente.",
  },
  {
    id: 4,
    slug: "robo-vendas",
    eyebrow: "04 · Robô de Vendas (análise)",
    title: "Ele lê toda conversa — e te avisa se o atendimento está bom",
    description:
      "O robô acompanha as conversas no WhatsApp, junta tudo periodicamente, resume com IA e diz se o atendimento está bom ou não.",
  },
  {
    id: 5,
    slug: "diario-de-bordo",
    eyebrow: "05 · Diário de Bordo",
    title: "O relatório chega sozinho — no ritmo que você escolher",
    description:
      "Diário, semanal ou mensal: você configura uma vez por cliente, e o relatório cai automaticamente no WhatsApp — sem precisar lembrar de mandar nada.",
  },
  {
    id: 6,
    slug: "alerta-saldo",
    eyebrow: "06 · Alerta de Saldo",
    title: "Antes de faltar saldo, alguém já sabe",
    description:
      "O sistema avisa automaticamente quando o saldo da conta de anúncios está acabando.",
  },
  {
    id: 7,
    slug: "contratos",
    eyebrow: "07 · Contratos Automáticos",
    title: "Formulário preenchido. Contrato pronto.",
    description:
      "Com base no formulário de fechamento, o contrato é gerado e enviado pra assinatura, sem redigir nada manualmente.",
  },
  {
    id: 8,
    slug: "sdr-atendimento",
    eyebrow: "08 · SDR de Atendimento",
    title: "Um SDR que atende de verdade — no tom do seu negócio",
    description:
      "Esse robô não analisa depois: ele responde o lead na hora. E o jeito que ele fala é seu — o prompt é configurável, e o ajuste fica nas suas mãos.",
  },
];
