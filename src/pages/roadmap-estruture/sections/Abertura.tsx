import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Blob, Reveal } from "../components/motion-kit";
import { formatarDataBR, primeiroNome, segmentoLabel } from "../labels";
import type { Diagnostico, Roadmap } from "../types";

export default function Abertura({
  diagnostico,
  roadmap,
}: {
  diagnostico: Diagnostico;
  roadmap: Roadmap;
}) {
  const reduce = useReducedMotion();
  const nome = primeiroNome(diagnostico.cadastro.nomeCompleto);
  const empresa = diagnostico.cadastro.nomeEmpresa;
  const seg =
    diagnostico.perfil.segmento === "outro"
      ? diagnostico.perfil.segmentoOutro || "Negócio"
      : segmentoLabel[diagnostico.perfil.segmento];

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center px-6 py-24 sm:px-10 lg:px-20">
      <Blob color="hsl(var(--rme-orange-deep))" size={680} top={-180} left={-160} opacity={0.3} speed={140} />
      <Blob color="hsl(var(--rme-orange))" size={420} bottom={-80} right={-100} opacity={0.16} speed={-90} />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <Reveal y={20}>
          <div className="flex flex-wrap items-center gap-4">
            <span className="rme-eyebrow">Roadmap personalizado</span>
            <span
              className="h-px flex-1 min-w-[40px]"
              style={{ background: "hsl(var(--rme-paper) / 0.15)" }}
            />
            <span className="rme-hairline">
              Estruture sua Empresa{roadmap.geradoEm ? ` · ${formatarDataBR(roadmap.geradoEm)}` : ""}
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <h1 className="rme-display mt-10 text-[clamp(2.6rem,8vw,6.5rem)]">
            {nome ? `${nome},` : "Seu negócio,"}
            <br />
            <span className="rme-orange-text">este é o seu plano.</span>
          </h1>
        </Reveal>

        {roadmap.chamada && (
          <Reveal delay={0.18}>
            <p
              className="mt-8 max-w-2xl text-[clamp(1.05rem,2.4vw,1.45rem)] leading-relaxed"
              style={{ color: "hsl(var(--rme-paper-dim))" }}
            >
              {roadmap.chamada}
            </p>
          </Reveal>
        )}

        <Reveal delay={0.26}>
          <div className="mt-12 flex flex-wrap items-center gap-3">
            {[empresa, seg, `${roadmap.passos.length} passos priorizados`]
              .filter(Boolean)
              .map((t) => (
                <span
                  key={t as string}
                  className="rme-pill px-5 py-2 text-sm font-medium"
                  style={{
                    background: "hsl(var(--rme-paper) / 0.06)",
                    border: "1px solid hsl(var(--rme-paper) / 0.12)",
                    color: "hsl(var(--rme-paper-dim))",
                  }}
                >
                  {t}
                </span>
              ))}
          </div>
        </Reveal>

        <motion.div
          className="mt-20 inline-flex items-center gap-3"
          style={{ color: "hsl(var(--rme-muted))" }}
          animate={reduce ? undefined : { y: [0, 9, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="h-4 w-4" strokeWidth={2.5} />
          <span className="rme-hairline">Comece pelo retrato do seu negócio</span>
        </motion.div>
      </div>
    </section>
  );
}
