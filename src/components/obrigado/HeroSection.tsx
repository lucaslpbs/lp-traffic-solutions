import { WHATSAPP_URL } from './constants';

// Partículas pré-geradas para evitar re-render
const PARTICLES = [
  { id: 0,  size: 6,  x: 8,   y: 15,  dur: 12, delay: 0   },
  { id: 1,  size: 4,  x: 20,  y: 75,  dur: 9,  delay: 1.5 },
  { id: 2,  size: 8,  x: 35,  y: 40,  dur: 14, delay: 0.8 },
  { id: 3,  size: 5,  x: 55,  y: 10,  dur: 11, delay: 3   },
  { id: 4,  size: 7,  x: 70,  y: 60,  dur: 10, delay: 0.3 },
  { id: 5,  size: 4,  x: 82,  y: 30,  dur: 13, delay: 2   },
  { id: 6,  size: 6,  x: 90,  y: 80,  dur: 8,  delay: 1   },
  { id: 7,  size: 5,  x: 15,  y: 50,  dur: 15, delay: 4   },
  { id: 8,  size: 9,  x: 48,  y: 85,  dur: 10, delay: 0.5 },
  { id: 9,  size: 4,  x: 63,  y: 25,  dur: 12, delay: 2.5 },
  { id: 10, size: 6,  x: 78,  y: 90,  dur: 9,  delay: 1.2 },
  { id: 11, size: 5,  x: 93,  y: 50,  dur: 11, delay: 3.5 },
  { id: 12, size: 7,  x: 30,  y: 95,  dur: 13, delay: 0.7 },
  { id: 13, size: 4,  x: 5,   y: 65,  dur: 8,  delay: 2.8 },
  { id: 14, size: 8,  x: 42,  y: 5,   dur: 14, delay: 1.8 },
  { id: 15, size: 5,  x: 60,  y: 70,  dur: 10, delay: 0.2 },
  { id: 16, size: 6,  x: 88,  y: 15,  dur: 12, delay: 3.2 },
  { id: 17, size: 4,  x: 22,  y: 35,  dur: 9,  delay: 4.5 },
  { id: 18, size: 7,  x: 75,  y: 45,  dur: 11, delay: 1.6 },
  { id: 19, size: 5,  x: 50,  y: 55,  dur: 13, delay: 0.9 },
];

export default function HeroSection() {
  return (
    <section className="ob-mesh-bg relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Partículas SVG flutuantes */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {PARTICLES.map((p) => (
          <svg
            key={p.id}
            className="ob-particle absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              opacity: 0.4,
            }}
            viewBox="0 0 10 10"
          >
            <circle cx="5" cy="5" r="5" fill="hsl(217 91% 80% / 0.6)" />
          </svg>
        ))}

        {/* Blobs decorativos */}
        <div
          className="absolute top-1/4 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'hsl(217 91% 60%)' }}
        />
        <div
          className="absolute bottom-1/4 -right-24 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: 'hsl(217 91% 45%)' }}
        />
      </div>

      {/* Overlay escuro para legibilidade */}
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />

      {/* Conteúdo principal */}
      <div className="relative z-10 container mx-auto px-6 py-20 text-center max-w-4xl">

        {/* Check animado */}
        <div className="ob-stagger-1 flex justify-center mb-8">
          <div className="relative">
            {/* Halo externo */}
            <div
              className="absolute inset-0 rounded-full opacity-30 animate-ping"
              style={{ background: 'hsl(142 76% 50%)' }}
            />
            <svg
              viewBox="0 0 100 100"
              className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl"
              aria-label="Formulário enviado com sucesso"
            >
              {/* Círculo de fundo */}
              <circle
                cx="50" cy="50" r="48"
                fill="hsl(142 76% 36% / 0.15)"
                stroke="hsl(142 76% 50% / 0.3)"
                strokeWidth="1"
              />
              {/* Círculo animado */}
              <circle
                cx="50" cy="50" r="44"
                fill="none"
                stroke="hsl(142 76% 50%)"
                strokeWidth="4"
                strokeLinecap="round"
                className="ob-check-circle"
                style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)' }}
              />
              {/* Checkmark animado */}
              <path
                d="M 24 50 L 42 68 L 76 30"
                fill="none"
                stroke="hsl(142 76% 65%)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ob-check-path"
              />
            </svg>
          </div>
        </div>

        {/* Badge */}
        <div className="ob-stagger-2 inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
          style={{
            background: 'hsl(217 91% 60% / 0.15)',
            border: '1px solid hsl(217 91% 60% / 0.4)',
            color: 'hsl(217 91% 80%)',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          Formulário recebido com sucesso
        </div>

        {/* Headline */}
        <h1 className="ob-stagger-3 text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-4">
          Recebemos seu{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'var(--gradient-modern)' }}
          >
            contato!
          </span>
        </h1>

        {/* Subheadline */}
        <p className="ob-stagger-4 text-xl md:text-2xl text-white/80 mb-4 leading-relaxed">
          Nossa equipe retorna em até{' '}
          <strong className="text-white">2 horas úteis</strong> com uma
          análise personalizada do seu negócio.
        </p>

        <p className="ob-stagger-4 text-base md:text-lg text-white/60 mb-10 max-w-2xl mx-auto">
          Você acabou de dar o primeiro passo para escalar suas vendas com tráfego pago.
          Enquanto isso, confira o que preparamos para você logo abaixo.
        </p>

        {/* CTA WhatsApp */}
        <div className="ob-stagger-5 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ob-pulse-green inline-flex items-center gap-3 px-8 py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 hover:scale-105"
            style={{ background: 'hsl(142 76% 36%)' }}
          >
            {/* WhatsApp icon */}
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Falar agora no WhatsApp
          </a>

          <span className="text-white/40 text-sm hidden sm:block">ou</span>

          <button
            onClick={() => document.getElementById('proximos-passos')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-white/70 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
          >
            Ver próximos passos
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Seta de scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <div className="w-6 h-10 border-2 rounded-full flex justify-center pt-2"
          style={{ borderColor: 'hsl(217 91% 60% / 0.5)' }}>
          <div className="w-1 h-3 rounded-full animate-pulse"
            style={{ background: 'hsl(217 91% 60%)' }} />
        </div>
      </div>
    </section>
  );
}
