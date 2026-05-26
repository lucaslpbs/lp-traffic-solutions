import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const isHome = location.pathname === "/";

  const navItems = [
    { path: "/", label: "Início" },
    { path: "/servicos", label: "Serviços" },
    { path: "/sobre", label: "Sobre" },
    { path: "/cases", label: "Cases" },
    { path: "/contato", label: "Contato" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-elegant h-16"
          : "bg-transparent h-20"
      }`}
    >
      <div className="container mx-auto px-6 h-full">
        <div className="flex items-center justify-between h-full">

          {/* Logo */}
          <Link to="/" className="flex items-center font-display font-bold text-2xl">
            <span
              className={`transition-colors duration-300 ${
                isHome
                  ? isScrolled ? "text-foreground" : "text-white"
                  : "text-foreground"
              }`}
            >
              Traffic
            </span>
            <span className="text-primary"> Solutions</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative font-medium text-sm transition-colors duration-200 group ${
                  isActive(item.path)
                    ? "text-primary"
                    : isScrolled || !isHome
                    ? "text-foreground hover:text-primary"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-primary transition-all duration-300 ${
                    isActive(item.path) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:block">
            <Link to="/contato">
              <Button
                className="bg-primary hover:bg-primary-dark text-white font-semibold hover:scale-105 transition-all duration-300 ring-2 ring-primary/0 hover:ring-primary/30"
              >
                Começar Agora
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 transition-colors ${
              isScrolled || !isHome ? "text-foreground" : "text-white"
            }`}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu — slide down */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-white/97 backdrop-blur-md border-t border-border/40 ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="py-4 space-y-1 container mx-auto px-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? "text-primary bg-primary/8"
                  : "text-foreground hover:bg-primary/5 hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link to="/contato" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-primary hover:bg-primary-dark text-white font-semibold">
                Começar Agora
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
