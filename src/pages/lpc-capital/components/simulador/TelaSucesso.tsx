import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatCurrencyPrecise } from '../../lib/masks';
import type { SimuladorData } from '../../hooks/useSimulador';
import type { ResultadoSimulacao } from '../../lib/calculoPrice';

const WHATSAPP_URL =
  'https://api.whatsapp.com/send?phone=5511940775149&text=Ol%C3%A1%21+Vim+do+site+e+gostaria+de+mais+informa%C3%A7%C3%B5es';

interface TelaSucessoProps {
  data: SimuladorData;
  resultado: ResultadoSimulacao;
}

export function TelaSucesso({ data, resultado }: TelaSucessoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="text-center max-w-lg mx-auto py-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 14 }}
        className="w-16 h-16 rounded-full bg-[#0a8a4a]/10 flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle2 className="w-9 h-9 text-[#0a8a4a]" />
      </motion.div>

      <h2 className="text-[#00325b] font-extrabold text-2xl md:text-3xl mb-3">
        Recebemos sua simulação!
      </h2>
      <p className="text-[#1d1d1d]/60 leading-relaxed mb-8">
        Nossa equipe de especialistas vai analisar seu perfil e entrar em contato pelo WhatsApp em
        breve.
      </p>

      <div className="rounded-2xl bg-[#f4f7fa] border border-[#00325b]/10 p-6 text-left grid grid-cols-2 gap-4 mb-8">
        <Resumo label="Valor solicitado" value={formatCurrency(data.valor)} />
        <Resumo label="Prazo" value={`${data.prazo} meses`} />
        <Resumo label="Tipo de imóvel" value={data.tipoImovel ?? '—'} />
        <Resumo label="Parcela estimada" value={`${formatCurrencyPrecise(resultado.parcela)}/mês`} />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-8 py-4 text-base font-bold text-white hover:brightness-95 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Falar com um especialista
        </a>

        <Link
          to="/lpccapital/proposta"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-[#c99900] px-8 py-4 text-base font-bold text-[#00325b] hover:bg-[#c99900]/10 transition-colors"
        >
          Ver proposta
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

function Resumo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-[#00325b]/45 font-semibold mb-0.5">
        {label}
      </p>
      <p className="text-sm font-bold text-[#00325b]">{value}</p>
    </div>
  );
}
