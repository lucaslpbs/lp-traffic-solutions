import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const quickLinks = [
  { path: "/", label: "Início" },
  { path: "/servicos", label: "Serviços" },
  { path: "/sobre", label: "Sobre Nós" },
  { path: "/cases", label: "Cases de Sucesso" },
  { path: "/contato", label: "Contato" },
];

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconLinkedin() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function IconYoutube() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="hsl(var(--foreground))" />
    </svg>
  );
}

const socials = [
  { Icon: IconInstagram, href: "https://www.instagram.com/trafficsolutions/", label: "Instagram" },
  { Icon: IconLinkedin, href: "https://www.linkedin.com/company/traffic-solutions-ltda/posts/?feedView=all", label: "LinkedIn" },
  { Icon: IconYoutube, href: "", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Main grid */}
      <div className="container mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Col 1 — Logo + tagline */}
          <div>
            <div className="font-display font-bold text-2xl mb-3">
              <span className="text-white">Traffic</span>
              <span className="text-primary-glow"> Solutions</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Marketing de performance para empresas que querem crescer de forma previsível e escalável.
            </p>
            {/* Socials */}
            <div className="flex gap-3 mt-6">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 hover:bg-white/8 transition-all duration-200"
                  style={{ backgroundColor: "transparent" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Links rápidos */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">
              Links Rápidos
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map(({ path, label }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-white/50 hover:text-white text-sm flex items-center gap-1.5 group transition-colors duration-200"
                  >
                    <span>{label}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Contato */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">
              Contato
            </h3>
            <ul className="space-y-3 text-sm text-white/50">
              <li>
                <span className="block text-white/30 text-xs uppercase tracking-wider mb-0.5">Site</span>
                trafficsolutionsdigital.com.br
              </li>
              <li>
                <span className="block text-white/30 text-xs uppercase tracking-wider mb-0.5">WhatsApp</span>
                <a
                  href="https://wa.me/5585987479260"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  +55 (85) 9 8747-9260
                </a>
              </li>
              <li>
                <span className="block text-white/30 text-xs uppercase tracking-wider mb-0.5">E-mail</span>
                <a
                  href="mailto:lucaspaulinobs@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  lucaspaulinobs@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>© {new Date().getFullYear()} Traffic Solutions. Todos os direitos reservados.</p>
          <div className="flex gap-5">
            <Link to="/privacidade" className="hover:text-white transition-colors">
              Política de Privacidade
            </Link>
            <Link to="/termos" className="hover:text-white transition-colors">
              Termos e Condições
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
