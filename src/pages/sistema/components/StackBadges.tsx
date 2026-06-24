import { motion } from "framer-motion";

const tools = [
  { name: "Meta Ads", color: "#1877F2" },
  { name: "Google Ads", color: "#4285F4" },
  { name: "WhatsApp (UAZAPI)", color: "#25D366" },
  { name: "n8n", color: "#EA4B71" },
  { name: "Supabase", color: "#3ECF8E" },
  { name: "OpenAI", color: "#10A37F" },
  { name: "Anthropic", color: "#D4A574" },
];

export default function StackBadges() {
  return (
    <section className="w-full py-20 lg:py-28" style={{ background: "#161819" }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-[clamp(1.4rem,3.5vw,2.4rem)] font-bold mb-12"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F0F1F2" }}
        >
          Tecnologia de ponta, rodando nos bastidores
        </motion.h2>

        <div className="flex flex-wrap justify-center gap-3">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-2.5 rounded-full border px-5 py-2.5 transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(240,241,242,0.25)]"
              style={{
                borderColor: "rgba(240,241,242,0.12)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: tool.color, boxShadow: `0 0 8px ${tool.color}40` }} />
              <span className="text-sm font-medium" style={{ color: "#F0F1F2", fontFamily: "Inter, sans-serif" }}>
                {tool.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
