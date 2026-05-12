import { useEffect, useState } from 'react';
import HeroSection from '@/components/obrigado/HeroSection';
import TimelineSection from '@/components/obrigado/TimelineSection';
import MetricsSection from '@/components/obrigado/MetricsSection';
import TestimonialsSection from '@/components/obrigado/TestimonialsSection';
import DeliverablesSection from '@/components/obrigado/DeliverablesSection';
import FAQSection from '@/components/obrigado/FAQSection';
import CTAFinalSection from '@/components/obrigado/CTAFinalSection';

// ─── Keyframes e classes de animação ────────────────────────────────────────
// Todas as animações respeitam prefers-reduced-motion.
// Nenhuma biblioteca externa — apenas CSS keyframes + JS IntersectionObserver.
const OBRIGADO_STYLES = `
  /* ── Hero entrance (stagger fade-up com blur) ── */
  @keyframes ob-fadeUp {
    from { opacity: 0; transform: translateY(32px); filter: blur(6px); }
    to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
  }

  .ob-stagger-1 { animation: ob-fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0ms;   }
  .ob-stagger-2 { animation: ob-fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 150ms; }
  .ob-stagger-3 { animation: ob-fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 300ms; }
  .ob-stagger-4 { animation: ob-fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 450ms; }
  .ob-stagger-5 { animation: ob-fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 600ms; }

  /* ── SVG check animado (stroke-dashoffset) ── */
  @keyframes ob-drawStroke {
    from { stroke-dashoffset: var(--stroke-len, 300); }
    to   { stroke-dashoffset: 0; }
  }

  .ob-check-circle {
    stroke-dasharray: 283;
    stroke-dashoffset: 283;
    transform-origin: 50% 50%;
    transform: rotate(-90deg);
    animation: ob-drawStroke 0.9s cubic-bezier(0.65,0,0.35,1) 0.3s forwards;
    --stroke-len: 283;
  }
  .ob-check-path {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: ob-drawStroke 0.6s cubic-bezier(0.65,0,0.35,1) 0.9s forwards;
    --stroke-len: 100;
  }

  /* ── Partículas flutuantes ── */
  @keyframes ob-float {
    0%   { transform: translateY(0)    rotate(0deg);   opacity: 0.5; }
    33%  { transform: translateY(-22px) rotate(120deg); opacity: 0.9; }
    66%  { transform: translateY(-12px) rotate(240deg); opacity: 0.7; }
    100% { transform: translateY(0)    rotate(360deg); opacity: 0.5; }
  }
  .ob-particle { animation: ob-float linear infinite; }

  /* ── Gradiente mesh animado (hero background) ── */
  @keyframes ob-meshMove {
    0%   { background-position: 0%   50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0%   50%; }
  }
  .ob-mesh-bg {
    background: linear-gradient(
      135deg,
      hsl(217 91% 35%) 0%,
      hsl(217 91% 20%) 35%,
      hsl(220 60% 10%) 65%,
      hsl(0 0% 3%)     100%
    );
    background-size: 400% 400%;
    animation: ob-meshMove 10s ease infinite;
  }

  /* ── Slide-in acionado por IntersectionObserver ── */
  .ob-slide-target {
    opacity: 0;
    transform: translateX(-36px);
    transition: opacity 0.55s ease, transform 0.55s ease;
  }
  .ob-slide-target.ob-visible {
    opacity: 1;
    transform: translateX(0);
  }

  /* ── Contador acionado por IntersectionObserver ── */
  .ob-counter-target {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .ob-counter-target.ob-visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── CTA pulsante (botão WhatsApp) ── */
  @keyframes ob-pulseGlow {
    0%, 100% { box-shadow: 0 0 16px hsl(142 76% 36% / 0.5), 0 0 32px hsl(142 76% 36% / 0.25); }
    50%       { box-shadow: 0 0 40px hsl(142 76% 36% / 0.85), 0 0 80px hsl(142 76% 36% / 0.4), 0 0 120px hsl(142 76% 36% / 0.15); }
  }
  .ob-pulse-green { animation: ob-pulseGlow 2.2s ease-in-out infinite; }

  /* ── prefers-reduced-motion: remove todas as animações decorativas ── */
  @media (prefers-reduced-motion: reduce) {
    .ob-stagger-1, .ob-stagger-2, .ob-stagger-3,
    .ob-stagger-4, .ob-stagger-5 {
      animation: none;
      opacity: 1;
      filter: none;
    }
    .ob-check-circle, .ob-check-path {
      animation: none;
      stroke-dashoffset: 0;
    }
    .ob-particle        { animation: none; opacity: 0.4; }
    .ob-pulse-green     { animation: none; box-shadow: none; }
    .ob-mesh-bg         { animation: none; background-size: 100% 100%; }
    .ob-slide-target    { opacity: 1; transform: none; transition: none; }
    .ob-counter-target  { opacity: 1; transform: none; transition: none; }
  }
`;

export default function Obrigado() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Meta noindex — página de pós-conversão não deve ser indexada
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    // TODO: Disparar evento de conversão do Meta Pixel
    // if (typeof window !== 'undefined' && window.fbq) {
    //   window.fbq('track', 'Lead');
    // }

    // Barra de progresso de scroll
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) setScrollProgress((window.scrollY / total) * 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (document.head.contains(meta)) document.head.removeChild(meta);
    };
  }, []);

  return (
    <>
      {/* Estilos de animação injetados globalmente */}
      <style>{OBRIGADO_STYLES}</style>

      {/* Barra de progresso de scroll */}
      <div
        role="progressbar"
        aria-label="Progresso de leitura da página"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="fixed top-0 left-0 h-1 z-50 transition-[width] duration-100"
        style={{
          width: `${scrollProgress}%`,
          background: 'var(--gradient-modern)',
        }}
      />

      <main className="min-h-screen bg-background overflow-x-hidden">
        {/* Seção 1 — Hero com check animado + partículas */}
        <HeroSection />

        {/* Seção 2 — Timeline de próximos passos */}
        <TimelineSection />

        {/* Seção 3 — Métricas com contadores animados */}
        <MetricsSection />

        {/* Seção 4 — Depoimentos com hover 3D */}
        <TestimonialsSection />

        {/* Seção 5 — O que você recebe (entregáveis) */}
        <DeliverablesSection />

        {/* Seção 6 — FAQ com acordeão suave */}
        <FAQSection />

        {/* Seção 7 — CTA final com botão pulsante */}
        <CTAFinalSection />
      </main>
    </>
  );
}
