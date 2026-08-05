import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import { formatCurrency, formatCurrencyPrecise } from '../../lib/masks';
import type { SimuladorData } from '../../hooks/useSimulador';

interface ResumoLateralProps {
  data: SimuladorData;
  parcela: number;
  step: 1 | 2 | 3 | 4;
}

export function ResumoLateral({ data, parcela, step }: ResumoLateralProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const linhas = [
    { label: 'Valor solicitado', value: formatCurrency(data.valor) },
    { label: 'Prazo', value: `${data.prazo} meses` },
    ...(step >= 2 && data.tipoImovel ? [{ label: 'Tipo de imóvel', value: data.tipoImovel }] : []),
  ];

  return (
    <>
      {/* Mobile: collapsible bar */}
      <div className="lg:hidden sticky top-20 z-30 bg-white border-b border-[#00325b]/10 shadow-sm">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5"
        >
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-wide text-[#00325b]/50 font-semibold">
              Parcela estimada
            </p>
            <p className="text-lg font-extrabold text-[#00325b]">
              <AnimatedNumber value={parcela} format={formatCurrencyPrecise} />
              <span className="text-xs font-medium text-[#00325b]/50">/mês</span>
            </p>
            <div className="h-0.5 w-8 bg-[#c99900] rounded-full mt-1" />
          </div>
          <ChevronDown
            className={`w-5 h-5 text-[#00325b] transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-4 flex flex-col gap-2">
                {linhas.map((l) => (
                  <div key={l.label} className="flex justify-between text-sm">
                    <span className="text-[#1d1d1d]/55">{l.label}</span>
                    <span className="font-semibold text-[#00325b]">{l.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: sticky sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-28 bg-[#00325b] rounded-2xl border-t-2 border-t-[#c99900] shadow-[0_8px_32px_rgba(0,0,0,0.25)] p-6">
          <p className="text-[11px] uppercase tracking-wide text-white/45 font-semibold mb-1">
            Parcela estimada
          </p>
          <p className="text-3xl font-extrabold text-[#f3de74] mb-1">
            <AnimatedNumber value={parcela} format={formatCurrencyPrecise} />
          </p>
          <p className="text-xs text-white/35 mb-6">por mês, na Tabela Price</p>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5">
            {linhas.map((l) => (
              <div key={l.label} className="flex justify-between text-sm">
                <span className="text-white/50">{l.label}</span>
                <span className="font-semibold text-white text-right">{l.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
