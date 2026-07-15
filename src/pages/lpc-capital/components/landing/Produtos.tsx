import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import garantiaImg from '../../assets/produto-garantia.jpeg';
import financiamentoImg from '../../assets/produto-financiamento.jpeg';

const PRODUTOS = [
  {
    titulo: 'Empréstimo com Garantia de Imóvel',
    texto: 'Transforme seu imóvel quitado em crédito com condições vantajosas.',
    img: garantiaImg,
  },
  {
    titulo: 'Financiamento Imobiliário',
    texto: 'Adquira seu imóvel com taxas acessíveis e prazos que cabem no seu bolso.',
    img: financiamentoImg,
  },
];

export function Produtos() {
  return (
    <section id="produtos" className="bg-[#f4f7fa] py-24 lg:py-32">
      <div className="max-w-[1180px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c99900]">Produtos</span>
            <h2 className="lpc-display text-[#1d1d1d] font-semibold text-[clamp(28px,3.4vw,42px)] mt-2 max-w-xl">
              Como a LPC Capital pode apoiar você ou sua empresa?
            </h2>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {PRODUTOS.map((produto, i) => (
            <motion.div
              key={produto.titulo}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group bg-[#00325b] rounded-3xl overflow-hidden relative"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={produto.img}
                  alt={produto.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#00325b] via-transparent to-transparent" />
              </div>
              <div className="p-7">
                <h3 className="text-white font-bold text-xl mb-2">{produto.titulo}</h3>
                <p className="text-white/55 mb-6 leading-relaxed">{produto.texto}</p>
                <Link
                  to="/lpccapital/simulacao"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#f3de74] hover:text-white transition-colors"
                >
                  Saiba mais
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
