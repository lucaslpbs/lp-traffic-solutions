import './lpc.css';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Abertura } from './components/proposta/Abertura';
import { ComparativoSimuladores } from './components/proposta/ComparativoSimuladores';
import { Escopo } from './components/proposta/Escopo';
import { Investimento } from './components/proposta/Investimento';

export default function LPCProposta() {
  return (
    <div className="lpc-root min-h-screen">
      <title>Proposta comercial — LPC Capital</title>
      <meta name="robots" content="noindex, nofollow" />
      <meta
        name="description"
        content="Proposta comercial do novo site LPC Capital: comparativo do simulador antigo com o novo, escopo do projeto e investimento."
      />

      <Header />
      <main>
        <Abertura />
        <ComparativoSimuladores />
        <Escopo />
        <Investimento />
      </main>
      <Footer />
    </div>
  );
}
