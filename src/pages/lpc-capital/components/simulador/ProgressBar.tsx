import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const ETAPAS = ['Quanto você precisa?', 'Sobre o imóvel', 'Seus dados'];

interface ProgressBarProps {
  step: 1 | 2 | 3 | 4;
}

export function ProgressBar({ step }: ProgressBarProps) {
  const activeStep = Math.min(step, 3);
  const pct = ((activeStep - 1) / (ETAPAS.length - 1)) * 100;

  return (
    <div className="max-w-[720px] mx-auto px-6 pt-8 pb-2">
      <div className="relative h-1.5 rounded-full bg-[#0a0a0a]/10 mb-6">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-[#c9a227]"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="flex justify-between">
        {ETAPAS.map((label, i) => {
          const n = i + 1;
          const done = n < activeStep || step === 4;
          const active = n === activeStep && step !== 4;
          return (
            <div key={label} className="flex flex-col items-center gap-1.5 text-center w-1/3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done
                    ? 'bg-[#0a0a0a] text-white'
                    : active
                    ? 'bg-[#c9a227] text-[#0a0a0a]'
                    : 'bg-[#0a0a0a]/10 text-[#0a0a0a]/40'
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : n}
              </div>
              <span
                className={`text-xs font-medium ${
                  active || done ? 'text-[#0a0a0a]' : 'text-[#0a0a0a]/40'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
