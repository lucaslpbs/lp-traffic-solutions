import { motion } from "framer-motion";

const profiles = [
  {
    icon: "🚀",
    title: "Gestor de tráfego",
    desc: "Quer escalar sem virar suporte técnico. O sistema assume a operação repetitiva pra você focar em estratégia.",
  },
  {
    icon: "🏢",
    title: "Dono de agência",
    desc: "Quer parar de operar tudo manualmente. Cada cliente novo não pode significar mais horas na planilha.",
  },
  {
    icon: "🔧",
    title: "Quem vende implementação",
    desc: "Já vendeu curso ou mentoria e quer vender implementação de verdade — resultado configurado, não aula gravada.",
  },
];

export default function ParaQuemE() {
  return (
    <section className="w-full py-20 lg:py-28" style={{ background: "#161819" }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-[clamp(1.4rem,3.5vw,2.4rem)] font-bold mb-14"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F0F1F2" }}
        >
          Pra quem é isso
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profiles.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-2 hover:border-[#2f6fd6]/40"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(240,241,242,0.12)",
              }}
            >
              <div className="text-3xl mb-4">{p.icon}</div>
              <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F0F1F2" }}>
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#c9cdd1", fontFamily: "Inter, sans-serif" }}>
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
