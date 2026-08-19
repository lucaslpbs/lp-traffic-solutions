import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ArrowRight, CheckCircle, ImageIcon, Hand, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Banner de serviço em tela cheia com imagem "navegável".
 *
 * motion:
 *  - "pan-x"    → imagem larga (fluxo do n8n): desliza na horizontal.
 *                 Mouse acompanha o cursor; no touch, arrasta com o dedo
 *                 (a rolagem vertical da página continua funcionando).
 *  - "pan-y"    → imagem alta (dashboard/site): desliza na vertical, como
 *                 se estivesse rolando a tela real. No touch, o movimento
 *                 acompanha a rolagem da página.
 *  - "parallax" → imagem inteira com deriva suave em torno do centro.
 *
 * Quem tem "reduzir movimento" ligado no sistema vê a imagem parada.
 */
export type BannerMotion = "pan-x" | "pan-y" | "parallax";

export interface ServiceBannerProps {
  /** Âncora do banner — usada pelos cards do carrossel para rolar até aqui. */
  id?: string;
  eyebrow: string;
  title: string;
  highlight?: string;
  description: string;
  bullets?: string[];
  /** Caminho da imagem em /public (ex.: "/servicos/n8n-fluxo.png"). */
  image: string;
  imageAlt: string;
  motion?: BannerMotion;
  /** Lado em que o texto fica sobre a imagem. */
  align?: "left" | "right";
  cta?: { label: string; to: string };
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const IMAGE_CLASSES: Record<BannerMotion, string> = {
  // largura natural: mantém o fluxo inteiro legível e sobra imagem para os lados
  "pan-x": "absolute inset-y-0 left-0 h-full w-auto max-w-none object-cover",
  // largura da tela: sobra imagem para baixo, como uma página comprida
  "pan-y": "absolute inset-x-0 top-0 w-full h-auto max-h-none",
  // max-w-none é obrigatório: o preflight do Tailwind limita img a 100%
  parallax: "absolute -left-[5%] -top-[5%] h-[110%] w-[110%] max-w-none object-cover",
};

export function ServiceBanner({
  id,
  eyebrow,
  title,
  highlight,
  description,
  bullets = [],
  image,
  imageAlt,
  motion = "parallax",
  align = "left",
  cta,
}: ServiceBannerProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [hint, setHint] = useState<"mouse" | "drag" | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img || imageFailed) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let maxX = 0;
    let maxY = 0;
    let px = 0.5;
    let py = 0.5;

    const xTo = gsap.quickTo(img, "x", { duration: 0.8, ease: "power3.out" });
    const yTo = gsap.quickTo(img, "y", { duration: 0.8, ease: "power3.out" });

    const render = () => {
      // sem folga no eixo, a imagem fica centralizada em vez de colada na borda
      xTo(maxX > 0 ? -px * maxX : (frame.offsetWidth - img.offsetWidth) / 2);
      yTo(maxY > 0 ? -py * maxY : (frame.offsetHeight - img.offsetHeight) / 2);
    };

    const measure = () => {
      maxX = Math.max(0, img.offsetWidth - frame.offsetWidth);
      maxY = Math.max(0, img.offsetHeight - frame.offsetHeight);
      render();
    };

    measure();
    if (!img.complete) img.addEventListener("load", measure);
    window.addEventListener("resize", measure);

    const cleanups: Array<() => void> = [
      () => img.removeEventListener("load", measure),
      () => window.removeEventListener("resize", measure),
    ];

