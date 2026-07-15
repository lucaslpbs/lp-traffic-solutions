import logoSrc from '../assets/logo-lpc.png';

interface LogoProps {
  // 'dark' = sobre fundo claro (logo original navy/dourado). 'light' = sobre fundo
  // preto — a marca original é navy, então usamos um selo claro para manter legibilidade.
  variant?: 'dark' | 'light';
  className?: string;
}

export function Logo({ variant = 'dark', className = '' }: LogoProps) {
  const img = <img src={logoSrc} alt="LPC Capital" className={`h-9 w-auto object-contain ${className}`} />;

  if (variant === 'light') {
    return <span className="inline-flex items-center rounded-lg bg-[#f7f3ea] px-3 py-1.5">{img}</span>;
  }

  return img;
}
