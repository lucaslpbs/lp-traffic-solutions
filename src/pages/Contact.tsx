import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send, Shield, Clock, Zap } from "lucide-react";
import emailjs from "@emailjs/browser";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    revenue: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    await fetch("http://localhost:5678/webhook/Formulário", { // URL do seu webhook
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData) // envia como objeto JSON
    });

    toast({
      title: "Solicitação enviada com sucesso!",
      description: "Nossa equipe entrará em contato em até 2 horas.",
    });

    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      revenue: "",
      service: "",
      message: ""
    });
  } catch (error) {
    toast({
      title: "Erro ao enviar solicitação",
      description: "Tente novamente ou entre em contato via WhatsApp.",
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
    {
      icon: Clock,
      title: "Resposta em 2 horas",
      description: "Nossa equipe responde rapidamente"
    },
    {
      icon: Shield,
      title: "Análise gratuita",
      description: "Diagnóstico completo sem compromisso"
    },
    {
      icon: Zap,
      title: "Estratégia personalizada",
      description: "Plano exclusivo para seu negócio"
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
            Fale Conosco
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Pronto para 
            <span className="block text-primary-glow">Transformar seu Negócio?</span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Agende uma conversa estratégica gratuita e descubra como podemos 
            multiplicar seus resultados em 90 dias ou menos.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="shadow-modern hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl text-center">
                  Solicite sua Análise Gratuita
                </CardTitle>
                <p className="text-muted-foreground text-center">
                  Preencha o formulário e receba um diagnóstico personalizado do seu negócio
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Label htmlFor="company">Empresa *</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Nome da sua empresa"
                        required
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail corporativo *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="seu@empresa.com"
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp *</Label>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="revenue">Faturamento mensal</Label>
                      <Select onValueChange={(value) => setFormData(prev => ({...prev, revenue: value}))}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-30k">R$ 0 - 30k</SelectItem>
                          <SelectItem value="30k-100k">R$ 30k - 100k</SelectItem>
                          <SelectItem value="100k-500k">R$ 100k - 500k</SelectItem>
                          <SelectItem value="500k+">R$ 500k+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service">Serviço de interesse</Label>
                      <Select onValueChange={(value) => setFormData(prev => ({...prev, service: value}))}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trafego-pago">Tráfego Pago</SelectItem>
                          <SelectItem value="seo">SEO</SelectItem>
                          <SelectItem value="crm">CRM & Automação</SelectItem>
                          <SelectItem value="sites">Criação de Sites</SelectItem>
                          <SelectItem value="completo">Pacote Completo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Descreva seu principal desafio</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Conte-nos sobre seus objetivos, desafios atuais e o que espera alcançar..."
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 bg-primary hover:bg-primary-dark text-white text-lg shadow-modern hover:shadow-glow transition-all duration-300 hover:scale-105"
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        Solicitar Análise Gratuita
                        <Send className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    Seus dados estão seguros. Não enviamos spam.
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Benefits & Contact Info */}
            <div className="space-y-8">
              {/* Benefits */}
              <Card className="shadow-modern">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-center">
                    O que você ganha:
                  </h3>
                  <div className="space-y-6">
                    {benefits.map((benefit, index) => {
                      const Icon = benefit.icon;
                      return (
                        <div key={index} className="flex items-start gap-4">
                          <div className="bg-primary/10 rounded-full p-3">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">{benefit.title}</h4>
                            <p className="text-muted-foreground">{benefit.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="shadow-modern">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-center">
                    Outras formas de contato:
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 rounded-full p-3">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">E-mail</div>
                        <div className="text-muted-foreground">lucaspaulinobs@gmail.com</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 rounded-full p-3">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">WhatsApp</div>
                        <div className="text-muted-foreground">(11) 99999-9999</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 rounded-full p-3">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">Escritório</div>
                        <div className="text-muted-foreground">R MONSENHOR BRUNO 1153, SALA 1423, CEP: 60.115-191, ALDEOTA, FORTALEZA, CE</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t">
                    <Button
                      size="lg"
                      className="w-full bg-green-600 hover:bg-green-700 text-white shadow-modern"
                      onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre os serviços da MarketingPro.', '_blank')}
                    >
                      <Phone className="mr-2 h-5 w-5" />
                      Falar no WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Guarantee */}
              <Card className="bg-gradient-modern text-white shadow-glow">
                <CardContent className="p-8 text-center">
                  <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">
                    Garantia de 30 Dias
                  </h3>
                  <p className="text-white/90">
                    Transforme cliques em clientes em apenas 30 dias!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Perguntas <span className="text-primary">Frequentes</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  question: "Quanto tempo para ver resultados?",
                  answer: "Primeiros resultados em 30 dias, resultados significativos em 90 dias."
                },
                {
                  question: "Qual o investimento mínimo?",
                  answer: "A partir de R$ 3.500/mês, dependendo do escopo e objetivos."
                },
                {
                  question: "Trabalham com que tipo de empresa?",
                  answer: "Empresas que faturam acima de R$ 30k/mês e querem escalar."
                },
                {
                  question: "Como funciona a garantia?",
                  answer: "Com apenas 30/90 dias, seus resultados não serão mais os mesmos. Dezenas de clientes já satisfeitos com a nossa estratégia."
                }
              ].map((faq, index) => (
                <Card key={index} className="shadow-elegant hover:shadow-modern transition-all duration-300">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3 text-lg">{faq.question}</h4>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}