    if (!reduceMotion) {
      if (canHover) {
        setHint("mouse");
        const onPointerMove = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          const rect = frame.getBoundingClientRect();
          px = clamp01((event.clientX - rect.left) / rect.width);
          py = clamp01((event.clientY - rect.top) / rect.height);
          render();
        };
        const onPointerLeave = () => {
          px = 0.5;
          py = 0.5;
          render();
        };
        frame.addEventListener("pointermove", onPointerMove);
        frame.addEventListener("pointerleave", onPointerLeave);
        cleanups.push(
          () => frame.removeEventListener("pointermove", onPointerMove),
          () => frame.removeEventListener("pointerleave", onPointerLeave)
        );
      } else if (motion === "pan-x") {
        // arrasto horizontal — touch-action: pan-y deixa a página rolar normalmente
        setHint("drag");
        let startX = 0;
        let startPx = 0.5;
        const onTouchStart = (event: TouchEvent) => {
          startX = event.touches[0].clientX;
          startPx = px;
        };
        const onTouchMove = (event: TouchEvent) => {
          if (maxX <= 0) return;
          const delta = event.touches[0].clientX - startX;
          px = clamp01(startPx - delta / maxX);
          render();
        };
        frame.addEventListener("touchstart", onTouchStart, { passive: true });
        frame.addEventListener("touchmove", onTouchMove, { passive: true });
        cleanups.push(
          () => frame.removeEventListener("touchstart", onTouchStart),
          () => frame.removeEventListener("touchmove", onTouchMove)
        );
      } else {
        // sem hover e sem arrasto: o movimento acompanha a rolagem da página.
        // Sem throttle de propósito: o handler só lê um rect e o gsap já
        // agrupa a escrita do transform no próprio ticker.
        const onScroll = () => {
          const rect = frame.getBoundingClientRect();
          py = clamp01((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
          render();
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        cleanups.push(() => window.removeEventListener("scroll", onScroll));
      }
    }

    return () => cleanups.forEach((fn) => fn());
  }, [motion, imageFailed]);

  const textOnRight = align === "right";

  return (
    // scroll-mt compensa o header fixo + a barra de abas (mais alta no
    // celular, onde os dois botões ficam empilhados) ao chegar pela âncora
    <section
      id={id}
      className="relative w-full overflow-hidden bg-foreground scroll-mt-[240px] sm:scroll-mt-[172px]"
    >
      <div
        ref={frameRef}
        // no celular o banner é mais baixo: a imagem escala pela largura da
        // tela, então um quadro alto demais deixaria pouca folga para explorar
        className={`relative h-[46vh] min-h-[320px] md:h-[70vh] md:min-h-[440px] max-h-[780px] w-full overflow-hidden ${
          motion === "pan-x" ? "touch-pan-y cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        {imageFailed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-foreground">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, hsl(217 91% 60% / 0.35) 1px, transparent 0)",
                backgroundSize: "30px 30px",
              }}
            />
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
              <ImageIcon className="h-8 w-8 text-primary-glow" />
            </div>
            <span className="relative z-10 text-sm text-white/50">
              Imagem em breve — {image}
            </span>
          </div>
        ) : (
          <img
            ref={imgRef}
            src={image}
            alt={imageAlt}
            loading="lazy"
            draggable={false}
            onError={() => setImageFailed(true)}
            className={`${IMAGE_CLASSES[motion]} select-none`}
          />
        )}

        {/* escurecimento para o texto ficar legível sobre a imagem */}
        <div
          className={`pointer-events-none absolute inset-0 ${
            textOnRight ? "bg-gradient-to-l" : "bg-gradient-to-r"
          } from-foreground via-foreground/85 to-foreground/25 md:via-foreground/70 md:to-transparent`}
        />

        {/* conteúdo */}
        <div className="pointer-events-none absolute inset-0 flex items-center">
          <div
            className={`container mx-auto px-6 flex ${textOnRight ? "justify-end" : "justify-start"}`}
          >
            <div className="pointer-events-auto max-w-xl">
              <span className="inline-block text-primary-glow text-xs font-semibold tracking-widest uppercase mb-5 border border-primary-glow/30 rounded-full px-4 py-1.5">
                {eyebrow}
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                {title}
                {highlight && <span className="block text-primary-glow">{highlight}</span>}
              </h2>
              <p className="text-white/65 text-base md:text-lg mb-6">{description}</p>

              {bullets.length > 0 && (
                <div className="space-y-2.5 mb-8">
                  {bullets.map((bullet, index) => (
                    <div key={index} className="flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 text-primary-glow mt-1 flex-shrink-0" />
                      <span className="text-sm md:text-base text-white/70">{bullet}</span>
                    </div>
                  ))}
                </div>
              )}

              {cta && (
                <Link to={cta.to}>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary-dark text-white px-8 font-semibold hover:scale-105 transition-all duration-300 group"
                  >
                    {cta.label}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* dica de interação */}
        {hint && !imageFailed && (
          <div className="pointer-events-none absolute bottom-5 right-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 backdrop-blur-md px-3.5 py-2 text-xs text-white/70">
            {hint === "drag" ? (
              <>
                <Hand className="h-3.5 w-3.5" />
                Arraste para explorar
              </>
            ) : (
              <>
                <MousePointer2 className="h-3.5 w-3.5" />
                Passe o mouse para explorar
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
