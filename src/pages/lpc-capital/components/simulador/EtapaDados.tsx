import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { formatCurrencyPrecise, isValidEmail, maskCEP, maskCPF, maskPhone, parseCurrencyInput } from '../../lib/masks';
import type { UseSimuladorReturn } from '../../hooks/useSimulador';

interface EtapaDadosProps {
  sim: UseSimuladorReturn;
}

type Erros = Partial<Record<'nome' | 'email' | 'telefone' | 'cpf' | 'rendaMensal' | 'cep' | 'numero' | 'termos', string>>;

export function EtapaDados({ sim }: EtapaDadosProps) {
  const { data, update, goPrev, submit } = sim;
  const [erros, setErros] = useState<Erros>({});
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const buscarCep = async (cepDigitado: string) => {
    const digits = cepDigitado.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setBuscandoCep(true);
    try {
      // Auto-preenchimento via ViaCEP para demonstrar o conceito de UX.
      // TODO: em produção, tratar timeout/indisponibilidade da API com fallback manual.
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const json = await res.json();
      if (!json.erro) {
        update('cidade', json.localidade ?? '');
        update('estado', json.uf ?? '');
        update('endereco', json.logradouro ?? '');
        update('bairro', json.bairro ?? '');
      }
    } catch {
      // silencioso — usuário pode preencher manualmente
    } finally {
      setBuscandoCep(false);
    }
  };

  const validar = (): boolean => {
    const novosErros: Erros = {};
    if (!data.nome.trim()) novosErros.nome = 'Informe seu nome completo';
    if (!isValidEmail(data.email)) novosErros.email = 'E-mail inválido';
    if (data.telefone.replace(/\D/g, '').length < 10) novosErros.telefone = 'Telefone inválido';
    if (data.cpf.replace(/\D/g, '').length !== 11) novosErros.cpf = 'CPF inválido';
    if (data.rendaMensal <= 0) novosErros.rendaMensal = 'Informe sua renda mensal';
    if (data.cep.replace(/\D/g, '').length !== 8) novosErros.cep = 'CEP inválido';
    if (!data.numero.trim()) novosErros.numero = 'Informe o número';
    if (!data.aceitaTermos) novosErros.termos = 'É necessário aceitar os termos para continuar';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    setEnviando(true);
    setTimeout(() => {
      submit();
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="text-[#0a0a0a] font-extrabold text-2xl md:text-3xl mb-2">Seus dados</h2>
      <p className="text-[#1d1d1d]/55 mb-9">
        Última etapa — nossa equipe entra em contato com o resultado da sua simulação.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <Field label="Nome completo" error={erros.nome} className="sm:col-span-2">
          <input
            type="text"
            value={data.nome}
            onChange={(e) => update('nome', e.target.value)}
            className={inputClass(!!erros.nome)}
            placeholder="Seu nome completo"
          />
        </Field>

        <Field label="E-mail" error={erros.email}>
          <input
            type="email"
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
            className={inputClass(!!erros.email)}
            placeholder="voce@email.com"
          />
        </Field>

        <Field label="Telefone" error={erros.telefone}>
          <input
            type="tel"
            value={data.telefone}
            onChange={(e) => update('telefone', maskPhone(e.target.value))}
            className={inputClass(!!erros.telefone)}
            placeholder="(11) 94077-5149"
          />
        </Field>

        <Field label="CPF" error={erros.cpf}>
          <input
            type="text"
            value={data.cpf}
            onChange={(e) => update('cpf', maskCPF(e.target.value))}
            className={inputClass(!!erros.cpf)}
            placeholder="000.000.000-00"
          />
        </Field>

        <Field label="Qual sua renda mensal?" error={erros.rendaMensal}>
          <input
            type="text"
            inputMode="numeric"
            value={data.rendaMensal > 0 ? formatCurrencyPrecise(data.rendaMensal) : ''}
            onChange={(e) => update('rendaMensal', parseCurrencyInput(e.target.value))}
            className={inputClass(!!erros.rendaMensal)}
            placeholder="R$ 0"
          />
        </Field>

        <Field label="CEP" error={erros.cep}>
          <div className="relative">
            <input
              type="text"
              value={data.cep}
              onChange={(e) => update('cep', maskCEP(e.target.value))}
              onBlur={(e) => buscarCep(e.target.value)}
              className={inputClass(!!erros.cep)}
              placeholder="00000-000"
            />
            {buscandoCep && (
              <Loader2 className="w-4 h-4 animate-spin text-[#0a0a0a]/50 absolute right-3 top-1/2 -translate-y-1/2" />
            )}
          </div>
        </Field>

        <Field label="Cidade">
          <input
            type="text"
            value={data.cidade}
            onChange={(e) => update('cidade', e.target.value)}
            className={inputClass(false)}
          />
        </Field>

        <Field label="Estado">
          <input
            type="text"
            value={data.estado}
            onChange={(e) => update('estado', e.target.value)}
            className={inputClass(false)}
          />
        </Field>

        <Field label="Endereço" className="sm:col-span-2">
          <input
            type="text"
            value={data.endereco}
            onChange={(e) => update('endereco', e.target.value)}
            className={inputClass(false)}
          />
        </Field>

        <Field label="Bairro">
          <input
            type="text"
            value={data.bairro}
            onChange={(e) => update('bairro', e.target.value)}
            className={inputClass(false)}
          />
        </Field>

        <Field label="Número" error={erros.numero}>
          <input
            type="text"
            value={data.numero}
            onChange={(e) => update('numero', e.target.value)}
            className={inputClass(!!erros.numero)}
          />
        </Field>

        <Field label="Complemento (opcional)" className="sm:col-span-2">
          <input
            type="text"
            value={data.complemento}
            onChange={(e) => update('complemento', e.target.value)}
            className={inputClass(false)}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-3 mb-4 border-t border-[#0a0a0a]/10 pt-6">
        <Checkbox
          checked={data.aceitaTermos}
          onChange={(v) => update('aceitaTermos', v)}
          error={erros.termos}
        >
          Li e aceito os{' '}
          <span className="underline text-[#0a0a0a] font-semibold">Termos de Uso</span> e a{' '}
          <span className="underline text-[#0a0a0a] font-semibold">Política de Privacidade</span> da
          LPC Capital.
        </Checkbox>
        <Checkbox
          checked={data.aceitaCadastroPositivo}
          onChange={(v) => update('aceitaCadastroPositivo', v)}
        >
          Autorizo a consulta ao Cadastro Positivo, nos termos da Lei Complementar nº 166/2019.
        </Checkbox>
        <Checkbox checked={data.aceitaSCR} onChange={(v) => update('aceitaSCR', v)}>
          Autorizo a consulta ao Sistema de Informações de Crédito (SCR) do Banco Central do
          Brasil, conforme a Resolução CMN nº 4.571/2017.
        </Checkbox>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          type="button"
          onClick={goPrev}
          disabled={enviando}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-[#0a0a0a]/20 px-7 py-4 text-base font-bold text-[#0a0a0a] hover:bg-[#0a0a0a]/5 transition-colors disabled:opacity-40"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={enviando}
          className="inline-flex items-center gap-2 rounded-lg bg-[#c9a227] px-8 py-4 text-base font-bold text-[#0a0a0a] hover:bg-[#e8c968] transition-colors disabled:opacity-70"
        >
          {enviando ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              Enviar simulação
              <Send className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-lg border-2 px-4 py-3 text-[#0a0a0a] font-medium focus:outline-none transition-colors ${
    hasError ? 'border-red-400' : 'border-[#0a0a0a]/15 focus:border-[#0a0a0a]'
  }`;
}

function Field({
  label,
  error,
  className = '',
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-semibold text-[#0a0a0a] mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  error,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#0a0a0a] shrink-0"
        />
        <span className="text-sm text-[#1d1d1d]/70 leading-relaxed">{children}</span>
      </label>
      {error && <p className="text-xs text-red-500 mt-1 ml-7">{error}</p>}
    </div>
  );
}
