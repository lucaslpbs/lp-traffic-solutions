import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function Abertura() {
  return (
    <section className="lpc-noise bg-[#00325b] relative overflow-hidden min-h-[92vh] flex items-center">
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#c99900]/15 blur-[140px] pointer-events-none" />

      <div className="max-w-[900px] mx-auto px-6 relative z-10 text-center py-24">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#f3de74] mb-7 border border-[#c99900]/40 rounded-full px-4 py-1.5"
        >
          Proposta comercial · LPC Capital
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-white font-extrabold leading-[1.1] text-[clamp(30px,5vw,54px)] mb-7"
        >
          O site atual está deixando dinheiro na mesa.{' '}
          <span className="lpc-shine-text">Aqui está o que construímos para mudar isso.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-white/55 text-lg max-w-2xl mx-auto"
        >
          Esta proposta compara o simulador de crédito atual (formulário longo, tudo digitado)
          com o que já está no ar em <span className="text-white/80">/lpccapital/simulacao</span> —
          e mostra o que está incluso no projeto completo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-16 flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-xs uppercase tracking-widest">Role para ver</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>

      <div className="lpc-hairline absolute bottom-0 left-0 right-0" />
    </section>
  );
}
