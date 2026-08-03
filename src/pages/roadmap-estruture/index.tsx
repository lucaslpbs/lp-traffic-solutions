import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { Loader2 } from "lucide-react";
import "./roadmap.css";
import type { RoadmapPayload } from "./types";
import { mockRoadmap } from "./mock";
import Abertura from "./sections/Abertura";
import Retrato from "./sections/Retrato";
import Alertas from "./sections/Alertas";
import Passos from "./sections/Passos";
import Fechamento from "./sections/Fechamento";

const STORAGE_KEY = "roadmap-estruture-sua-empresa";

function ProgressoLeitura() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, { stiffness: 90, damping: 30 });
  return (
    <motion.div
      className="fixed left-0 top-0 z-50 h-[3px] w-full origin-left"
      style={{ background: "var(--rme-grad-orange)", scaleX: width }}
      aria-hidden="true"
    />
  );
}

function Carregando() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center gap-5 px-6 text-center">
      <Loader2 className="h-7 w-7 animate-spin" style={{ color: "hsl(var(--rme-orange))" }} />
      <p className="rme-hairline">Montando o seu roadmap</p>
    </div>
  );
}

function SemDados() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center gap-5 px-6 text-center">
      <h1 className="rme-display text-[clamp(1.8rem,5vw,3rem)]">Roadmap não encontrado</h1>
      <p className="max-w-md" style={{ color: "hsl(var(--rme-muted))" }}>
        Este link precisa de um diagnóstico associado. Refaça o diagnóstico para gerar o seu
        roadmap personalizado.
      </p>
    </div>
  );
}

export default function RoadmapEstrutureSuaEmpresa() {
  const location = useLocation();
  const [params] = useSearchParams();
  const [payload, setPayload] = useState<RoadmapPayload | null>(null);
  const [carregando, setCarregando] = useState(true);

  const demo = params.get("demo") === "1";

  // Fonte dos dados: navegação (state) → sessionStorage → ?demo=1 (mock)
  useEffect(() => {
    document.title = "Seu Roadmap Personalizado | Estruture sua Empresa";

    const meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const criada = !meta;
    const robots = meta ?? document.createElement("meta");
    robots.name = "robots";
    const anterior = robots.content;
    robots.content = "noindex, nofollow";
    if (criada) document.head.appendChild(robots);

    const doState = (location.state as { roadmap?: RoadmapPayload } | null)?.roadmap;
    if (doState) {
      setPayload(doState);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(doState));
      } catch {
        /* storage indisponível */
      }
      setCarregando(false);
      return;
    }

    try {
      const salvo = sessionStorage.getItem(STORAGE_KEY);
      if (salvo) {
        setPayload(JSON.parse(salvo) as RoadmapPayload);
        setCarregando(false);
        return;
      }
    } catch {
      /* json inválido */
    }

    if (demo) setPayload(mockRoadmap);
    setCarregando(false);

    return () => {
      if (criada) robots.remove();
      else robots.content = anterior;
    };
  }, [location.state, demo]);

  const conteudo = useMemo(() => {
    if (carregando) return <Carregando />;
    if (!payload) return <SemDados />;
    const { diagnostico, roadmap } = payload;
    return (
      <>
        <ProgressoLeitura />
        <Abertura diagnostico={diagnostico} roadmap={roadmap} />
        <Retrato diagnostico={diagnostico} roadmap={roadmap} />
        <Alertas alertas={roadmap.alertas ?? []} />
        <Passos passos={roadmap.passos ?? []} />
        <Fechamento diagnostico={diagnostico} roadmap={roadmap} />
      </>
    );
  }, [carregando, payload]);

  return <main className="rme-root rme-grain">{conteudo}</main>;
}
