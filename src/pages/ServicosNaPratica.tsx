import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Search,
  Users,
  Globe,
  BarChart3,
  ArrowRight,
  Smartphone,
  ImageIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ServicosTabs } from "@/components/sections/ServicosTabs";
import SocialCards, { type CardItem } from "@/components/sections/SocialCards";

/* ── Cards do carrossel (7 serviços) ─────────────────────────────────
   As artes em SVG são provisórias: quando tiver as fotos dos projetos,
   importe a imagem nova e troque só o `imgUrl` do card correspondente.
   `linkUrl` é opcional (ex.: link do case ou do site do cliente).      */
import ImgN8nSdr from "../assets/servicos/n8n-sdr.svg";
import ImgTrafegoPago from "../assets/servicos/trafego-pago.svg";
import ImgTrafegoOrganico from "../assets/servicos/trafego-organico.svg";
import ImgCriacaoSites from "../assets/servicos/criacao-sites.svg";
import ImgSaas from "../assets/servicos/saas.svg";
import ImgCrmKommo from "../assets/servicos/crm-kommo.svg";
import ImgDashboards from "../assets/servicos/dashboards-bi.svg";

const projetos: CardItem[] = [
  { imgUrl: ImgN8nSdr, alt: "N8N SDR — agente de atendimento humanizado no WhatsApp" },
  { imgUrl: ImgTrafegoPago, alt: "Tráfego pago — métricas de campanhas" },
  { imgUrl: ImgTrafegoOrganico, alt: "Tráfego orgânico — organização e engajamento no Instagram" },
  { imgUrl: ImgCriacaoSites, alt: "Criação de sites para vendas" },
  { imgUrl: ImgSaas, alt: "SaaS — sistema de organização e crescimento" },
  { imgUrl: ImgCrmKommo, alt: "Aulas de CRM Kommo" },
  { imgUrl: ImgDashboards, alt: "Dashboards — números em tempo real" },
];

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

/**
 * Vitrine visual dos serviços.
 * Para publicar o conteúdo real: preencha `image` com o caminho da imagem
 * e ajuste title/description/tags.
 *
 * Duas formas de apontar a imagem:
 *  1. Arquivo em `public/servicos/` → use o caminho "/servicos/arquivo.png".
 *     Não precisa mexer em import nenhum, basta soltar o arquivo na pasta.
 *  2. Arquivo em `src/assets/` → importe no topo e use a variável.
 *
 * Se `image` estiver vazio (ou o arquivo ainda não existir) aparece um
 * placeholder estilizado no lugar, sem quebrar a página.
 */
type Showcase = {
  icon: typeof TrendingUp;
  title: string;
  description: string;
  tags: string[];
  image?: string;
};

const showcases: Showcase[] = [
  {
    icon: TrendingUp,
    title: "Tráfego Pago",
    description:
      "Campanhas rodando no Google, Meta e LinkedIn — criativos, segmentação e resultado no painel.",
    tags: ["Google Ads", "Meta Ads", "LinkedIn Ads"],
    image: "/servicos/trafego-pago-resultados.png",
  },
  {
    icon: Smartphone,
    title: "Tráfego Orgânico (Social Media)",
    description:
      "Feed, stories e reels planejados: identidade visual consistente e comunidade ativa.",
    tags: ["Conteúdo", "Design", "Engajamento"],
    image: "/servicos/trafego-organico.png",
  },
  {
    icon: Search,
    title: "Tráfego Orgânico (SEO)",
    description:
      "Da auditoria ao topo do Google: páginas otimizadas e evolução de rankings mês a mês.",
    tags: ["On-page", "Técnico", "Conteúdo"],
    image: "/servicos/seo.png",
  },
  {
    icon: Users,
    title: "CRM & Automação",
    description:
      "Funis, fluxos de nutrição e follow-up automático — nenhum lead esquecido.",
    tags: ["Funil", "Automação", "Follow-up"],
    image: "/servicos/crm-automacao.png",
  },
  {
    icon: Globe,
    title: "Criação de Sites",
    description:
      "Landing pages e sites feitos para converter, rápidos e responsivos em qualquer tela.",
    tags: ["Landing Page", "Site", "Conversão"],
    image: "/servicos/criacao-sites.png",
  },
  {
    icon: BarChart3,
    title: "Analytics & BI",
    description:
      "Dashboards ao vivo com CPL, ROI e origem de cada lead para decidir com dados.",
    tags: ["Dashboard", "ROI", "Insights"],
    image: "/servicos/analytics-bi.png",
  },
];

