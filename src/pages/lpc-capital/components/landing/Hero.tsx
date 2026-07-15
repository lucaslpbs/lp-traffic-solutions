import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import heroImg from '../../assets/bg3.png';

export function Hero() {
  return (
    <section id="topo" className="lpc-noise bg-[#0a0a0a] relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-[#c9a227]/20 blur-[120px] pointer-events-none" />

      <div className="max-w-[1180px] mx-auto px-6 relative grid lg:grid-cols-[1.1fr_0.9fr] items-end">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="py-24 lg:py-32 relative z-10"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#e8c968] mb-5 border border-[#c9a227]/40 rounded-full px-4 py-1.5">
            Crédito com garantia de imóvel
          </span>
          <h1 className="text-white font-extrabold leading-[1.08] text-[clamp(32px,4.6vw,54px)] mb-6">
            A fintech que descomplica, potencializa e conecta você ao{' '}
            <span className="lpc-shine-text">crédito com garantia de imóvel</span>
          </h1>
          <p className="text-white/60 text-lg mb-9 max-w-md">
            Sem burocracia, sem atendimento engessado, sem complicação.
          </p>
          <Link
            to="/lpccapital/simulacao"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c9a227] to-[#e8c968] px-8 py-4 text-base font-bold text-[#0a0a0a] hover:shadow-[0_0_32px_rgba(201,162,39,0.5)] transition-shadow"
          >
            Simule seu crédito com garantia de imóvel
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex justify-center lg:justify-end"
        >
          <img
            src={heroImg}
            alt="Especialista LPC Capital"
            className="w-[280px] sm:w-[340px] lg:w-[400px] h-auto object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
          />
        </motion.div>
      </div>

      <div className="lpc-hairline" />
    </section>
  );
}
