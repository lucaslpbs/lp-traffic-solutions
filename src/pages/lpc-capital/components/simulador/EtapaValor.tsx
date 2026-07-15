import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { LPCSlider } from './LPCSlider';
import { AnimatedNumber } from './AnimatedNumber';
import { formatCurrency, formatCurrencyPrecise } from '../../lib/masks';
import { TAXA_MENSAL_ILUSTRATIVA } from '../../lib/calculoPrice';
import type { UseSimuladorReturn } from '../../hooks/useSimulador';

const CHIPS_VALOR = [100000, 250000, 500000, 1000000, 2000000];

interface EtapaValorProps {
  sim: UseSimuladorReturn;
}

export function EtapaValor({ sim }: EtapaValorProps) {
  const { data, update, resultado, goNext } = sim;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="text-[#0a0a0a] font-extrabold text-2xl md:text-3xl mb-2">
        Quanto você precisa?
      </h2>
      <p className="text-[#1d1d1d]/55 mb-9">Mova os controles e veja o resultado na hora.</p>

      {/* Valor do empréstimo */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between mb-3">
          <label className="text-sm font-semibold text-[#0a0a0a]">Valor do empréstimo</label>
          <span className="text-2xl font-extrabold text-[#0a0a0a]">
            <AnimatedNumber value={data.valor} format={formatCurrency} />
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {CHIPS_VALOR.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => update('valor', v)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                data.valor === v
                  ? 'bg-[#0a0a0a] text-white'
                  : 'bg-[#0a0a0a]/[0.06] text-[#0a0a0a] hover:bg-[#0a0a0a]/10'
              }`}
            >
              {formatCurrency(v)}
            </button>
          ))}
        </div>

        <LPCSlider
          min={50000}
          max={3000000}
          step={5000}
          value={data.valor}
          onChange={(v) => update('valor', v)}
          ariaLabel="Valor do empréstimo"
        />
        <div className="flex justify-between text-xs text-[#1d1d1d]/40 mt-1.5">
          <span>R$ 50 mil</span>
          <span>R$ 3 milhões</span>
        </div>
      </div>

      {/* Prazo */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between mb-3">
          <label className="text-sm font-semibold text-[#0a0a0a]">Prazo</label>
          <span className="text-2xl font-extrabold text-[#0a0a0a]">
            <AnimatedNumber value={data.prazo} format={(n) => `${Math.round(n)} meses`} />
          </span>
        </div>

        <LPCSlider
          min={36}
          max={240}
          step={1}
          value={data.prazo}
          onChange={(v) => update('prazo', v)}
          ariaLabel="Prazo em meses"
        />
        <div className="flex justify-between text-xs text-[#1d1d1d]/40 mt-1.5">
          <span>36 meses</span>
          <span>240 meses</span>
        </div>
      </div>

      {/* Resultado em tempo real */}
      <div className="rounded-2xl bg-[#0a0a0a] p-6 md:p-7 grid sm:grid-cols-3 gap-6 mb-10">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-white/50 font-semibold mb-1">
            Parcela mensal estimada
          </p>
          <p className="text-2xl font-extrabold text-[#c9a227]">
            <AnimatedNumber value={resultado.parcela} format={formatCurrencyPrecise} />
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-white/50 font-semibold mb-1">
            Taxa aplicada
          </p>
          <p className="text-2xl font-extrabold text-white">
            {(TAXA_MENSAL_ILUSTRATIVA * 100).toFixed(2).replace('.', ',')}% a.m.
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-white/50 font-semibold mb-1">
            Total de juros no período
          </p>
          <p className="text-2xl font-extrabold text-white">
            <AnimatedNumber value={resultado.totalJuros} format={formatCurrency} />
          </p>
        </div>
      </div>
      <p className="text-xs text-[#1d1d1d]/40 -mt-6 mb-8">
        * Taxa ilustrativa. A taxa final depende de análise e aprovação da instituição financeira
        parceira.
      </p>

      <button
        type="button"
        onClick={goNext}
        className="inline-flex items-center gap-2 rounded-lg bg-[#c9a227] px-8 py-4 text-base font-bold text-[#0a0a0a] hover:bg-[#e8c968] transition-colors"
      >
        Continuar
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
