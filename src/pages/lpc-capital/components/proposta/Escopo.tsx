import { motion } from 'framer-motion';
import { LayoutTemplate, SlidersHorizontal, BookOpen, TrendingUp, Plug, Smartphone } from 'lucide-react';

const ENTREGAVEIS = [
  {
    icon: LayoutTemplate,
    titulo: 'Landing institucional completa',
    texto: 'Todas as seções do site em /lpccapital — hero, produtos, parceiros, propósito, comparativo e home equity.',
  },
  {
    icon: SlidersHorizontal,
    titulo: 'Simulador de crédito interativo',
    texto: 'O fluxo em 3 etapas de /lpccapital/simulacao, com cálculo em tempo real e responsivo em qualquer tela.',
  },
  {
    icon: BookOpen,
    titulo: 'Blog de conteúdo',
    texto: 'Estrutura de artigos para educação financeira — alinhada ao pilar que a própria LPC já destaca — com listagem e página de artigo prontas para receber conteúdo.',
  },
  {
    icon: TrendingUp,
    titulo: 'Otimização de SEO',
    texto: 'Meta tags, sitemap, dados estruturados, performance de carregamento e títulos/descrições otimizados por página.',
  },
  {
    icon: Plug,
    titulo: 'Pronto para CRM/backend',
    texto: 'O formulário do simulador já está estruturado para integração futura com CRM ou backend, sem retrabalho.',
  },
  {
    icon: Smartphone,
    titulo: 'Responsivo de ponta a ponta',
    texto: 'Mobile, tablet e desktop testados e ajustados em cada seção do site.',
  },
];

export function Escopo() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="max-w-[1180px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a227]">
            Escopo do projeto
          </span>
          <h2 className="lpc-serif text-[#0f0e0c] font-semibold text-[clamp(28px,3.4vw,42px)] mt-2 mb-4">
            O que está incluso no projeto completo
          </h2>
          <p className="text-[#0f0e0c]/60 leading-relaxed text-lg">
            Não é só o simulador — é o site inteiro, pensado como um sistema único.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ENTREGAVEIS.map((item, i) => (
            <motion.div
              key={item.titulo}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="rounded-2xl border border-[#0a0a0a]/10 p-7 hover:border-[#c9a227]/40 transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#c9a227] to-[#e8c968] flex items-center justify-center mb-5">
                <item.icon className="w-5 h-5 text-[#0a0a0a]" strokeWidth={2} />
              </div>
              <h3 className="text-[#0f0e0c] font-bold text-lg mb-2">{item.titulo}</h3>
              <p className="text-[#0f0e0c]/60 leading-relaxed text-sm">{item.texto}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
