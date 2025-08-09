import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const scrollToContact = () => scrollToSection('contato');

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-elegant' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className={`text-2xl font-bold transition-colors ${
              isScrolled ? 'text-foreground' : 'text-white'
            }`}>
              Agência<span className="text-primary">Digital</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('sobre')}
              className={`transition-colors hover:text-primary ${
                isScrolled ? 'text-foreground' : 'text-white'
              }`}
            >
              Sobre
            </button>
            <button
              onClick={() => scrollToSection('cases')}
              className={`transition-colors hover:text-primary ${
                isScrolled ? 'text-foreground' : 'text-white'
              }`}
            >
              Cases
            </button>
            <button
              onClick={scrollToContact}
              className={`transition-colors hover:text-primary ${
                isScrolled ? 'text-foreground' : 'text-white'
              }`}
            >
              Contato
            </button>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button
              onClick={scrollToContact}
              className="bg-primary hover:bg-primary-dark text-white shadow-premium"
            >
              Quero meu orçamento
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 transition-colors ${
              isScrolled ? 'text-foreground' : 'text-white'
            }`}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-sm border-t shadow-elegant">
            <nav className="py-4 space-y-2">
              <button
                onClick={() => scrollToSection('sobre')}
                className="block w-full text-left px-4 py-2 text-foreground hover:bg-primary/10 transition-colors"
              >
                Sobre
              </button>
              <button
                onClick={() => scrollToSection('cases')}
                className="block w-full text-left px-4 py-2 text-foreground hover:bg-primary/10 transition-colors"
              >
                Cases
              </button>
              <button
                onClick={scrollToContact}
                className="block w-full text-left px-4 py-2 text-foreground hover:bg-primary/10 transition-colors"
              >
                Contato
              </button>
              <div className="px-4 pt-2">
                <Button
                  onClick={scrollToContact}
                  className="w-full bg-primary hover:bg-primary-dark text-white"
                >
                  Quero meu orçamento
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}