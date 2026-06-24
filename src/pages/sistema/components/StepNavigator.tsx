import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { modules } from "../data/modules";
import RelatoriosScene from "../scenes/RelatoriosScene";
import QuartoDeGuerraScene from "../scenes/QuartoDeGuerraScene";
import GestaoClientesScene from "../scenes/GestaoClientesScene";
import RoboVendasScene from "../scenes/RoboVendasScene";
import DiarioDeBordoScene from "../scenes/DiarioDeBordoScene";
import AlertaSaldoScene from "../scenes/AlertaSaldoScene";
import ContratosScene from "../scenes/ContratosScene";
import SdrAtendimentoScene from "../scenes/SdrAtendimentoScene";

const sceneComponents: Record<string, React.FC> = {
  relatorios: RelatoriosScene,
  "quarto-de-guerra": QuartoDeGuerraScene,
  "gestao-clientes": GestaoClientesScene,
  "robo-vendas": RoboVendasScene,
  "diario-de-bordo": DiarioDeBordoScene,
  "alerta-saldo": AlertaSaldoScene,
  contratos: ContratosScene,
  "sdr-atendimento": SdrAtendimentoScene,
};

export default function StepNavigator() {
  const [active, setActive] = useState(0);
  const ActiveScene = sceneComponents[modules[active].slug];

  return (
    <section className="relative w-full py-20 lg:py-32" style={{ background: "#161819" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center text-[clamp(1.6rem,4vw,2.8rem)] font-bold leading-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F0F1F2" }}
        >
          Veja o sistema por dentro
        </motion.h2>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar / Tabs */}
          <div className="lg:w-72 shrink-0">
            {/* Mobile: horizontal scroll */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 lg:overflow-visible scrollbar-hide">
              {modules.map((mod, i) => (
                <button
                  key={mod.id}
                  onClick={() => setActive(i)}
                  className={`
                    flex-shrink-0 text-left px-4 py-3 rounded-xl border transition-all duration-300
                    lg:w-full whitespace-nowrap lg:whitespace-normal
                    ${active === i
                      ? "border-[#2f6fd6]/60 bg-[#2f6fd6]/10"
                      : "border-[rgba(240,241,242,0.08)] bg-transparent hover:bg-white/[0.03] hover:border-[rgba(240,241,242,0.15)]"
                    }
                  `}
                >
                  <span
                    className="block text-xs font-semibold tracking-wider uppercase mb-0.5"
                    style={{ color: active === i ? "#2f6fd6" : "#c9cdd1", fontFamily: "Inter, sans-serif" }}
                  >
                    {mod.eyebrow}
                  </span>
                  <span
                    className="block text-sm font-medium leading-snug hidden lg:block"
                    style={{ color: active === i ? "#F0F1F2" : "#c9cdd1", fontFamily: "Inter, sans-serif" }}
                  >
                    {mod.title}
                  </span>
                  {mod.highlight && (
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[#2f6fd6]/20 text-[#2f6fd6] font-semibold tracking-wide uppercase">
                      ★ Destaque
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Stage */}
          <div className="flex-1 min-h-[520px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={modules[active].slug}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ enter: { duration: 0.35, ease: "easeOut" }, exit: { duration: 0.15 } }}
                className="w-full"
              >
                <div className="mb-6">
                  <span
                    className="text-xs font-semibold tracking-wider uppercase"
                    style={{ color: "#2f6fd6", fontFamily: "Inter, sans-serif" }}
                  >
                    {modules[active].eyebrow}
                  </span>
                  <h3
                    className="mt-2 text-2xl lg:text-3xl font-bold leading-tight"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F0F1F2" }}
                  >
                    {modules[active].title}
                  </h3>
                  <p
                    className="mt-3 text-base leading-relaxed max-w-xl"
                    style={{ color: "#c9cdd1", fontFamily: "Inter, sans-serif" }}
                  >
                    {modules[active].description}
                  </p>
                </div>
                <ActiveScene />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
