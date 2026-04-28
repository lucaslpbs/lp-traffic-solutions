// ── Mock data for Ciclo de Vendas dashboard ────────────────────────────────────
// Replace these with real computed data when enough closed deals are available.

export interface CicloMesMock {
  mes: string;
  diasMedios: number;
}

export interface CicloFaixaMock {
  faixa: string;
  leads: number;
}

export interface CicloAgenteMock {
  label: string;
  diasMedios: number;
  fechamentos: number;
}

export interface CicloKPIsMock {
  cicloMedio: number;
  cicloMediana: number;
  menorCiclo: number;
  maiorCiclo: number;
}

export const mockCicloKPIs: CicloKPIsMock = {
  cicloMedio: 47,
  cicloMediana: 38,
  menorCiclo: 3,
  maiorCiclo: 180,
};

// Tendência de queda ao longo do ano (maturidade da equipe / processo)
export const mockCicloPorMes: CicloMesMock[] = [
  { mes: 'Jan/25', diasMedios: 72 },
  { mes: 'Fev/25', diasMedios: 68 },
  { mes: 'Mar/25', diasMedios: 65 },
  { mes: 'Abr/25', diasMedios: 58 },
  { mes: 'Mai/25', diasMedios: 52 },
  { mes: 'Jun/25', diasMedios: 48 },
  { mes: 'Jul/25', diasMedios: 55 },
  { mes: 'Ago/25', diasMedios: 47 },
  { mes: 'Set/25', diasMedios: 42 },
  { mes: 'Out/25', diasMedios: 38 },
  { mes: 'Nov/25', diasMedios: 35 },
  { mes: 'Dez/25', diasMedios: 30 },
];

// Concentração maior em 30–60 dias (perfil típico imobiliário)
export const mockDistribuicaoFaixas: CicloFaixaMock[] = [
  { faixa: '0–15 dias',  leads: 8  },
  { faixa: '15–30 dias', leads: 22 },
  { faixa: '30–45 dias', leads: 45 },
  { faixa: '45–60 dias', leads: 38 },
  { faixa: '60–90 dias', leads: 27 },
  { faixa: '90+ dias',   leads: 12 },
];

export const mockCicloPorCorretor: CicloAgenteMock[] = [
  { label: 'Ana Lima',        diasMedios: 28, fechamentos: 18 },
  { label: 'Fernanda Costa',  diasMedios: 35, fechamentos: 14 },
  { label: 'Carlos Mendes',   diasMedios: 42, fechamentos: 22 },
  { label: 'Juliana Santos',  diasMedios: 47, fechamentos: 11 },
  { label: 'Ricardo Alves',   diasMedios: 58, fechamentos: 16 },
  { label: 'Marcos Pereira',  diasMedios: 73, fechamentos: 9  },
];

export const mockCicloPorProduto: CicloAgenteMock[] = [
  { label: 'Alameda dos Ipês',       diasMedios: 45, fechamentos: 42 },
  { label: 'Bela Sintra',            diasMedios: 38, fechamentos: 28 },
  { label: 'Residencial Porto Real', diasMedios: 62, fechamentos: 15 },
  { label: 'Jardim das Acácias',     diasMedios: 52, fechamentos: 8  },
];

export interface EtapaCicloMock {
  etapa: string;
  diasMedios: number;
  leads: number;
}

// Dias médios que leads ficam em cada etapa antes de avançar
// (dados simulados — substituir quando houver histórico de transições no CRM)
export const mockDiasPorEtapa: EtapaCicloMock[] = [
  { etapa: 'Contato inicial',      diasMedios: 5,  leads: 428 },
  { etapa: 'Em Atendimento',       diasMedios: 9,  leads: 312 },
  { etapa: 'Corretor nomeado',     diasMedios: 12, leads: 198 },
  { etapa: 'Visita agendada',      diasMedios: 7,  leads: 142 },
  { etapa: 'Visita REALIZADA',     diasMedios: 15, leads: 98  },
  { etapa: 'Documentos Pendentes', diasMedios: 22, leads: 64  },
  { etapa: 'Análise de crédito',   diasMedios: 18, leads: 47  },
  { etapa: 'Negociação',           diasMedios: 11, leads: 35  },
  { etapa: 'Contratado',           diasMedios: 4,  leads: 28  },
];

export const mockCicloPorCanal: CicloAgenteMock[] = [
  { label: 'Indicação',   diasMedios: 28, fechamentos: 32 },
  { label: 'Google Ads',  diasMedios: 38, fechamentos: 24 },
  { label: 'Instagram',   diasMedios: 42, fechamentos: 28 },
  { label: 'Site',        diasMedios: 47, fechamentos: 15 },
  { label: 'Plantão',     diasMedios: 55, fechamentos: 11 },
];
