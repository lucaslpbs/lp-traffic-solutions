import { Instagram, MapPin, Phone } from 'lucide-react';
import { Logo } from './Logo';

const WHATSAPP_URL =
  'https://api.whatsapp.com/send?phone=5511940775149&text=Ol%C3%A1%21+Vim+do+site+e+gostaria+de+mais+informa%C3%A7%C3%B5es';

export function Footer() {
  return (
    <footer className="lpc-noise bg-[#00325b] text-white relative">
      <div className="lpc-hairline" />
      <div className="max-w-[1180px] mx-auto px-6 py-16 grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <Logo variant="light" className="mb-5" />
          <p className="text-sm text-white/55 leading-relaxed flex items-start gap-2 mb-4">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#c99900]" />
            Av Eng Luiz Carlos Berrini n 1748 conjunto 1710, São Paulo, Brazil
          </p>
          <div className="flex flex-col gap-2.5 text-sm text-white/55">
            <a
              href="https://www.instagram.com/lpccapital_homeequity?igsh=MTMwam1xdTRzd2J0Mg=="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-[#f3de74] transition-colors w-fit"
            >
              <Instagram className="w-4 h-4 text-[#c99900]" />
              @lpccapital_homeequity
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-[#f3de74] transition-colors w-fit"
            >
              <Phone className="w-4 h-4 text-[#c99900]" />
              WhatsApp: (11) 94077-5149
            </a>
            <a href="tel:+5511973594659" className="inline-flex items-center gap-2 hover:text-[#f3de74] transition-colors w-fit">
              <Phone className="w-4 h-4 text-[#c99900]" />
              Telefone: (11) 97359-4659
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#c99900] mb-4">Navegue</h4>
          <div className="flex flex-col gap-2.5 text-sm text-white/55">
            <a href="/lpccapital#produtos" className="hover:text-[#f3de74] transition-colors w-fit">Produtos</a>
            <a href="/lpccapital#sobre" className="hover:text-[#f3de74] transition-colors w-fit">Sobre nós</a>
            <a href="/lpccapital#parceiros" className="hover:text-[#f3de74] transition-colors w-fit">Parceiros</a>
            <a href="/lpccapital/blog" className="hover:text-[#f3de74] transition-colors w-fit">Blog</a>
            <a href="/lpccapital/simulacao" className="hover:text-[#f3de74] transition-colors w-fit">Simular crédito</a>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#c99900] mb-4">
            Instituições parceiras
          </h4>
          <p className="text-sm text-white/55 leading-relaxed">
            Trabalhamos com instituições reconhecidas, como: Banco Bari, Bradesco, C6 Bank,
            CashMe, CrediBlue, Creditas, Daycoval, Inter, Itaú, Santander, entre outras.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#c99900] mb-4">
            Informações legais
          </h4>
          <p className="text-sm text-white/55 leading-relaxed mb-3">
            A LPC Capital é uma plataforma digital especializada na mediação de crédito, atuando
            como correspondente bancário autorizado, conforme a Resolução nº 3.954 de 24/02/2011.
          </p>
          <p className="text-sm text-white/35">LPC Capital | CNPJ 52.584.903/0001-60</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="max-w-[1180px] mx-auto px-6 py-5 text-xs text-white/30">
          © {new Date().getFullYear()} LPC Capital. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
