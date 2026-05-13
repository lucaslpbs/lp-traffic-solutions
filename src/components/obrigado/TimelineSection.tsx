import { useEffect, useRef } from 'react';

const STEPS = [
  {
    number: '01',
    title: 'Análise do seu negócio',
    description:
      'Nossa equipe estuda o seu mercado, concorrentes e público-alvo para entender o cenário completo antes de qualquer ação.',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    delay: 0,
  },
  {
    number: '02',
    title: 'Reunião estratégica gratuita',
    description:
      'Apresentamos um diagnóstico personalizado e um plano de ação com metas claras. Sem enrolação — só estratégia.',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    delay: 150,
  },
  {
    number: '03',
    title: 'Campanhas no ar',
    description:
      'Estruturamos, criamos e lançamos as campanhas. Monitoramento diário, otimização contínua e relatórios semanais.',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    delay: 300,
  },
];

export default function TimelineSection() {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = parseInt(el.dataset.delay || '0', 10);
            setTimeout(() => el.classList.add('ob-visible'), delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.2 }
    );

    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="proximos-passos"
      className="py-20 md:py-28"
      style={{ background: 'var(--gradient-subtle)' }}
    >
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Título */}
        <div className="text-center mb-16">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{
              background: 'hsl(217 91% 35% / 0.1)',
              color: 'hsl(217 91% 35%)',
            }}
          >
            O que acontece agora
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            Próximos <span className="text-primary">passos</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Um processo claro e sem burocracia para você começar a crescer o quanto antes.
          </p>
        </div>

        {/* Timeline — vertical mobile / horizontal desktop */}
        <div className="relative">
          {/* Linha conectora desktop */}
          <div
            className="hidden md:block absolute top-16 left-0 right-0 h-0.5 mx-16"
            style={{ background: 'hsl(217 91% 35% / 0.2)' }}
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                ref={(el) => (stepRefs.current[i] = el)}
                data-delay={step.delay}
                className="ob-slide-target relative"
              >
                {/* Linha vertical mobile */}
                {i < STEPS.length - 1 && (
                  <div
                    className="md:hidden absolute left-8 top-20 bottom-0 w-0.5 -mb-8"
                    style={{ background: 'hsl(217 91% 35% / 0.2)' }}
                    aria-hidden="true"
                  />
                )}

                {/* Card */}
                <div
                  className="group relative bg-card rounded-2xl p-6 md:p-8 flex flex-row md:flex-col gap-5 md:gap-6 transition-all duration-300 hover:-translate-y-2"
                  style={{ boxShadow: 'var(--shadow-elegant)' }}
                >
                  {/* Número + ícone */}
                  <div className="flex-shrink-0 md:flex md:flex-col md:items-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110"
                      style={{ background: 'var(--gradient-primary)' }}
                    >
                      {step.icon}
                    </div>
                    <span
                      className="hidden md:block text-xs font-bold mt-3 tracking-widest"
                      style={{ color: 'hsl(217 91% 35% / 0.4)' }}
                    >
                      PASSO {step.number}
                    </span>
                  </div>

                  {/* Conteúdo */}
                  <div className="md:text-center">
                    <span
                      className="md:hidden text-xs font-bold tracking-widest block mb-1"
                      style={{ color: 'hsl(217 91% 35% / 0.5)' }}
                    >
                      PASSO {step.number}
                    </span>
                    <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                  </div>

                  {/* Indicador de ponto na linha (desktop) */}
                  <div
                    className="hidden md:block absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-background"
                    style={{ background: 'hsl(217 91% 35%)' }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
