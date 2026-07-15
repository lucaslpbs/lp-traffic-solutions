import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import './lpc.css';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BLOG_POSTS } from './lib/blogPosts';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(
    new Date(iso)
  );
}

export default function LPCBlog() {
  const [destaque, ...resto] = BLOG_POSTS;

  return (
    <div className="lpc-root min-h-screen bg-white flex flex-col">
      <title>Blog — LPC Capital</title>
      <meta
        name="description"
        content="Conteúdos sobre crédito com garantia de imóvel, educação financeira e planejamento para você decidir com mais segurança."
      />

      <Header />

      <section className="lpc-noise bg-[#0a0a0a] py-16 lg:py-20">
        <div className="max-w-[1180px] mx-auto px-6">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a227]">Blog</span>
          <h1 className="lpc-serif text-white font-semibold text-[clamp(30px,4vw,48px)] mt-2 max-w-2xl">
            Conteúdo para decidir com mais clareza
          </h1>
          <p className="text-white/55 mt-4 max-w-xl text-lg">
            Educação financeira, comparativos e dicas práticas sobre crédito com garantia de
            imóvel.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-[1180px] w-full mx-auto px-6 py-16 lg:py-20">
        {/* Post em destaque */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to={`/lpccapital/blog/${destaque.slug}`}
            className="group grid md:grid-cols-2 gap-8 items-center mb-20 rounded-3xl overflow-hidden bg-[#f7f3ea]"
          >
            <div className="relative h-64 md:h-full min-h-[280px] overflow-hidden">
              <img
                src={destaque.capa}
                alt={destaque.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-8 md:pr-12">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#c9a227]">
                {destaque.categoria}
              </span>
              <h2 className="lpc-serif text-[#0f0e0c] font-semibold text-[clamp(22px,2.6vw,32px)] mt-3 mb-4 leading-snug">
                {destaque.titulo}
              </h2>
              <p className="text-[#0f0e0c]/60 leading-relaxed mb-6">{destaque.resumo}</p>
              <div className="flex items-center justify-between text-sm text-[#0f0e0c]/45">
                <span>
                  {formatDate(destaque.data)} · {destaque.tempoLeitura}
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-[#0a0a0a] group-hover:text-[#c9a227] transition-colors">
                  Ler artigo <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Grid dos demais posts */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {resto.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link to={`/lpccapital/blog/${post.slug}`} className="group block">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                  <img
                    src={post.capa}
                    alt={post.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#c9a227]">
                  {post.categoria}
                </span>
                <h3 className="text-[#0f0e0c] font-bold text-lg mt-2 mb-2 leading-snug group-hover:text-[#c9a227] transition-colors">
                  {post.titulo}
                </h3>
                <p className="text-[#0f0e0c]/55 text-sm leading-relaxed mb-3">{post.resumo}</p>
                <span className="text-xs text-[#0f0e0c]/40">
                  {formatDate(post.data)} · {post.tempoLeitura}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
