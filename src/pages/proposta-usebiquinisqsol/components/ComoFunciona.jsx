import { motion } from 'framer-motion';
import { Megaphone, MessageCircle, Store, ShoppingBag } from 'lucide-react';

const steps = [
  { icon: Megaphone, label: 'Tráfego pago direcionado', color: '#FF7A3D' },
  { icon: MessageCircle, label: 'Pessoa manda mensagem no WhatsApp', color: '#FF4F6E' },
  { icon: Store, label: 'Time/loja atende', color: '#0FA3B1' },
  { icon: ShoppingBag, label: 'Venda', color: '#FFC857' },
];

const stepVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.85 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ComoFunciona() {
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
          03 · COMO FUNCIONA
        </p>
        <h2 className="font-display font-bold text-[#F0F1F2] text-[clamp(26px,4vw,40px)] leading-tight">
          Do anúncio à venda, em 4 passos
        </h2>
      </motion.div>

      <div className="relative max-w-5xl mx-auto">
        {/* Connector line — desktop */}
        <svg
          className="hidden md:block absolute top-10 left-0 w-full h-2 -z-0"
          viewBox="0 0 1000 8"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M 60 4 L 940 4"
            stroke="#FFC857"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          />
        </svg>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 relative">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                custom={i}
                variants={stepVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col items-center text-center gap-4"
              >
                <motion.div
                  initial={{ rotate: -20, scale: 0.6 }}
                  whileInView={{ rotate: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.35 + 0.15, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg relative z-10"
                  style={{ background: step.color }}
                >
                  <Icon size={32} className="text-white" />
                  <span
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs text-[#F0F1F2] bg-[#161819] border-2"
                    style={{ borderColor: step.color }}
                  >
                    {i + 1}
                  </span>
                </motion.div>
                <p className="font-body text-sm font-semibold text-[#F0F1F2] max-w-[160px]">
                  {step.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
