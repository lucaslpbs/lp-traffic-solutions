import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  /** Atraso da entrada, em ms — use para escalonar irmaos. */
  delay?: number;
  /** Distancia do deslize inicial. */
  deslocamento?: 'sm' | 'md';
  as?: 'div' | 'section' | 'li' | 'header';
  /** Estilos do proprio elemento; o transitionDelay e mesclado por cima. */
  style?: CSSProperties;
  'aria-hidden'?: boolean;
}

/**
 * Entrada ao rolar, sem depender de requestAnimationFrame.
 *
 * O `whileInView` do framer-motion resolve o mesmo problema, mas anima por rAF:
 * numa aba em segundo plano ou com o navegador economizando bateria, o quadro
 * nunca avanca e o conteudo fica preso em opacity 0 — some da tela em vez de
 * so nao animar. Aqui quem observa e o IntersectionObserver (que nao usa rAF) e
 * quem anima e uma transicao CSS; se a transicao nao rodar, o elemento
 * simplesmente aparece.
 *
 * O setTimeout e a ultima linha de defesa: revela o conteudo mesmo que o
 * observer nunca dispare (elemento em container exotico, IO indisponivel).
 */
export const RevealOnScroll = ({
  children,
  className,
  delay = 0,
  deslocamento = 'md',
  as: Tag = 'div',
  style,
  'aria-hidden': ariaHidden,
}: RevealOnScrollProps) => {
  const ref = useRef<HTMLElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (visivel) return;

    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisivel(true);
      return;
    }

    const io = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisivel(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    io.observe(el);

    const rede = setTimeout(() => setVisivel(true), 1500);

    return () => {
      io.disconnect();
      clearTimeout(rede);
    };
  }, [visivel]);

  return (
    <Tag
      ref={ref as never}
      style={{ ...style, transitionDelay: visivel ? `${delay}ms` : '0ms' }}
      aria-hidden={ariaHidden}
      className={cn(
        'transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none',
        visivel
          ? 'opacity-100 translate-y-0'
          : deslocamento === 'sm'
            ? 'opacity-0 translate-y-2'
            : 'opacity-0 translate-y-4',
        className
      )}
    >
      {children}
    </Tag>
  );
};
