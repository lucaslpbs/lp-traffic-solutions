import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Building2, Home, LandPlot, MoreHorizontal, Store } from 'lucide-react';
import { formatCurrencyPrecise, parseCurrencyInput } from '../../lib/masks';
import type { PropriedadeImovel, TipoImovel, UseSimuladorReturn } from '../../hooks/useSimulador';

const TIPOS: { label: TipoImovel; icon: typeof Home }[] = [
  { label: 'Apartamento', icon: Building2 },
  { label: 'Casa', icon: Home },
  { label: 'Sala comercial', icon: Store },
  { label: 'Terreno', icon: LandPlot },
  { label: 'Outros', icon: MoreHorizontal },
];

const PROPRIEDADES: PropriedadeImovel[] = ['Imóvel próprio', 'Pai ou mãe', 'Cônjuge', 'Filho ou filha'];

interface EtapaImovelProps {
  sim: UseSimuladorReturn;
}

export function EtapaImovel({ sim }: EtapaImovelProps) {
  const { data, update, goNext, goPrev } = sim;

  const podeAvancar =
    data.tipoImovel !== null &&
    data.imovelFinanciado !== null &&
    data.imovelCondominio !== null &&
    data.propriedadeImovel !== null &&
    data.valorImovel > 0 &&
    data.metragem !== '';

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="text-[#00325b] font-extrabold text-2xl md:text-3xl mb-2">Sobre o imóvel</h2>
      <p className="text-[#1d1d1d]/55 mb-9">Só cliques — sem formulário chato.</p>

      {/* Tipo do imóvel */}
      <div className="mb-9">
        <p className="text-sm font-semibold text-[#00325b] mb-3">Tipo do imóvel</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {TIPOS.map(({ label, icon: Icon }) => {
            const selected = data.tipoImovel === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => update('tipoImovel', label)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-center transition-all ${
                  selected
                    ? 'border-[#c99900] bg-[#c99900]/10 scale-[1.02] shadow-[0_0_0_3px_rgba(201,153,0,0.15)]'
                    : 'border-[#00325b]/12 hover:border-[#00325b]/25'
                }`}
              >
                <Icon className={`w-6 h-6 ${selected ? 'text-[#c99900]' : 'text-[#00325b]/60'}`} />
                <span className="text-xs font-semibold text-[#00325b]">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Financiado */}
      <BinaryQuestion
        label="O imóvel está financiado?"
        value={data.imovelFinanciado}
        onChange={(v) => update('imovelFinanciado', v)}
      />
      {data.imovelFinanciado && (
        <div className="mb-9 -mt-4">
          <label className="text-sm font-semibold text-[#00325b] mb-2 block">
            Quanto falta para quitar?
          </label>
          <CurrencyField
            value={data.valorRestante}
            onChange={(v) => update('valorRestante', v)}
            placeholder="R$ 0"
          />
        </div>
      )}

      {/* Condomínio */}
      <BinaryQuestion
        label="O imóvel está em condomínio?"
        value={data.imovelCondominio}
        onChange={(v) => update('imovelCondominio', v)}
      />

      {/* Propriedade */}
      <div className="mb-9">
        <p className="text-sm font-semibold text-[#00325b] mb-3">
          O imóvel é próprio ou de outra pessoa?
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PROPRIEDADES.map((label) => {
            const selected = data.propriedadeImovel === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => update('propriedadeImovel', label)}
                className={`rounded-xl border-2 px-3 py-4 text-center text-sm font-semibold transition-all ${
                  selected
                    ? 'border-[#c99900] bg-[#c99900]/10 text-[#00325b] scale-[1.02] shadow-[0_0_0_3px_rgba(201,153,0,0.15)]'
                    : 'border-[#00325b]/12 text-[#00325b]/70 hover:border-[#00325b]/25'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Valor + metragem */}
      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <div>
          <label className="text-sm font-semibold text-[#00325b] mb-2 block">
            Valor estimado do imóvel
          </label>
          <CurrencyField
            value={data.valorImovel}
            onChange={(v) => update('valorImovel', v)}
            placeholder="R$ 0"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-[#00325b] mb-2 block">Metragem (m²)</label>
          <input
            type="number"
            min={0}
            value={data.metragem}
            onChange={(e) => update('metragem', e.target.value)}
            placeholder="Ex: 85"
            className="w-full rounded-lg border-2 border-[#00325b]/15 px-4 py-3 text-[#00325b] font-semibold focus:outline-none focus:border-[#00325b] transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={goPrev}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-[#00325b]/20 px-7 py-4 text-base font-bold text-[#00325b] hover:bg-[#00325b]/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!podeAvancar}
          className="inline-flex items-center gap-2 rounded-lg bg-[#c99900] px-8 py-4 text-base font-bold text-[#00325b] hover:bg-[#f3de74] transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          Continuar
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

function BinaryQuestion({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="mb-9">
      <p className="text-sm font-semibold text-[#00325b] mb-3">{label}</p>
      <div className="flex gap-3">
        {[
          { label: 'Sim', v: true },
          { label: 'Não', v: false },
        ].map((opt) => {
          const selected = value === opt.v;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.v)}
              className={`flex-1 sm:flex-none sm:w-40 rounded-xl border-2 px-6 py-4 text-center font-bold transition-all ${
                selected
                  ? 'border-[#c99900] bg-[#c99900]/10 text-[#00325b] scale-[1.02] shadow-[0_0_0_3px_rgba(201,153,0,0.15)]'
                  : 'border-[#00325b]/12 text-[#00325b]/70 hover:border-[#00325b]/25'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CurrencyField({
  value,
  onChange,
  placeholder,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={value > 0 ? formatCurrencyPrecise(value) : ''}
      onChange={(e) => onChange(parseCurrencyInput(e.target.value))}
      placeholder={placeholder}
      className="w-full rounded-lg border-2 border-[#00325b]/15 px-4 py-3 text-[#00325b] font-semibold focus:outline-none focus:border-[#00325b] transition-colors"
    />
  );
}
