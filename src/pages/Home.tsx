import { useEffect, useRef, useState } from "react";
import { ModernHero } from "@/components/sections/modern-hero";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, XCircle, AlertTriangle, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

function useScrollReveal(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".animate-on-scroll").forEach((child, i) => {
              (child as HTMLElement).style.transitionDelay = `${i * 0.12}s`;
              child.classList.add("is-visible");
            });
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
}

function useCounter(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [start, target, duration]);
  return value;
}

function AnimatedStat({ raw, label }: { raw: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const numericMatch = raw.match(/\d+/);
  const numericValue = numericMatch ? parseInt(numericMatch[0]) : 0;
  const prefix = raw.replace(/[\d,\.]+.*/, "");
  const suffix = raw.replace(/^[^\d]*\d+/, "");
  const count = useCounter(numericValue, 1800, started);

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-5xl md:text-6xl font-bold text-white mb-2">
        {prefix}{started ? count.toLocaleString("pt-BR") : 0}{suffix}
      </div>
      <div className="text-white/50 text-sm font-medium tracking-wide uppercase">{label}</div>
    </div>
  );
}

export default function Home() {
  const problemRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  useScrollReveal(problemRef as React.RefObject<HTMLElement>);
  useScrollReveal(ctaRef as React.RefObject<HTMLElement>);

  const problems = [
    "Campanhas sem estratégia que queimam orçamento",
    "Sites que não convertem visitantes em clientes",
    "Leads frios que nunca viram compradores",
  ];

  const benefits = [
    "Aumento de 300% nas vendas em 90 dias",
    "Redução de 50% no custo de aquisição",
    "Automação completa do funil de vendas",
    "Relatórios e análises semanais",
  ];

  const stats = [
    { raw: "100", suffix: "+", label: "Empresas Transformadas" },
    { raw: "10", suffix: "M+", label: "Reais em Receita Gerada" },
    { raw: "98", suffix: "%", label: "Taxa de Retenção" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <ModernHero />

      {/* SEÇÃO 1 — O Problema */}
      <section ref={problemRef as React.RefObject<HTMLElement>} className="py-28 bg-background">
        <div className="container mx-auto px-6">

          <div className="animate-on-scroll max-w-xl mb-16">
            <span className="inline-block text-primary text-xs font-semibold tracking-widest uppercase mb-4 border border-primary/30 rounded-full px-4 py-1.5">
              O Problema é Real
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Você está{" "}
              <span className="text-primary">perdendo dinheiro</span>{" "}
              todos os dias.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Problemas */}
            <div className="space-y-4">
              <h3 className="animate-on-scroll text-base font-semibold text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                Pare de jogar dinheiro fora com:
              </h3>
              {problems.map((text, i) => (
                <div
                  key={i}
                  className="animate-on-scroll flex items-start gap-4 p-4 border-l-2 border-red-400 bg-red-50/50 rounded-r-xl"
                >
                  <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-red-700 font-medium text-sm leading-relaxed">{text}</span>
                </div>
              ))}
            </div>

            {/* Benefícios */}
            <div className="space-y-4">
              <h3 className="animate-on-scroll text-base font-semibold text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Comece a lucrar com:
              </h3>
              {benefits.map((text, i) => (
                <div
                  key={i}
                  className="animate-on-scroll flex items-start gap-4 p-4 border-l-2 border-primary bg-primary/5 rounded-r-xl"
                >
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium text-sm leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Diagonal separator */}
      <div className="h-16 overflow-hidden -mt-1">
        <svg viewBox="0 0 1200 64" preserveAspectRatio="none" className="w-full h-full">
          <polygon points="0,0 1200,0 1200,64" fill="hsl(var(--foreground))" />
        </svg>
      </div>

      {/* SEÇÃO 2 — Stats */}
      <section className="bg-foreground py-24">
        <div className="container mx-auto px-6">
          <div className="border-t border-white/10 mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {stats.map((stat, i) => (
              <AnimatedStat
                key={i}
                raw={`${stat.raw}${stat.suffix}`}
                label={stat.label}
              />
            ))}
          </div>
          <div className="border-b border-white/10 mt-16" />
        </div>
      </section>

      {/* Diagonal separator inverted */}
      <div className="h-16 overflow-hidden bg-background -mt-0.5">
        <svg viewBox="0 0 1200 64" preserveAspectRatio="none" className="w-full h-full">
          <polygon points="0,64 1200,0 1200,64" fill="hsl(var(--foreground))" />
        </svg>
      </div>

      {/* SEÇÃO 3 — CTA Final */}
      <section
        ref={ctaRef as React.RefObject<HTMLElement>}
        className="py-32 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(217 91% 35% / 0.12) 0%, transparent 70%), hsl(var(--background))",
        }}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(217 91% 35% / 0.3) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10 container mx-auto px-6 text-center max-w-3xl">
          <div className="animate-on-scroll">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6">
              Pronto para crescer de forma{" "}
              <span className="text-primary">previsível?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Fale com um especialista e descubra como transformar seu investimento em marketing em receita real.
            </p>
            <Link to="/contato">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-dark text-white px-10 py-6 text-base font-semibold hover:scale-105 transition-all duration-300 group"
              >
                Falar com Especialista
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
