import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Search, 
  Users, 
  Globe, 
  BarChart3, 
  Zap,
  CheckCircle,
  ArrowRight,
  Target,
  Smartphone,
  MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Services() {
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
        "A/B testing contínuo de anúncios"
      ],
      price: "A partir de R$ 2.500/mês",
      popular: true
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
        "Monitoramento de rankings"
      ],
      price: "A partir de R$ 1.800/mês"
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
        "Análise de funil completa"
      ],
      price: "A partir de R$ 1.500/mês"
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
        "Manutenção e suporte inclusos"
      ],
      price: "A partir de R$ 3.500"
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
        "Previsões e tendências"
      ],
      price: "A partir de R$ 1.200/mês"
    },
    {
      icon: Smartphone,
      title: "Social Media",
      description: "Gestão estratégica de redes sociais para engajamento e vendas",
      features: [
        "Estratégia de conteúdo",
        "Criação de posts e stories",
        "Gestão de comunidade",
        "Campanhas de influenciadores",
        "Relatórios de engagement"
      ],
      price: "A partir de R$ 2.000/mês"
    }
  ];

  const packages = [
    {
      name: "Starter",
      price: "R$ 3.500",
      period: "/mês",
      description: "Ideal para pequenas empresas que querem começar",
      features: [
        "Tráfego Pago (Google + Meta)",
        "Landing Page Otimizada",
        "Relatórios Mensais",
        "Suporte via WhatsApp",
        "Consultoria Estratégica"
      ],
      popular: false
    },
    {
      name: "Growth",
      price: "R$ 6.500",
      period: "/mês",
      description: "Para empresas prontas para escalar rapidamente",
      features: [
        "Tudo do Starter +",
        "SEO Completo",
        "CRM e Automação",
        "Social Media",
        "Relatórios Semanais",
        "Consultoria Quinzenal"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "R$ 12.000",
      period: "/mês",
      description: "Solução completa para grandes empresas",
      features: [
        "Tudo do Growth +",
        "Analytics Avançado",
        "Multi-canais Premium",
        "Gerente Dedicado",
        "Relatórios Personalizados",
        "Consultoria Semanal"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 border-primary-glow text-primary-glow bg-white/10 backdrop-blur-sm">
            Nossos Serviços
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Soluções Completas de 
            <span className="block text-primary-glow">Marketing Digital</span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Combinamos estratégia, tecnologia e execução para transformar 
            seu negócio em uma máquina de vendas automatizada
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Cada Serviço é uma <span className="text-primary">Peça do Puzzle</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Não trabalhamos com soluções isoladas. Cada serviço se integra perfeitamente 
              para criar um ecossistema de marketing que gera resultados exponenciais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card 
                  key={index} 
                  className={`relative overflow-hidden group hover:shadow-modern transition-all duration-300 hover:-translate-y-2 ${
                    service.popular ? 'ring-2 ring-primary shadow-glow' : ''
                  }`}
                >
                  {service.popular && (
                    <Badge className="absolute top-4 right-4 bg-primary text-white">
                      Mais Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="bg-primary/10 rounded-xl w-16 h-16 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="text-2xl font-bold text-primary mb-4">{service.price}</div>
                      <Link to="/contato">
                        <Button className="w-full bg-primary hover:bg-primary-dark text-white">
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

      {/* Packages Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 text-primary border-primary">
              Pacotes Completos
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Escolha o Pacote Ideal para 
              <span className="text-primary block">Seu Momento de Crescimento</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Pacotes estratégicos que combinam nossos melhores serviços 
              para acelerar seus resultados com economia garantida.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <Card 
                key={index}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-modern hover:-translate-y-2 ${
                  pkg.popular ? 'ring-2 ring-primary shadow-glow scale-105' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-white text-center py-2 font-semibold">
                    🏆 Mais Escolhido
                  </div>
                )}
                
                <CardHeader className={`text-center ${pkg.popular ? 'pt-12' : ''}`}>
                  <CardTitle className="text-2xl mb-2">{pkg.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-primary">{pkg.price}</span>
                    <span className="text-muted-foreground">{pkg.period}</span>
                  </div>
                  <p className="text-muted-foreground">{pkg.description}</p>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {pkg.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link to="/contato">
                    <Button 
                      className={`w-full ${
                        pkg.popular 
                          ? 'bg-primary hover:bg-primary-dark text-white shadow-glow' 
                          : 'bg-primary hover:bg-primary-dark text-white'
                      }`}
                    >
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

      {/* Process Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Como Trabalhamos: <span className="text-primary">Metodologia Comprovada</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Diagnóstico", desc: "Análise completa do seu negócio e concorrência" },
              { step: "02", title: "Estratégia", desc: "Criação do plano personalizado de marketing" },
              { step: "03", title: "Execução", desc: "Implementação coordenada de todas as ações" },
              { step: "04", title: "Otimização", desc: "Monitoramento e melhoria contínua dos resultados" }
            ].map((process, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {process.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{process.title}</h3>
                <p className="text-muted-foreground">{process.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Pronto para Transformar seus 
            <span className="block text-primary-glow">Resultados de Marketing?</span>
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Não perca mais tempo com estratégias que não funcionam. 
            Comece hoje mesmo com uma consultoria gratuita e personalizada.
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