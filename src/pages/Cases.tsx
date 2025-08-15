import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stats } from "@/components/ui/stats";
import { Quote, Star, TrendingUp, ArrowRight, BarChart3, Target } from "lucide-react";
import { Link } from "react-router-dom";
import resultsChart from "@/assets/results-chart.jpg";

export default function Cases() {
  const testimonials = [
    {
      name: "Carlos Eduardo Santos",
      company: "TechSolutions Pro",
      role: "CEO",
      content: "Em 8 meses, saímos de R$ 50k para R$ 200k mensais. O ROI do investimento foi de 450%. A MarketingPro não apenas entregou resultados, superou todas as expectativas.",
      rating: 5,
      results: "300% de crescimento em vendas",
      investment: "R$ 5.500/mês"
    },
    {
      name: "Mariana Silva",
      company: "Beauty & Wellness",
      role: "Diretora Comercial",
      content: "Reduzimos o CAC em 65% e aumentamos o LTV em 280%. Agora temos um funil de vendas que funciona 24/7. O melhor investimento que fizemos na empresa.",
      rating: 5,
      results: "65% redução no CAC",
      investment: "R$ 4.200/mês"
    },
    {
      name: "Roberto Fernandes",
      company: "FitnessPro Academy",
      role: "Fundador",
      content: "De 100 leads por mês para 1200 leads qualificados. A estratégia de tráfego pago + SEO foi um divisor de águas. Nossa receita multiplicou por 6!",
      rating: 5,
      results: "1100% aumento em leads",
      investment: "R$ 6.800/mês"
    },
    {
      name: "Ana Costa",
      company: "EduTech Online",
      role: "CMO",
      content: "Implementaram um CRM completo que automatizou nossa operação. Agora convertemos 40% mais leads em clientes pagantes. ROI incrível!",
      rating: 5,
      results: "40% mais conversões",
      investment: "R$ 3.900/mês"
    }
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
        timeline: "8 meses"
      },
      investment: "R$ 8.500/mês"
    },
    {
      industry: "SaaS B2B",
      challenge: "Dificuldade para gerar leads qualificados",
      solution: "Estratégia omnichannel: LinkedIn Ads + SEO + Automação",
      results: {
        revenue: "De R$ 120k para R$ 480k/mês",
        leads: "800% aumento em leads MQL",
        conversion: "35% de melhoria na conversão",
        timeline: "10 meses"
      },
      investment: "R$ 12.000/mês"
    },
    {
      industry: "Clínica Médica",
      challenge: "Baixa visibilidade online e poucos agendamentos",
      solution: "SEO local + Google Ads + Gestão de reputação",
      results: {
        revenue: "De R$ 60k para R$ 180k/mês",
        appointments: "250% mais agendamentos",
        visibility: "1º lugar no Google",
        timeline: "6 meses"
      },
      investment: "R$ 4.500/mês"
    }
  ];

  const metrics = [
    { number: "400", label: "ROI médio dos clientes", suffix: "%" },
    { number: "R$ 80", label: "Milhões gerados", suffix: "M+" },
    { number: "500", label: "Empresas transformadas", suffix: "+" },
    { number: "4.9", label: "Nota média dos clientes", suffix: "/5" }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 border-primary-glow text-primary-glow bg-white/10 backdrop-blur-sm
          px-6 py-2 text-lg">
            Cases de Sucesso Reais
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Resultados que 
            <span className="block text-primary-glow">Falam por Si</span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Conheça empresas reais que transformaram seus resultados com nossas estratégias. 
            Números reais, crescimento real, lucro real.
          </p>
        </div>
      </section>

      {/* Results Overview */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Panorama dos Nossos <span className="text-primary">Resultados</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Mais de 500 empresas transformadas com metodologia própria e foco obsessivo em ROI
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {metrics.map((metric, index) => (
              <Stats 
                key={index}
                number={metric.number}
                label={metric.label}
                suffix={metric.suffix}
                className="bg-white p-8 rounded-2xl shadow-modern hover:shadow-glow transition-all duration-300 hover:-translate-y-2"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Case Studies */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Cases de <span className="text-primary">Destaque</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Histórias reais de transformação digital com resultados mensuráveis e sustentáveis
            </p>
          </div>

          <div className="space-y-12">
            {caseStudies.map((study, index) => (
              <Card key={index} className="overflow-hidden shadow-modern hover:shadow-glow transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="p-8 lg:p-12">
                    <Badge className="mb-4 bg-primary/10 text-primary">
                      {study.industry}
                    </Badge>
                    
                    <h3 className="text-2xl md:text-3xl font-bold mb-6">
                      Transformação Digital Completa
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          Desafio
                        </h4>
                        <p className="text-muted-foreground">{study.challenge}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          Solução
                        </h4>
                        <p className="text-muted-foreground">{study.solution}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-lg mb-2">Investimento</h4>
                        <p className="text-2xl font-bold text-primary">{study.investment}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-modern p-8 lg:p-12 text-white">
                    <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <BarChart3 className="h-6 w-6" />
                      Resultados Alcançados
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-2xl font-bold mb-1">{study.results.revenue}</div>
                        <div className="text-white/80">Crescimento em Faturamento</div>
                      </div>
                      
                      {study.results.cac && (
                        <div className="bg-white/10 rounded-lg p-4">
                          <div className="text-2xl font-bold mb-1">{study.results.cac}</div>
                          <div className="text-white/80">Otimização de CAC</div>
                        </div>
                      )}
                      
                      {study.results.leads && (
                        <div className="bg-white/10 rounded-lg p-4">
                          <div className="text-2xl font-bold mb-1">{study.results.leads}</div>
                          <div className="text-white/80">Aumento em Leads</div>
                        </div>
                      )}
                      
                      {study.results.roas && (
                        <div className="bg-white/10 rounded-lg p-4">
                          <div className="text-2xl font-bold mb-1">{study.results.roas}</div>
                          <div className="text-white/80">Retorno sobre Investimento</div>
                        </div>
                      )}
                      
                      <div className="bg-white/20 rounded-lg p-4 border border-white/30">
                        <div className="text-lg font-bold mb-1">Tempo: {study.results.timeline}</div>
                        <div className="text-white/80">Para atingir estes resultados</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              O que Nossos <span className="text-primary">Clientes Dizem</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Depoimentos reais de empresários que transformaram seus negócios conosco
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-modern transition-all duration-300">
                <CardContent className="p-8">
                  <div className="absolute top-6 right-6 opacity-20">
                    <Quote className="h-12 w-12 text-primary" />
                  </div>
                  
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="border-t pt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-bold text-primary text-lg">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{testimonial.name}</div>
                        <div className="text-muted-foreground">
                          {testimonial.role} - {testimonial.company}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 bg-gradient-card rounded-lg p-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Resultado</div>
                        <div className="font-bold text-primary">{testimonial.results}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Investimento</div>
                        <div className="font-bold">{testimonial.investment}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Results Guarantee */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary">
              Garantia de Resultados
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Tão Confiantes que Oferecemos 
              <span className="text-primary block">Garantia de 90 Dias</span>
            </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Nossa metodologia já transformou empresas de diferentes setores em até 90 dias. 
                O próximo caso de sucesso pode ser o seu.
              </p>

              <div className="bg-gradient-card rounded-2xl p-8 shadow-modern">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">90</span>
                    </div>
                    <h3 className="font-semibold mb-2">Dias para Resultados</h3>
                    <p className="text-muted-foreground text-sm">Prazo médio para começar a ver crescimento real</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">+120</span>
                    </div>
                    <h3 className="font-semibold mb-2">Empresas Impactadas</h3>
                    <p className="text-muted-foreground text-sm">Negócios de diferentes setores já transformados</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">100%</span>
                    </div>
                    <h3 className="font-semibold mb-2">Metodologia Validada</h3>
                    <p className="text-muted-foreground text-sm">Estratégias testadas e comprovadas no mercado</p>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Quer ser o Próximo 
            <span className="block text-primary-glow">Case de Sucesso?</span>
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Agende uma conversa estratégica gratuita e descubra como podemos 
            replicar esses resultados na sua empresa.
          </p>
          <Link to="/contato">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-dark text-white px-8 py-6 text-xl shadow-glow hover:scale-105 transition-all duration-300"
            >
              Começar Minha Transformação
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}