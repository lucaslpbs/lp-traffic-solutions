import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, Star, TrendingUp, ArrowRight, BarChart3, Target } from "lucide-react";
import { Link } from "react-router-dom";

function useScrollReveal(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target
              .querySelectorAll(".animate-on-scroll")
              .forEach((child, i) => {
                (child as HTMLElement).style.transitionDelay = `${i * 0.1}s`;
                child.classList.add("is-visible");
              });
          }
        });
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
}

function useCounter(target: number, duration = 1600, start = false) {
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

function AnimatedMetric({ number, suffix, label }: { number: string; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const numericValue = parseFloat(number.replace(",", "."));
  const isDecimal = number.includes(".");
  const count = useCounter(isDecimal ? numericValue * 10 : numericValue, 1600, started);
  const display = isDecimal ? (count / 10).toFixed(1) : count.toLocaleString("pt-BR");

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

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-4xl md:text-5xl font-black text-primary mb-2">
        {started ? display : "0"}{suffix}
      </div>
      <div className="text-muted-foreground text-sm font-medium">{label}</div>
    </div>
  );
}

export default function Cases() {
  const metricsRef = useRef<HTMLElement>(null);
  const studiesRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const guaranteeRef = useRef<HTMLElement>(null);

  useScrollReveal(studiesRef as React.RefObject<HTMLElement>);
  useScrollReveal(testimonialsRef as React.RefObject<HTMLElement>);
  useScrollReveal(guaranteeRef as React.RefObject<HTMLElement>);

  const testimonials = [
    {
      name: "Carlos Eduardo Santos",
      company: "TechSolutions Pro",
      role: "CEO",
      content:
        "Em 8 meses, saímos de R$ 50k para R$ 200k mensais. O ROI do investimento foi de 450%. A Traffic Solutions não apenas entregou resultados, superou todas as expectativas.",
      rating: 5,
      results: "300% de crescimento em vendas",
      investment: "R$ 5.500/mês",
    },
    {
      name: "Mariana Silva",
      company: "Beauty & Wellness",
      role: "Diretora Comercial",
      content:
        "Reduzimos o CAC em 65% e aumentamos o LTV em 280%. Agora temos um funil de vendas que funciona 24/7. O melhor investimento que fizemos na empresa.",
      rating: 5,
      results: "65% redução no CAC",
      investment: "R$ 4.200/mês",
    },
    {
      name: "Roberto Fernandes",
      company: "FitnessPro Academy",
      role: "Fundador",
      content:
        "De 100 leads por mês para 1200 leads qualificados. A estratégia de tráfego pago + SEO foi um divisor de águas. Nossa receita multiplicou por 6!",
      rating: 5,
      results: "1100% aumento em leads",
      investment: "R$ 6.800/mês",
    },
    {
      name: "Ana Costa",
      company: "EduTech Online",
      role: "CMO",
      content:
        "Implementaram um CRM completo que automatizou nossa operação. Agora convertemos 40% mais leads em clientes pagantes. ROI incrível!",
      rating: 5,
      results: "40% mais conversões",
      investment: "R$ 3.900/mês",
    },
  ];

  const caseStudies = [
    {
      industry: "E-commerce de Moda",
      challenge: "Alto CAC e baixa conversão",
      solution: "Reestruturação completa do funil + otimização de campanhas",
      results: {
        revenue: "De R$ 80k para R$ 350k/mês",
        cac: "Redução de 60% no CAC",
        roas: "ROAS de 4.2x",
        timeline: "8 meses",
      },
      investment: "R$ 8.500/mês",
    },
    {
      industry: "SaaS B2B",
      challenge: "Dificuldade para gerar leads qualificados",
      solution: "Estratégia omnichannel: LinkedIn Ads + SEO + Automação",
      results: {
        revenue: "De R$ 120k para R$ 480k/mês",
        leads: "800% aumento em leads MQL",
        conversion: "35% de melhoria na conversão",
        timeline: "10 meses",
      },
      investment: "R$ 12.000/mês",
    },
    {
      industry: "Clínica Médica",
      challenge: "Baixa visibilidade online e poucos agendamentos",
      solution: "SEO local + Google Ads + Gestão de reputação",
      results: {
        revenue: "De R$ 60k para R$ 180k/mês",
        appointments: "250% mais agendamentos",
        visibility: "1º lugar no Google",
        timeline: "6 meses",
      },
      investment: "R$ 4.500/mês",
    },
  ];

  const metrics = [
    { number: "400", suffix: "%", label: "ROI médio dos clientes" },
    { number: "10", suffix: "M+", label: "Reais em receita gerada" },
    { number: "100", suffix: "+", label: "Empresas transformadas" },
    { number: "4.9", suffix: "/5", label: "Nota média dos clientes" },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* HERO */}
      <section className="bg-foreground py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(217 91% 60% / 0.4) 1px, transparent 0)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <span className="inline-block text-primary-glow text-xs font-semibold tracking-widest uppercase mb-5 border border-primary-glow/30 rounded-full px-4 py-1.5">
            Cases de Sucesso Reais
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Resultados que
            <span className="block text-primary-glow">Falam por Si</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Conheça empresas reais que transformaram seus resultados com nossas estratégias.
            Números reais, crescimento real, lucro real.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-12 block">
            <polygon points="0,60 1200,0 1200,60" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* METRICS */}
      <section ref={metricsRef as React.RefObject<HTMLElement>} className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Panorama dos Nossos{" "}
              <span className="text-primary">Resultados</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Mais de 100 empresas transformadas com metodologia própria e foco obsessivo em ROI.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="border border-border/40 rounded-2xl p-8 bg-card hover:border-primary/30 transition-all duration-300"
              >
                <AnimatedMetric
                  number={metric.number}
                  suffix={metric.suffix}
                  label={metric.label}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CASE STUDIES */}
      <section ref={studiesRef as React.RefObject<HTMLElement>} className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="animate-on-scroll text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Cases de <span className="text-primary">Destaque</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Histórias reais de transformação digital com resultados mensuráveis e sustentáveis.
            </p>
          </div>

          <div className="space-y-8">
            {caseStudies.map((study, index) => (
              <div
                key={index}
                className="animate-on-scroll border border-border/40 rounded-2xl overflow-hidden bg-card hover:border-primary/30 transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Left */}
                  <div className="p-8 lg:p-10">
                    <span className="inline-block text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 mb-5">
                      {study.industry}
                    </span>
                    <h3 className="font-display text-xl md:text-2xl font-bold mb-6">
                      Transformação Digital Completa
                    </h3>
                    <div className="space-y-5">
                      <div>
                        <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          Desafio
                        </h4>
                        <p className="text-muted-foreground text-sm">{study.challenge}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Solução
                        </h4>
                        <p className="text-muted-foreground text-sm">{study.solution}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Investimento</h4>
                        <p className="font-display text-xl font-bold text-primary">
                          {study.investment}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right — dark results panel */}
                  <div
                    className="p-8 lg:p-10 text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(217 91% 25%) 0%, hsl(217 91% 15%) 100%)",
                    }}
                  >
                    <h4 className="font-semibold text-sm mb-5 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Resultados Alcançados
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                        <div className="font-display text-lg font-bold mb-0.5">
                          {study.results.revenue}
                        </div>
                        <div className="text-white/60 text-xs">Crescimento em Faturamento</div>
                      </div>
                      {study.results.cac && (
                        <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                          <div className="font-display text-lg font-bold mb-0.5">
                            {study.results.cac}
                          </div>
                          <div className="text-white/60 text-xs">Otimização de CAC</div>
                        </div>
                      )}
                      {study.results.leads && (
                        <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                          <div className="font-display text-lg font-bold mb-0.5">
                            {study.results.leads}
                          </div>
                          <div className="text-white/60 text-xs">Aumento em Leads</div>
                        </div>
                      )}
                      {study.results.roas && (
                        <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                          <div className="font-display text-lg font-bold mb-0.5">
                            {study.results.roas}
                          </div>
                          <div className="text-white/60 text-xs">Retorno sobre Investimento</div>
                        </div>
                      )}
                      <div className="bg-white/20 rounded-xl p-4 border border-white/20">
                        <div className="font-bold text-sm mb-0.5">
                          Prazo: {study.results.timeline}
                        </div>
                        <div className="text-white/60 text-xs">Para atingir estes resultados</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section ref={testimonialsRef as React.RefObject<HTMLElement>} className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="animate-on-scroll text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              O que Nossos <span className="text-primary">Clientes Dizem</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Depoimentos reais de empresários que transformaram seus negócios conosco.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="animate-on-scroll relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 border border-border/40 hover:border-primary/30 bg-card"
              >
                <CardContent className="p-8">
                  <div className="absolute top-6 right-6 opacity-10">
                    <Quote className="h-10 w-10 text-primary" />
                  </div>
                  <div className="flex mb-4 gap-0.5">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t pt-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 ring-2 ring-primary/20 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "hsl(var(--primary) / 0.08)" }}
                      >
                        <span className="font-display font-bold text-primary text-sm">
                          {testimonial.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{testimonial.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {testimonial.role} · {testimonial.company}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 bg-muted/40 rounded-xl p-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Resultado</div>
                        <div className="font-semibold text-primary text-xs">
                          {testimonial.results}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Investimento</div>
                        <div className="font-semibold text-xs">{testimonial.investment}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section ref={guaranteeRef as React.RefObject<HTMLElement>} className="py-24 bg-muted/30">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="animate-on-scroll text-center mb-12">
            <span className="inline-block text-primary text-xs font-semibold tracking-widest uppercase mb-4 border border-primary/30 rounded-full px-4 py-1.5">
              Garantia de Resultados
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Tão Confiantes que Oferecemos
              <span className="text-primary block">Garantia de 90 Dias</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Nossa metodologia já transformou empresas de diferentes setores em até 90 dias.
              O próximo caso de sucesso pode ser o seu.
            </p>
          </div>

          <div className="animate-on-scroll border border-border/40 rounded-2xl p-8 bg-card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  value: "90",
                  title: "Dias para Resultados",
                  desc: "Prazo médio para começar a ver crescimento real",
                },
                {
                  value: "+120",
                  title: "Empresas Impactadas",
                  desc: "Negócios de diferentes setores já transformados",
                },
                {
                  value: "100%",
                  title: "Metodologia Validada",
                  desc: "Estratégias testadas e comprovadas no mercado",
                },
              ].map((item, i) => (
                <div key={i} className={`text-center ${i < 2 ? "md:border-r border-border/30 md:pr-8" : ""}`}>
                  <div className="border-2 border-primary/30 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                    <span className="font-display font-bold text-primary text-sm">{item.value}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-28 bg-foreground relative overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(217 91% 35% / 0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="relative z-10 container mx-auto px-6 text-center max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">
            Quer ser o próximo{" "}
            <span className="text-primary-glow">case de sucesso?</span>
          </h2>
          <p className="text-white/60 mb-8">
            Agende uma conversa estratégica gratuita e descubra como podemos replicar
            esses resultados na sua empresa.
          </p>
          <Link to="/contato">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary-dark text-white px-10 py-6 text-base font-semibold hover:scale-105 transition-all duration-300 group"
            >
              Começar Minha Transformação
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
