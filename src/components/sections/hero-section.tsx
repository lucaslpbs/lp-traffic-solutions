import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Target, Users } from "lucide-react";
import teamHero from "@/assets/team-hero.jpg";

export function HeroSection() {
  const scrollToContact = () => {
    document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-hero overflow-hidden">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${teamHero})` }}
      ></div>
      
      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Transforme sua empresa em uma 
            <span className="block text-primary-light">máquina de vendas</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Agência especializada em tráfego pago, SEO e CRM para empreendedores que faturam acima de R$ 30k/mês e querem escalar com estratégias comprovadas
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              variant="default"
              onClick={scrollToContact}
              className="bg-primary hover:bg-primary-dark text-white px-8 py-4 text-lg shadow-premium transform hover:scale-105 transition-all duration-300"
            >
              Quero meu orçamento
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm"
            >
              Ver nossos cases
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex flex-col items-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 mb-4">
                <Target className="h-8 w-8 text-primary-light" />
              </div>
              <div className="text-3xl font-bold mb-2">300%</div>
              <div className="text-white/80">Aumento médio em vendas</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 mb-4">
                <BarChart3 className="h-8 w-8 text-primary-light" />
              </div>
              <div className="text-3xl font-bold mb-2">R$ 50M+</div>
              <div className="text-white/80">Gerados para clientes</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 mb-4">
                <Users className="h-8 w-8 text-primary-light" />
              </div>
              <div className="text-3xl font-bold mb-2">200+</div>
              <div className="text-white/80">Empresas transformadas</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </div>
    </section>
  );
}