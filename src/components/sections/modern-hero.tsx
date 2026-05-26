import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function ModernHero() {
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".animate-on-scroll").forEach((child, i) => {
              (child as HTMLElement).style.transitionDelay = `${i * 0.1}s`;
              child.classList.add("is-visible");
            });
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { icon: Target, number: "400%", label: "ROI Médio" },
    { icon: TrendingUp, number: "R$ 10M+", label: "Receita Gerada" },
    { icon: Users, number: "100+", label: "Clientes Ativos" },
    { icon: Zap, number: "30 dias", label: "Primeiros Resultados" },
  ];

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(217 91% 20%) 0%, hsl(0 0% 3%) 100%)" }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(217 91% 60% / 0.4) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Soft ambient glow */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 container mx-auto px-6 pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-16 items-center">

          {/* LEFT — text */}
          <div>
            <span className="inline-block text-primary-glow text-sm font-semibold tracking-widest uppercase mb-6 border border-primary-glow/30 rounded-full px-4 py-1.5">
              Tráfego Pago · SEO · CRM
            </span>

            <h1
              className="font-display font-bold text-white leading-[1.05] mb-6"
              style={{ fontSize: "clamp(3rem, 6vw, 5rem)" }}
            >
              Transforme seu
              <span className="block text-primary-glow">marketing em</span>
              máquina de vendas.
            </h1>

            <p className="text-white/65 text-lg max-w-lg mb-10 leading-relaxed">
              Estratégias de performance para empresas que faturam +R$30k/mês e
              querem crescer de forma previsível e escalável.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contato">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-6 text-base font-semibold hover:scale-105 transition-all duration-300 group"
                >
                  Quero Crescer Agora
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/cases">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white/80 hover:text-white border border-white/20 hover:border-white/40 hover:bg-white/5 px-8 py-6 text-base font-semibold transition-all duration-300"
                >
                  Ver Cases de Sucesso
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT — glassmorphism stat cards */}
          <div ref={statsRef} className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="animate-on-scroll bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/12 hover:border-white/20 transition-all duration-300"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                >
                  <div className="bg-primary/20 rounded-xl w-10 h-10 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-primary-glow" />
                  </div>
                  <div className="font-display text-2xl font-bold text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="animate-bounce">
          <div className="w-5 h-9 border border-white/30 rounded-full flex justify-center">
            <div className="w-0.5 h-2.5 bg-white/40 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
