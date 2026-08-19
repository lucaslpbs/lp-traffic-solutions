import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

export default function InvestimentoPlataforma() {
  return (
    <section className="bg-[#161819] px-5 pb-14 md:pb-28">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl mx-auto relative rounded-3xl p-6 sm:p-8 md:p-10 overflow-hidden"
        style={{ background: 'rgba(255,200,87,0.06)' }}
      >
        {/* Glowing animated border */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            padding: 2,
            background: 'linear-gradient(120deg, #FFC857, #FF7A3D, #FFC857)',
            backgroundSize: '200% 200%',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative flex items-start gap-4">
          <span className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center" style={{ background: '#FFC857' }}>
            <Info size={22} className="text-[#0B1F4D]" />
          </span>
          <div>
            <h3 className="font-display font-bold text-[#F0F1F2] text-xl md:text-2xl mb-3">
              Investimento em Plataforma
            </h3>
            <p className="font-body text-[#F0F1F2]/75 text-sm md:text-base leading-relaxed mb-4">
              O valor da gestão é diferente do valor investido em anúncios. A verba de anúncios
              (Meta Ads/Instagram) é sempre à parte e vai direto para a plataforma (Meta), não
              para a agência.
            </p>
            <div className="flex flex-col sm:inline-flex sm:flex-row sm:items-baseline gap-1 sm:gap-2 px-4 sm:px-5 py-3 rounded-xl" style={{ background: 'rgba(255,122,61,0.15)' }}>
              <span className="font-body text-xs uppercase tracking-wider text-[#F0F1F2]/60">
                Verba inicial combinada
              </span>
              <span className="font-display font-bold text-[#FFC857] text-xl">
                R$ 150/semana
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
