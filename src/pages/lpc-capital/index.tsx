import './lpc.css';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Hero } from './components/landing/Hero';
import { Produtos } from './components/landing/Produtos';
import { ParceirosMarquee } from './components/landing/ParceirosMarquee';
import { Destaques } from './components/landing/Destaques';
import { Proposito } from './components/landing/Proposito';
import { SemFilas } from './components/landing/SemFilas';
import { Comparativo } from './components/landing/Comparativo';
import { HomeEquity } from './components/landing/HomeEquity';

export default function LPCCapitalLanding() {
  return (
    <div className="lpc-root min-h-screen">
      <title>LPC Capital — Crédito com garantia de imóvel</title>
      <meta
        name="description"
        content="A fintech que descomplica, potencializa e conecta você ao crédito com garantia de imóvel. Sem burocracia, sem atendimento engessado, sem complicação."
      />

      <Header />
      <main>
        <Hero />
        <Produtos />
        <ParceirosMarquee />
        <Destaques />
        <Proposito />
        <SemFilas />
        <Comparativo />
        <HomeEquity />
      </main>
      <Footer />
    </div>
  );
}
