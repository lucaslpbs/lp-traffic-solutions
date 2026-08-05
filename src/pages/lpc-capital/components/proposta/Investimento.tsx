import { motion } from 'framer-motion';
import { ArrowRight, CreditCard } from 'lucide-react';

const WHATSAPP_URL = `https://api.whatsapp.com/send?phone=5511940775149&text=${encodeURIComponent(
  'Olá! Vi a proposta do novo site e quero conversar sobre o projeto.'
)}`;

export function Investimento() {
  return (
    <section className="lpc-noise bg-[#00325b] relative overflow-hidden py-24 lg:py-32">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#c99900]/10 blur-[140px] pointer-events-none" />

      <div className="max-w-[700px] mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c99900]">
            Investimento
          </span>
          <h2 className="lpc-display text-white font-semibold text-[clamp(28px,3.4vw,42px)] mt-2">
            O que custa colocar isso no ar
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lpc-corner-cut rounded-3xl border border-[#c99900]/30 bg-white/[0.03] p-10 md:p-14 mb-8"
        >
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/45 mb-3">
            Investimento único para o projeto completo
          </p>
          <p className="lpc-display text-[#f3de74] font-semibold text-[clamp(42px,6vw,64px)] mb-4">
            R$ 6.000
          </p>
          <p className="text-white/55 leading-relaxed max-w-md mx-auto mb-8">
            Inclui landing page institucional, simulador interativo, blog de conteúdo e
            otimização de SEO completa.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-white/40 border-t border-white/10 pt-6">
            <CreditCard className="w-4 h-4 text-[#c99900]" />
            <span>
              Também aceito parcelamento no cartão{' '}
              <span className="text-white/30">(sujeito às taxas da maquineta)</span>
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c99900] to-[#f3de74] px-9 py-4 text-base font-bold text-[#00325b] hover:shadow-[0_0_32px_rgba(201,153,0,0.5)] transition-shadow"
          >
            Falar sobre a proposta
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
