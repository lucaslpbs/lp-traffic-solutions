import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowUp, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToContact = () => {
    document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-foreground text-white">
      {/* Final CTA */}
      <div className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Transforme seu negócio hoje mesmo
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Não deixe seus concorrentes saírem na frente. 
            Comece agora sua jornada rumo ao crescimento exponencial.
          </p>
          <Button
            size="lg"
            onClick={scrollToContact}
            className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg shadow-premium"
          >
            Quero meu orçamento gratuito
          </Button>
        </div>
      </div>

      {/* Footer Content */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="text-2xl font-bold">
                Agência<span className="text-primary">Digital</span>
              </div>
              <p className="text-white/70 leading-relaxed">
                Especialistas em marketing digital com foco em resultados mensuráveis 
                para empresas que querem crescer de verdade.
              </p>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Serviços</h3>
              <ul className="space-y-2 text-white/70">
                <li>Tráfego Pago</li>
                <li>Tráfego Orgânico (SEO)</li>
                <li>CRM & Automação</li>
                <li>Criação de Sites</li>
                <li>Consultoria Digital</li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Empresa</h3>
              <ul className="space-y-2 text-white/70">
                <li><a href="#sobre" className="hover:text-white transition-colors">Sobre nós</a></li>
                <li><a href="#cases" className="hover:text-white transition-colors">Cases de sucesso</a></li>
                <li><a href="#contato" className="hover:text-white transition-colors">Contato</a></li>
                <li>Blog</li>
                <li>Carreiras</li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contato</h3>
              <div className="space-y-3 text-white/70">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>contato@agenciadigital.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(11) 99999-9999</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>São Paulo, SP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-white/20" />

      {/* Bottom Footer */}
      <div className="py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-white/70 text-sm mb-4 md:mb-0">
            © 2024 Agência Digital. Todos os direitos reservados.
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-white/70 text-sm">
              Política de Privacidade | Termos de Uso
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToTop}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}