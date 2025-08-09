import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    try {
      // Here you would typically send the data to your backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Mensagem enviada com sucesso!",
        description: "Entraremos em contato em até 24 horas.",
      });
      
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente ou entre em contato por WhatsApp.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const benefits = [
    "Análise gratuita do seu negócio",
    "Estratégia personalizada em 48h",
    "Consultoria sem compromisso",
    "Orçamento detalhado e transparente"
  ];

  return (
    <section id="contato" className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/80 z-10"></div>
      
      <div className="relative z-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-white border-white/30">
            Entre em Contato
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Pronto para 
            <span className="text-primary-light block">transformar seu negócio?</span>
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Vamos conversar sobre como podemos ajudar sua empresa a alcançar resultados extraordinários
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-premium">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Solicite seu orçamento gratuito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Conte-nos sobre seu negócio e seus objetivos..."
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-primary hover:bg-primary-dark text-white shadow-premium"
                >
                  {isSubmitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      Enviar mensagem
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info & Benefits */}
          <div className="space-y-8">
            {/* Benefits */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  O que você ganha ao entrar em contato:
                </h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary-light mt-1 flex-shrink-0" />
                      <span className="text-white/90">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">
                Outras formas de contato:
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-white/90">
                  <div className="bg-white/10 rounded-full p-3">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">E-mail</div>
                    <div>contato@agenciadigital.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-white/90">
                  <div className="bg-white/10 rounded-full p-3">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">WhatsApp</div>
                    <div>(11) 99999-9999</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-white/90">
                  <div className="bg-white/10 rounded-full p-3">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">Endereço</div>
                    <div>São Paulo, SP - Brasil</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center pt-6">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg shadow-premium"
                onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
              >
                Falar no WhatsApp
                <Phone className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}