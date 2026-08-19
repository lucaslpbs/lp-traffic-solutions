import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SobreParceria from './components/SobreParceria';
import Propostas from './components/Propostas';
import ComoFunciona from './components/ComoFunciona';
import Metricas from './components/Metricas';
import InvestimentoPlataforma from './components/InvestimentoPlataforma';
import CTA from './components/CTA';
import Footer from './components/Footer';

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
        background: 'linear-gradient(90deg, #FF7A3D, #FFC857)',
        transformOrigin: 'left',
        scaleX,
        zIndex: 9999,
      }}
    />
  );
}

export default function PropostaUseBiquinisQSol() {
  return (
    <>
      <title>Proposta — Use Biquínis Q Sol</title>
      <meta
        property="og:title"
        content="Proposta Comercial — Use Biquínis Q Sol × Traffic Solutions"
      />
      <meta
        property="og:description"
        content="Três caminhos possíveis de parceria entre a Use Biquínis Q Sol e a Traffic Solutions para acelerar mensagens no WhatsApp e vendas nesta temporada."
      />
      <meta property="og:type" content="website" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');

        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }

        html { scroll-behavior: smooth; }

        body {
          margin: 0;
          -webkit-font-smoothing: antialiased;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #FFF8F0; }
        ::-webkit-scrollbar-thumb { background: #FF7A3D; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #FF4F6E; }
      `}</style>

      <ReadingProgressBar />
      <Navbar />

      <main className="font-body">
        <Hero />
        <SobreParceria />
        <Propostas />
        <ComoFunciona />
        <Metricas />
        <InvestimentoPlataforma />
        <CTA />
        <Footer />
      </main>
    </>
  );
}
