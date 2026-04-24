import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function useCountUp(target, isVisible, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, target, duration]);
  return count;
}

function StrikeThrough({ children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ color: 'rgba(240,241,242,0.4)', fontSize: 14 }}>{children}</span>
      <motion.span
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        style={{
          position: 'absolute',
          left: 0, right: 0,
          top: '50%',
          height: 2,
          background: '#ef4444',
          transformOrigin: 'left',
          borderRadius: 999,
        }}
      />
    </span>
  );
}

function CounterValue({ value, prefix = 'R$ ', suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useCountUp(value, isInView);
  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('pt-BR')}{suffix}
    </span>
  );
}

function WaveDivider({ color = '#161819', bg = '#0d1117' }) {
  return (
    <div style={{ lineHeight: 0, overflow: 'hidden', background: bg }}>
      <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
        <path
          d="M0,20 C360,60 1080,0 1440,40 L1440,60 L0,60 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}

const checkIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function Precificacao() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <>
      <WaveDivider color="#0d1117" bg="#161819" />
      <section
        ref={sectionRef}
        id="precificacao"
        style={{
          background: '#0d1117',
          padding: '80px 24px 100px',
        }}
      >
        {/* Header */}
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
            Investimento
          </p>
          <h2 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(30px, 4vw, 46px)',
            fontWeight: 700,
            color: '#F0F1F2',
            marginBottom: 16,
          }}>
            Proposta Financeira
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            color: 'rgba(240,241,242,0.6)',
            maxWidth: 520,
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Transparência total no investimento, com máxima entrega de valor.
          </p>
        </motion.div>

        {/* Cards */}
        <div style={{
          display: 'flex',
          gap: 24,
          justifyContent: 'center',
          alignItems: 'stretch',
          flexWrap: 'wrap',
          maxWidth: 1100,
          margin: '0 auto 40px',
        }}>

          {/* Card 1: Setup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0 }}
            whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.25 } }}
            style={{
              flex: '1 1 280px',
              maxWidth: 320,
              background: 'rgba(8,35,71,0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(24,72,146,0.3)',
              borderRadius: 20,
              padding: '36px 28px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              color: 'rgba(240,241,242,0.5)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              Etapa Inicial
            </div>
            <h3 style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 22,
              fontWeight: 700,
              color: '#F0F1F2',
              marginBottom: 24,
            }}>
              Setup Inicial
            </h3>

            <div style={{ flex: 1 }}>
              {/* Item 1 */}
              <div style={{
                marginBottom: 20,
                paddingBottom: 20,
                borderBottom: '1px solid rgba(240,241,242,0.08)',
              }}>
                <div style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  color: 'rgba(240,241,242,0.7)',
                  marginBottom: 6,
                }}>
                  Setup completo do CRM Kommo
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StrikeThrough>R$ 1.000</StrikeThrough>
                  <motion.span
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      background: 'rgba(74,222,128,0.15)',
                      border: '1px solid rgba(74,222,128,0.4)',
                      color: '#4ade80',
                      borderRadius: 6,
                      padding: '2px 10px',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    GRÁTIS
                  </motion.span>
                </div>
              </div>

              {/* Item 2 */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  color: 'rgba(240,241,242,0.7)',
                  marginBottom: 6,
                }}>
                  Configuração de automações iniciais
                </div>
                <motion.span
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  style={{
                    background: 'rgba(74,222,128,0.15)',
                    border: '1px solid rgba(74,222,128,0.4)',
                    color: '#4ade80',
                    borderRadius: 6,
                    padding: '2px 10px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: 13,
                    display: 'inline-block',
                  }}
                >
                  INCLUSO
                </motion.span>
              </div>
            </div>

            <div style={{
              marginTop: 24,
              padding: '16px',
              background: 'rgba(74,222,128,0.08)',
              borderRadius: 10,
              border: '1px solid rgba(74,222,128,0.2)',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                color: '#4ade80',
                fontWeight: 600,
              }}>
                Economia imediata de R$ 1.000
              </div>
            </div>
          </motion.div>

          {/* Card 2: Mensal — DESTAQUE */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            whileHover={{ scale: 1.02, y: -6, transition: { duration: 0.25 } }}
            style={{
              flex: '1 1 320px',
              maxWidth: 380,
              position: 'relative',
              borderRadius: 22,
              padding: 3,
              background: 'linear-gradient(135deg, #184892 0%, #082347 50%, #184892 100%)',
              backgroundSize: '300% 300%',
              animation: 'rotateBorder 4s linear infinite',
              zIndex: 2,
              alignSelf: 'center',
            }}
          >
            <div style={{
              background: '#0d1117',
              borderRadius: 20,
              padding: '40px 32px',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Glow */}
              <div style={{
                position: 'absolute',
                top: -80, left: -80,
                width: 220, height: 220,
                background: 'radial-gradient(circle, rgba(24,72,146,0.2) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                color: '#184892',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 8,
              }}>
                Recorrente
              </div>
              <h3 style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: 24,
                fontWeight: 700,
                color: '#F0F1F2',
                marginBottom: 28,
              }}>
                Serviços Mensais
              </h3>

              {/* Line items */}
              {[
                { label: 'Gestão de Tráfego Pago', value: 1000, note: 'Inclui até R$ 4.000/mês em investimento nas plataformas', old: null },
                { label: 'Manutenção do CRM Kommo', value: 0, old: 500 },
                { label: 'Manutenção das Automações', value: 0, old: 500 },
              ].map((item, i) => (
                <div key={i} style={{
                  marginBottom: 18,
                  paddingBottom: 18,
                  borderBottom: i < 2 ? '1px solid rgba(240,241,242,0.06)' : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 14,
                      color: 'rgba(240,241,242,0.75)',
                      flex: 1,
                    }}>
                      {item.label}
                    </span>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {item.old && (
                        <div style={{ marginBottom: 2 }}>
                          <StrikeThrough>R$ {item.old}/mês</StrikeThrough>
                        </div>
                      )}
                      {item.value > 0 ? (
                        <span style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 15,
                          fontWeight: 700,
                          color: '#F0F1F2',
                        }}>
                          R$ {item.value.toLocaleString('pt-BR')}/mês
                        </span>
                      ) : (
                        <motion.span
                          animate={{ scale: [1, 1.06, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                          style={{
                            background: 'rgba(74,222,128,0.15)',
                            border: '1px solid rgba(74,222,128,0.4)',
                            color: '#4ade80',
                            borderRadius: 6,
                            padding: '2px 10px',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          R$ 0
                        </motion.span>
                      )}
                    </div>
                  </div>
                  {item.note && (
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 11,
                      color: 'rgba(240,241,242,0.4)',
                      marginTop: 4,
                      fontStyle: 'italic',
                    }}>
                      {item.note}
                    </p>
                  )}
                </div>
              ))}

              {/* Total */}
              <div style={{
                marginTop: 8,
                padding: '20px 16px',
                background: 'linear-gradient(135deg, rgba(8,35,71,0.8), rgba(24,72,146,0.4))',
                borderRadius: 12,
                border: '1px solid rgba(24,72,146,0.4)',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  color: 'rgba(240,241,242,0.5)',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>
                  Total mensal
                </div>
                <div style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: 38,
                  fontWeight: 700,
                  color: '#F0F1F2',
                  lineHeight: 1,
                }}>
                  {isInView ? <CounterValue value={1000} prefix="R$ " suffix="/mês" /> : 'R$ 0/mês'}
                </div>
                <div style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  color: '#4ade80',
                  marginTop: 8,
                  fontWeight: 500,
                }}>
                  Economia de R$ 1.000/mês nos serviços de CRM
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Inclusos */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.25 } }}
            style={{
              flex: '1 1 280px',
              maxWidth: 320,
              background: 'rgba(8,35,71,0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(24,72,146,0.3)',
              borderRadius: 20,
              padding: '36px 28px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              color: 'rgba(240,241,242,0.5)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              Sem custo adicional
            </div>
            <h3 style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 22,
              fontWeight: 700,
              color: '#F0F1F2',
              marginBottom: 8,
            }}>
              O que está INCLUSO
            </h3>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: 'rgba(240,241,242,0.45)',
              marginBottom: 24,
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}>
              Porque acreditamos na parceria de longo prazo
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
              {[
                'Setup completo do CRM Kommo',
                'Configuração de automações iniciais',
                'Manutenção mensal do CRM Kommo',
                'Manutenção das automações',
                'Integração com WhatsApp Business',
                'Suporte contínuo via WhatsApp',
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    marginBottom: 14,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14,
                    color: 'rgba(240,241,242,0.8)',
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ flexShrink: 0, marginTop: 1 }}>{checkIcon}</span>
                  {item}
                </motion.li>
              ))}
            </ul>

            <div style={{
              marginTop: 20,
              padding: '14px 16px',
              background: 'rgba(74,222,128,0.06)',
              border: '1px solid rgba(74,222,128,0.15)',
              borderRadius: 10,
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 20,
                fontWeight: 800,
                color: '#4ade80',
              }}>
                R$ 0 adicional
              </div>
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                color: 'rgba(240,241,242,0.45)',
                marginTop: 2,
              }}>
                em todos esses serviços
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footnote */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: 'rgba(240,241,242,0.38)',
            textAlign: 'center',
            maxWidth: 600,
            margin: '0 auto',
            lineHeight: 1.6,
            fontStyle: 'italic',
          }}
        >
          * Investimento nas plataformas (Meta Ads + Google Ads) é pago diretamente pelo cliente, com gestão da Traffic Solutions. Limite de R$ 4.000/mês combinados.
        </motion.p>
      </section>

      <style>{`
        @keyframes rotateBorder {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
}
