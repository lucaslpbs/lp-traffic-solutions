import { motion } from "framer-motion";
import { Blob, DrawnLine, Reveal } from "../components/motion-kit";
import type { RoadmapPasso } from "../types";

const prioridadeLabel: Record<NonNullable<RoadmapPasso["prioridade"]>, string> = {
  alta: "Prioridade alta",
  media: "Prioridade média",
  baixa: "Depois",
};

function prioridadeCor(p?: RoadmapPasso["prioridade"]) {
  if (p === "alta") return "hsl(var(--rme-orange))";
  if (p === "media") return "hsl(var(--rme-orange-soft) / 0.8)";
  return "hsl(var(--rme-muted))";
}

function Passo({ passo, index, total }: { passo: RoadmapPasso; index: number; total: number }) {
  const numero = String(index + 1).padStart(2, "0");

  return (
    <Reveal y={48} delay={0.04}>
      <div className="relative grid gap-8 md:grid-cols-[auto_1fr] md:gap-12">
        {/* Numeral */}
        <div className="flex items-start gap-5 md:flex-col md:items-center">
          <motion.span
            className="rme-display leading-none"
            style={{
              fontSize: "clamp(3rem,8vw,5.5rem)",
              WebkitTextStroke: "1.5px hsl(var(--rme-orange) / 0.75)",
              color: "transparent",
            }}
            initial={{ opacity: 0, scale: 0.82 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {numero}
          </motion.span>
          {index < total - 1 && (
            <span
              className="hidden md:block w-px flex-1 rme-step-line"
              style={{ minHeight: 90 }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Conteúdo */}
        <div className="min-w-0 pb-16 md:pb-24">
          <div className="flex flex-wrap items-center gap-3">
            {passo.tema && (
              <span
                className="rme-pill px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em]"
                style={{
                  background: "hsl(var(--rme-orange) / 0.14)",
                  color: "hsl(var(--rme-orange-soft))",
                }}
              >
                {passo.tema}
              </span>
            )}
            {passo.prioridade && (
              <span
                className="text-xs font-semibold uppercase tracking-[0.14em]"
                style={{ color: prioridadeCor(passo.prioridade) }}
              >
                {prioridadeLabel[passo.prioridade]}
              </span>
            )}
          </div>

          <h3 className="rme-display mt-5 text-[clamp(1.5rem,3.6vw,2.5rem)]">{passo.titulo}</h3>

          <p
            className="mt-5 max-w-2xl text-[1.02rem] leading-[1.85]"
            style={{ color: "hsl(var(--rme-paper-dim))" }}
          >
            {passo.explicacao}
          </p>

          {passo.porque && (
            <div
              className="mt-7 max-w-2xl rme-soft p-6"
              style={{
                background: "hsl(var(--rme-ink-soft) / 0.8)",
                borderLeft: "3px solid hsl(var(--rme-orange))",
              }}
            >
              <p className="rme-hairline">Por que isso vale para você</p>
              <p
                className="mt-3 text-[0.98rem] leading-[1.8]"
                style={{ color: "hsl(var(--rme-paper))" }}
              >
                {passo.porque}
              </p>
            </div>
          )}

          {passo.impacto && (
            <p
              className="mt-6 rme-display text-[clamp(1rem,2.2vw,1.3rem)]"
              style={{ color: "hsl(var(--rme-orange))" }}
            >
              {passo.impacto}
            </p>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export default function Passos({ passos }: { passos: RoadmapPasso[] }) {
  if (!passos.length) return null;

  return (
    <section className="relative px-6 py-28 sm:px-10 lg:px-20">
      <Blob color="hsl(var(--rme-orange-deep))" size={620} top={200} left={-260} opacity={0.16} speed={160} />
      <DrawnLine className="pointer-events-none absolute left-1/2 top-40 hidden h-[70%] w-10 -translate-x-1/2 opacity-40 lg:block" />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <Reveal>
          <span className="rme-eyebrow">Seu caminho</span>
          <h2 className="rme-display mt-6 max-w-3xl text-[clamp(2rem,5.5vw,3.8rem)]">
            Na ordem certa, um passo por vez
          </h2>
          <p className="mt-6 max-w-xl" style={{ color: "hsl(var(--rme-muted))" }}>
            Não tente fazer tudo ao mesmo tempo. Cada passo abaixo prepara o terreno para o
            seguinte.
          </p>
        </Reveal>

        <div className="mt-20">
          {passos.map((p, i) => (
            <Passo key={p.id ?? p.titulo} passo={p} index={i} total={passos.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
