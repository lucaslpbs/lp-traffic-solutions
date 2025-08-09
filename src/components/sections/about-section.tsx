import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Award, TrendingUp, Users, Zap, Shield } from "lucide-react";

export function AboutSection() {
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
    "Metodologia proprietária testada em 200+ empresas",
    "Time de especialistas certificados Google e Meta",
    "Acompanhamento semanal com relatórios detalhados",
    "Garantia de resultados em 90 dias",
    "Suporte dedicado via WhatsApp",
    "Consultoria estratégica mensal inclusa"
  ];

  return (
    <section id="sobre" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Quem Somos
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            A agência que faz empresas 
            <span className="text-primary block">crescerem de verdade</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Especialistas em marketing digital com foco em resultados mensuráveis. 
            Nossa missão é transformar seu investimento em marketing em crescimento real e sustentável.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="text-center group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2">
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

        {/* Mission & Differentials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-6">
              Nossa missão é simples:
              <span className="text-primary block">Fazer você vender mais</span>
            </h3>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Fundada por especialistas com mais de 10 anos no mercado digital, nossa agência nasceu 
              da necessidade de oferecer estratégias realmente eficazes para empreendedores sérios 
              que querem resultados, não apenas relatórios bonitos.
            </p>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-primary/10 rounded-full p-3">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Certificações Google & Meta</h4>
                <p className="text-muted-foreground">Time certificado nas principais plataformas</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-6">Por que escolher nossa agência?</h4>
            <div className="space-y-4">
              {differentials.map((differential, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">{differential}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}