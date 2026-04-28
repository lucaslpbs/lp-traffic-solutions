import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 80 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] },
  }),
};

const benefitVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, delay: 0.1 + i * 0.08 },
  }),
};

function WaveDivider({ flip = false }) {
  return (
    <div style={{ lineHeight: 0, overflow: 'hidden', transform: flip ? 'scaleY(-1)' : 'none' }}>
      <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
        <path
          d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
          fill="#161819"
        />
      </svg>
    </div>
  );
}

function ServiceCard({ service, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const logoY = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      whileHover={{
        scale: 1.03,
        y: -6,
        boxShadow: '0 20px 40px rgba(8,35,71,0.45)',
        transition: { duration: 0.3 },
      }}
      style={{
        background: 'rgba(8,35,71,0.45)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(24,72,146,0.32)',
        borderRadius: 20,
        padding: '40px 36px',
        flex: '1 1 340px',
        maxWidth: 560,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow accent */}
      <div style={{
        position: 'absolute',
        top: -60,
        right: -60,
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(24,72,146,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Tool logos with parallax */}
      <motion.div style={{ y: logoY, marginBottom: 28, display: 'flex', gap: 12, alignItems: 'center' }}>
        {service.logos.map((logo, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.15 }}
          >
            {logo}
          </motion.div>
        ))}
      </motion.div>

      <h3 style={{
        fontFamily: '"Playfair Display", serif',
        fontSize: 26,
        fontWeight: 700,
        color: '#F0F1F2',
        marginBottom: 12,
      }}>
        {service.title}
      </h3>

      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 15,
        color: 'rgba(240,241,242,0.68)',
        lineHeight: 1.7,
        marginBottom: 28,
      }}>
        {service.description}
      </p>

      {/* Divider */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, rgba(24,72,146,0.5), transparent)',
        marginBottom: 24,
      }} />

      {/* Benefits */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {service.benefits.map((benefit, i) => (
          <motion.li
            key={i}
            custom={i}
            variants={benefitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              marginBottom: 12,
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: 'rgba(240,241,242,0.82)',
              lineHeight: 1.5,
            }}
          >
            <span style={{ color: '#4ade80', marginTop: 2, flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            {benefit}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

// Logo SVGs inline
const MetaAdsLogo = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '6px 12px',
  }}>
    <svg width="18" height="18" viewBox="0 0 36 36" fill="none">
      <path d="M18 3C9.716 3 3 9.716 3 18s6.716 15 15 15 15-6.716 15-15S26.284 3 18 3z" fill="#1877F2"/>
      <path d="M22.23 16.5h-2.98v-1.95c0-.735.49-.905.835-.905h2.095v-2.65H19.22c-2.935 0-3.6 2.2-3.6 3.6v1.905H13.8v2.75h1.82V26h2.63v-6.75h2.755l.225-2.75z" fill="white"/>
    </svg>
    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(240,241,242,0.8)', fontWeight: 500 }}>Meta Ads</span>
  </div>
);

const InstagramLogo = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '6px 12px',
  }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433"/>
          <stop offset="25%" stopColor="#e6683c"/>
          <stop offset="50%" stopColor="#dc2743"/>
          <stop offset="75%" stopColor="#cc2366"/>
          <stop offset="100%" stopColor="#bc1888"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-grad)"/>
      <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.8" fill="none"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
    </svg>
    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(240,241,242,0.8)', fontWeight: 500 }}>Instagram</span>
  </div>
);

const GoogleAdsLogo = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '6px 12px',
  }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/>
    </svg>
    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(240,241,242,0.8)', fontWeight: 500 }}>Google Ads</span>
  </div>
);

const KommoLogo = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '6px 12px',
  }}>
    <div style={{
      width: 18, height: 18, borderRadius: 4,
      background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 800, color: 'white', fontFamily: 'Inter, sans-serif',
    }}>K</div>
    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(240,241,242,0.8)', fontWeight: 500 }}>Kommo CRM</span>
  </div>
);

const WhatsAppLogo = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '6px 12px',
  }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(240,241,242,0.8)', fontWeight: 500 }}>WhatsApp</span>
  </div>
);

const services = [
  {
    title: 'Tráfego Pago',
    description:
      'Gestão estratégica de anúncios pagos nas principais plataformas digitais para gerar leads qualificados e maximizar o retorno sobre investimento do Piazza Aldeota.',
    logos: [<MetaAdsLogo />, <InstagramLogo />, <GoogleAdsLogo />],
    benefits: [
      'Mais leads qualificados para o empreendimento',
      'Segmentação precisa do público-alvo (perfil do comprador do Piazza Aldeota)',
      'Relatórios claros de desempenho e ROI',
      'Gestão de até R$ 4.000/mês em investimento nas plataformas',
    ],
  },
  {
    title: 'CRM Kommo + Automações',
    description:
      'Implementação e manutenção do CRM Kommo com automações personalizadas para gestão do pipeline de vendas, follow-up automático e organização dos leads gerados pelo tráfego.',
    logos: [<KommoLogo />, <WhatsAppLogo />],
    benefits: [
      'Nenhum lead perdido — todos os contatos organizados e acompanhados',
      'Automações de follow-up que trabalham por você 24h',
      'Visão completa do funil de vendas em tempo real',
      'Integração com WhatsApp para comunicação ágil com leads',
    ],
  },
];

export default function Servicos() {
  return (
    <>
      <WaveDivider />
      <section
        id="servicos"
        style={{
          background: '#161819',
          padding: '80px 24px 100px',
        }}
      >
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#184892',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 12,
          }}>
            O que está incluído
          </p>
          <h2 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(30px, 4vw, 46px)',
            fontWeight: 700,
            color: '#F0F1F2',
            marginBottom: 16,
          }}>
            Serviços da Proposta
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            color: 'rgba(240,241,242,0.6)',
            maxWidth: 520,
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Duas frentes integradas para gerar e nutrir leads com máxima eficiência.
          </p>
        </motion.div>

        {/* Cards */}
        <div style={{
          display: 'flex',
          gap: 28,
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: 1180,
          margin: '0 auto',
        }}>
          {services.map((service, i) => (
            <ServiceCard key={i} service={service} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
