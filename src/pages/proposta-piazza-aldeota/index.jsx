import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Hero from './components/Hero';
import Servicos from './components/Servicos';
import Precificacao from './components/Precificacao';
import CTA from './components/CTA';
import logoTraffic from './assets/logo-traffic.png';

function ReadingProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: '#184892',
        transformOrigin: 'left',
        scaleX,
        zIndex: 9999,
      }}
    />
  );
}

function Navbar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -70, opacity: 0 }}
      animate={visible ? { y: 0, opacity: 1 } : { y: -70, opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(8,35,71,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(24,72,146,0.3)',
        padding: '12px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <img
        src={logoTraffic}
        alt="Traffic Solutions"
        style={{ height: 32, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
      />
      <motion.a
        href="https://wa.me/5585998088064"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 20px',
          background: '#25D366',
          color: '#fff',
          borderRadius: 7,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 14,
          textDecoration: 'none',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Falar conosco
      </motion.a>
    </motion.nav>
  );
}

export default function PropostaPiazzaAldeota() {
  return (
    <>
      {/* SEO */}
      <title>Proposta Comercial — Piazza Aldeota | Traffic Solutions</title>
      <meta property="og:title" content="Proposta Comercial — Piazza Aldeota | Traffic Solutions" />
      <meta property="og:description" content="Proposta exclusiva de Marketing Digital com Tráfego Pago e CRM Kommo para o Piazza Aldeota. Estratégia completa para geração e gestão de leads qualificados." />
      <meta property="og:type" content="website" />

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #161819;
          color: #F0F1F2;
          -webkit-font-smoothing: antialiased;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #161819; }
        ::-webkit-scrollbar-thumb { background: #184892; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #082347; }
      `}</style>

      <ReadingProgressBar />
      <Navbar />

      <main>
        <Hero />
        <Servicos />
        <Precificacao />
        <CTA />
      </main>
    </>
  );
}
