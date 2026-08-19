import {
  canalLabel,
  controleLabel,
  faturamentoLabel,
  fonteLabel,
  funcionariosLabel,
  investimentoLabel,
  operacaoLabel,
  papelLabel,
  pedidosLabel,
  segmentoLabel,
  tipoCnpjLabel,
} from "../roadmap-estruture/labels";

function toOptions<T extends string>(map: Record<T, string>) {
  return (Object.entries(map) as [T, string][]).map(([value, label]) => ({ value, label }));
}

export const segmentoOptions = toOptions(segmentoLabel);
export const operacaoOptions = toOptions(operacaoLabel);
export const tipoCnpjOptions = toOptions(tipoCnpjLabel);
export const canalOptions = toOptions(canalLabel);
export const papelOptions = toOptions(papelLabel);
export const faturamentoOptions = toOptions(faturamentoLabel);
export const pedidosOptions = toOptions(pedidosLabel);
export const funcionariosOptions = toOptions(funcionariosLabel);
export const controleOptions = toOptions(controleLabel);
export const fonteOptions = toOptions(fonteLabel);
export const investimentoOptions = toOptions(investimentoLabel);

export const gestaoTrafegoOptions = [
  { value: "sozinho" as const, label: "Cuido sozinho(a)" },
  { value: "contrata" as const, label: "Contrato alguém" },
];
