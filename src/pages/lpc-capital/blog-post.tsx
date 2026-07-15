import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import './lpc.css';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BLOG_POSTS, getPostBySlug } from './lib/blogPosts';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(
    new Date(iso)
  );
}

export default function LPCBlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return <Navigate to="/lpccapital/blog" replace />;
  }

  const relacionados = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="lpc-root min-h-screen bg-white flex flex-col">
      <title>{post.titulo} — Blog LPC Capital</title>
      <meta name="description" content={post.resumo} />

      <Header />

      <section className="lpc-noise bg-[#00325b] py-16 lg:py-20">
        <div className="max-w-[820px] mx-auto px-6">
          <Link
            to="/lpccapital/blog"
            className="flex w-fit items-center gap-2 text-sm font-semibold text-white/50 hover:text-[#f3de74] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o blog
          </Link>
          <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[#c99900]">
            {post.categoria}
          </span>
          <h1 className="lpc-display text-white font-semibold text-[clamp(28px,4vw,44px)] mt-3 mb-5 leading-tight">
            {post.titulo}
          </h1>
          <p className="text-white/45 text-sm">
            Por {post.autor} · {formatDate(post.data)} · {post.tempoLeitura}
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-[820px] w-full mx-auto px-6 py-14 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-12"
        >
          <img src={post.capa} alt={post.titulo} className="w-full h-full object-cover" />
        </motion.div>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid sm:grid-cols-[3px_1fr] gap-8"
        >
          <div className="hidden sm:block bg-gradient-to-b from-[#c99900] to-transparent rounded-full" />
          <div className="text-[#1d1d1d]/70 leading-[1.85] text-[17px] space-y-5">
            {post.corpo.map((paragrafo, i) => (
              <p key={i}>{paragrafo}</p>
            ))}
          </div>
        </motion.article>

        <div className="mt-14 rounded-2xl bg-[#f4f7fa] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-bold text-[#1d1d1d] text-lg mb-1">Quer ver quanto você pode liberar?</p>
            <p className="text-[#1d1d1d]/55 text-sm">Simule seu crédito com garantia de imóvel em poucos cliques.</p>
          </div>
          <Link
            to="/lpccapital/simulacao"
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c99900] to-[#f3de74] px-7 py-3.5 text-sm font-bold text-[#00325b] hover:shadow-[0_0_24px_rgba(201,153,0,0.4)] transition-shadow"
          >
            Simular agora
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <section className="bg-[#f4f7fa] py-16 lg:py-20">
        <div className="max-w-[1180px] mx-auto px-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#c99900] mb-8">
            Continue lendo
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {relacionados.map((p) => (
              <Link key={p.slug} to={`/lpccapital/blog/${p.slug}`} className="group block">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                  <img
                    src={p.capa}
                    alt={p.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h3 className="text-[#1d1d1d] font-bold leading-snug group-hover:text-[#c99900] transition-colors flex items-start gap-1">
                  {p.titulo}
                  <ArrowUpRight className="w-4 h-4 shrink-0 mt-1" />
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
