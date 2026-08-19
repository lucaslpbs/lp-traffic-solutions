import { motion } from 'framer-motion';
import { Rocket, Target, Sparkles, Check } from 'lucide-react';
import fotoFlavinha from '../assets/foto-flavinha-paulino.jpg';

const checklistVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const checkItem = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

function Checklist({ items }) {
  return (
    <motion.ul
      variants={checklistVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="space-y-3 mb-8"
    >
      {items.map((item, i) => (
        <motion.li key={i} variants={checkItem} className="flex items-start gap-3 font-body text-sm text-[#0B1F4D]/85 leading-relaxed">
          <Check size={16} className="shrink-0 mt-0.5 text-[#0FA3B1]" />
          <span>{item}</span>
        </motion.li>
      ))}
    </motion.ul>
  );
}

function AdsNote() {
  return (
    <p className="font-body text-xs text-[#0B1F4D]/55 leading-relaxed border-t border-[#0B1F4D]/10 pt-4">
      * Verba de investimento em anúncios (Meta/Instagram Ads) é à parte.
    </p>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Propostas() {
  return (
    <section id="propostas" className="bg-[#FFF8F0] px-5 py-14 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl mx-auto text-center mb-10 md:mb-16"
      >
        <p className="font-body uppercase text-[#FF4F6E] text-xs md:text-sm tracking-[0.28em] font-semibold mb-4">
          02 · AS PROPOSTAS
        </p>
        <h2 className="font-display font-bold text-[#0B1F4D] text-[clamp(26px,4vw,40px)] leading-tight mb-5">
          Três caminhos possíveis
        </h2>
        <p className="font-body text-[#0B1F4D]/75 text-base leading-relaxed">
          Preparamos três caminhos possíveis. Cada um resolve uma necessidade diferente — não
          existe certo ou errado, existe o momento certo da sua marca.
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8 items-stretch">
        {/* CARD 1 — Tráfego Pago Puro */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          whileHover={{ scale: 1.03, y: -6, boxShadow: '0 24px 48px rgba(15,163,177,0.28)' }}
          transition={{ type: 'tween' }}
          className="flex flex-col bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#0FA3B1]/25 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ background: '#0FA3B1' }}>
              <Target size={18} className="text-white" />
            </span>
            <span className="font-body uppercase text-xs tracking-[0.18em] font-bold text-[#0FA3B1]">
              Card 1
            </span>
          </div>

          <h3 className="font-display font-bold text-[#0B1F4D] text-2xl mb-2">
            Tráfego Pago Puro
          </h3>
          <p className="font-body text-sm text-[#0B1F4D]/60 mb-6 leading-relaxed">
            Para quem já tem uma base de conteúdo e quer só acelerar a entrada de gente
            qualificada no WhatsApp, sem produção de criativos.
          </p>

          <div className="mb-6 p-4 rounded-2xl" style={{ background: 'rgba(15,163,177,0.08)' }}>
            <p className="font-body text-xs font-bold uppercase tracking-wider text-[#0FA3B1] mb-2">
              O que vamos fazer
            </p>
            <p className="font-body text-xs text-[#0B1F4D]/70 leading-relaxed">
              Criamos e gerenciamos as campanhas no Meta Ads (Instagram e Facebook) usando os
              criativos que a própria loja já produz, segmentando o público certo para a região e
              o perfil de cliente da Q'Sol. Acompanhamos o desempenho diariamente, testamos
              públicos e ajustamos a verba para trazer o máximo de mensagens qualificadas no
              WhatsApp pelo menor custo possível.
            </p>
          </div>

          <Checklist
            items={[
              'Criação e otimização das campanhas no Meta Ads',
              'Segmentação de público e testes de públicos/formatos',
              'Acompanhamento diário e ajuste de verba',
              'Relatório de desempenho e mensagens geradas',
              'Sem divulgação da Flavinha Paulino',
              'Sem criação de criativos/conteúdo',
            ]}
          />

          <div className="mt-auto">
            <p className="font-display font-bold text-[#0B1F4D] text-3xl mb-1">
              R$ 800<span className="text-base font-body font-normal text-[#0B1F4D]/55">/mês</span>
            </p>
            <a
              href="https://wa.me/5585998088064"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-body text-sm font-semibold text-[#0FA3B1] mb-4 hover:underline"
            >
              Falar no WhatsApp sobre este pacote →
            </a>
            <AdsNote />
          </div>
        </motion.div>

        {/* CARD 2 — Autoridade + Influencer */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          whileHover={{ scale: 1.03, y: -6, boxShadow: '0 24px 48px rgba(255,79,110,0.28)' }}
          transition={{ type: 'tween' }}
          className="flex flex-col bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FF4F6E]/25 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ background: '#FF4F6E' }}>
              <Rocket size={18} className="text-white" />
            </span>
            <span className="font-body uppercase text-xs tracking-[0.18em] font-bold text-[#FF4F6E]">
              Card 2
            </span>
          </div>

          <h3 className="font-display font-bold text-[#0B1F4D] text-2xl mb-2">
            Autoridade + Aceleração com Influencer
          </h3>
          <p className="font-body text-sm text-[#0B1F4D]/60 mb-6 leading-relaxed">
            Ideal para acelerar rápido a chegada de mensagens no WhatsApp usando prova social de
            quem já tem audiência e confiança do público.
          </p>

          {/* Flavinha badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4 mb-6 p-3 rounded-2xl"
            style={{ background: 'rgba(255,122,61,0.08)' }}
          >
            <motion.div
              className="relative w-16 h-16 shrink-0 rounded-full p-[3px]"
              style={{ background: 'linear-gradient(135deg, #FF7A3D, #FFC857)', backgroundSize: '200% 200%' }}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <img
                src={fotoFlavinha}
                alt="Flavinha Paulino"
                className="w-full h-full rounded-full object-cover border-2 border-white"
              />
            </motion.div>
            <div>
              <p className="font-body font-bold text-sm text-[#0B1F4D]">Flavinha Paulino</p>
              <p className="font-body text-xs text-[#0B1F4D]/55">Selo de parceria/embaixadora</p>
            </div>
          </motion.div>

          <Checklist
            items={[
              '2 divulgações por mês com a influenciadora Flavinha Paulino',
              'Tráfego pago rodando dentro do próprio perfil da Use Biquínis Q\'Sol, potencializando o alcance das divulgações',
              'Objetivo: ganhar autoridade mais rápido, aumentar o volume de mensagens no WhatsApp e, consequentemente, as vendas',
            ]}
          />

          <div className="mt-auto">
            <p className="font-display font-bold text-[#0B1F4D] text-3xl mb-1">
              R$ 1.500<span className="text-base font-body font-normal text-[#0B1F4D]/55">/mês</span>
            </p>
            <a
              href="https://wa.me/5585998088064"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-body text-sm font-semibold text-[#FF4F6E] mb-4 hover:underline"
            >
              Falar no WhatsApp sobre este pacote →
            </a>
            <AdsNote />
          </div>
        </motion.div>

        {/* CARD 3 — Gestão Completa */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          whileHover={{ scale: 1.03, y: -6, boxShadow: '0 24px 48px rgba(255,200,87,0.35)' }}
          transition={{ type: 'tween' }}
          className="flex flex-col bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFC857]/40 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ background: '#FFC857' }}>
              <Sparkles size={18} className="text-[#0B1F4D]" />
            </span>
            <span className="font-body uppercase text-xs tracking-[0.18em] font-bold text-[#0B1F4D]">
              Card 3
            </span>
          </div>

          <h3 className="font-display font-bold text-[#0B1F4D] text-2xl mb-2">
            Gestão Completa (Conteúdo + Tráfego)
          </h3>
          <p className="font-body text-sm text-[#0B1F4D]/60 mb-6 leading-relaxed">
            A solução mais completa — para quem quer o perfil organizado, produção profissional
            de conteúdo e tráfego pago trabalhando juntos, sem precisar se preocupar com nada disso.
          </p>

          <div className="mb-6 p-3 rounded-2xl" style={{ background: 'rgba(255,200,87,0.14)' }}>
            <p className="font-body text-xs text-[#0B1F4D]/60 leading-relaxed">
              Sem divulgação da Flavinha Paulino neste pacote — é apenas uma composição
              diferente de serviço, não falta nada.
            </p>
          </div>

          <Checklist
            items={[
              'Criação de conteúdo em vídeo e foto para o Instagram',
              'Videomaker presencial — vai até o local gravar',
              'Designer dedicado para organização visual do perfil',
              'Organização completa do perfil (feed, destaques, identidade)',
              'Gestão de tráfego pago incluída',
            ]}
          />

          <div className="mt-auto">
            <p className="font-display font-bold text-[#0B1F4D] text-3xl mb-1">
              R$ 4.000<span className="text-base font-body font-normal text-[#0B1F4D]/55">/mês</span>
            </p>
            <a
              href="https://wa.me/5585998088064"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-body text-sm font-semibold text-[#FF7A3D] mb-4 hover:underline"
            >
              Falar no WhatsApp sobre este pacote →
            </a>
            <AdsNote />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
