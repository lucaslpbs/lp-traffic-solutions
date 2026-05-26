import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Award,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Target,
  ArrowRight,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import Certificado from "../assets/Certificado.jpg";
import "./shimmer.css";

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

export default function About() {
  const [openModal, setOpenModal] = useState(false);

  const storyRef = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const valuesRef = useRef<HTMLElement>(null);
  const differentialsRef = useRef<HTMLElement>(null);
  const teamRef = useRef<HTMLElement>(null);

  useScrollReveal(storyRef as React.RefObject<HTMLElement>);
  useScrollReveal(servicesRef as React.RefObject<HTMLElement>);
  useScrollReveal(valuesRef as React.RefObject<HTMLElement>);
  useScrollReveal(differentialsRef as React.RefObject<HTMLElement>);
  useScrollReveal(teamRef as React.RefObject<HTMLElement>);

  const services = [
    {
      icon: TrendingUp,
      title: "Tráfego Pago",
      description: "Google Ads, Meta Ads e LinkedIn Ads com foco em ROI máximo",
    },
    {
      icon: Zap,
      title: "Tráfego Orgânico",
      description: "SEO estratégico para posicionamento de longo prazo",
    },
    {
      icon: Users,
      title: "CRM & Automação",
      description: "Sistemas de vendas automatizados e nurturing de leads",
    },
    {
      icon: Shield,
      title: "Criação de Sites",
      description: "Landing pages e sites otimizados para conversão",
    },
  ];

  const differentials = [
    "Metodologia proprietária testada em 100+ empresas",
    "Time de especialistas certificados Google e Meta",
    "Acompanhamento semanal com relatórios detalhados",
    "Com apenas 30/90 dias, seus resultados não serão mais os mesmos. Dezenas de clientes já satisfeitos com a nossa estratégia.",
    "Suporte dedicado via WhatsApp em horário comercial",
    "Consultoria estratégica mensal inclusa sem custo adicional",
  ];

  const values = [
    {
      icon: Target,
      title: "Resultados Reais",
      description:
        "Focamos em métricas que impactam diretamente o faturamento da sua empresa",
    },
    {
      icon: Shield,
      title: "Transparência Total",
      description: "Acesso completo a dados, relatórios e estratégias. Sem caixas pretas.",
    },
    {
      icon: Zap,
      title: "Agilidade",
      description:
        "Implementação rápida e otimizações constantes para acelerar resultados",
    },
    {
      icon: Users,
      title: "Parceria Verdadeira",
      description:
        "Seu sucesso é o nosso sucesso. Trabalhamos como uma extensão do seu time",
    },
  ];

  const team = [
    {
      name: "Lucas Paulino",
      role: "CEO & Head de estratégia",
      experience: "1+ anos em marketing digital, 5+ anos em desenvolvimento de softwares",
      specialization: "Growth Marketing e Performance",
    },
    {
      name: "Taylane Maia",
      role: "Diretora de Tráfego Pago",
      experience: "1+ anos em Google e Meta Ads",
      specialization: "Otimização de Campanhas e ROAS",
    },
    {
      name: "Gabriel Paulino",
      role: "Especialista em Sites",
      experience: "2+ anos em desenvolvimento de softwares",
      specialization: "Criação de sistemas e sites",
    },
    {
      name: "Kauã Silvano",
      role: "Especialista em Designer",
      experience: "5+ anos em designer para empresas",
      specialization: "Criação de designers personalizados",
    },
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
            Sobre a Traffic Solutions
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            A Agência que Faz
            <span className="block text-primary-glow">Empresas Crescerem</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Especialistas em transformar investimento em marketing em crescimento real e
            sustentável. Nossa missão é fazer sua empresa dominar o mercado digital.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-12 block">
            <polygon points="0,60 1200,0 1200,60" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* MISSION & STORY */}
      <section ref={storyRef as React.RefObject<HTMLElement>} className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="animate-on-scroll">
                <span className="inline-block text-primary text-xs font-semibold tracking-widest uppercase mb-4 border border-primary/30 rounded-full px-4 py-1.5">
                  Nossa História
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                  Traffic{" "}
                  <span className="text-primary">Solutions</span>
                </h2>
              </div>

              <p className="animate-on-scroll text-base leading-relaxed mb-5 text-muted-foreground">
                Desde 2023, a{" "}
                <strong className="shimmer font-bold">Traffic Solutions</strong>{" "}
                vem transformando negócios com{" "}
                <strong className="shimmer font-semibold">estratégias de marketing reais</strong>{" "}
                que geram resultados. Somos especialistas em impulsionar marcas através de{" "}
                <strong className="shimmer">automação inteligente</strong>,{" "}
                <strong className="shimmer">gestão de tráfego pago</strong>,{" "}
                <strong className="shimmer">design criativo</strong>,{" "}
                <strong className="shimmer">CRM personalizado</strong>,{" "}
                <strong className="shimmer">criação de sites profissionais</strong> e{" "}
                <strong className="shimmer">produção de vídeos impactantes</strong>.
              </p>

              <p className="animate-on-scroll text-base leading-relaxed mb-5 text-muted-foreground">
                Aqui, cada detalhe é pensado para uma coisa:{" "}
                <strong className="shimmer">fazer sua empresa crescer de verdade</strong>. Nossa
                equipe é formada por profissionais apaixonados pelo que fazem —{" "}
                <strong className="shimmer">
                  gente que estuda, testa e aprimora cada estratégia até alcançar o melhor
                  desempenho possível
                </strong>
                .
              </p>

              <p className="animate-on-scroll text-base leading-relaxed mb-8 text-muted-foreground">
                E o diferencial?{" "}
                <strong className="shimmer">atendimento próximo e personalizado</strong>. O
                próprio CEO acompanha de perto cada projeto, garantindo{" "}
                <strong className="shimmer">relatórios transparentes</strong>,{" "}
                <strong className="shimmer">retorno real</strong> e{" "}
                <strong className="shimmer">atenção total em cada etapa</strong>. Na{" "}
                <strong className="shimmer">Traffic Solutions</strong>, não acreditamos em sorte —
                acreditamos em <strong className="shimmer">estratégia</strong>,{" "}
                <strong className="shimmer">dados</strong> e{" "}
                <strong className="shimmer">resultados</strong>.
              </p>

              <button
                onClick={() => setOpenModal(true)}
                className="animate-on-scroll flex items-center gap-4 mb-6 hover:opacity-80 transition group"
              >
                <div className="bg-primary/10 rounded-full p-3 group-hover:bg-primary/20 transition-colors">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-sm">Certificações Premium</h4>
                  <p className="text-muted-foreground text-sm">
                    Google Partner Premier e Meta Business Partner
                  </p>
                </div>
              </button>
            </div>

            {/* Numbers card */}
            <div className="animate-on-scroll">
              <div className="bg-foreground rounded-2xl p-8">
                <h3 className="font-display text-xl font-bold mb-8 text-center text-white">
                  Nossos Números
                </h3>
                <div className="grid grid-cols-2 gap-0">
                  {[
                    { value: "100+", label: "Empresas Transformadas" },
                    { value: "R$ 10M+", label: "Faturamento Gerado" },
                    { value: "400%", label: "ROI Médio dos Clientes" },
                    { value: "4.9/5", label: "Avaliação dos Clientes" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`text-center p-6 ${
                        i === 0 ? "border-r border-b border-white/10" :
                        i === 1 ? "border-b border-white/10" :
                        i === 2 ? "border-r border-white/10" : ""
                      }`}
                    >
                      <div className="font-display text-4xl font-black text-white mb-1">
                        {item.value}
                      </div>
                      <div className="text-sm text-white/60">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section ref={servicesRef as React.RefObject<HTMLElement>} className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="animate-on-scroll text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Nossos{" "}
              <span className="text-primary">Serviços Especializados</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada serviço é uma peça estratégica do puzzle que vai transformar sua empresa
              em uma máquina de vendas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={index}
                  className="animate-on-scroll text-center group transition-all duration-300 hover:-translate-y-1 border border-border/40 hover:border-primary/30 bg-card"
                >
                  <CardContent className="p-6">
                    <div className="bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base mb-2">{service.title}</h3>
                    <p className="text-muted-foreground text-sm">{service.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="animate-on-scroll text-center">
            <Link to="/servicos">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white">
                Ver Todos os Serviços
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section ref={valuesRef as React.RefObject<HTMLElement>} className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="animate-on-scroll text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Nossos <span className="text-primary">Valores</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Estes são os princípios que guiam cada decisão e estratégia que desenvolvemos
              para nossos clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="animate-on-scroll text-center group transition-all duration-300 hover:-translate-y-1 border border-border/40 hover:border-primary/30 bg-card"
                >
                  <CardContent className="p-6">
                    <div className="bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* DIFFERENTIALS */}
      <section
        ref={differentialsRef as React.RefObject<HTMLElement>}
        className="py-24 bg-muted/30"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-on-scroll text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Por que Escolher a{" "}
                <span className="text-primary">Traffic Solutions?</span>
              </h2>
              <p className="text-muted-foreground">
                Não somos apenas mais uma agência. Somos seus parceiros estratégicos no crescimento.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {differentials.map((differential, index) => (
                <div
                  key={index}
                  className="animate-on-scroll flex items-start gap-4 p-5 bg-card rounded-xl border border-border/40 hover:border-primary/30 transition-all duration-300"
                >
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground text-sm font-medium">
                    {differential}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section ref={teamRef as React.RefObject<HTMLElement>} className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="animate-on-scroll text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Conheça Nosso{" "}
              <span className="text-primary">Time de Especialistas</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Profissionais certificados e experientes, dedicados a transformar sua empresa em
              líder de mercado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card
                key={index}
                className="animate-on-scroll text-center group transition-all duration-300 hover:-translate-y-1 border border-border/40 hover:border-primary/30 bg-card"
              >
                <CardContent className="p-6">
                  <div className="w-24 h-24 ring-2 ring-primary/20 bg-primary/8 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: "hsl(var(--primary) / 0.08)" }}
                  >
                    <span className="font-display font-bold text-primary text-2xl">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base mb-1">{member.name}</h3>
                  <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-xs text-muted-foreground mb-1">{member.experience}</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {member.specialization}
                  </p>
                </CardContent>
              </Card>
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
            Pronto para conhecer nosso{" "}
            <span className="text-primary-glow">método de trabalho?</span>
          </h2>
          <p className="text-white/60 mb-8">
            Agende uma conversa estratégica gratuita e descubra como podemos transformar
            sua empresa em uma potência digital.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contato">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-dark text-white px-10 py-6 text-base font-semibold hover:scale-105 transition-all duration-300 group"
              >
                Agendar Conversa Gratuita
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/cases">
              <Button
                size="lg"
                variant="ghost"
                className="text-white/80 hover:text-white border border-white/20 hover:border-white/40 hover:bg-white/5 px-10 py-6 text-base font-semibold transition-all duration-300"
              >
                Ver Cases de Sucesso
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CERTIFICATE MODAL */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setOpenModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full mx-4 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 hover:text-red-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={Certificado} alt="Certificado" className="rounded-xl w-full h-auto" />
          </div>
        </div>
      )}
    </div>
  );
}
