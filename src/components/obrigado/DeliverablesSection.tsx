import { useEffect, useRef } from 'react';

const DELIVERABLES = [
  {
    title: 'Gestão completa de Meta Ads',
    description: 'Facebook e Instagram — criação, segmentação e otimização de campanhas.',
  },
  {
    title: 'Gestão de Google Ads',
    description: 'Search, Display e YouTube para capturar demanda ativa e passiva.',
  },
  {
    title: 'Criação e teste de copys',
    description: 'Criamos copys que vendem — testamos diferentes abordagens nos seus anúncios para descobrir quais mensagens geram mais cliques, leads e conversões para o seu negócio.',
  },
  {
    title: 'Configuração de pixels e rastreamento',
    description: 'Meta Pixel, GA4 e conversões configurados para dados 100% confiáveis.',
  },
  {
    title: 'Relatórios semanais detalhados',
    description: 'Dashboard atualizado com todas as métricas que importam para o seu negócio.',
  },
  {
    title: 'Reunião mensal de estratégia',
    description: 'Revisão de resultados, ajustes de rota e planejamento do próximo ciclo.',
  },
  {
    title: 'Suporte via WhatsApp (seg–sex)',
    description: 'Acesso direto ao seu gestor para tirar dúvidas e acompanhar em tempo real.',
  },
  {
    title: 'Otimização contínua',
    description: 'Ajustes diários nos lances, públicos e criativos para melhorar os resultados.',
  },
];

export default function DeliverablesSection() {
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

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
      { threshold: 0.15 }
    );

    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="py-20 md:py-28"
      style={{ background: 'var(--gradient-subtle)' }}
    >
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
            O que você recebe
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            Tudo incluído na sua{' '}
            <span className="text-primary">gestão de tráfego</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Sem cobranças escondidas. Um serviço completo para você focar no que sabe fazer.
          </p>
        </div>

        {/* Grid de entregáveis */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {DELIVERABLES.map((item, i) => (
            <li
              key={i}
              ref={(el) => (itemRefs.current[i] = el)}
              data-delay={i * 80}
              className="ob-slide-target group flex items-start gap-4 bg-card rounded-xl p-5 transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: 'var(--shadow-elegant)' }}
            >
              {/* Ícone de check */}
              <div
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5 transition-all duration-300 group-hover:scale-110"
                style={{ background: 'hsl(217 91% 35% / 0.1)' }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-none stroke-current"
                  style={{ color: 'hsl(217 91% 35%)' }}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              {/* Texto */}
              <div>
                <p className="font-semibold text-foreground text-sm md:text-base">{item.title}</p>
                <p className="text-muted-foreground text-xs md:text-sm mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
