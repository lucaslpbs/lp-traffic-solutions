import { motion } from 'framer-motion';
import logoTraffic from '../assets/logo-traffic.png';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18, delayChildren: 0.2 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const shimmerVariants = {
  animate: {
    backgroundPosition: ['200% center', '-200% center'],
    transition: { duration: 3, repeat: Infinity, ease: 'linear' },
  },
};

export default function Hero() {
  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#082347',
      }}
    >
      {/* Animated gradient background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #082347 0%, #184892 50%, #082347 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 8s ease infinite',
          zIndex: 0,
        }}
      />

      {/* Subtle grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(240,241,242,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(240,241,242,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          zIndex: 1,
        }}
      />

      {/* Logo Traffic Solutions — top left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        style={{
          position: 'absolute',
          top: 32,
          left: 40,
          zIndex: 10,
        }}
      >
        <img
          src={logoTraffic}
          alt="Traffic Solutions"
          style={{ height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
        />
      </motion.div>

      {/* Badge shimmer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        style={{ position: 'relative', zIndex: 10, marginBottom: 28 }}
      >
        <motion.span
          animate={shimmerVariants.animate}
          style={{
            display: 'inline-block',
            padding: '6px 20px',
            borderRadius: 999,
            border: '1px solid rgba(240,241,242,0.25)',
            background:
              'linear-gradient(90deg, rgba(240,241,242,0.08) 0%, rgba(240,241,242,0.22) 40%, rgba(240,241,242,0.08) 100%)',
            backgroundSize: '200% auto',
            color: '#F0F1F2',
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          Proposta Exclusiva
        </motion.span>
      </motion.div>

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: 820,
        }}
      >
        <motion.p
          variants={fadeInUp}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: 'rgba(240,241,242,0.65)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 16,
            fontWeight: 400,
          }}
        >
          Proposta Comercial preparada para
        </motion.p>

        <motion.h1
          variants={fadeInUp}
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(42px, 7vw, 80px)',
            fontWeight: 700,
            color: '#F0F1F2',
            lineHeight: 1.1,
            marginBottom: 12,
            textShadow: '0 4px 40px rgba(8,35,71,0.5)',
          }}
        >
          Piazza Aldeota
        </motion.h1>

        <motion.div
          variants={fadeInUp}
          style={{
            width: 64,
            height: 3,
            background: 'linear-gradient(90deg, #184892, #F0F1F2)',
            borderRadius: 999,
            margin: '0 auto 28px',
          }}
        />

        <motion.p
          variants={fadeInUp}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(16px, 2.2vw, 20px)',
            color: 'rgba(240,241,242,0.78)',
            lineHeight: 1.7,
            maxWidth: 600,
            margin: '0 auto 40px',
            fontWeight: 300,
          }}
        >
          Estratégia completa de Marketing Digital para acelerar as vendas do empreendimento com tráfego qualificado e gestão de CRM integrada.
        </motion.p>

        <motion.div variants={fadeInUp} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.a
            href="https://wa.me/5585998088064"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 32px',
              background: '#25D366',
              color: '#fff',
              borderRadius: 8,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(37,211,102,0.3)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Falar pelo WhatsApp
          </motion.a>
          <motion.a
            href="#servicos"
            onClick={(e) => { e.preventDefault(); document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' }); }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 32px',
              background: 'rgba(240,241,242,0.08)',
              border: '1px solid rgba(240,241,242,0.25)',
              color: '#F0F1F2',
              borderRadius: 8,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 15,
              textDecoration: 'none',
              backdropFilter: 'blur(12px)',
            }}
          >
            Ver proposta completa
          </motion.a>
        </motion.div>

        {/* Validade */}
        <motion.p
          variants={fadeInUp}
          style={{
            marginTop: 36,
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: 'rgba(240,241,242,0.45)',
            letterSpacing: '0.05em',
          }}
        >
          Proposta válida por 7 dias a partir da data de apresentação
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: 36,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          cursor: 'pointer',
        }}
        onClick={() => document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(240,241,242,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </motion.div>

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  );
}
