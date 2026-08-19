import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { MessageSquareText, TrendingUp, PiggyBank } from 'lucide-react';

function Counter({ from = 0, to, decimals = 0, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(from, to, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [isInView, from, to]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toFixed(decimals).replace('.', ',')}
      {suffix}
    </span>
  );
}

const metrics = [
  {
    icon: MessageSquareText,
    prefix: 'Até R$ ',
    to: 2.5,
    decimals: 2,
    suffix: '',
    label: 'Custo por mensagem recebida no WhatsApp',
    note: 'Teto de segurança usado como referência — a média real costuma ficar abaixo disso.',
  },
  {
    icon: TrendingUp,
    prefix: '',
    to: 6,
    decimals: 0,
    suffix: 'x',
    label: 'ROAS médio',
    note: 'Retorno médio sobre o valor investido em anúncios.',
  },
  {
    icon: PiggyBank,
    prefix: '',
    to: 3,
    decimals: 0,
    suffix: 'x',
    label: 'ROI médio',
    note: 'Retorno médio sobre o investimento total.',
  },
];

export default function Metricas() {
  return (
    <section className="bg-[#161819] px-5 py-14 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl mx-auto text-center mb-10 md:mb-16"
      >
        <p className="font-body uppercase text-[#2f6fd6] text-xs md:text-sm tracking-[0.28em] font-semibold mb-4">
          04 · MÉTRICAS E EXPECTATIVAS
        </p>
        <h2 className="font-display font-bold text-[#F0F1F2] text-[clamp(26px,4vw,40px)] leading-tight mb-5">
          Números que sustentam a proposta
        </h2>
        <p className="font-body text-[#F0F1F2]/65 text-base leading-relaxed">
          Moda praia é produto de desejo e impulso em época de verão, com ticket que favorece
          conversão direta via WhatsApp — um cenário favorável para os números abaixo.
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="rounded-2xl p-6 sm:p-8 text-center"
              style={{ background: 'rgba(24,72,146,0.18)', border: '1px solid rgba(47,111,214,0.3)', backdropFilter: 'blur(10px)' }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 + 0.1, type: 'spring', stiffness: 220 }}
                className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center"
                style={{ background: '#2f6fd6' }}
              >
                <Icon size={26} className="text-white" />
              </motion.div>

              <p className="font-display font-bold text-[#F0F1F2] text-4xl md:text-5xl mb-3">
                <Counter to={m.to} decimals={m.decimals} prefix={m.prefix} suffix={m.suffix} />
              </p>
              <p className="font-body font-semibold text-[#F0F1F2]/90 text-sm mb-2">{m.label}</p>
              <p className="font-body text-[#F0F1F2]/50 text-xs leading-relaxed">{m.note}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
