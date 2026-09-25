/**
 * Regras de alerta do Checklist: demandas fixas (recorrentes, com horario) e
 * data limite dos itens. Tudo aqui e puro (recebe "agora" por parametro) para
 * o quadro poder reavaliar a cada tick e para ser testavel isoladamente.
 *
 * Datas circulam como chave local "YYYY-MM-DD" — nunca via toISOString(), que
 * e UTC e viraria o dia depois das 21h no Brasil.
 */

export type Recorrencia = "semanal" | "mensal" | "unica";

export interface DemandaFixa {
  id: string;
  client_id: string;
  titulo: string;
  responsavel: string | null;
  recorrencia: Recorrencia;
  /** 0 = domingo ... 6 = sabado (mesmo valor de Date.getDay()). */
  dias_semana: number[];
  dia_mes: number | null;
  data_unica: string | null;
  /** "HH:MM" */
  horario: string;
  ativo: boolean;
  /** Data (chave) da ultima ocorrencia marcada como feita. */
  ultima_conclusao: string | null;
  /** Ocorrencia (chave) marcada como "pendente cliente": enviado, falta o cliente responder. */
  aguardando_ocorrencia: string | null;
  /** Observacao, valida so para a ocorrencia em observacao_ocorrencia — some quando a proxima chega. */
  observacao: string | null;
  observacao_ocorrencia: string | null;
  created_at: string | null;
}

export const DIAS_SEMANA_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DIAS_SEMANA_LONGO = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const DIAS_SEMANA_ABREV = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const DIA_MS = 86_400_000;

