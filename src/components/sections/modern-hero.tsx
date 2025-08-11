import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, TrendingUp, Users, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import teamHero from "@/assets/team-hero.jpg";

export function ModernHero() {
  const stats = [
    { icon: Target, number: "400%", label: "ROI Médio", color: "text-primary" },
    { icon: TrendingUp, number: "R$ 80M+", label: "Gerados", color: "text-primary-glow" },
    { icon: Users, number: "500+", label: "Clientes", color: "text-primary-light" },
    { icon: Zap, number: "24h", label: "Resposta", color: "text-primary" }
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-hero">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-modern opacity-20 animate-pulse"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${teamHero})` }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-bounce"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary-glow/20 rounded-full blur-2xl animate-pulse"></div>
      
      <div className="relative z-20 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-6 border-primary-glow text-primary-glow bg-white/10 backdrop-blur-sm px-6 py-2 text-lg">
              🚀 Marketing que Converte
            </Badge>
            
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
              <span className="block text-white">Desperte o</span>
              <span className="block text-transparent bg-gradient-modern bg-clip-text animate-pulse">
                POTENCIAL
              </span>
              <span className="block text-white">do seu negócio</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-4xl mx-auto leading-relaxed">
              Transformamos empresas em <span className="text-primary-glow font-bold">máquinas de vendas</span> com 
              estratégias de marketing digital que realmente funcionam. 
              <span className="block mt-2 text-primary-light">Resultados em 30 dias ou seu dinheiro de volta!</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link to="/contato">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary-dark text-white px-10 py-6 text-xl shadow-glow transform hover:scale-105 transition-all duration-300 group"
                >
                  Começar Minha Transformação
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Button 
                size="lg" 
                variant="outline"
                className="border-white/30 text-black hover:bg-white/10 px-10 py-6 text-xl backdrop-blur-sm group"
              >
                <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                Ver Como Funciona
              </Button>
            </div>
          </div>
          
          {/* Modern Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 hover:bg-white/20 group"
                >
                  <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-black mb-2 text-white">{stat.number}</div>
                  <div className="text-white/80 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-primary-glow rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary-glow rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}