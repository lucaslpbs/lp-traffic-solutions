import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  format: (n: number) => string;
  className?: string;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function AnimatedNumber({ value, format, className }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(value);
      prevRef.current = value;
      return;
    }
    const controls = animate(prevRef.current, value, {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    prevRef.current = value;
    return () => controls.stop();
  }, [value]);

  return <span className={className}>{format(display)}</span>;
}
