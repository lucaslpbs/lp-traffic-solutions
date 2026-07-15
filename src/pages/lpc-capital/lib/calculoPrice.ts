// Taxa ilustrativa (1,09% a.m., mesma citada no site institucional da LPC Capital).
// A taxa final aplicada depende de análise e aprovação da instituição financeira parceira.
export const TAXA_MENSAL_ILUSTRATIVA = 0.0109;

export interface ResultadoSimulacao {
  parcela: number;
  totalJuros: number;
  totalPago: number;
}

// Amortização pela Tabela Price: PMT = PV * [ i(1+i)^n ] / [ (1+i)^n - 1 ]
export function calcularPrice(
  valorSolicitado: number,
  prazoMeses: number,
  taxaMensal: number = TAXA_MENSAL_ILUSTRATIVA
): ResultadoSimulacao {
  if (valorSolicitado <= 0 || prazoMeses <= 0) {
    return { parcela: 0, totalJuros: 0, totalPago: 0 };
  }

  const fator = Math.pow(1 + taxaMensal, prazoMeses);
  const parcela = (valorSolicitado * taxaMensal * fator) / (fator - 1);
  const totalPago = parcela * prazoMeses;
  const totalJuros = totalPago - valorSolicitado;

  return { parcela, totalJuros, totalPago };
}
