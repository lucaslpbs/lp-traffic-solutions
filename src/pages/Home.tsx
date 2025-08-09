import { ModernHero } from "@/components/sections/modern-hero";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const benefits = [
    "Aumento de 300% nas vendas em 90 dias",
    "Redução de 50% no custo de aquisição",
    "Automação completa do funil de vendas",
    "Relatórios em tempo real com IA"
  ];

  const quickStats = [
    { number: "500+", label: "Empresas Transformadas" },
    { number: "R$ 80M+", label: "Faturamento Gerado" },
    { number: "4.9/5", label: "Avaliação dos Clientes" }
  ];

  return (
    <div className="min-h-screen">
      <ModernHero />
      
      {/* Problem/Solution Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-6 text-primary border-primary">
              O Problema é Real
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-8">
              Você está <span className="text-primary">perdendo dinheiro</span> todos os dias
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Enquanto você hesita, seus concorrentes estão dominando o mercado online. 
              Cada dia sem uma estratégia de marketing eficaz é receita que vai para o bolso deles.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-8">
              <h3 className="text-2xl md:text-3xl font-bold">
                Pare de jogar dinheiro fora com:
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border-l-4 border-red-500">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✕</span>
                  </div>
                  <span className="text-red-700 font-medium">Campanhas sem estratégia que queimam orçamento</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border-l-4 border-red-500">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✕</span>
                  </div>
                  <span className="text-red-700 font-medium">Sites que não convertem visitantes em clientes</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border-l-4 border-red-500">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✕</span>
                  </div>
                  <span className="text-red-700 font-medium">Leads frios que nunca viram compradores</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl md:text-3xl font-bold text-primary">
                Comece a lucrar com:
              </h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border-l-4 border-primary">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <span className="text-foreground font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-modern p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Resultados que Comprovam Nossa Eficácia
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {quickStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Não deixe para amanhã o que pode 
              <span className="block text-primary-glow">transformar seu negócio hoje</span>
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Cada segundo que passa é uma oportunidade perdida. 
              Comece sua jornada rumo ao sucesso digital agora mesmo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contato">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-6 text-xl shadow-glow hover:scale-105 transition-all duration-300"
                >
                  Quero Começar Agora
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link to="/cases">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-xl backdrop-blur-sm"
                >
                  Ver Casos de Sucesso
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}