import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import logoQSol from '../assets/logo-usebiquinisqsol.jpg';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const wordUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const titleLine1 = 'Verão a mais.';
const titleLine2 = 'Vendas a mais.';

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-5"
      style={{ background: 'linear-gradient(135deg, #FF7A3D 0%, #FF4F6E 45%, #FFC857 100%)' }}
    >
      {/* Animated sunset gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(120deg, #FF7A3D 0%, #FF4F6E 30%, #FFC857 60%, #FF7A3D 100%)',
          backgroundSize: '300% 300%',
        }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      />

      {/* Rising light bubbles */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${8 + i * 9.5}%`,
            width: 6 + (i % 4) * 5,
            height: 6 + (i % 4) * 5,
            background: 'rgba(255,248,240,0.55)',
            bottom: -40,
          }}
          animate={{ y: [-0, -700], opacity: [0, 0.8, 0] }}
          transition={{
            duration: 9 + (i % 5),
            repeat: Infinity,
            delay: i * 0.9,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16 max-w-6xl mx-auto pt-20 pb-10 md:pt-24 md:pb-16"
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="text-center md:text-left max-w-xl"
        >
          <motion.p
            variants={wordUp}
            className="font-body uppercase text-[#FFF8F0] text-xs md:text-sm tracking-[0.28em] mb-5"
          >
            Traffic Solutions × Use Biquínis Q'Sol
          </motion.p>

          <h1 className="font-display font-bold text-[#0B1F4D] leading-[1.05] text-[clamp(36px,6vw,64px)] mb-4">
            <motion.span variants={wordUp} className="block">
              {titleLine1}
            </motion.span>
            <motion.span variants={wordUp} className="block">
              {titleLine2}
            </motion.span>
          </h1>

          <motion.p
            variants={wordUp}
            transition={{ delay: 0.3 }}
            className="font-body text-[#0B1F4D]/90 text-base md:text-lg leading-relaxed mb-8 max-w-md mx-auto md:mx-0"
          >
            Uma proposta comercial com 3 caminhos possíveis para acelerar as mensagens no
            WhatsApp e as vendas da Use Biquínis Q'Sol nesta temporada.
          </motion.p>

          <motion.div variants={wordUp} className="flex items-center gap-2 justify-center md:justify-start">
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B1F4D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </motion.span>
            <p className="font-body text-sm md:text-base font-semibold text-[#0B1F4D]/85">
              Role para baixo para ver as 3 propostas
            </p>
          </motion.div>
        </motion.div>

        {/* Floating art card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ rotate: 0, scale: 1.03 }}
          className="relative shrink-0"
        >
          <motion.div
            animate={{ rotate: [0, 2, -2, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-56 h-56 md:w-72 md:h-72 rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FFF8F0]"
          >
            <img
              src={logoQSol}
              alt="Use Biquínis Q'Sol"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 cursor-pointer"
        onClick={() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0B1F4D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </motion.div>
    </section>
  );
}
