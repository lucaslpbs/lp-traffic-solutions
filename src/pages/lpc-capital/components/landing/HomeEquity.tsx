import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function HomeEquity() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="max-w-[820px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a227]">Home Equity</span>
          <h2 className="lpc-serif text-[#0f0e0c] font-semibold text-[clamp(26px,3.2vw,38px)] mt-2">
            Empréstimo com Garantia de Imóvel
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid sm:grid-cols-[3px_1fr] gap-8 mb-10"
        >
          <div className="hidden sm:block bg-gradient-to-b from-[#c9a227] to-transparent rounded-full" />
          <div className="text-[#0f0e0c]/65 leading-relaxed space-y-5 text-[17px]">
            <p>
              Na LPC Capital, oferecemos uma solução financeira inteligente para quem busca crédito
              com taxas mais baixas, prazos longos e total liberdade de uso: o empréstimo com
              garantia de imóvel. Com essa modalidade, você utiliza o valor do seu imóvel quitado
              como garantia para obter recursos de forma segura, sem precisar vendê-lo.
            </p>
            <p>
              Seja para quitar dívidas, investir em um novo negócio, reformar sua casa ou realizar
              projetos pessoais, o home equity é uma das opções mais vantajosas do mercado. Você tem
              acesso a valores mais altos, com condições flexíveis e segurança jurídica em todas as
              etapas, desde a simulação até a liberação do crédito.
            </p>
            <p>
              Nosso processo é 100% digital, simples e transparente. Em poucos passos, avaliamos seu
              imóvel, analisamos a documentação e liberamos o valor diretamente na sua conta. Além
              disso, você conta com o suporte de consultores especializados, prontos para atender
              pelo WhatsApp e tirar todas as dúvidas.
            </p>
          </div>
        </motion.div>

        <Link
          to="/lpccapital/simulacao"
          className="inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-8 py-4 text-base font-bold text-white hover:bg-[#1a1a1a] transition-colors"
        >
          Simule agora mesmo sem custo!
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
