import { useState, useRef } from 'react';

// TODO: Substituir pelas perguntas/respostas mais relevantes para o seu público
const FAQS = [
  {
    id: 'resultado',
    question: 'Quanto tempo leva para ver resultados?',
    answer:
      'Os primeiros resultados aparecem entre 15 e 30 dias — fase de aprendizado dos algoritmos e testes iniciais. Resultados consistentes e escaláveis normalmente chegam entre 30 e 60 dias. O crescimento é progressivo: quanto mais tempo com a gestão ativa, mais refinada fica a estratégia e melhores os retornos.',
  },
  {
    id: 'investimento',
    question: 'Qual o investimento mínimo recomendado em anúncios?',
    answer:
      'Recomendamos no mínimo R$ 1.000/mês de verba para anúncios (separado da taxa de gestão). Com menos do que isso, os algoritmos não têm dados suficientes para otimizar com eficiência. Para negócios que querem escalar rapidamente, trabalhamos com verbas a partir de R$ 2.500/mês.',
  },
  {
    id: 'segmento',
    question: 'Vocês atendem o meu segmento de negócio?',
    answer:
      'Trabalhamos com e-commerce, clínicas e consultórios, imobiliárias, infoprodutos, serviços locais, academias, restaurantes e muito mais. Durante a nossa reunião estratégica gratuita, analisamos o seu segmento específico e apresentamos casos de sucesso em mercados similares ao seu.',
  },
];

interface FAQItemProps {
  faq: typeof FAQS[0];
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ faq, isOpen, onToggle }: FAQItemProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        border: isOpen
          ? '1px solid hsl(217 91% 35% / 0.4)'
          : '1px solid hsl(0 0% 0% / 0.08)',
        boxShadow: isOpen ? 'var(--shadow-modern)' : 'var(--shadow-elegant)',
      }}
    >
      {/* Header do acordeão */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-card hover:bg-secondary/50 transition-colors duration-200"
        aria-expanded={isOpen}
        aria-controls={`faq-body-${faq.id}`}
      >
        <span className="font-semibold text-foreground text-base md:text-lg pr-2">
          {faq.question}
        </span>

        {/* Ícone de + / × */}
        <span
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: isOpen ? 'hsl(217 91% 35%)' : 'hsl(217 91% 35% / 0.1)',
            color: isOpen ? '#fff' : 'hsl(217 91% 35%)',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </button>

      {/* Corpo animado via CSS grid */}
      <div
        id={`faq-body-${faq.id}`}
        ref={bodyRef}
        className="bg-card transition-all duration-400 ease-in-out overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.35s ease',
        }}
        role="region"
        aria-hidden={!isOpen}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pt-2 border-t border-border">
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              {faq.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(FAQS[0].id);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-6 max-w-3xl">
        {/* Título */}
        <div className="text-center mb-12">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{
              background: 'hsl(217 91% 35% / 0.08)',
              color: 'hsl(217 91% 35%)',
            }}
          >
            Dúvidas frequentes
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            Perguntas <span className="text-primary">frequentes</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Respostas diretas para as principais dúvidas de quem está avaliando a gestão de tráfego.
          </p>
        </div>

        {/* Lista de FAQs */}
        <div className="flex flex-col gap-4">
          {FAQS.map((faq) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => toggle(faq.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
