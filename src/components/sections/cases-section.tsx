import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stats } from "@/components/ui/stats";
import { Quote, Star, TrendingUp } from "lucide-react";
import resultsChart from "@/assets/results-chart.jpg";
import clientSuccess from "@/assets/client-success.jpg";

export function CasesSection() {
  const testimonials = [
    {
      name: "Carlos Eduardo",
      company: "Tech Solutions",
      role: "CEO",
      content: "Em 6 meses, saímos de R$ 50k para R$ 180k mensais. O ROI do investimento em marketing foi de 400%. Equipe extremamente profissional.",
      rating: 5
    },
    {
      name: "Mariana Silva",
      company: "Beauty & Care",
      role: "Diretora",
      content: "Conseguimos reduzir o CAC em 60% e aumentar o LTV em 250%. Os resultados superaram todas as expectativas. Recomendo!",
      rating: 5
    },
    {
      name: "Roberto Fernandes",
      company: "Fitness Pro",
      role: "Fundador",
      content: "De 100 leads por mês para 800 leads qualificados. A estratégia de tráfego pago deles é simplesmente excepcional.",
      rating: 5
    }
  ];

  const results = [
    { number: "300", label: "Aumento médio em vendas", suffix: "%" },
    { number: "50", label: "Milhões gerados", prefix: "R$ ", suffix: "M+" },
    { number: "200", label: "Empresas transformadas", suffix: "+" },
    { number: "4.9", label: "Nota média dos clientes", suffix: "/5" }
  ];

  return (
    <section id="cases" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Cases de Sucesso
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Resultados que 
            <span className="text-primary block">falam por si</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Veja como transformamos negócios reais em histórias de sucesso mensuráveis
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {results.map((result, index) => (
            <Stats 
              key={index}
              number={result.number}
              label={result.label}
              prefix={result.prefix}
              suffix={result.suffix}
              className="bg-card p-6 rounded-lg shadow-elegant hover:shadow-premium transition-all duration-300"
            />
          ))}
        </div>

        {/* Case Study Highlight */}
        <div className="bg-gradient-subtle rounded-2xl p-8 md:p-12 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary">
                Case de Destaque
              </Badge>
              <h3 className="text-2xl md:text-3xl font-bold mb-6">
                E-commerce de Moda: 
                <span className="text-primary block">De R$ 80k para R$ 350k/mês</span>
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Desafio</h4>
                    <p className="text-muted-foreground">Alto CAC e baixa conversão nas campanhas de tráfego pago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Solução</h4>
                    <p className="text-muted-foreground">Reestruturação completa das campanhas + otimização do funil de vendas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Resultado</h4>
                    <p className="text-muted-foreground">337% de aumento no faturamento em 8 meses</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={resultsChart} 
                alt="Gráfico de resultados mostrando crescimento"
                className="rounded-xl shadow-elegant w-full"
              />
              <div className="absolute -bottom-4 -right-4 bg-primary text-white p-4 rounded-xl shadow-premium">
                <div className="text-2xl font-bold">+337%</div>
                <div className="text-sm">Crescimento</div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
            O que nossos clientes dizem
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="absolute top-4 right-4 opacity-20">
                    <Quote className="h-8 w-8 text-primary" />
                  </div>
                  
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} - {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}