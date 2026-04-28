import { motion } from 'framer-motion';

function WaveDivider() {
  return (
    <div style={{ lineHeight: 0, overflow: 'hidden', background: '#0d1117' }}>
      <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
        <path
          d="M0,40 C480,0 960,60 1440,20 L1440,60 L0,60 Z"
          fill="#082347"
        />
      </svg>
    </div>
  );
}

export default function CTA() {
  return (
    <>
      <WaveDivider />
      <section
        id="cta"
        style={{
          background: 'linear-gradient(135deg, #082347 0%, #184892 50%, #082347 100%)',
          backgroundSize: '400% 400%',
          animation: 'ctaGradient 8s ease infinite',
          padding: '100px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(240,241,242,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(240,241,242,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />

        {/* Radial glow center */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(24,72,146,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 640, margin: '0 auto' }}>
          {/* Title with clipPath reveal */}
          <div style={{ overflow: 'hidden', marginBottom: 16 }}>
            <motion.h2
              initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
              whileInView={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: 'clamp(32px, 5vw, 54px)',
                fontWeight: 700,
                color: '#F0F1F2',
                lineHeight: 1.15,
              }}
            >
              Vamos conversar?
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.7 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 18,
              color: 'rgba(240,241,242,0.72)',
              lineHeight: 1.6,
              marginBottom: 48,
            }}
          >
            Apresentamos pessoalmente todos os detalhes. Sem compromisso.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.65, duration: 0.7 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {/* WhatsApp button */}
            <motion.a
              href="https://wa.me/5585998088064"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 36px',
                background: '#25D366',
                color: '#fff',
                borderRadius: 10,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 16,
                textDecoration: 'none',
                boxShadow: '0 8px 40px rgba(37,211,102,0.4)',
                position: 'relative',
              }}
            >
              {/* Pulsing WhatsApp icon */}
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </motion.span>
              Falar pelo WhatsApp
            </motion.a>

            {/* Call button */}
            <motion.a
              href="tel:+5585998088064"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 32px',
                background: 'rgba(240,241,242,0.1)',
                border: '1px solid rgba(240,241,242,0.25)',
                color: '#F0F1F2',
                borderRadius: 10,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 16,
                textDecoration: 'none',
                backdropFilter: 'blur(10px)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .82h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.27a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              Ligar agora
            </motion.a>
          </motion.div>

          {/* Validade */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9 }}
            style={{
              marginTop: 40,
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: 'rgba(240,241,242,0.38)',
              fontStyle: 'italic',
            }}
          >
            Proposta válida por 7 dias a partir da data de apresentação
          </motion.p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0a0b0c',
        borderTop: '1px solid rgba(24,72,146,0.2)',
        padding: '40px 24px',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 20,
            fontWeight: 700,
            color: '#F0F1F2',
            marginBottom: 8,
          }}>
            Traffic Solutions
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: 'rgba(240,241,242,0.38)',
            marginBottom: 16,
            fontStyle: 'italic',
          }}>
            Proposta válida por 7 dias a partir da data de apresentação
          </p>
          <a
            href="https://wa.me/5585998088064"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: '#25D366',
              textDecoration: 'none',
            }}
          >
            +55 85 99808-8064
          </a>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            color: 'rgba(240,241,242,0.25)',
            marginTop: 20,
          }}>
            © 2025 Traffic Solutions. Todos os direitos reservados.
          </p>
        </motion.div>
      </footer>

      <style>{`
        @keyframes ctaGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
}
