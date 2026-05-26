import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Search,
  Users,
  Globe,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Target,
  Smartphone,
} from "lucide-react";
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

export default function Services() {
  const servicesRef = useRef<HTMLElement>(null);
  const packagesRef = useRef<HTMLElement>(null);
  const processRef = useRef<HTMLElement>(null);

  useScrollReveal(servicesRef as React.RefObject<HTMLElement>);
  useScrollReveal(packagesRef as React.RefObject<HTMLElement>);
  useScrollReveal(processRef as React.RefObject<HTMLElement>);

  const services = [
    {
      icon: TrendingUp,
      title: "Tráfego Pago",
      description: "Google Ads, Meta Ads e LinkedIn Ads otimizados para máximo ROI",
      features: [
        "Configuração e otimização de campanhas",
        "Análise de palavras-chave estratégicas",
        "Segmentação avançada de audiência",
        "Relatórios de performance em tempo real",
        "A/B testing contínuo de anúncios",
      ],
      popular: true,
    },
    {
      icon: Smartphone,
      title: "Tráfego Orgânico (SOCIAL MEDIA)",
      description: "Gestão estratégica de redes sociais para engajamento e vendas",
      features: [
        "Estratégia de conteúdo",
        "Criação de posts e stories",
        "Gestão de comunidade",
        "Campanhas de influenciadores",
        "Relatórios de engajamento",
      ],
    },
    {
      icon: Search,
      title: "Tráfego Orgânico (SEO)",
      description: "Posicionamento estratégico no Google para resultados duradouros",
      features: [
        "Auditoria completa de SEO",
        "Otimização on-page e técnica",
        "Criação de conteúdo otimizado",
        "Link building estratégico",
        "Monitoramento de rankings",
      ],
    },
    {
      icon: Users,
      title: "CRM & Automação",
      description: "Sistemas inteligentes para nutrir leads e aumentar conversões",
      features: [
        "Implementação de CRM personalizado",
        "Automação de e-mail marketing",
        "Fluxos de nutrição de leads",
        "Integração com vendas",
        "Análise de funil completa",
      ],
    },
    {
      icon: Globe,
      title: "Criação de Sites",
      description: "Landing pages e sites otimizados para conversão máxima",
      features: [
        "Design responsivo e moderno",
        "Otimização para conversão",
        "Integração com ferramentas de marketing",
        "Performance e velocidade otimizada",
        "Manutenção e suporte inclusos",
      ],
    },
    {
      icon: BarChart3,
      title: "Analytics & BI",
      description: "Inteligência de dados para decisões estratégicas assertivas",
      features: [
        "Dashboards personalizados",
        "Relatórios automatizados",
        "Análise de ROI detalhada",
        "Insights de comportamento",
        "Previsões e tendências",
      ],
    },
  ];

  const packages = [
    {
      name: "Starter",
      period: "/mês",
      description: "Ideal para pequenas empresas que querem começar",
      features: [
        "Tráfego Pago (Google + Meta)",
        "Landing Page Otimizada",
        "Relatórios Mensais",
        "Suporte via WhatsApp",
        "Consultoria Estratégica",
      ],
      popular: false,
    },
    {
      name: "Growth",
      period: "/mês",
      description: "Para empresas prontas para escalar rapidamente",
      features: [
        "Tudo do Starter +",
        "SEO Completo",
        "CRM e Automação",
        "Social Media",
        "Relatórios Semanais",
        "Consultoria Quinzenal",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      period: "/mês",
      description: "Solução completa para grandes empresas",
      features: [
        "Tudo do Growth +",
        "Analytics Avançado",
        "Multi-canais Premium",
        "Gerente Dedicado",
        "Relatórios Personalizados",
        "Consultoria Semanal",
      ],
      popular: false,
    },
  ];

  const steps = [
    { step: "01", title: "Diagnóstico", desc: "Análise completa do seu negócio e concorrência" },
    { step: "02", title: "Estratégia", desc: "Criação do plano personalizado de marketing" },
    { step: "03", title: "Execução", desc: "Implementação coordenada de todas as ações" },
    { step: "04", title: "Otimização", desc: "Monitoramento e melhoria contínua dos resultados" },
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
            Nossos Serviços
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Soluções Completas de
            <span className="block text-primary-glow">Marketing Digital</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Combinamos estratégia, tecnologia e execução para transformar
            seu negócio em uma máquina de vendas automatizada.
          </p>
        </div>
        {/* Diagonal separator */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-12 block">
            <polygon points="0,60 1200,0 1200,60" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section ref={servicesRef as React.RefObject<HTMLElement>} className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="animate-on-scroll text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Cada Serviço é uma{" "}
              <span className="text-primary">Peça do Puzzle</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Não trabalhamos com soluções isoladas. Cada serviço se integra perfeitamente
              para criar um ecossistema de marketing que gera resultados exponenciais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={index}
                  className={`animate-on-scroll relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 border border-border/40 hover:border-primary/30 bg-card ${
                    service.popular ? "border-l-4 border-l-primary" : ""
                  }`}
                >
                  {service.popular && (
                    <span className="absolute top-4 right-4 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5">
                      Mais Popular
                    </span>
                  )}
                  <CardHeader className="pb-3">
                    <div className="bg-primary/10 rounded-xl w-14 h-14 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-lg mb-1">{service.title}</CardTitle>
                    <p className="text-muted-foreground text-sm">{service.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2.5 mb-6">
                      {service.features.map((feature, fi) => (
                        <div key={fi} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <Link to="/contato">
                        <Button className="w-full bg-primary hover:bg-primary-dark text-white" size="sm">
                          Contratar Agora
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section ref={packagesRef as React.RefObject<HTMLElement>} className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="animate-on-scroll text-center mb-16">
            <span className="inline-block text-primary text-xs font-semibold tracking-widest uppercase mb-4 border border-primary/30 rounded-full px-4 py-1.5">
              Pacotes Completos
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Escolha o Pacote Ideal para{" "}
              <span className="text-primary">Seu Crescimento</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pacotes estratégicos que combinam nossos melhores serviços
              para acelerar seus resultados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <Card
                key={index}
                className={`animate-on-scroll relative overflow-hidden transition-all duration-300 hover:-translate-y-1 border border-border/40 hover:border-primary/30 bg-card ${
                  pkg.popular ? "border-t-4 border-t-primary" : ""
                }`}
              >
                <CardHeader className="text-center pb-4">
                  {pkg.popular && (
                    <span className="inline-block text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-0.5 mb-3 mx-auto">
                      Mais Escolhido
                    </span>
                  )}
                  <CardTitle className="text-2xl mb-1">{pkg.name}</CardTitle>
                  <div className="mb-1">
                    <span className="text-3xl font-bold text-primary">Contrate</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Sob consulta</p>
                  <p className="text-muted-foreground text-sm mt-2">{pkg.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {pkg.features.map((feature, fi) => (
                      <div key={fi} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/contato">
                    <Button className="w-full bg-primary hover:bg-primary-dark text-white">
                      Escolher {pkg.name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section ref={processRef as React.RefObject<HTMLElement>} className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="animate-on-scroll text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Como Trabalhamos:{" "}
              <span className="text-primary">Metodologia Comprovada</span>
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((process, index) => (
              <div key={index} className="animate-on-scroll relative text-center">
                {/* Connector line (except last) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-[calc(-50%+2rem)] h-px bg-border z-0" />
                )}
                <div className="relative z-10 w-16 h-16 border-2 border-primary text-primary rounded-full flex items-center justify-center mx-auto mb-4 bg-background">
                  <span className="font-display font-bold text-sm">{process.step}</span>
                </div>
                <h3 className="font-semibold text-base mb-2">{process.title}</h3>
                <p className="text-muted-foreground text-sm">{process.desc}</p>
              </div>
            ))}
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
            Pronto para transformar seus{" "}
            <span className="text-primary-glow">resultados?</span>
          </h2>
          <p className="text-white/60 mb-8">
            Comece hoje com uma consultoria gratuita e personalizada.
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
