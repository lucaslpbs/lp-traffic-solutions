import logoSrc from '../assets/logo-lpc.png';

interface LogoProps {
  // 'dark' = sobre fundo claro (logo original navy/dourado). 'light' = sobre fundo
  // azul/escuro da marca — usamos um selo claro por trás para manter a legibilidade
  // do azul do próprio logo, já que não temos o arquivo da versão negativa (branca).
  variant?: 'dark' | 'light';
  className?: string;
}

export function Logo({ variant = 'dark', className = '' }: LogoProps) {
  const img = <img src={logoSrc} alt="LPC Capital" className={`h-9 w-auto object-contain ${className}`} />;

  if (variant === 'light') {
    return <span className="inline-flex items-center rounded-lg bg-[#f4f7fa] px-3 py-1.5">{img}</span>;
  }

  return img;
}
