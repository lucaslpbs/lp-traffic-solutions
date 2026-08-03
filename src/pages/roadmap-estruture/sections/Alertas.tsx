import { AlertTriangle, TriangleAlert } from "lucide-react";
import { Reveal } from "../components/motion-kit";
import type { RoadmapAlerta } from "../types";

export default function Alertas({ alertas }: { alertas: RoadmapAlerta[] }) {
  if (!alertas.length) return null;

  return (
    <section className="relative px-6 py-24 sm:px-10 lg:px-20">
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <Reveal>
          <span className="rme-eyebrow" style={{ color: "hsl(var(--rme-scarlet))" }}>
            Atenção imediata
          </span>
          <h2 className="rme-display mt-6 max-w-2xl text-[clamp(1.9rem,5vw,3.4rem)]">
            O que precisa parar de sangrar antes de crescer
          </h2>
        </Reveal>

        <div className="mt-14 space-y-6">
          {alertas.map((a, i) => {
            const critico = a.severidade !== "atencao";
            const Icon = critico ? TriangleAlert : AlertTriangle;
            return (
              <Reveal key={a.titulo} delay={i * 0.1} y={30}>
                <div
                  className={`rme-soft p-7 sm:p-9 ${critico ? "rme-scarlet-panel" : "rme-blend"}`}
                >
                  <div className="flex items-start gap-5">
                    <span
                      className="rme-pill mt-1 flex h-11 w-11 flex-none items-center justify-center"
                      style={{
                        background: critico
                          ? "hsl(var(--rme-scarlet) / 0.18)"
                          : "hsl(var(--rme-orange) / 0.16)",
                        color: critico
                          ? "hsl(var(--rme-scarlet))"
                          : "hsl(var(--rme-orange))",
                      }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.4} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="rme-display text-[clamp(1.15rem,2.6vw,1.65rem)]">
                        {a.titulo}
                      </h3>
                      <p
                        className="mt-3 text-[1rem] leading-[1.8]"
                        style={{ color: "hsl(var(--rme-paper-dim))" }}
                      >
                        {a.descricao}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
