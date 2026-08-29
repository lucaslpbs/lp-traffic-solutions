import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  /** Formatador aplicado a cada quadro. Padrao: numero inteiro pt-BR. */
  format?: (n: number) => string;
  /** Duracao da contagem, em segundos. */
  duration?: number;
  delay?: number;
  className?: string;
}

/**
 * Numero que conta ate o valor quando entra na tela.
 *
 * Escreve direto no textContent em vez de usar estado: sao ~60 atualizacoes por
 * segundo e um setState por quadro re-renderizaria a arvore inteira em volta.
 *
 * O valor REAL e o estado de repouso — o zero so aparece depois que a animacao
 * efetivamente comeca. E deliberado: se o requestAnimationFrame nao rodar (aba
 * em segundo plano, navegador economizando bateria, JS de animacao falhando),
 * o cliente ve o total dele, e nao "R$ 0,00" congelado na tela.
 */
export const AnimatedNumber = ({
  value,
  format = (n) => Math.round(n).toLocaleString('pt-BR'),
  duration = 1.1,
  delay = 0,
  className,
}: AnimatedNumberProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const emVista = useInView(ref, { once: true, margin: '-40px' });
  const reduzir = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Sem animacao: o texto renderizado ja e o valor final.
    if (reduzir || !emVista) return;

    const controls = animate(0, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (n) => {
        node.textContent = format(n);
      },
      // Garante o valor exato no fim, sem depender do arredondamento do ultimo quadro.
      onComplete: () => {
        node.textContent = format(value);
      },
    });

    /*
      Rede de seguranca. A contagem avanca por requestAnimationFrame; se ele
      parar no meio (aba em segundo plano, navegador economizando bateria), o
      numero congela num valor parcial — no pior caso em zero, que e justamente
      o comeco da animacao. O setTimeout nao depende de rAF e crava o valor
      final passado o tempo previsto, aconteca o que acontecer com a animacao.
    */
    const trava = setTimeout(
      () => {
        node.textContent = format(value);
      },
      (delay + duration) * 1000 + 400
    );

    return () => {
      clearTimeout(trava);
      controls.stop();
      node.textContent = format(value);
    };
  }, [value, emVista, reduzir, duration, delay, format]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
};
