import { useEffect, useRef } from 'react';

// TODO: Substituir por depoimentos reais de clientes
const TESTIMONIALS = [
  {
    id: 0,
    name: 'Rafael Oliveira',
    role: 'Fundador · E-commerce de Moda',
    quote:
      'Em 60 dias, saímos de R$ 40 mil para R$ 180 mil em faturamento mensal. O ROI das campanhas foi de 4,5x. A Traffic Solutions mudou o patamar do meu negócio.',
    result: '+350% de faturamento em 2 meses',
    avatar: 'RO',
    stars: 5,
  },
  {
    id: 1,
    name: 'Dra. Camila Farias',
    role: 'Proprietária · Clínica de Estética',
    quote:
      'Antes eu jogava dinheiro fora em anúncios que não convertiam. Com a gestão deles, em 45 dias lotei minha agenda e precisei contratar mais profissionais.',
    result: 'Agenda lotada em menos de 45 dias',
    avatar: 'CF',
    stars: 5,
  },
];

function Card3D({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = ref.current;
    if (!card) return;

    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotX = (-y / rect.height) * 8;
      const rotY = (x / rect.width) * 8;
      card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
    };
    const handleLeave = () => {
      card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      card.style.transition = 'transform 0.5s ease';
    };
    const handleEnter = () => {
      card.style.transition = 'transform 0.1s ease';
    };

    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', handleLeave);
    card.addEventListener('mouseenter', handleEnter);
    return () => {
      card.removeEventListener('mousemove', handleMove);
      card.removeEventListener('mouseleave', handleLeave);
      card.removeEventListener('mouseenter', handleEnter);
    };
  }, []);

  return (
    <div ref={ref} style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>
      {children}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Título */}
        <div className="text-center mb-14">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{
              background: 'hsl(217 91% 35% / 0.08)',
              color: 'hsl(217 91% 35%)',
            }}
          >
            Prova social
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            Quem já confia na{' '}
            <span className="text-primary">Traffic Solutions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Resultados reais de empresários que decidiram escalar suas vendas com tráfego pago.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {TESTIMONIALS.map((t) => (
            <Card3D key={t.id}>
              <div
                className="bg-card rounded-2xl p-8 h-full flex flex-col gap-5"
                style={{ boxShadow: 'var(--shadow-modern)' }}
              >
                {/* Estrelas */}
                <div className="flex gap-1" aria-label={`${t.stars} estrelas`}>
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24" className="w-5 h-5 text-yellow-400 fill-current">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                {/* Aspas decorativas */}
                <svg
                  viewBox="0 0 40 30"
                  className="w-10 h-8 flex-shrink-0"
                  style={{ fill: 'hsl(217 91% 35% / 0.15)' }}
                >
                  <path d="M0 30V18.75Q0 12.5 3.625 7.5T14 0l2.25 3.25Q11.5 5 9.25 8.375T7 15.75H14V30H0zm20 0V18.75q0-6.25 3.625-11.25T34 0l2.25 3.25Q31.5 5 29.25 8.375T27 15.75H34V30H20z" />
                </svg>

                {/* Depoimento */}
                <blockquote className="text-foreground text-base md:text-lg leading-relaxed flex-grow italic">
                  "{t.quote}"
                </blockquote>

                {/* Resultado em destaque */}
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{
                    background: 'hsl(142 76% 36% / 0.08)',
                    color: 'hsl(142 76% 36%)',
                    border: '1px solid hsl(142 76% 36% / 0.2)',
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current flex-shrink-0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t.result}
                </div>

                {/* Autor */}
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
    </section>
  );
}
