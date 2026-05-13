import { useEffect, useRef } from 'react';

// TODO: Substituir pelos números reais da empresa
const METRICS = [
  {
    id: 'empresas',
    raw: 150,
    prefix: '+',
    suffix: '',
    decimals: 0,
    label: 'Empresas atendidas',
    description: 'em todo o Brasil',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'faturamento',
    raw: 2.3,
    prefix: 'R$ ',
    suffix: 'M',
    decimals: 1,
    label: 'Faturamento gerado',
    description: 'para nossos clientes',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'roi',
    raw: 4,
    prefix: '',
    suffix: 'x',
    decimals: 0,
    label: 'ROI médio',
    description: 'retorno sobre investimento',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: 'satisfacao',
    raw: 98,
    prefix: '',
    suffix: '%',
    decimals: 0,
    label: 'Satisfação',
    description: 'dos clientes atendidos',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
];

function animateCounter(
  el: HTMLElement,
  target: number,
  decimals: number,
  duration: number
) {
  const start = performance.now();
  const step = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    // ease-out-cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;
    el.textContent = decimals > 0
      ? current.toFixed(decimals).replace('.', ',')
      : Math.floor(current).toLocaleString('pt-BR');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export default function MetricsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const observed = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !observed.current) {
          observed.current = true;
          counterRefs.current.forEach((el, i) => {
            if (!el) return;
            const metric = METRICS[i];
            el.closest('.ob-counter-target')?.classList.add('ob-visible');
            setTimeout(() => animateCounter(el, metric.raw, metric.decimals, 1600), i * 120);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 md:py-28" style={{ background: 'var(--gradient-hero)' }}>
      <div className="container mx-auto px-6 max-w-5xl" ref={sectionRef}>
        {/* Título */}
        <div className="text-center mb-14">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{
              background: 'hsl(217 91% 60% / 0.15)',
              color: 'hsl(217 91% 75%)',
              border: '1px solid hsl(217 91% 60% / 0.3)',
            }}
          >
            Nossos números
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Resultados que{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--gradient-modern)' }}
            >
              falam por si
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Dados reais de clientes reais. Sem promessas vazias.
          </p>
        </div>

        {/* Grid de métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {METRICS.map((metric, i) => (
            <div
              key={metric.id}
              className="ob-counter-target group bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 text-center transition-all duration-300 hover:bg-white/20 hover:scale-105"
              style={{ border: '1px solid hsl(217 91% 60% / 0.2)' }}
            >
              {/* Ícone */}
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 text-white transition-all duration-300 group-hover:scale-110"
                style={{ background: 'hsl(217 91% 60% / 0.2)' }}
              >
                {metric.icon}
              </div>

              {/* Número animado */}
              <div className="text-4xl md:text-5xl font-black text-white mb-1">
                <span style={{ color: 'hsl(217 91% 75%)' }}>{metric.prefix}</span>
                <span
                  ref={(el) => (counterRefs.current[i] = el)}
                  aria-label={`${metric.prefix}${metric.raw}${metric.suffix}`}
                >
                  {metric.decimals > 0 ? '0,0' : '0'}
                </span>
                <span style={{ color: 'hsl(217 91% 75%)' }}>{metric.suffix}</span>
              </div>

              {/* Labels */}
              <p className="text-white font-semibold text-sm md:text-base">{metric.label}</p>
              <p className="text-white/50 text-xs mt-1">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
