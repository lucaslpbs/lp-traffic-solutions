import { motion } from 'framer-motion';
import { BANCOS_PARCEIROS } from '../../lib/bancos';

export function ParceirosMarquee() {
  const track = [...BANCOS_PARCEIROS, ...BANCOS_PARCEIROS];

  return (
    <section id="parceiros" className="bg-white py-24 lg:py-28">
      <div className="max-w-[1180px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a227]">Parceiros</span>
          <h2 className="lpc-serif text-[#0f0e0c] font-semibold text-[clamp(26px,3.2vw,38px)] mt-2 mb-4">
            A plataforma multibancos que oferece mais opções para você
          </h2>
          <p className="text-[#0f0e0c]/60 leading-relaxed">
            Na LPC Capital, você tem acesso a produtos financeiros de mais de 30 instituições
            parceiras. Isso significa taxas mais competitivas, maiores chances de aprovação e
            atendimento consultivo de ponta a ponta.
          </p>
        </motion.div>
      </div>

      <div className="overflow-hidden relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
        <div className="lpc-marquee-track flex gap-4 w-max">
          {track.map((banco, i) => (
            <div
              key={`${banco.nome}-${i}`}
              className="shrink-0 w-40 h-24 rounded-xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center px-5 hover:border-[#c9a227]/40 transition-colors"
            >
              <img src={banco.logo} alt={banco.nome} className="max-w-full max-h-12 object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
