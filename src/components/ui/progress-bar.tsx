import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  /** Progresso de 0 a 1. */
  pct: number;
  className?: string;
  /** Classe do preenchimento — normalmente um gradiente. */
  fillClassName?: string;
  /** Atraso antes de comecar a encher, em ms. */
  delay?: number;
  /** Brilho passando por cima do preenchimento. */
  brilho?: boolean;
  'aria-label'?: string;
}

/**
 * Barra de progresso que enche ao aparecer.
 *
 * A largura e trocada por estado e a animacao fica por conta de uma transicao
 * CSS — nao do framer. Motivo: o disparo e um setTimeout, que roda mesmo com o
 * requestAnimationFrame estrangulado. Se a transicao nao chegar a rodar, a
 * largura simplesmente salta para o valor certo; o que nao acontece e a barra
 * ficar presa em zero mostrando progresso que o cliente nao tem.
 */
export const ProgressBar = ({
  pct,
  className,
  fillClassName = 'bg-gradient-to-r from-level-dark via-level to-level-glow',
  delay = 80,
  brilho = false,
  'aria-label': ariaLabel,
}: ProgressBarProps) => {
  const alvo = Math.max(0, Math.min(1, pct)) * 100;
  const [largura, setLargura] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setLargura(alvo), delay);
    return () => clearTimeout(t);
  }, [alvo, delay]);

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(alvo)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={cn('h-2.5 rounded-full bg-foreground/10 overflow-hidden', className)}
    >
      <div
        style={{ width: `${largura}%` }}
        className={cn(
          'relative h-full rounded-full transition-[width] duration-1000 ease-out motion-reduce:transition-none',
          fillClassName
        )}
      >
        {brilho && (
          <span className="absolute inset-0 overflow-hidden rounded-full" aria-hidden>
            <span className="absolute inset-y-0 w-1/3 bg-foreground/25 blur-sm animate-sheen" />
          </span>
        )}
      </div>
    </div>
  );
};
