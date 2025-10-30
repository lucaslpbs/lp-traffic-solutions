import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Users, 
  Globe, 
  MessageSquare, 
  Smartphone, 
  Palette, 
  Video, 
  Search,
  Gift,
  ArrowDown,
  CheckCircle2,
  X
} from "lucide-react";

export default function BrindeLanding() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    whatsapp: "",
    revenue: "",
    challenge: "",
    instagram: ""
  });
  const imagens = [
  "../public/Resultados Ouse.png",
  "../public/Resultados Luiza.png",
  "../public/Resultados Luiza 2.png",
  "../public/Resutados DVeras.png",
  "../public/Resultados Ouse 2.png",
  "../public/Resultados .png",
];
 const [imagemAberta, setImagemAberta] = useState(null);


  // Bloquear indexação
  useEffect(() => {
    // Adicionar meta tag noindex/nofollow
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);

    return () => {
      document.head.removeChild(metaRobots);
    };
  }, []);

  const services = [
    {
      icon: TrendingUp,
      title: "Tráfego Pago",
      description: "Campanhas otimizadas com ROAS alto e resultados mensuráveis em tempo real.",
      color: "text-primary"
    },
    {
      icon: Users,
      title: "Tráfego Orgânico (Social Media)",
      description: "Estratégia de posts e crescimento consistente nas redes sociais.",
      color: "text-primary-glow"
    },
    {
      icon: Globe,
      title: "Criação de Sites e Sistemas",
      description: "Desenvolvimento focado em performance e conversão de visitantes em clientes.",
      color: "text-primary-light"
    },
    {
      icon: MessageSquare,
      title: "CRM",
      description: "Gestão e automação completa do relacionamento com clientes.",
      color: "text-primary"
    },
    {
      icon: Smartphone,
      title: "Automatização de Mensagens",
      description: "Atendimento automático e follow-ups que nunca deixam leads esfriar.",
      color: "text-primary-glow"
    },
    {
      icon: Palette,
      title: "Designer",
      description: "Identidade visual impactante e materiais que convertem.",
      color: "text-primary-light"
    },
    {
      icon: Video,
      title: "Videomaker",
      description: "Criativos e vídeos profissionais para maximizar conversões.",
      color: "text-primary"
    },
    {
      icon: Search,
      title: "SEO",
      description: "Ranqueamento sólido no Google e presença orgânica duradoura.",
      color: "text-primary-glow"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.email || !formData.whatsapp || !formData.revenue) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Aqui você pode integrar com o Kommo ou enviar email
    console.log("Dados do formulário:", formData);
    
    toast({
      title: "Brinde garantido! 🎁",
      description: "Em breve entraremos em contato com você!",
    });

    // Limpar formulário
    setFormData({
      name: "",
      company: "",
      email: "",
      whatsapp: "",
      revenue: "",
      challenge: "",
      instagram: ""
    });
  };

  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };
  const scrollToResults = () => {
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
  };
    const scrollToBrinde = () => {
    document.getElementById('brinde')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Seção 1: Suspense + Interesse */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-primary-dark to-black">
        {/* Elementos flutuantes animados */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary-glow/20 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary-light/10 rounded-full blur-2xl animate-pulse"></div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-8 border-primary-glow text-primary-glow bg-white/10 backdrop-blur-sm px-8 py-3 text-lg animate-pulse">
              ✨ Página Exclusiva
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 text-white leading-tight">
              Parabéns! Você acaba de ganhar um{" "}
              <span className="text-transparent bg-gradient-to-r from-primary-glow to-primary-light bg-clip-text">
                brinde exclusivo 
              </span>
              🎁
            </h1>

            <p className="text-xl md:text-2xl mb-4 text-white/90 leading-relaxed">
              Resgate agora!
            </p>

            <p className="text-lg md:text-xl mb-12 text-white/80 max-w-3xl mx-auto">
              Condições válidas{" "}
              <span className="text-primary-glow font-bold">para os serviços abaixo.</span>{" "}
              Não perca essa oportunidade única de impulsionar seu negócio!
            </p>

            <Button
              size="lg"
              onClick={scrollToServices}
              className="bg-primary hover:bg-primary-dark text-white px-12 py-6 text-xl shadow-glow transform hover:scale-105 transition-all duration-300 group"
            >
              Ver Serviços
              <ArrowDown className="ml-3 h-6 w-6 group-hover:translate-y-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary-glow rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary-glow rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Seção 2: Serviços */}
      <section id="services" className="py-20 md:py-32 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary text-white px-6 py-2">
              Nossos Serviços
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">
              Soluções Completas em{" "}
              <span className="text-primary">Marketing Digital</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para dominar o mercado digital e escalar suas vendas
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={index}
                  className="p-6 hover:shadow-modern transition-all duration-300 hover:scale-105 bg-card border-border group"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <Icon className={`h-8 w-8 ${service.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
         <Button
              size="lg"
              onClick={scrollToResults}
              className="bg-primary hover:bg-primary-dark text-white px-12 py-6 text-xl shadow-glow transform hover:scale-105 transition-all duration-300 group mt-12 mx-auto flex"
            >
              Alguns Resultados
              <ArrowDown className="ml-3 h-3 w-6 group-hover:translate-y-1 transition-transform" />
          </Button>
      </section>

      {/* Seção 3: Resultados */}
      <section id="results" className="py-20 md:py-32 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary-glow text-primary-glow bg-white/10 backdrop-blur-sm px-6 py-2">
              Comprovados
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Resultados que Falam por Si
            </h2>
            <p className="text-xl text-white/80">
              Dados, não promessas.
            </p>
          </div>

          {/* Galeria de resultados - imagens placeholder */}
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
  {imagens.map((src, index) => (
    <div
      key={index}
      className="relative aspect-[4/3] rounded-2xl overflow-hidden group hover:scale-[1.03] transition-transform duration-300 cursor-pointer shadow-lg"
      onClick={() => setImagemAberta(src)}
    >
      <img
        src={src}
        alt={`Resultado ${index + 1}`}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Overlay leve, visível o tempo todo */}
      <div className="absolute inset-0 flex items-end justify-between p-4 bg-gradient-to-t from-black/50 via-transparent to-transparent">
        <div className="text-white drop-shadow-lg">
          <TrendingUp className="h-6 w-6 mb-1 text-primary-glow" />
          <p className="text-sm font-semibold">Resultado #{index + 1}</p>
          <p className="text-xs text-white/80">Clique para ampliar</p>
        </div>
      </div>
    </div>
  ))}
</div>

      {/* MODAL DE IMAGEM */}
      {imagemAberta && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setImagemAberta(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-primary transition"
            onClick={() => setImagemAberta(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={imagemAberta}
            alt="Imagem ampliada"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
          />
        </div>
      )}
        </div>
        <Button
              size="lg"
              onClick={scrollToBrinde}
              className="bg-primary hover:bg-primary-dark text-white px-12 py-6 text-xl shadow-glow transform hover:scale-105 transition-all duration-300 group mt-12 mx-auto flex"
            >
              Nosso brinde 🎁
              <ArrowDown className="ml-3 h-3 w-6 group-hover:translate-y-1 transition-transform" />
          </Button>
      </section>

      {/* Seção 4: O Brinde */}
      <section id="brinde" className="py-20 md:py-32 bg-gradient-to-br from-white via-primary/5 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 animate-bounce">
                <Gift className="h-10 w-10 text-primary" />
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6">
                Surpresa Revelada! 🎁
              </h2>

              <div className="bg-gradient-primary text-white rounded-2xl p-8 mb-8 shadow-premium">
                <p className="text-xl md:text-2xl font-bold mb-4">
                  Você ganhou:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="text-lg">Consultoria GRATUITA de análise do seu perfil</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="text-lg">DESCONTO ESPECIAL na contratação de qualquer serviço</span>
                  </div>
                </div>
              </div>

              <p className="text-xl text-foreground font-semibold mb-8">
                Preencha o formulário abaixo para garantir o seu bônus exclusivo!
              </p>
            </div>

            {/* Formulário */}
            <Card className="p-8 shadow-premium">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Seu nome completo"
                      className="border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Nome da sua empresa"
                      className="border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      className="border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp *</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="(00) 00000-0000"
                      className="border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revenue">Faturamento mensal *</Label>
                  <Select
                    required
                    value={formData.revenue}
                    onValueChange={(value) => setFormData({ ...formData, revenue: value })}
                  >
                    <SelectTrigger id="revenue" className="border-border">
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-10k">Até R$10.000</SelectItem>
                      <SelectItem value="10k-50k">R$10.000 – R$50.000</SelectItem>
                      <SelectItem value="50k-200k">R$50.000 – R$200.000</SelectItem>
                      <SelectItem value="200k+">Acima de R$200.000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="challenge">Descreva o principal desafio da sua empresa</Label>
                  <Textarea
                    id="challenge"
                    value={formData.challenge}
                    onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                    placeholder="Ex: Preciso gerar mais leads qualificados..."
                    className="min-h-[100px] border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram (opcional)</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@seuinstagram"
                    className="border-border focus:border-primary"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary-dark text-white py-6 text-xl shadow-glow hover:scale-105 transition-all duration-300"
                >
                  Quero meu brinde 🎁
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  * Campos obrigatórios
                </p>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
