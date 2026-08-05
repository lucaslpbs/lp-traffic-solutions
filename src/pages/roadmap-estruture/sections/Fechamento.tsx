import { ArrowUpRight } from "lucide-react";
import { Blob, Reveal } from "../components/motion-kit";
import { primeiroNome } from "../labels";
import type { Diagnostico, Roadmap } from "../types";

export default function Fechamento({
  diagnostico,
  roadmap,
}: {
  diagnostico: Diagnostico;
  roadmap: Roadmap;
}) {
  const cta = roadmap.cta;
  const nome = primeiroNome(diagnostico.cadastro.nomeCompleto);

  return (
    <section className="relative overflow-hidden px-6 py-32 sm:px-10 lg:px-20">
      <Blob color="hsl(var(--rme-orange))" size={760} bottom={-360} left="50%" opacity={0.22} speed={-120} />

      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        <Reveal>
          <span className="rme-eyebrow">{cta?.titulo || "Próximo passo"}</span>
          <h2 className="rme-display mt-7 text-[clamp(2.1rem,6.5vw,4.4rem)]">
            {nome ? `${nome}, ` : ""}estrutura primeiro.
            <br />
            <span className="rme-orange-text">Escala depois.</span>
          </h2>
        </Reveal>

        {cta?.texto && (
          <Reveal delay={0.12}>
            <p
              className="mx-auto mt-8 max-w-2xl text-[1.05rem] leading-[1.85] sm:text-[1.15rem]"
              style={{ color: "hsl(var(--rme-paper-dim))" }}
            >
              {cta.texto}
            </p>
          </Reveal>
        )}

        <Reveal delay={0.2}>
          <a
            href={cta?.url || "#"}
            className="rme-cta rme-pill mt-12 inline-flex items-center gap-3 px-9 py-5 text-[1.02rem]"
          >
            {cta?.botao || "Quero avançar com apoio"}
            <ArrowUpRight className="h-5 w-5" strokeWidth={2.6} />
          </a>
        </Reveal>

        <Reveal delay={0.3}>
          <p className="rme-hairline mt-16">
            Roadmap gerado a partir do seu diagnóstico · Estruture sua Empresa
          </p>
        </Reveal>
      </div>
    </section>
  );
}
