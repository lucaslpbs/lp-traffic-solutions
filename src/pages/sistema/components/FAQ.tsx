import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "Preciso já ter um time grande de tráfego pago?",
    a: "Não, o sistema se adapta do gestor solo a uma agência com vários clientes.",
  },
  {
    q: "Funciona pra qualquer nicho?",
    a: "Sim, desde que você rode ou gerencie tráfego no Meta e/ou Google Ads.",
  },
  {
    q: "Quanto tempo leva a implementação?",
    a: "Varia conforme o escopo fechado no diagnóstico. A maioria das implementações fica entre 2 e 4 semanas.",
  },
  {
    q: "É mensalidade de ferramenta ou serviço de implementação?",
    a: "É implementação — o sistema é configurado especificamente pra sua operação, não é acesso a uma plataforma genérica.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="w-full py-20 lg:py-28" style={{ background: "#161819" }}>
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-[clamp(1.4rem,3.5vw,2.4rem)] font-bold mb-12"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F0F1F2" }}
        >
          Perguntas frequentes
        </motion.h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-xl border overflow-hidden transition-colors"
              style={{
                borderColor: open === i ? "rgba(47,111,214,0.3)" : "rgba(240,241,242,0.12)",
                background: open === i ? "rgba(47,111,214,0.05)" : "rgba(255,255,255,0.02)",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-sm font-medium pr-4" style={{ color: "#F0F1F2", fontFamily: "Inter, sans-serif" }}>
                  {faq.q}
                </span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  className="flex-shrink-0 text-lg"
                  style={{ color: "#2f6fd6" }}
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="px-6 pb-4 text-sm leading-relaxed" style={{ color: "#c9cdd1", fontFamily: "Inter, sans-serif" }}>
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
