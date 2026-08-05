import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const LINHAS = [
  'Taxas competitivas',
  'Diversidade de instituições',
  'Soluções integradas',
  'Processo ágil e digital',
  'Atendimento 7 dias por semana',
  'Consultoria personalizada',
  'Foco total no cliente',
];

export function Comparativo() {
  return (
    <section className="bg-[#f4f7fa] py-24 lg:py-32">
      <div className="max-w-[900px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c99900]">Comparativo</span>
          <h2 className="lpc-display text-[#1d1d1d] font-semibold text-[clamp(26px,3.2vw,38px)] mt-2">
            Por que escolher a LPC Capital?
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_180px_180px] rounded-2xl overflow-hidden border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
        >
          <div className="bg-white" />
          <div className="relative bg-[#00325b] text-white text-center py-5 px-2 font-bold">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#c99900] to-[#f3de74] text-[#00325b] text-[10px] font-extrabold uppercase tracking-wide px-3 py-1 rounded-full whitespace-nowrap">
              Recomendado
            </span>
            LPC Capital
          </div>
          <div className="bg-[#e1e7ed] text-[#1d1d1d]/60 text-center py-5 px-2 font-bold">
            Bancos tradicionais
          </div>

          {LINHAS.map((linha, i) => (
            <div key={linha} className="contents">
              <div
                className={`px-5 py-4 text-sm font-medium text-[#1d1d1d]/80 flex items-center ${
                  i % 2 === 0 ? 'bg-white' : 'bg-[#eef2f6]'
                }`}
              >
                {linha}
              </div>
              <div
                className={`flex items-center justify-center py-4 ${
                  i % 2 === 0 ? 'bg-[#00325b]' : 'bg-[#04263f]'
                }`}
              >
                <Check className="w-5 h-5 text-[#f3de74]" strokeWidth={2.5} />
              </div>
              <div
                className={`flex items-center justify-center py-4 ${
                  i % 2 === 0 ? 'bg-[#e1e7ed]' : 'bg-[#d8dfe6]'
                }`}
              >
                <X className="w-5 h-5 text-[#1d1d1d]/25" strokeWidth={2.5} />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