function ShowcaseVisual({ item }: { item: Showcase }) {
  const Icon = item.icon;
  // Se o arquivo ainda não foi colocado na pasta, cai no placeholder.
  const [imageFailed, setImageFailed] = useState(false);

  if (item.image && !imageFailed) {
    return (
      <img
        src={item.image}
        alt={item.title}
        loading="lazy"
        onError={() => setImageFailed(true)}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/40">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--primary) / 0.18) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <span className="relative z-10 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ImageIcon className="h-3.5 w-3.5" />
        Imagem em breve
      </span>
    </div>
  );
}

export default function ServicosNaPratica() {
  const showcaseRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  useScrollReveal(showcaseRef as React.RefObject<HTMLElement>);
  useScrollReveal(ctaRef as React.RefObject<HTMLElement>);

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
            Serviços na Prática
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Veja Como Nosso Trabalho
            <span className="block text-primary-glow">Fica na Prática</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Menos texto, mais prova. Aqui você enxerga cada serviço acontecendo:
            campanhas, criativos, páginas e dashboards que já rodam para nossos clientes.
          </p>
        </div>
        {/* Diagonal separator */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-12 block">
            <polygon points="0,60 1200,0 1200,60" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* NAV ENTRE AS SUB-PÁGINAS DE SERVIÇOS */}
      <ServicosTabs />

      {/* CARROSSEL DE PROJETOS */}
      <section className="pt-16 pb-8 bg-background overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-4">
            <span className="inline-block text-primary text-xs font-semibold tracking-widest uppercase mb-4 border border-primary/30 rounded-full px-4 py-1.5">
              Projetos
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Nossas Soluções <span className="text-primary">em Imagens</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Passe o mouse sobre os cards para explorar cada frente de trabalho.
            </p>
          </div>
        </div>
        <SocialCards cards={projetos} />
      </section>

      {/* VITRINE VISUAL */}
      <section ref={showcaseRef as React.RefObject<HTMLElement>} className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="animate-on-scroll text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Cada Serviço, <span className="text-primary">Visualmente</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Uma amostra visual do que entregamos em cada frente de trabalho.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {showcases.map((item, index) => {
              const Icon = item.icon;
              return (
                <article
                  key={index}
                  className="animate-on-scroll group overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <ShowcaseVisual item={item} />
                  </div>
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                        <Icon className="h-5 w-5 text-primary" />
                      </span>
                      <h3 className="font-display text-lg font-bold leading-tight">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, ti) => (
                        <span
                          key={ti}
                          className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        ref={ctaRef as React.RefObject<HTMLElement>}
        className="py-28 bg-foreground relative overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(217 91% 35% / 0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="relative z-10 container mx-auto px-6 text-center max-w-2xl">
          <h2 className="animate-on-scroll font-display text-3xl md:text-4xl font-bold mb-4 text-white">
            Quer ver isso rodando no{" "}
            <span className="text-primary-glow">seu negócio?</span>
          </h2>
          <p className="animate-on-scroll text-white/60 mb-8">
            Fale com a gente e receba um diagnóstico gratuito e personalizado.
          </p>
          <div className="animate-on-scroll flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contato">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-dark text-white px-10 py-6 text-base font-semibold hover:scale-105 transition-all duration-300 group"
              >
                Falar com um Especialista
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/servicos">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white px-10 py-6 text-base font-semibold"
              >
                Ver Nossos Serviços
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
