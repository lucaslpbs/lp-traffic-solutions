import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Award, TrendingUp, Users, Zap, Shield, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Certificado from "../assets/Certificado.jpg";
import { motion } from "framer-motion";
import React from "react";
import './shimmer.css';

export default function About() {
  const [openModal, setOpenModal] = useState(false);
  const services = [
    {
      icon: TrendingUp,
      title: "Tráfego Pago",
      description: "Google Ads, Meta Ads e LinkedIn Ads com foco em ROI máximo"
    },
    {
      icon: Zap,
      title: "Tráfego Orgânico",
      description: "SEO estratégico para posicionamento de longo prazo"
    },
    {
      icon: Users,
      title: "CRM & Automação",
      description: "Sistemas de vendas automatizados e nurturing de leads"
    },
    {
      icon: Shield,
      title: "Criação de Sites",
      description: "Landing pages e sites otimizados para conversão"
    }
  ];

  const differentials = [
    "Metodologia proprietária testada em 100+ empresas",
    "Time de especialistas certificados Google e Meta",
    "Acompanhamento semanal com relatórios detalhados",
    "Com apenas 30/90 dias, seus resultados não serão mais os mesmos. Dezenas de clientes já satisfeitos com a nossa estratégia.",
    "Suporte dedicado via WhatsApp em horário comercial",
    "Consultoria estratégica mensal inclusa sem custo adicional"
  ];

  const values = [
    {
      icon: Target,
      title: "Resultados Reais",
      description: "Focamos em métricas que impactam diretamente o faturamento da sua empresa"
    },
    {
      icon: Shield,
      title: "Transparência Total",
      description: "Acesso completo a dados, relatórios e estratégias. Sem caixas pretas."
    },
    {
      icon: Zap,
      title: "Agilidade",
      description: "Implementação rápida e otimizações constantes para acelerar resultados"
    },
    {
      icon: Users,
      title: "Parceria Verdadeira",
      description: "Seu sucesso é o nosso sucesso. Trabalhamos como uma extensão do seu time"
    }
  ];

  const team = [
    {
      name: "Lucas Paulino",
      role: "CEO & Head de estratégia",
      experience: "1+ anos em marketing digital, 5+ anos em desenvolvimento de softwares",
      specialization: "Growth Marketing e Performance"
    },
    {
      name: "Taylane Maia",
      role: "Diretora de Tráfego Pago",
      experience: "1+ anos em Google e Meta Ads",
      specialization: "Otimização de Campanhas e ROAS"
    },
    {
      name: "Gabriel Paulino",
      role: "Especialista em Sites",
      experience: "2+ anos em desenvolvimento de softwares",
      specialization: "Criação de sistemas e sites"
    },
    {
      name: "Kauã Silvano",
      role: "Especialista em Designer",
      experience: "5+ anos em designer para empresas",
      specialization: "Criação de designers personalizados"
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 border-primary-glow text-primary-glow bg-white/10 backdrop-blur-sm
          px-6 py-2 text-lg">
            Sobre a Traffic Solutions
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            A Agência que Faz 
            <span className="block text-primary-glow">Empresas Crescerem</span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Especialistas em transformar investimento em marketing em crescimento real e sustentável. 
            Nossa missão é fazer sua empresa dominar o mercado digital.
          </p>
        </div>
      </section>

{/* Mission & Story */}
<section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge variant="outline" className="mb-6 text-primary border-primary">
              Nossa História
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Traffic <span className="text-primary block">Solutions</span>
            </h2>

            {/* Parágrafo 1 */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-lg leading-relaxed mb-6 text-muted-foreground"
            >
              Desde 2023, a{" "}
              <strong className="shimmer font-bold">Traffic Solutions</strong>{" "}
              vem transformando negócios com{" "}
              <strong className="shimmer font-semibold">
                estratégias de marketing reais
              </strong>{" "}
              que geram resultados. Somos especialistas em impulsionar marcas através de{" "}
              <strong className="shimmer">automação inteligente</strong>,{" "}
              <strong className="shimmer">gestão de tráfego pago</strong>,{" "}
              <strong className="shimmer">design criativo</strong>,{" "}
              <strong className="shimmer">CRM personalizado</strong>,{" "}
              <strong className="shimmer">criação de sites profissionais</strong> e{" "}
              <strong className="shimmer">produção de vídeos impactantes</strong>.
            </motion.p>

            {/* Parágrafo 2 */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg leading-relaxed mb-8 text-muted-foreground"
            >
              Aqui, cada detalhe é pensado para uma coisa:{" "}
              <strong className="shimmer">fazer sua empresa crescer de verdade</strong>
              . Nossa equipe é formada por profissionais apaixonados pelo que fazem —{" "}
              <strong className="shimmer">
                gente que estuda, testa e aprimora cada estratégia até alcançar o melhor desempenho possível
              </strong>
              .
            </motion.p>

            {/* Parágrafo 3 */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-lg leading-relaxed mb-8 text-muted-foreground"
            >
              E o diferencial?{" "}
              <strong className="shimmer">atendimento próximo e personalizado</strong>. O próprio CEO acompanha de perto cada projeto, garantindo{" "}
              <strong className="shimmer">relatórios transparentes</strong>,{" "}
              <strong className="shimmer">retorno real</strong> e{" "}
              <strong className="shimmer">atenção total em cada etapa</strong>. Na{" "}
              <strong className="shimmer">Traffic Solutions</strong>, não acreditamos em sorte — acreditamos em{" "}
              <strong className="shimmer">estratégia</strong>,{" "}
              <strong className="shimmer">dados</strong> e{" "}
              <strong className="shimmer">resultados</strong>. Se o seu objetivo é crescer de forma consistente e dominar o digital, você está no lugar certo.
            </motion.p>

            <button
              onClick={() => setOpenModal(true)}
              className="flex items-center gap-4 mb-6 hover:opacity-80 transition"
            >
              <div className="bg-primary/10 rounded-full p-3">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Certificações Premium</h4>
                <p className="text-muted-foreground">Google Partner Premier e Meta Business Partner</p>
              </div>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-modern p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Nossos Números</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">100+</div>
                <div className="text-sm text-muted-foreground">Empresas Transformadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">R$ 10M+</div>
                <div className="text-sm text-muted-foreground">Faturamento Gerado</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">400%</div>
                <div className="text-sm text-muted-foreground">ROI Médio dos Clientes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
                <div className="text-sm text-muted-foreground">Avaliação dos Clientes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>


      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Nossos <span className="text-primary">Serviços Especializados</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Cada serviço é uma peça estratégica do puzzle que vai transformar 
              sua empresa em uma máquina de vendas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="text-center group hover:shadow-modern transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-6">
                    <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Link to="/servicos">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white shadow-modern">
                Ver Todos os Serviços
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Nossos <span className="text-primary">Valores</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Estes são os princípios que guiam cada decisão e estratégia que desenvolvemos para nossos clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center group hover:shadow-modern transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {openModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setOpenModal(false)} // <-- fecha clicando no fundo
        >
          <div 
            className="bg-white rounded-2xl shadow-lg max-w-3xl w-full p-6 relative"
            onClick={(e) => e.stopPropagation()} // <-- impede fechar ao clicar na imagem
          >
            <button 
              onClick={() => setOpenModal(false)} 
              className="absolute top-3 right-3 text-black hover:text-red-600 text-xl font-bold"
            >
              ✕
            </button>
            <img src={Certificado} alt="Certificado" className="rounded-xl w-full h-auto" />
          </div>
        </div>
      )}

      {/* Differentials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Por que Escolher a <span className="text-primary">TrafficSolutions?</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Não somos apenas mais uma agência. Somos seus parceiros estratégicos no crescimento.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {differentials.map((differential, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-gradient-card rounded-xl border hover:shadow-elegant transition-all duration-300">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground font-medium">{differential}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Conheça Nosso <span className="text-primary">Time de Especialistas</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Profissionais certificados e experientes, dedicados a transformar sua empresa em líder de mercado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center group hover:shadow-modern transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <span className="text-2xl font-bold text-primary">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground mb-2">{member.experience}</p>
                  <p className="text-sm text-muted-foreground font-medium">{member.specialization}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Pronto para Conhecer Nosso 
            <span className="block text-primary-glow">Método de Trabalho?</span>
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Agende uma conversa estratégica gratuita e descubra como podemos 
            transformar sua empresa em uma potência digital.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contato">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-dark text-white px-8 py-6 text-xl shadow-glow hover:scale-105 transition-all duration-300"
              >
                Agendar Conversa Gratuita
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Link to="/cases">
              <Button 
                size="lg" 
                variant="outline"
                className="border-white/30 text-black hover:bg-white/10 px-8 py-6 text-xl backdrop-blur-sm"
              >
                Ver Cases de Sucesso
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}