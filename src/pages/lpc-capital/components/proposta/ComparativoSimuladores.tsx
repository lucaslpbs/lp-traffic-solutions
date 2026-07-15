import { motion } from 'framer-motion';
import { Check, X, ListTree, Keyboard, Gauge, UserCheck, Sparkles, Smartphone } from 'lucide-react';

const PONTOS = [
  {
    icon: ListTree,
    titulo: 'Estrutura do formulário',
    antigo: 'Formulário único e longo, sem etapas — tudo em uma página só.',
    novo: 'Fluxo em 3 etapas com barra de progresso visível do início ao fim.',
  },
  {
    icon: Keyboard,
    titulo: 'Preenchimento',
    antigo:
      'Quase todos os campos digitados: nome, CPF, telefone, CEP, endereço completo, valor do imóvel.',
    novo:
      'Etapas 1 e 2 majoritariamente clicáveis: sliders com chips de atalho e cards selecionáveis.',
  },
  {
    icon: Gauge,
    titulo: 'Retorno visual',
    antigo: 'Resposta só depois de preencher tudo — nenhum retorno visual antes disso.',
    novo: 'Parcela, taxa e juros calculados e exibidos em tempo real, sem enviar nada.',
  },
  {
    icon: UserCheck,
    titulo: 'Quando pede dado pessoal',
    antigo: 'Nome, CPF e contato aparecem misturados aos outros campos, logo no início.',
    novo: 'Dado pessoal só na etapa 3, no fim do funil, quando o usuário já viu valor e está engajado.',
  },
  {
    icon: Sparkles,
    titulo: 'Interatividade',
    antigo: 'Visual estático — só digitar e clicar em enviar. Sem sensação de avanço.',
    novo: 'Microanimações, contador numérico animado, resumo lateral fixo e transições suaves entre etapas.',
  },
  {
    icon: Smartphone,
    titulo: 'Responsividade e acessibilidade',
    antigo: 'Sem tratamento dedicado para mobile ou para acessibilidade.',
    novo: 'Totalmente responsivo, com foco de teclado visível e respeito a prefers-reduced-motion.',
  },
];

export function ComparativoSimuladores() {
  return (
    <section className="bg-[#f4f7fa] py-24 lg:py-32">
      <div className="max-w-[1180px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c99900]">
            Antes × Depois
          </span>
          <h2 className="lpc-display text-[#1d1d1d] font-semibold text-[clamp(28px,3.4vw,42px)] mt-2 mb-4">
            O que mudou do simulador antigo para o novo
          </h2>
          <p className="text-[#1d1d1d]/60 leading-relaxed text-lg">
            Comparando <span className="font-semibold">/simulacao2</span> (o formulário atual) com{' '}
            <span className="font-semibold">/lpccapital/simulacao</span> (o que construímos).
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {PONTOS.map((ponto, i) => (
            <motion.div
              key={ponto.titulo}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: (i % 2) * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-full bg-[#00325b] flex items-center justify-center shrink-0">
                  <ponto.icon className="w-[18px] h-[18px] text-[#f3de74]" />
                </div>
                <h3 className="text-[#1d1d1d] font-bold text-base">{ponto.titulo}</h3>
              </div>

              <div className="flex items-start gap-3 mb-3 opacity-60">
                <X className="w-4 h-4 text-[#1d1d1d]/40 mt-0.5 shrink-0" strokeWidth={2.5} />
                <p className="text-sm text-[#1d1d1d]/55 leading-relaxed">{ponto.antigo}</p>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-[#c99900] mt-0.5 shrink-0" strokeWidth={2.5} />
                <p className="text-sm text-[#1d1d1d] font-medium leading-relaxed">{ponto.novo}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
