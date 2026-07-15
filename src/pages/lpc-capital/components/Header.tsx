import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';

const NAV_ITEMS = [
  { label: 'Início', href: '#topo' },
  { label: 'Produtos', href: '#produtos' },
  { label: 'Sobre nós', href: '#sobre' },
  { label: 'Parceiros', href: '#parceiros' },
  { label: 'Blog', href: '/lpccapital/blog', route: true },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const onLanding = location.pathname === '/lpccapital';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const resolveHref = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.route) return item.href;
    return onLanding ? item.href : `/lpccapital${item.href}`;
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-[#0a0a0a] transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : ''
      }`}
    >
      <div className="lpc-hairline" />
      <div className="max-w-[1180px] mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/lpccapital" className="shrink-0">
          <Logo variant="light" />
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={resolveHref(item)}
              className="relative text-[14px] font-semibold uppercase tracking-wide text-white/75 hover:text-[#e8c968] transition-colors group"
            >
              {item.label}
              <span className="absolute -bottom-1.5 left-0 w-0 h-px bg-[#c9a227] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            to="/lpccapital/simulacao"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-[#c9a227] to-[#e8c968] px-6 py-2.5 text-sm font-bold text-[#0a0a0a] hover:shadow-[0_0_24px_rgba(201,162,39,0.45)] transition-shadow"
          >
            Faça uma simulação
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden p-2 text-[#e8c968]"
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0a0a0a] px-6 py-5 flex flex-col gap-4">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={resolveHref(item)}
              onClick={() => setMobileOpen(false)}
              className="text-[15px] font-semibold uppercase tracking-wide text-white/80"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/lpccapital/simulacao"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#c9a227] to-[#e8c968] px-6 py-3 text-sm font-bold text-[#0a0a0a]"
          >
            Faça uma simulação
          </Link>
        </div>
      )}
    </header>
  );
}
