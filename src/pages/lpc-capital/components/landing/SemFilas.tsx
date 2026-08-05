import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import sideImg from '../../assets/bg2.png';

export function SemFilas() {
  return (
    <section className="lpc-noise bg-[#00325b] relative overflow-hidden">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#c99900]/10 blur-[140px] pointer-events-none" />

      <div className="max-w-[1180px] mx-auto px-6 grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-20 lg:py-28 relative z-10"
        >
          <h2 className="text-white font-extrabold text-[clamp(28px,3.8vw,46px)] mb-5 leading-tight">
            Sem filas. Sem gerentes. <span className="lpc-shine-text">Sem obstáculos.</span>
          </h2>
          <p className="text-white/60 text-lg mb-9 max-w-md">
            Uma nova identidade com o mesmo compromisso: ampliar possibilidades através da
            tecnologia e da expertise humana.
          </p>
          <Link
            to="/lpccapital/simulacao"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c99900] to-[#f3de74] px-8 py-4 text-base font-bold text-[#00325b] hover:shadow-[0_0_32px_rgba(201,153,0,0.5)] transition-shadow"
          >
            Simule agora mesmo sem custo!
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative z-10 hidden lg:flex justify-end"
        >
          <div className="relative rounded-3xl overflow-hidden w-[340px] aspect-[3/4]">
            <img src={sideImg} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00325b]/60 via-transparent to-transparent" />
            <div className="absolute inset-0 ring-1 ring-inset ring-[#c99900]/25 rounded-3xl" />
          </div>
        </motion.div>
      </div>

      <div className="lpc-hairline" />
    </section>
  );
}
