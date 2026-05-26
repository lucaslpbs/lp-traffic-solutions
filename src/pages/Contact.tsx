import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send, Shield, Clock, Zap } from "lucide-react";

function useScrollReveal(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target
              .querySelectorAll(".animate-on-scroll")
              .forEach((child, i) => {
                (child as HTMLElement).style.transitionDelay = `${i * 0.1}s`;
                child.classList.add("is-visible");
              });
          }
        });
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    revenue: "",
    service: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const formRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);
  useScrollReveal(formRef as React.RefObject<HTMLElement>);
  useScrollReveal(faqRef as React.RefObject<HTMLElement>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch("https://n8n.trafficsolutions.cloud/webhook/envio-formulario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
        message: "",
      });
    } catch (error) {
      console.error("Erro ao enviar webhook:", error);
      toast({
        title: "Erro ao enviar solicitação",
        description: "Tente novamente ou entre em contato via WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const benefits = [
    { icon: Clock, title: "Resposta em 2 horas", description: "Nossa equipe responde rapidamente" },
    { icon: Shield, title: "Análise gratuita", description: "Diagnóstico completo sem compromisso" },
    { icon: Zap, title: "Estratégia personalizada", description: "Plano exclusivo para seu negócio" },
  ];

  const faqs = [
    {
      question: "Quanto tempo para ver resultados?",
      answer: "Primeiros resultados em 30 dias, resultados significativos em 90 dias.",
    },
    {
      question: "Qual o investimento mínimo?",
      answer: "A partir de R$ 3.500/mês, dependendo do escopo e objetivos.",
    },
    {
      question: "Trabalham com que tipo de empresa?",
      answer: "Empresas que faturam acima de R$ 30k/mês e querem escalar.",
    },
    {
      question: "Como funciona a garantia?",
      answer:
        "Com apenas 30/90 dias, seus resultados não serão mais os mesmos. Dezenas de clientes já satisfeitos com a nossa estratégia.",
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* HERO */}
      <section className="bg-foreground py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(217 91% 60% / 0.4) 1px, transparent 0)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <span className="inline-block text-primary-glow text-xs font-semibold tracking-widest uppercase mb-5 border border-primary-glow/30 rounded-full px-4 py-1.5">
            Fale Conosco
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Pronto para
            <span className="block text-primary-glow">Transformar seu Negócio?</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Agende uma conversa estratégica gratuita e descubra como podemos
            multiplicar seus resultados em 90 dias ou menos.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-12 block">
            <polygon points="0,60 1200,0 1200,60" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* FORM + SIDEBAR */}
      <section ref={formRef as React.RefObject<HTMLElement>} className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">

            {/* FORM CARD */}
            <Card className="animate-on-scroll border border-border/40 bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-2xl md:text-3xl text-center">
                  Solicite sua Análise Gratuita
                </CardTitle>
                <p className="text-muted-foreground text-center text-sm">
                  Preencha o formulário e receba um diagnóstico personalizado do seu negócio
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-sm font-medium">Nome completo *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Seu nome completo"
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="company" className="text-sm font-medium">Empresa *</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Nome da sua empresa"
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium">E-mail corporativo *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="seu@empresa.com"
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-sm font-medium">WhatsApp *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+55 (85) 98747-9260"
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Faturamento mensal</Label>
                      <Select
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, revenue: value }))
                        }
                      >
                        <SelectTrigger className="h-11">
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
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Serviço de interesse</Label>
                      <Select
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, service: value }))
                        }
                      >
                        <SelectTrigger className="h-11">
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

                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-sm font-medium">
                      Descreva seu principal desafio
                    </Label>
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
                    className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-semibold hover:scale-[1.02] transition-all duration-300"
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        Solicitar Análise Gratuita
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Seus dados estão seguros. Não enviamos spam.
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* SIDEBAR */}
            <div className="space-y-5">
              {/* Benefits */}
              <Card className="animate-on-scroll border border-border/40 bg-card">
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-bold mb-5">O que você ganha:</h3>
                  <div className="space-y-5">
                    {benefits.map((benefit, index) => {
                      const Icon = benefit.icon;
                      return (
                        <div key={index} className="flex items-start gap-4">
                          <div className="bg-primary/10 rounded-xl p-2.5 flex-shrink-0">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-0.5">{benefit.title}</h4>
                            <p className="text-muted-foreground text-xs">{benefit.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Contact info */}
              <Card className="animate-on-scroll border border-border/40 bg-card">
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-bold mb-5">
                    Outras formas de contato:
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-xl p-2.5 flex-shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">E-mail</div>
                        <div className="text-muted-foreground text-xs">lucaspaulinobs@gmail.com</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-xl p-2.5 flex-shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">WhatsApp</div>
                        <div className="text-muted-foreground text-xs">85 98747-9260</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 rounded-xl p-2.5 flex-shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Escritório</div>
                        <div className="text-muted-foreground text-xs leading-relaxed">
                          R. Monsenhor Bruno, 1153 · Sala 1423 · Aldeota · Fortaleza, CE
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 pt-5 border-t">
                    <Button
                      size="lg"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold hover:scale-[1.02] transition-all duration-300"
                      onClick={() =>
                        window.open(
                          "https://wa.me/5585987479260?text=Ol%C3%A1%20tudo%20bem,%20vim%20pelo%20site%20e%20desejo%20saber%20mais%20informa%C3%A7%C3%B5es%20sobre%20o%20seu%20servi%C3%A7o!!",
                          "_blank"
                        )
                      }
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Falar no WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Guarantee */}
              <div
                className="animate-on-scroll rounded-2xl p-8 text-center"
                style={{ backgroundColor: "hsl(var(--foreground))" }}
              >
                <div className="bg-white/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-display font-bold text-base mb-2 text-white">
                  Garantia de 30 Dias
                </h3>
                <p className="text-white/70 text-sm">
                  Transforme cliques em clientes em apenas 30 dias!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diagonal separator */}
      <div className="h-12 overflow-hidden bg-muted/30">
        <svg viewBox="0 0 1200 48" preserveAspectRatio="none" className="w-full h-full block">
          <polygon points="0,0 1200,48 0,48" fill="hsl(var(--background))" />
        </svg>
      </div>

      {/* FAQ */}
      <section ref={faqRef as React.RefObject<HTMLElement>} className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-on-scroll text-center mb-14">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Perguntas <span className="text-primary">Frequentes</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="animate-on-scroll p-6 bg-card rounded-xl border border-border/40 hover:border-primary/30 transition-all duration-300"
                >
                  <h4 className="font-semibold text-sm mb-2">{faq.question}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
