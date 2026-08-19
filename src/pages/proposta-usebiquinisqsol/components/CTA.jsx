import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative overflow-hidden px-5 py-16 md:py-32 flex items-center justify-center">
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(120deg, #FF7A3D 0%, #FF4F6E 35%, #FFC857 70%, #FF7A3D 100%)',
          backgroundSize: '300% 300%',
        }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 text-center max-w-xl"
      >
        <h2 className="font-display font-bold text-[#0B1F4D] text-[clamp(28px,5vw,44px)] leading-tight mb-4">
          Vamos conversar sobre o melhor caminho pra sua marca
        </h2>
        <p className="font-body text-[#0B1F4D]/80 text-base md:text-lg mb-9">
          Sem compromisso — é só uma conversa para entender qual das três propostas encaixa
          melhor no momento da Use Biquínis Q'Sol.
        </p>

        <motion.a
          href="https://wa.me/5585998088064"
          target="_blank"
          rel="noopener noreferrer"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.96 }}
          className="inline-flex items-center gap-3 px-6 py-4 sm:px-9 sm:py-5 rounded-full font-body font-bold text-base sm:text-lg text-white shadow-2xl text-center"
          style={{ background: '#0B1F4D' }}
        >
          <motion.span
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <MessageCircle size={24} />
          </motion.span>
          Falar no WhatsApp agora
        </motion.a>
      </motion.div>
    </section>
  );
}