export const dateKey = (d: Date): string => {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

export const parseKey = (key: string): Date => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const addDias = (d: Date, n: number): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const diasNoMes = (d: Date): number => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

/** Diferenca em dias corridos (a - b), ambos como chaves "YYYY-MM-DD". */
export const diffDias = (a: string, b: string): number =>
  Math.round((parseKey(a).getTime() - parseKey(b).getTime()) / DIA_MS);

/** "HH:MM[:SS]" -> minutos desde 00:00. */
const minutosDoHorario = (horario: string): number => {
  const [h, m] = horario.split(":").map(Number);
  return h * 60 + (m || 0);
};

export const formatHorario = (horario: string): string => horario.slice(0, 5);

/** "ter 30/09" */
export const formatDiaCurto = (key: string): string => {
  const d = parseKey(key);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${DIAS_SEMANA_CURTO[d.getDay()].toLowerCase()} ${dd}/${mm}`;
};

const ocorreNoDia = (demanda: DemandaFixa, dia: Date): boolean => {
  switch (demanda.recorrencia) {
    case "semanal":
      return demanda.dias_semana.includes(dia.getDay());
    case "mensal":
      // Dia 31 em mes de 30 dias (ou 29/30 em fevereiro) cai no ultimo dia do mes.
      return !!demanda.dia_mes && dia.getDate() === Math.min(demanda.dia_mes, diasNoMes(dia));
    case "unica":
      return !!demanda.data_unica && dateKey(dia) === demanda.data_unica;
  }
};

/** Ocorrencia mais recente com data <= hoje. Recorrentes so contam a partir do dia do cadastro. */
const ultimaOcorrencia = (demanda: DemandaFixa, agora: Date): string | null => {
  const hoje = dateKey(agora);
  if (demanda.recorrencia === "unica") {
    return demanda.data_unica && demanda.data_unica <= hoje ? demanda.data_unica : null;
  }
  const criada = demanda.created_at ? dateKey(new Date(demanda.created_at)) : null;
  // O maior intervalo entre ocorrencias (mensal) e 31 dias.
  for (let i = 0; i <= 31; i++) {
    const dia = addDias(agora, -i);
    const key = dateKey(dia);
    if (criada && key < criada) return null;
    if (ocorreNoDia(demanda, dia)) return key;
  }
  return null;
};

/** Primeira ocorrencia depois de hoje. */
export const proximaOcorrencia = (demanda: DemandaFixa, agora: Date): string | null => {
  const hoje = dateKey(agora);
  if (demanda.recorrencia === "unica") {
    return demanda.data_unica && demanda.data_unica > hoje ? demanda.data_unica : null;
  }
  for (let i = 1; i <= 62; i++) {
    const dia = addDias(agora, i);
    if (ocorreNoDia(demanda, dia)) return dateKey(dia);
  }
  return null;
};

/**
 * Ocorrencia imediatamente anterior a `ocorrencia`. Serve para desfazer uma
 * conclusao: em vez de limpar `ultima_conclusao` (o que faria uma ocorrencia
 * antiga, ja resolvida, voltar como atrasada), ela volta para a anterior.
 */
export const ocorrenciaAnterior = (demanda: DemandaFixa, ocorrencia: string): string | null => {
  if (demanda.recorrencia === "unica") return null;
  const base = parseKey(ocorrencia);
  for (let i = 1; i <= 62; i++) {
    const dia = addDias(base, -i);
    if (ocorreNoDia(demanda, dia)) return dateKey(dia);
  }
  return null;
};

/**
 * Alerta (vermelho, sobe para o topo):
 *   hoje     — e o dia, ainda antes do horario (ja alerta desde a manha)
 *   vencida  — e o dia e o horario passou
 *   atrasada — a ocorrencia foi em um dia anterior e nao foi marcada como feita
 * Sem alerta:
 *   aguardando — feito o que dependia de mim, falta o cliente ("pendente cliente")
 *   proxima    — ainda nao e o dia; da para concluir antes
 *   feita      — a ocorrencia de hoje (ou a proxima, se concluida antes) esta feita
 */
export type EstadoDemanda = "hoje" | "vencida" | "atrasada" | "aguardando" | "proxima" | "feita";

export interface StatusDemanda {
  demanda: DemandaFixa;
  ocorrencia: string;
  estado: EstadoDemanda;
  /** Momento da ocorrencia (data + horario), em ms — usado para ordenar. */
  quando: number;
  /** Texto curto para o selo do card. */
  rotulo: string;
  /** Observacao desta ocorrencia ("" quando nao ha). */
  observacao: string;
}

const rotuloDuracao = (minutos: number): string => {
  if (minutos < 1) return "agora";
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
};

/**
 * Situacao da demanda fixa agora. Toda demanda ativa aparece no card: no dia
 * (ou atrasada) como alerta; "pendente cliente" quando ja fiz a minha parte;
 * fora do dia como linha normal ("proxima") que pode ser concluida antes;
 * concluida, fica "feita" ate a ocorrencia seguinte.
 */
export const statusDemanda = (demanda: DemandaFixa, agora: Date): StatusDemanda | null => {
  if (!demanda.ativo) return null;

  const hoje = dateKey(agora);
  const horarioMin = minutosDoHorario(demanda.horario);
  const horario = formatHorario(demanda.horario);
  const conclusao = demanda.ultima_conclusao;
  const feitaPara = (ocorrencia: string) => !!conclusao && conclusao >= ocorrencia;
  const aguardandoPara = (ocorrencia: string) =>
    !!demanda.aguardando_ocorrencia && demanda.aguardando_ocorrencia >= ocorrencia;
  const momento = (ocorrencia: string) => {
    const d = parseKey(ocorrencia);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, horarioMin).getTime();
  };
  const montar = (ocorrencia: string, estado: EstadoDemanda, rotulo: string): StatusDemanda => ({
    demanda,
    ocorrencia,
    estado,
    quando: momento(ocorrencia),
    rotulo,
    observacao: demanda.observacao_ocorrencia === ocorrencia ? demanda.observacao ?? "" : "",
  });
  const pendenteCliente = (ocorrencia: string) =>
    montar(ocorrencia, "aguardando", `Pendente cliente · ${formatDiaCurto(ocorrencia)}`);

  // 1) Ocorrencia de hoje ou de um dia anterior ainda sem conclusao: alerta —
  //    a menos que eu ja tenha feito a minha parte e falte o cliente.
  const passada = ultimaOcorrencia(demanda, agora);
  if (passada && !feitaPara(passada)) {
    if (aguardandoPara(passada)) return pendenteCliente(passada);
    if (passada < hoje) {
      return montar(passada, "atrasada", `Atrasada · ${formatDiaCurto(passada)} ${horario}`);
    }
    const agoraMin = agora.getHours() * 60 + agora.getMinutes();
    if (agoraMin >= horarioMin) {
      return montar(passada, "vencida", `Era às ${horario} · há ${rotuloDuracao(agoraMin - horarioMin)}`);
    }
    return montar(passada, "hoje", `Hoje às ${horario} · em ${rotuloDuracao(horarioMin - agoraMin)}`);
  }

  // 2) Concluida hoje: fica verde ate o fim do dia.
  if (passada === hoje) return montar(passada, "feita", `Feita · ${horario}`);

  // 3) Ainda nao e o dia da proxima ocorrencia.
  const proxima = proximaOcorrencia(demanda, agora);
  if (!proxima) return null;
  if (feitaPara(proxima)) return montar(proxima, "feita", `Feita · ${formatDiaCurto(proxima)} ${horario}`);
  if (aguardandoPara(proxima)) return pendenteCliente(proxima);
  return montar(proxima, "proxima", `Próxima · ${formatDiaCurto(proxima)} ${horario}`);
};

export const demandaEmAlerta = (s: StatusDemanda): boolean =>
  s.estado === "hoje" || s.estado === "vencida" || s.estado === "atrasada";

/** "Toda terça · 11:00", "Toda semana (ter, qui) · 11:00", "Todo dia 15 · 09:00", "ter 30/09 · 11:00" */
export const descreverRecorrencia = (d: DemandaFixa): string => {
  const horario = formatHorario(d.horario);
  switch (d.recorrencia) {
    case "semanal": {
      const dias = [...d.dias_semana].sort((a, b) => a - b);
      if (dias.length === 0) return `Sem dia definido · ${horario}`;
      if (dias.length === 7) return `Todo dia · ${horario}`;
      if (dias.length === 1) {
        const artigo = dias[0] === 0 || dias[0] === 6 ? "Todo" : "Toda";
        return `${artigo} ${DIAS_SEMANA_LONGO[dias[0]]} · ${horario}`;
      }
      return `Toda semana (${dias.map((i) => DIAS_SEMANA_ABREV[i]).join(", ")}) · ${horario}`;
    }
    case "mensal":
      return `Todo dia ${d.dia_mes} · ${horario}`;
    case "unica":
      return `${d.data_unica ? formatDiaCurto(d.data_unica) : "Sem data"} · ${horario}`;
  }
};

// ─── Data limite dos itens ───────────────────────────────────────────────────

export type EstadoPrazo = "atrasado" | "hoje" | "amanha" | "futuro";

export interface StatusPrazo {
  estado: EstadoPrazo;
  /** Dias ate a data limite (negativo = atrasado). */
  dias: number;
  rotulo: string;
}

interface ItemComPrazo {
  data_limite: string | null;
  concluido: boolean;
  arquivado: boolean;
}

export const statusPrazo = (item: ItemComPrazo, agora: Date): StatusPrazo | null => {
  if (!item.data_limite || item.concluido || item.arquivado) return null;
  const dias = diffDias(item.data_limite, dateKey(agora));
  if (dias < 0) return { estado: "atrasado", dias, rotulo: `Atrasado ${-dias}d` };
  if (dias === 0) return { estado: "hoje", dias, rotulo: "Vence hoje" };
  if (dias === 1) return { estado: "amanha", dias, rotulo: "Amanhã" };
  return { estado: "futuro", dias, rotulo: formatDiaCurto(item.data_limite) };
};

export const prazoEmAlerta = (s: StatusPrazo | null): boolean =>
  !!s && (s.estado === "atrasado" || s.estado === "hoje");

// ─── Alerta consolidado do card do cliente ───────────────────────────────────

export interface AlertaCliente {
  /** fixa = demanda fixa (vermelho); prazo = data limite de um item (ambar). */
  tipo: "fixa" | "prazo";
  /** Quanto menor, mais antigo/urgente — desempata a ordem dos cards. */
  quando: number;
}

export const alertaDoCliente = (
  demandas: StatusDemanda[],
  prazos: (StatusPrazo | null)[]
): AlertaCliente | null => {
  const fixas = demandas.filter(demandaEmAlerta);
  if (fixas.length > 0) return { tipo: "fixa", quando: Math.min(...fixas.map((s) => s.quando)) };
  const emAlerta = prazos.filter(prazoEmAlerta) as StatusPrazo[];
  if (emAlerta.length > 0) return { tipo: "prazo", quando: Math.min(...emAlerta.map((s) => s.dias)) };
  return null;
};

/** Cliente com alerta vem antes; fixa (vermelho) antes de prazo (ambar); depois o mais antigo. */
export const compararAlertas = (a: AlertaCliente | null, b: AlertaCliente | null): number => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  if (a.tipo !== b.tipo) return a.tipo === "fixa" ? -1 : 1;
  return a.quando - b.quando;
};
