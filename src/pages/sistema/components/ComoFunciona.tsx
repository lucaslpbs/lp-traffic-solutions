import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Diagnóstico",
    desc: "Conversa inicial pra entender a operação — quantos clientes, quais plataformas, o que funciona e o que trava.",
  },
  {
    number: "02",
    title: "Escopo fechado",
    desc: "Você aprova exatamente o que vai ser implementado, sem letra miúda. Nada começa antes de alinhar.",
  },
  {
    number: "03",
    title: "Implementação",
    desc: "O sistema entra no ar, configurado pra sua operação. Você acompanha cada etapa até estar rodando.",
  },
];

export default function ComoFunciona() {
  return (
    <section className="w-full py-20 lg:py-28" style={{ background: "#0f1215" }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-[clamp(1.4rem,3.5vw,2.4rem)] font-bold mb-14"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F0F1F2" }}
        >
          Como funciona o processo
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative"
            >
              <div
                className="text-5xl font-bold mb-4 leading-none"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "rgba(47,111,214,0.2)" }}
              >
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F0F1F2" }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#c9cdd1", fontFamily: "Inter, sans-serif" }}>
                {step.desc}
              </p>
              {/* Connector line on desktop */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-4 w-8 h-px" style={{ background: "rgba(47,111,214,0.3)" }} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
