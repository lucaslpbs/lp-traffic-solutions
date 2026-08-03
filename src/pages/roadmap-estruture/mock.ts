import type { RoadmapPayload } from "./types";

export const mockRoadmap: RoadmapPayload = {
  diagnostico: {
    cadastro: {
      nomeCompleto: "Ana Paula Ribeiro",
      nomeEmpresa: "Ana Modas Atacado",
      documento: "123.456.789-00",
      email: "ana@exemplo.com",
      telefone: "(85) 99999-0000",
    },
    perfil: {
      segmento: "moda_feminina",
      operacao: "ambos",
      temCnpj: false,
      canal: "ambos",
      instagram: "@anamodasatacado",
      papel: "revendedor",
    },
    numeros: {
      faturamentoMensal: "15k_30k",
      pedidosMes: "50_100",
      funcionarios: "1_2",
      temVendedores: true,
      quantidadeVendedores: 1,
      controle: "caderno",
    },
    margem: {
      sabeMargemReal: false,
      produtos: [
        { nome: "Vestido midi", custo: 38, precoVenda: 79, margemCalculada: 51.9 },
        { nome: "Conjunto tricot", custo: 62, precoVenda: 109, margemCalculada: 43.1 },
        { nome: "Calça jeans", custo: 55, precoVenda: 89, margemCalculada: 38.2 },
      ],
      margemAgregada: 21.4,
    },
    aquisicao: {
      fontes: ["indicacao", "instagram_organico", "feira_presencial"],
      fazTrafegoPago: false,
    },
    respondidoEm: "2026-08-01T14:20:00Z",
  },
  roadmap: {
    chamada: "Você fatura bem — mas está entregando margem no caminho.",
    resumo:
      "Seu negócio já tem tração: entre R$15 mil e R$30 mil por mês, com 50 a 100 pedidos e uma vendedora te ajudando. O problema não é volume, é estrutura. Sua margem real agregada ficou em 21,4% — bem abaixo do que os preços de tabela sugerem — porque frete, embalagem e taxa de cartão não estão dentro do preço. Somado a isso, você opera sem CNPJ e controla vendas em caderno, o que trava crescimento e te expõe. A boa notícia: os três primeiros passos abaixo mexem em margem sem precisar vender um real a mais.",
    destaques: [
      {
        label: "Faturamento mensal",
        valor: "R$15k–30k",
        valorNumerico: 30,
        prefixo: "R$",
        sufixo: "k",
        observacao: "faixa informada no diagnóstico",
      },
      {
        label: "Margem real agregada",
        valor: "21,4%",
        valorNumerico: 21.4,
        sufixo: "%",
        observacao: "calculada a partir dos seus 3 produtos",
        tom: "critico",
      },
      {
        label: "Pedidos por mês",
        valor: "50 a 100",
        valorNumerico: 100,
        observacao: "controle em caderno",
      },
      {
        label: "Time comercial",
        valor: "1 vendedora",
        valorNumerico: 1,
        observacao: "sem meta e sem comissão definida",
        tom: "alerta",
      },
    ],
    alertas: [
      {
        titulo: "Sua margem real está no vermelho operacional",
        descricao:
          "Os preços de venda que você informou sugerem margem perto de 45%, mas ao entrar frete, embalagem e taxa de cartão a margem agregada cai para 21,4%. Nesse patamar, cada mês de crescimento aumenta o seu risco de caixa em vez de reduzir.",
        severidade: "critico",
      },
      {
        titulo: "Operar sem CNPJ com esse faturamento é risco ativo",
        descricao:
          "Com R$15k–30k/mês você já passou do que a informalidade suporta: sem CNPJ você não emite nota para atacado, não acessa crédito de capital de giro e não consegue formalizar sua vendedora.",
        severidade: "critico",
      },
    ],
    passos: [
      {
        titulo: "Reprecifique com custo total, não com custo de compra",
        tema: "Precificação",
        prioridade: "alta",
        impacto: "+12 p.p. de margem sem vender mais",
        explicacao:
          "Monte a ficha de custo de cada produto somando: preço de compra, frete de entrada, embalagem, taxa de cartão média e uma reserva de 3% para troca/perda. Só depois aplique o markup.",
        porque:
          "Nos seus 3 produtos, o vestido midi aparenta 51,9% de margem, mas os custos variáveis não estão embutidos — é o que derruba sua agregada para 21,4%.",
      },
      {
        titulo: "Abra o CNPJ e escolha o enquadramento certo",
        tema: "Formalização",
        prioridade: "alta",
        impacto: "acesso a nota, crédito e atacado formal",
        explicacao:
          "Com o seu faturamento, MEI provavelmente já não te atende: avalie ME no Simples Nacional. Faça a conta do imposto real antes de abrir, não depois.",
        porque:
          "Você vende no atacado e no varejo faturando R$15k–30k/mês sem CNPJ — o atacado exige nota e o teto do MEI não acompanha esse volume.",
      },
      {
        titulo: "Troque o caderno por um controle único de pedidos",
        tema: "Operação",
        prioridade: "alta",
        impacto: "visibilidade de recompra e inadimplência",
        explicacao:
          "Comece simples: uma planilha com cliente, data, itens, valor, forma de pagamento e status. O objetivo não é tecnologia, é conseguir responder quem comprou, quanto e quando volta.",
        porque:
          "Com 50 a 100 pedidos por mês em caderno, você não consegue ver recompra — e recompra é o lucro mais barato que existe no seu segmento.",
      },
      {
        titulo: "Dê meta e comissão clara para a sua vendedora",
        tema: "Comercial",
        prioridade: "media",
        impacto: "previsibilidade de venda",
        explicacao:
          "Defina meta mensal em faturamento, comissão sobre margem (não sobre venda bruta) e um ritual semanal de acompanhamento de 20 minutos.",
        porque:
          "Você já tem 1 vendedora, mas sem meta definida a estrutura comercial vira custo fixo em vez de alavanca.",
      },
      {
        titulo: "Estruture o Instagram como vitrine de atacado",
        tema: "Aquisição",
        prioridade: "media",
        explicacao:
          "Separe conteúdo de varejo e de atacado, fixe destaques com condições de pedido mínimo e coloque um único caminho de contato no WhatsApp.",
        porque:
          "Hoje seus clientes vêm de indicação, orgânico e feira — todos canais sem controle de volume. Organizar o perfil é pré-requisito para o próximo passo.",
      },
      {
        titulo: "Só depois disso, ligue o tráfego pago",
        tema: "Escala",
        prioridade: "baixa",
        explicacao:
          "Com margem corrigida, CNPJ ativo e pedidos controlados, o tráfego pago passa a multiplicar um negócio saudável. Comece com verba pequena focada em captação de lojista para o atacado.",
        porque:
          "Você ainda não investe em tráfego. Ligar mídia com margem de 21,4% escalaria o prejuízo, não o lucro.",
      },
    ],
    cta: {
      titulo: "O próximo passo é escala",
      texto:
        "Quando os quatro primeiros passos estiverem de pé, o gargalo deixa de ser estrutura e passa a ser demanda. É aí que entra o tráfego pago feito com método.",
      botao: "Quero falar sobre escalar com tráfego",
      url: "#",
    },
    geradoEm: "2026-08-03T10:00:00Z",
  },
};
