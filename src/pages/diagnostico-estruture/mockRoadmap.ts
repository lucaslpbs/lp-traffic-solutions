// Converte o estado do formulário em Diagnostico e monta um Roadmap mockado,
// coerente com as respostas — só para fechar o fluxo ponta a ponta em dev/teste.
// A geração real (API Anthropic) é construída à parte.

import type { Diagnostico, Roadmap, RoadmapAlerta, RoadmapDestaque, RoadmapPasso, RoadmapPayload } from "../roadmap-estruture/types";
import { faturamentoLabel, margemExibida, pedidosLabel, primeiroNome } from "../roadmap-estruture/labels";
import type { FormState } from "./state";

function numOrUndefined(v: string): number | undefined {
  if (!v.trim()) return undefined;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

export function buildDiagnostico(f: FormState): Diagnostico {
  const produtos =
    f.sabeMargemReal === false
      ? f.produtos
          .filter((p) => p.nome.trim() || numOrUndefined(p.custo) || numOrUndefined(p.precoVenda))
          .map((p) => {
            const custo = numOrUndefined(p.custo) ?? 0;
            const precoVenda = numOrUndefined(p.precoVenda) ?? 0;
            const margemCalculada = precoVenda > 0 ? Number((((precoVenda - custo) / precoVenda) * 100).toFixed(1)) : undefined;
            return { nome: p.nome || "Produto sem nome", custo, precoVenda, margemCalculada };
          })
      : undefined;

  const margemAgregada =
    produtos && produtos.length
      ? Number((produtos.reduce((acc, p) => acc + (p.margemCalculada ?? 0), 0) / produtos.length).toFixed(1))
      : undefined;

  return {
    cadastro: {
      nomeCompleto: f.nomeCompleto,
      documento: f.documento || undefined,
      nomeEmpresa: f.nomeEmpresa || undefined,
      email: f.email || undefined,
      telefone: f.telefone || undefined,
    },
    perfil: {
      segmento: (f.segmento || "outro") as Diagnostico["perfil"]["segmento"],
      segmentoOutro: f.segmento === "outro" ? f.segmentoOutro || undefined : undefined,
      operacao: (f.operacao || "ambos") as Diagnostico["perfil"]["operacao"],
      temCnpj: !!f.temCnpj,
      tipoCnpj: f.temCnpj ? f.tipoCnpj || undefined : undefined,
      canal: (f.canal || "ambos") as Diagnostico["perfil"]["canal"],
      instagram: f.instagram || undefined,
      papel: (f.papel || "revendedor") as Diagnostico["perfil"]["papel"],
    },
    numeros: {
      faturamentoMensal: (f.faturamentoMensal || "ate_3k") as Diagnostico["numeros"]["faturamentoMensal"],
      pedidosMes: (f.pedidosMes || "ate_20") as Diagnostico["numeros"]["pedidosMes"],
      funcionarios: (f.funcionarios || "0") as Diagnostico["numeros"]["funcionarios"],
      temVendedores: !!f.temVendedores,
      quantidadeVendedores: f.temVendedores ? numOrUndefined(f.quantidadeVendedores) : undefined,
      controle: (f.controle || "caderno") as Diagnostico["numeros"]["controle"],
    },
    margem: {
      sabeMargemReal: !!f.sabeMargemReal,
      margemPercentual: f.sabeMargemReal ? numOrUndefined(f.margemPercentual) : undefined,
      descontaCustosVariaveis: f.sabeMargemReal ? !!f.descontaCustosVariaveis : undefined,
      produtos,
      margemAgregada,
    },
    aquisicao: {
      fontes: f.fonteCliente ? [f.fonteCliente] : [],
      fazTrafegoPago: !!f.fazTrafegoPago,
      gestaoTrafego: f.fazTrafegoPago ? f.gestaoTrafego || undefined : undefined,
      investimentoMensal: f.fazTrafegoPago ? f.investimentoMensal || undefined : undefined,
    },
    respondidoEm: new Date().toISOString(),
  };
}

const FONTE_RESUMO: Record<string, string> = {
  indicacao: "indicação/boca a boca",
  instagram_organico: "Instagram orgânico",
  trafego_pago: "tráfego pago",
  feira_presencial: "feira/presencial",
  nao_sabe: "uma origem que você ainda não identificou",
};

function fonteResumo(d: Diagnostico): string {
  const fonte = d.aquisicao.fontes[0];
  return fonte ? FONTE_RESUMO[fonte] ?? "múltiplos canais" : "uma origem ainda não identificada";
}

export function buildMockRoadmap(d: Diagnostico): Roadmap {
  const nome = primeiroNome(d.cadastro.nomeCompleto) || "Você";
  const margem = margemExibida(d);
  const faturamento = faturamentoLabel[d.numeros.faturamentoMensal];
  const pedidos = pedidosLabel[d.numeros.pedidosMes];

  const margemBaixa = typeof margem === "number" && margem < 30;
  const margemDesconhecida = typeof margem !== "number";
  const semCnpjRelevante = !d.perfil.temCnpj && d.numeros.faturamentoMensal !== "ate_3k";
  const controleFragil = d.numeros.controle === "caderno" || d.numeros.controle === "whatsapp_sem_controle";

  const destaques: RoadmapDestaque[] = [
    { label: "Faturamento mensal", valor: faturamento, observacao: "faixa informada no diagnóstico" },
  ];
  if (typeof margem === "number") {
    destaques.push({
      label: d.margem.sabeMargemReal ? "Margem informada" : "Margem real agregada",
      valor: `${margem.toLocaleString("pt-BR")}%`,
      valorNumerico: margem,
      sufixo: "%",
      observacao: d.margem.sabeMargemReal ? "informada por você" : "calculada a partir dos seus produtos",
      tom: margemBaixa ? "critico" : "neutro",
    });
  }
  destaques.push({ label: "Pedidos por mês", valor: pedidos });
  if (d.numeros.temVendedores) {
    destaques.push({
      label: "Time comercial",
      valor: `${d.numeros.quantidadeVendedores ?? 1} vendedor(es)`,
      valorNumerico: d.numeros.quantidadeVendedores ?? 1,
    });
  }

  const alertas: RoadmapAlerta[] = [];
  if (margemBaixa) {
    alertas.push({
      titulo: "Sua margem real está no vermelho operacional",
      descricao: `Com ${margem?.toLocaleString("pt-BR")}% de margem, cada mês de crescimento aumenta o risco de caixa em vez de reduzir. Vale revisar a precificação antes de investir em mais vendas.`,
      severidade: "critico",
    });
  }
  if (semCnpjRelevante) {
    alertas.push({
      titulo: "Operar sem CNPJ com esse faturamento é risco ativo",
      descricao: `Com ${faturamento} por mês, a informalidade já limita crédito, nota fiscal para atacado e formalização de equipe.`,
      severidade: "critico",
    });
  }
  if (controleFragil) {
    alertas.push({
      titulo: "Controle manual esconde recompra e inadimplência",
      descricao: "Sem um controle único de pedidos fica difícil ver quem comprou, quanto e quando volta a comprar.",
      severidade: "atencao",
    });
  }

  const passos: RoadmapPasso[] = [];
  if (margemBaixa || margemDesconhecida) {
    passos.push({
      titulo: "Reprecifique com custo total, não com custo de compra",
      tema: "Precificação",
      prioridade: "alta",
      impacto: "margem real visível antes de vender mais",
      explicacao:
        "Monte a ficha de custo somando preço de compra ou produção, frete, embalagem, taxa de cartão e uma reserva para troca/perda antes de aplicar o markup.",
      porque: margemDesconhecida
        ? "Você ainda não tem a margem real mapeada — sem isso, qualquer decisão de crescimento é um chute."
        : `Sua margem calculada ficou em ${margem?.toLocaleString("pt-BR")}%, abaixo do saudável para o seu segmento.`,
    });
  }
  if (semCnpjRelevante) {
    passos.push({
      titulo: "Abra o CNPJ e escolha o enquadramento certo",
      tema: "Formalização",
      prioridade: "alta",
      impacto: "acesso a nota, crédito e atacado formal",
      explicacao: "Avalie MEI ou ME no Simples Nacional de acordo com o seu faturamento e faça a conta do imposto real antes de abrir.",
      porque: `Com ${faturamento} por mês sem CNPJ, você já passou do que a informalidade suporta com segurança.`,
    });
  }
  if (controleFragil) {
    passos.push({
      titulo: "Troque o controle manual por um sistema único de pedidos",
      tema: "Operação",
      prioridade: "media",
      impacto: "visibilidade de recompra",
      explicacao: "Comece simples: uma planilha com cliente, data, itens, valor e status já é suficiente para começar a enxergar o negócio.",
      porque: `Hoje seu controle é feito por ${d.numeros.controle === "caderno" ? "caderno" : "WhatsApp sem controle"}, o que esconde a recompra.`,
    });
  }
  if (d.numeros.temVendedores) {
    passos.push({
      titulo: "Dê meta e comissão clara para o seu time comercial",
      tema: "Comercial",
      prioridade: "media",
      explicacao: "Defina meta mensal em faturamento, comissão sobre margem e um ritual semanal curto de acompanhamento.",
      porque: "Você já tem apoio comercial — sem meta definida, essa estrutura vira custo fixo em vez de alavanca.",
    });
  }
  passos.push({
    titulo: d.perfil.instagram ? "Estruture o Instagram como vitrine de atacado" : "Defina um canal principal de aquisição",
    tema: "Aquisição",
    prioridade: "media",
    explicacao: d.perfil.instagram
      ? "Separe conteúdo de varejo e de atacado, fixe destaques com condições de pedido mínimo e centralize o contato em um único canal."
      : "Escolha um canal para concentrar esforço — Instagram, indicação ou feira — antes de dividir energia entre vários ao mesmo tempo.",
    porque: `Hoje sua origem de clientes é: ${fonteResumo(d)}.`,
  });
  passos.push({
    titulo: d.aquisicao.fazTrafegoPago ? "Otimize o tráfego pago que você já faz" : "Só depois disso, ligue o tráfego pago",
    tema: "Escala",
    prioridade: "baixa",
    explicacao: d.aquisicao.fazTrafegoPago
      ? "Revise criativos, público e página de destino antes de aumentar verba — escalar erro só multiplica prejuízo."
      : "Com margem corrigida, CNPJ ativo e pedidos controlados, o tráfego pago passa a multiplicar um negócio saudável.",
    porque: d.aquisicao.fazTrafegoPago
      ? "Você já investe em mídia — o próximo ganho vem de eficiência, não de mais verba."
      : "Ligar mídia antes de resolver estrutura escala o prejuízo, não o lucro.",
  });

  const chamada = margemBaixa
    ? `${nome}, você fatura bem — mas está entregando margem no caminho.`
    : semCnpjRelevante
      ? `${nome}, o volume já pede estrutura formal.`
      : `${nome}, seu diagnóstico está pronto.`;

  const resumo = `Seu negócio fatura ${faturamento} por mês, com ${pedidos.toLowerCase()}. ${
    margemBaixa
      ? `Sua margem real ficou em ${margem?.toLocaleString("pt-BR")}%, abaixo do ideal — os primeiros passos abaixo mexem nisso sem precisar vender mais.`
      : margemDesconhecida
        ? "Você ainda não tem a margem real mapeada — esse é o primeiro ponto a resolver."
        : `Sua margem está em ${margem?.toLocaleString("pt-BR")}%, um bom ponto de partida para pensar em crescimento.`
  }`;

  return {
    chamada,
    resumo,
    destaques,
    alertas,
    passos,
    cta: {
      titulo: "O próximo passo é escala",
      texto:
        "Quando os primeiros passos estiverem de pé, o gargalo deixa de ser estrutura e passa a ser demanda. É aí que entra o tráfego pago feito com método.",
      botao: "Quero falar sobre escalar com tráfego",
      url: "#",
    },
    geradoEm: new Date().toISOString(),
  };
}

export function buildRoadmapPayload(f: FormState): RoadmapPayload {
  const diagnostico = buildDiagnostico(f);
  return { diagnostico, roadmap: buildMockRoadmap(diagnostico) };
}
