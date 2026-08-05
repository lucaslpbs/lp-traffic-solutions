import { AnimatePresence } from 'framer-motion';
import './lpc.css';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProgressBar } from './components/simulador/ProgressBar';
import { ResumoLateral } from './components/simulador/ResumoLateral';
import { EtapaValor } from './components/simulador/EtapaValor';
import { EtapaImovel } from './components/simulador/EtapaImovel';
import { EtapaDados } from './components/simulador/EtapaDados';
import { TelaSucesso } from './components/simulador/TelaSucesso';
import { useSimulador } from './hooks/useSimulador';

export default function LPCSimulacao() {
  const sim = useSimulador();
  const { step, data, resultado } = sim;

  return (
    <div className="lpc-root min-h-screen bg-white flex flex-col">
      <title>Simulação de crédito — LPC Capital</title>
      <meta
        name="description"
        content="Simule seu crédito com garantia de imóvel na LPC Capital em poucos cliques."
      />

      <Header />

      {step < 4 && <ProgressBar step={step} />}

      <main className="flex-1 max-w-[1140px] w-full mx-auto px-6 pb-20">
        {step < 4 ? (
          <div className="grid lg:grid-cols-[1fr_320px] gap-10 pt-4">
            <div className="lg:order-1 order-2">
              <AnimatePresence mode="wait">
                {step === 1 && <EtapaValor key="etapa1" sim={sim} />}
                {step === 2 && <EtapaImovel key="etapa2" sim={sim} />}
                {step === 3 && <EtapaDados key="etapa3" sim={sim} />}
              </AnimatePresence>
            </div>
            <div className="lg:order-2 order-1 -mx-6 lg:mx-0">
              <ResumoLateral data={data} parcela={resultado.parcela} step={step} />
            </div>
          </div>
        ) : (
          <div className="pt-14">
            <TelaSucesso data={data} resultado={resultado} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
