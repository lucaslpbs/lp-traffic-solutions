import { useMemo, useState } from 'react';
import { calcularPrice } from '../lib/calculoPrice';

export type TipoImovel = 'Apartamento' | 'Casa' | 'Sala comercial' | 'Terreno' | 'Outros';
export type PropriedadeImovel = 'Imóvel próprio' | 'Pai ou mãe' | 'Cônjuge' | 'Filho ou filha';

export interface SimuladorData {
  // Etapa 1
  valor: number;
  prazo: number;
  // Etapa 2
  tipoImovel: TipoImovel | null;
  imovelFinanciado: boolean | null;
  valorRestante: number;
  imovelCondominio: boolean | null;
  propriedadeImovel: PropriedadeImovel | null;
  valorImovel: number;
  metragem: string;
  // Etapa 3
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  rendaMensal: number;
  cep: string;
  cidade: string;
  estado: string;
  endereco: string;
  bairro: string;
  numero: string;
  complemento: string;
  aceitaTermos: boolean;
  aceitaCadastroPositivo: boolean;
  aceitaSCR: boolean;
}

const INITIAL_DATA: SimuladorData = {
  valor: 250000,
  prazo: 120,
  tipoImovel: null,
  imovelFinanciado: null,
  valorRestante: 0,
  imovelCondominio: null,
  propriedadeImovel: null,
  valorImovel: 500000,
  metragem: '',
  nome: '',
  email: '',
  telefone: '',
  cpf: '',
  rendaMensal: 0,
  cep: '',
  cidade: '',
  estado: '',
  endereco: '',
  bairro: '',
  numero: '',
  complemento: '',
  aceitaTermos: false,
  aceitaCadastroPositivo: false,
  aceitaSCR: false,
};

export function useSimulador() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [data, setData] = useState<SimuladorData>(INITIAL_DATA);

  const update = <K extends keyof SimuladorData>(key: K, value: SimuladorData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const resultado = useMemo(() => calcularPrice(data.valor, data.prazo), [data.valor, data.prazo]);

  const goNext = () => setStep((s) => (s < 4 ? ((s + 1) as typeof s) : s));
  const goPrev = () => setStep((s) => (s > 1 ? ((s - 1) as typeof s) : s));

  const submit = () => {
    // TODO: integrar com backend/CRM real
    console.log('Simulação enviada (protótipo):', { ...data, resultado });
    setStep(4);
  };

  return { step, setStep, data, update, resultado, goNext, goPrev, submit };
}

export type UseSimuladorReturn = ReturnType<typeof useSimulador>;
