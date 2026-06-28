import { useEffect } from "react";

const PAGE_STYLES = `
  :root{
    --navy-deep: #082347;
    --blue-vivid: #184892;
    --ink: #161819;
    --fog: #F0F1F2;
    --fog-dim: #c9cdd1;
    --blue-glow: #2f6fd6;
    --line: rgba(240,241,242,0.12);
    --green-ok: #4caf7d;
  }

  .eco-page *{margin:0;padding:0;box-sizing:border-box;}
  .eco-page{
    background:var(--ink);
    color:var(--fog);
    font-family:'Inter',sans-serif;
    overflow-x:hidden;
    -webkit-font-smoothing:antialiased;
    min-height:100vh;
  }
  .eco-page ::selection{background:var(--blue-vivid);color:#fff;}
  .eco-page a{color:inherit;text-decoration:none;}
  .eco-page img{max-width:100%;}

  .eco-page .display{
    font-family:'Space Grotesk',sans-serif;
    letter-spacing:-0.02em;
  }
  .eco-page .eyebrow{
    font-family:'Inter',sans-serif;
    font-weight:600;
    letter-spacing:0.28em;
    text-transform:uppercase;
    font-size:0.72rem;
    color:var(--blue-glow);
  }

  .eco-page nav{
    position:fixed;
    top:0;left:0;right:0;
    z-index:100;
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:22px 6vw;
    background:rgba(22,24,25,0.72);
    backdrop-filter:blur(14px);
    border-bottom:1px solid var(--line);
  }
  .eco-page .nav-logo{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.05rem;letter-spacing:-0.01em;display:flex;align-items:center;gap:10px;}
  .eco-page .nav-logo .dot-mark{width:9px;height:9px;border-radius:2px;background:var(--blue-glow);transform:rotate(45deg);}
  .eco-page .nav-links{display:flex;gap:34px;font-size:0.8rem;font-weight:500;color:var(--fog-dim);}
  .eco-page .nav-links a{transition:color .25s;}
  .eco-page .nav-links a:hover{color:var(--fog);}
  .eco-page .nav-cta{
    border:1px solid var(--blue-glow);
    padding:9px 20px;
    border-radius:100px;
    font-size:0.78rem;
    font-weight:600;
    color:var(--fog);
    transition:all .25s;
  }
  .eco-page .nav-cta:hover{background:var(--blue-glow);}
  @media (max-width:820px){.eco-page .nav-links{display:none;}}

  .eco-page section{
    position:relative;
    padding:120px 6vw;
    max-width:1300px;
    margin:0 auto;
  }
  @media (max-width:760px){.eco-page section{padding:90px 6vw;}}

  .eco-page .hero{
    min-height:100vh;
    display:flex;
    align-items:center;
    padding-top:90px;
    position:relative;
  }
  .eco-page .hero-grid{
    display:grid;
    grid-template-columns:1.05fr 0.95fr;
    gap:60px;
    align-items:center;
    width:100%;
  }
  @media (max-width:900px){.eco-page .hero-grid{grid-template-columns:1fr;}}

  .eco-page .doc-meta{
    display:flex;gap:10px;align-items:center;margin-bottom:26px;flex-wrap:wrap;
  }
  .eco-page .doc-tag{
    border:1px solid var(--line);
    padding:7px 14px;
    border-radius:100px;
    font-size:0.74rem;
    font-weight:500;
    color:var(--fog-dim);
  }

  .eco-page .hero h1{
    font-size:clamp(2.3rem,5vw,4.4rem);
    font-weight:700;
    line-height:1.04;
    margin-bottom:24px;
  }
  .eco-page .hero h1 span{color:var(--blue-glow);}
  .eco-page .hero p.lede{
    font-size:1.06rem;
    color:var(--fog-dim);
    max-width:520px;
    line-height:1.7;
  }
  .eco-page .hero-stats{
    display:flex;gap:36px;margin-top:42px;flex-wrap:wrap;
  }
  .eco-page .hero-stat .num{font-family:'Space Grotesk',sans-serif;font-size:2.2rem;font-weight:700;color:#fff;line-height:1;}
  .eco-page .hero-stat .lbl{font-size:0.78rem;color:var(--fog-dim);margin-top:6px;max-width:140px;line-height:1.4;}

  .eco-page .hero-panel{
    background:linear-gradient(160deg, rgba(24,72,146,0.18), rgba(255,255,255,0.02));
    border:1px solid var(--line);
    border-radius:22px;
    padding:36px;
    position:relative;
  }
  .eco-page .hero-panel-title{font-size:0.78rem;color:var(--fog-dim);letter-spacing:0.05em;text-transform:uppercase;margin-bottom:22px;}
  .eco-page .flow-step{
    display:flex;
    gap:16px;
    padding:16px 0;
    border-top:1px solid var(--line);
  }
  .eco-page .flow-step:first-of-type{border-top:none;padding-top:0;}
  .eco-page .flow-step .ic{
    width:38px;height:38px;flex:none;
    border-radius:10px;
    background:rgba(47,111,214,0.18);
    display:flex;align-items:center;justify-content:center;
  }
  .eco-page .flow-step .ic svg{width:18px;height:18px;stroke:var(--blue-glow);}
  .eco-page .flow-step h4{font-size:0.92rem;font-weight:600;margin-bottom:4px;}
  .eco-page .flow-step p{font-size:0.82rem;color:var(--fog-dim);line-height:1.5;}

  .eco-page .sec-head{
    display:flex;
    justify-content:space-between;
    align-items:flex-end;
    margin-bottom:60px;
    gap:30px;
    flex-wrap:wrap;
    border-bottom:1px solid var(--line);
    padding-bottom:28px;
  }
  .eco-page .sec-head h2{
    font-size:clamp(1.9rem,3.4vw,2.8rem);
    font-weight:700;
    margin-top:10px;
  }
  .eco-page .sec-head p{
    max-width:380px;
    color:var(--fog-dim);
    font-size:0.95rem;
    line-height:1.6;
  }

  .eco-page .context-grid{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:24px;
  }
  @media (max-width:900px){.eco-page .context-grid{grid-template-columns:1fr;}}
  .eco-page .context-card{
    border:1px solid var(--line);
    border-radius:18px;
    padding:32px 28px;
    background:rgba(255,255,255,0.015);
  }
  .eco-page .context-card .tag-x{
    display:inline-block;
    font-size:0.7rem;
    font-weight:700;
    color:#d65b5b;
    border:1px solid rgba(214,91,91,0.35);
    background:rgba(214,91,91,0.08);
    padding:4px 10px;
    border-radius:100px;
    margin-bottom:18px;
  }
  .eco-page .context-card h3{font-family:'Space Grotesk',sans-serif;font-size:1.15rem;font-weight:600;margin-bottom:10px;}
  .eco-page .context-card p{color:var(--fog-dim);font-size:0.9rem;line-height:1.6;}

  .eco-page .timeline{position:relative;}
  .eco-page .tl-item{
    display:grid;
    grid-template-columns:90px 1fr;
    gap:30px;
    padding:36px 0;
    border-top:1px solid var(--line);
    position:relative;
  }
  .eco-page .tl-item:first-of-type{border-top:none;}
  @media (max-width:700px){.eco-page .tl-item{grid-template-columns:50px 1fr;}}
  .eco-page .tl-num{
    font-family:'Space Grotesk',sans-serif;
    font-size:0.85rem;
    color:var(--blue-glow);
    font-weight:600;
    letter-spacing:0.05em;
  }
  .eco-page .tl-body h3{font-family:'Space Grotesk',sans-serif;font-size:1.3rem;font-weight:600;margin-bottom:10px;}
  .eco-page .tl-body p{color:var(--fog-dim);font-size:0.94rem;line-height:1.7;max-width:680px;}
  .eco-page .tl-body .tl-chips{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;}
  .eco-page .tl-chip{
    font-size:0.74rem;
    border:1px solid var(--line);
    padding:6px 13px;
    border-radius:100px;
    color:var(--fog-dim);
  }

  .eco-page .funnel-wrap{
    background:linear-gradient(160deg, rgba(24,72,146,0.14), rgba(255,255,255,0.02));
    border:1px solid var(--line);
    border-radius:22px;
    padding:48px 40px;
    margin-top:64px;
  }
  @media (max-width:760px){.eco-page .funnel-wrap{padding:32px 22px;}}
  .eco-page .funnel-title{font-size:0.78rem;color:var(--fog-dim);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:30px;}
  .eco-page .funnel-row{
    display:grid;
    grid-template-columns:1fr auto 1fr auto 1fr;
    align-items:center;
    gap:14px;
  }
  @media (max-width:760px){.eco-page .funnel-row{grid-template-columns:1fr;}.eco-page .funnel-arrow{transform:rotate(90deg);margin:0 auto;}}
  .eco-page .funnel-box{
    border:1px solid var(--line);
    border-radius:14px;
    padding:22px 20px;
    background:rgba(22,24,25,0.5);
  }
  .eco-page .funnel-box .k{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:1rem;margin-bottom:6px;}
  .eco-page .funnel-box .d{font-size:0.82rem;color:var(--fog-dim);line-height:1.5;}
  .eco-page .funnel-arrow{color:var(--blue-glow);font-size:1.4rem;text-align:center;}

  .eco-page .pricing-toggle-note{
    background:rgba(47,111,214,0.1);
    border:1px solid rgba(47,111,214,0.35);
    border-radius:16px;
    padding:22px 26px;
    font-size:0.9rem;
    color:var(--fog-dim);
    margin-bottom:50px;
    display:flex;
    gap:16px;
    align-items:flex-start;
  }
  .eco-page .pricing-toggle-note strong{color:var(--fog);}
  .eco-page .pricing-toggle-note .ic{flex:none;width:22px;height:22px;margin-top:1px;stroke:var(--blue-glow);}

  .eco-page .invest-block{
    border-radius:24px;
    border:1px solid var(--line);
    padding:42px 38px;
    margin-bottom:32px;
  }
  .eco-page .invest-block.platform{background:linear-gradient(160deg, rgba(24,72,146,0.16), rgba(255,255,255,0.02));border-color:rgba(47,111,214,0.4);}
  .eco-page .invest-block.support{background:rgba(255,255,255,0.02);}
  .eco-page .invest-block-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:34px;flex-wrap:wrap;}
  .eco-page .invest-block-head .tag-num{
    display:inline-flex;align-items:center;justify-content:center;
    width:28px;height:28px;border-radius:8px;
    background:var(--blue-glow);color:#fff;
    font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:0.82rem;
    margin-bottom:14px;
  }
  .eco-page .invest-block-head h3{font-family:'Space Grotesk',sans-serif;font-size:1.35rem;font-weight:700;margin-bottom:8px;}
  .eco-page .invest-block-head p{font-size:0.9rem;color:var(--fog-dim);max-width:520px;line-height:1.5;}
  .eco-page .invest-block-head .currency-pill{
    flex:none;
    font-size:0.74rem;font-weight:700;letter-spacing:0.04em;
    padding:7px 16px;border-radius:100px;
    border:1px solid var(--line);color:var(--fog-dim);
  }

  .eco-page .big-numbers{display:grid;grid-template-columns:1fr 1fr;gap:22px;}
  @media (max-width:760px){.eco-page .big-numbers{grid-template-columns:1fr;}}
  .eco-page .big-number-card{
    background:rgba(22,24,25,0.5);
    border:1px solid var(--line);
    border-radius:18px;
    padding:30px 28px;
    position:relative;
  }
  .eco-page .big-number-card.highlight{border-color:rgba(47,111,214,0.55);background:rgba(47,111,214,0.08);}
  .eco-page .big-number-card .bnc-tag{
    position:absolute;top:-12px;right:24px;
    background:var(--blue-glow);color:#fff;
    font-size:0.66rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;
    padding:5px 12px;border-radius:100px;
  }
  .eco-page .big-number-card .bnc-label{font-size:0.78rem;color:var(--fog-dim);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:16px;}
  .eco-page .big-number-card .bnc-value{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:2.6rem;color:#fff;line-height:1;margin-bottom:8px;}
  .eco-page .big-number-card .bnc-value small{font-size:1.1rem;color:var(--fog-dim);font-weight:600;}
  .eco-page .big-number-card .bnc-note{font-size:0.86rem;color:var(--green-ok);font-weight:600;margin-bottom:18px;}
  .eco-page .big-number-card .bnc-foot{font-size:0.84rem;color:var(--fog-dim);border-top:1px solid var(--line);padding-top:14px;}

  .eco-page .simple-table{width:100%;border-collapse:collapse;margin-top:8px;}
  .eco-page .simple-table th{
    text-align:left;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.06em;
    color:var(--fog-dim);font-weight:600;padding:14px 0;border-bottom:1px solid var(--line);
  }
  .eco-page .simple-table td{padding:18px 0;border-bottom:1px solid var(--line);font-size:0.95rem;color:var(--fog-dim);}
  .eco-page .simple-table td:first-child{color:var(--fog);font-weight:500;}
  .eco-page .simple-table td:last-child, .eco-page .simple-table th:last-child{text-align:right;}
  .eco-page .simple-table tr:last-child td{border-bottom:none;}
  .eco-page .simple-table .total-row td{font-weight:700;color:#fff;font-size:1.05rem;}

  .eco-page .conditions-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
  @media (max-width:760px){.eco-page .conditions-grid{grid-template-columns:1fr;}}
  .eco-page .cond-card{border:1px solid var(--line);border-radius:18px;padding:30px 28px;}
  .eco-page .cond-card h4{font-family:'Space Grotesk',sans-serif;font-size:1rem;margin-bottom:14px;}
  .eco-page .cond-card ul{list-style:none;}
  .eco-page .cond-card li{font-size:0.88rem;color:var(--fog-dim);padding:9px 0;border-top:1px solid var(--line);line-height:1.55;}
  .eco-page .cond-card li:first-of-type{border-top:none;padding-top:0;}

  .eco-page .variable-box{
    margin-top:40px;
    border:1px dashed var(--line);
    border-radius:18px;
    padding:30px 32px;
  }
  .eco-page .variable-box h4{font-family:'Space Grotesk',sans-serif;font-size:1.05rem;font-weight:600;margin-bottom:8px;}
  .eco-page .variable-box p{font-size:0.88rem;color:var(--fog-dim);line-height:1.6;margin-bottom:20px;max-width:680px;}
  .eco-page .var-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;}
  @media (max-width:700px){.eco-page .var-grid{grid-template-columns:1fr;}}
  .eco-page .var-item{
    border:1px solid var(--line);
    border-radius:14px;
    padding:18px 20px;
    display:flex;justify-content:space-between;align-items:center;
    gap:12px;
  }
  .eco-page .var-item .vt{font-size:0.88rem;color:var(--fog);font-weight:500;}
  .eco-page .var-item .vt small{display:block;color:var(--fog-dim);font-size:0.76rem;margin-top:3px;font-weight:400;}
  .eco-page .var-item .vv{font-family:'Space Grotesk',sans-serif;font-weight:700;color:var(--blue-glow);white-space:nowrap;}

  .eco-page .breakdown{
    margin-top:64px;
    border:1px solid var(--line);
    border-radius:22px;
    overflow:hidden;
  }
  .eco-page .breakdown-head{
    padding:30px 34px;
    border-bottom:1px solid var(--line);
    display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;
  }
  .eco-page .breakdown-head h3{font-family:'Space Grotesk',sans-serif;font-size:1.2rem;font-weight:600;}
  .eco-page .breakdown-head span{font-size:0.82rem;color:var(--fog-dim);}

  .eco-page .cta-section{
    background:linear-gradient(160deg, var(--navy-deep), var(--ink) 75%);
    border-radius:32px;
    margin:0 6vw 0;
    max-width:none;
    width:auto;
    padding:90px 6vw;
    text-align:center;
  }
  .eco-page .cta-section h2{font-size:clamp(1.9rem,4vw,3rem);font-weight:700;margin-bottom:18px;}
  .eco-page .cta-section p{color:var(--fog-dim);max-width:520px;margin:0 auto 36px;font-size:1rem;line-height:1.6;}
  .eco-page .cta-btn{
    display:inline-block;
    background:var(--blue-glow);
    color:#fff;
    padding:16px 36px;
    border-radius:100px;
    font-weight:600;
    font-size:0.95rem;
    transition:all .25s;
  }
  .eco-page .cta-btn:hover{background:var(--blue-vivid);transform:translateY(-2px);}

  .eco-page footer{
    border-top:1px solid var(--line);
    padding:46px 6vw;
    display:flex;
    justify-content:space-between;
    align-items:center;
    font-size:0.82rem;
    color:var(--fog-dim);
    flex-wrap:wrap;
    gap:14px;
    max-width:1300px;
    margin:0 auto;
  }

  .eco-page a:focus-visible, .eco-page button:focus-visible{outline:2px solid var(--blue-glow);outline-offset:3px;}

  .eco-page .reveal{opacity:0;transform:translateY(26px);transition:opacity .7s ease, transform .7s ease;}
  .eco-page .reveal.in{opacity:1;transform:translateY(0);}

  @media (prefers-reduced-motion: reduce){
    .eco-page .reveal{opacity:1;transform:none;transition:none;}
  }
`;

export default function OrcamentoEscolaCearenceOftalmologia() {
  useEffect(() => {
    document.title = "Traffic Solutions — Proposta para Escola Cearense de Oftalmologia";

    const link1 = document.createElement("link");
    link1.rel = "preconnect";
    link1.href = "https://fonts.googleapis.com";
    document.head.appendChild(link1);

    const link2 = document.createElement("link");
    link2.rel = "preconnect";
    link2.href = "https://fonts.gstatic.com";
    link2.crossOrigin = "anonymous";
    document.head.appendChild(link2);

    const link3 = document.createElement("link");
    link3.rel = "stylesheet";
    link3.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link3);

    const style = document.createElement("style");
    style.textContent = PAGE_STYLES;
    document.head.appendChild(style);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".eco-page .reveal").forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      document.head.removeChild(link1);
      document.head.removeChild(link2);
      document.head.removeChild(link3);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="eco-page">
      <nav>
        <div className="nav-logo">
          <span className="dot-mark"></span>Traffic Solutions
        </div>
        <div className="nav-links">
          <a href="#contexto">Diagnóstico</a>
          <a href="#funcionamento">Como funciona</a>
          <a href="#implementacao">Implementação</a>
          <a href="#investimento">Investimento</a>
          <a href="#condicoes">Condições</a>
        </div>
        <a href="#investimento" className="nav-cta">Ver investimento</a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="doc-meta">
              <span className="doc-tag">Proposta comercial</span>
              <span className="doc-tag">Escola Cearense de Oftalmologia</span>
            </div>
            <h1 className="display">
              Sua clínica não perde mais <span>consulta nem retorno</span> por falta de follow-up.
            </h1>
            <p className="lede">
              Proposta para a Escola Cearense de Oftalmologia: conectamos seu agendamento a um CRM com
              automação de WhatsApp oficial (Meta), para confirmar consultas, reduzir faltas e reativar
              pacientes da base de forma organizada, mensurável e dentro das regras da plataforma.
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="num">3</div>
                <div className="lbl">usuários incluídos na simulação desta proposta</div>
              </div>
              <div className="hero-stat">
                <div className="num">6 ou 12</div>
                <div className="lbl">meses de plataforma, à sua escolha</div>
              </div>
              <div className="hero-stat">
                <div className="num">+1</div>
                <div className="lbl">mês de bônus em tempo de CRM, em qualquer plano à vista</div>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-panel-title">O que muda na rotina da clínica</div>

            <div className="flow-step">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                </svg>
              </div>
              <div>
                <h4>Confirmação automática de consulta</h4>
                <p>O paciente recebe e confirma pelo WhatsApp oficial, sem ligação manual da recepção.</p>
              </div>
            </div>
            <div className="flow-step">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <div>
                <h4>Histórico centralizado no CRM</h4>
                <p>Cada conversa, consulta e retorno fica registrado por paciente — não em celular pessoal.</p>
              </div>
            </div>
            <div className="flow-step">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18M18.7 8 13 13.7l-3-3L4 16.7" />
                </svg>
              </div>
              <div>
                <h4>Reativação da carteira de pacientes</h4>
                <p>Campanhas de retorno (revisão anual, troca de lente, pós-cirúrgico) disparadas por critério, não na mão.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEXTO / DIAGNÓSTICO */}
      <section id="contexto">
        <div className="sec-head reveal">
          <div>
            <div className="eyebrow">Diagnóstico</div>
            <h2 className="display">O problema não é a clínica. É o canal solto.</h2>
          </div>
          <p>O que normalmente acontece quando a confirmação e a reativação dependem de WhatsApp pessoal e planilha.</p>
        </div>

        <div className="context-grid">
          <div className="context-card reveal">
            <span className="tag-x">Sem confirmação</span>
            <h3>Faltas e remarcações de última hora</h3>
            <p>Sem lembrete automático, a recepção perde tempo ligando — e ainda assim parte da agenda fura.</p>
          </div>
          <div className="context-card reveal" style={{ transitionDelay: ".08s" }}>
            <span className="tag-x">Sem histórico</span>
            <h3>Paciente "some" depois da primeira consulta</h3>
            <p>Sem rotina de reativação, exames de revisão e retornos pós-cirúrgicos ficam só na boa vontade do paciente.</p>
          </div>
          <div className="context-card reveal" style={{ transitionDelay: ".16s" }}>
            <span className="tag-x">Sem rastreio</span>
            <h3>Número pessoal misturado com a clínica</h3>
            <p>Conversa importante se perde no WhatsApp de alguém da equipe, sem padrão e sem possibilidade de auditoria.</p>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="funcionamento">
        <div className="sec-head reveal">
          <div>
            <div className="eyebrow">Como funciona</div>
            <h2 className="display">Três peças, um fluxo só</h2>
          </div>
          <p>CRM, WhatsApp oficial da Meta e a operação da Traffic Solutions trabalhando juntos.</p>
        </div>

        <div className="timeline">
          <div className="tl-item reveal">
            <div className="tl-num">01</div>
            <div className="tl-body">
              <h3>Integração com o Amigo (agendamento que vocês já usam)</h3>
              <p>O Amigo continua sendo o sistema de agendamento da clínica — nada muda na rotina de marcar consulta. A integração faz o CRM "ouvir" o Amigo: quando uma consulta é agendada ou alterada, o CRM já sabe e dispara a confirmação pelo WhatsApp automaticamente, sem digitação manual da recepção.</p>
              <div className="tl-chips">
                <span className="tl-chip">Sem trocar o Amigo</span>
                <span className="tl-chip">Sincronização automática</span>
                <span className="tl-chip">Confirmação sem intervenção manual</span>
              </div>
            </div>
          </div>
          <div className="tl-item reveal">
            <div className="tl-num">02</div>
            <div className="tl-body">
              <h3>CRM como centro da operação</h3>
              <p>Cada paciente, cada consulta e cada conversa do WhatsApp ficam dentro do CRM — não espalhados entre celulares e planilhas. A equipe enxerga o status de cada paciente em um lugar só.</p>
              <div className="tl-chips">
                <span className="tl-chip">Histórico do paciente</span>
                <span className="tl-chip">Funil de retorno</span>
                <span className="tl-chip">Dashboard para gestores</span>
              </div>
            </div>
          </div>
          <div className="tl-item reveal">
            <div className="tl-num">03</div>
            <div className="tl-body">
              <h3>WhatsApp oficial da Meta (não é WhatsApp comum)</h3>
              <p>As mensagens saem por uma linha homologada pela Meta, com número verificado da clínica. Isso garante entrega, evita bloqueio por uso comercial em número pessoal e mantém o atendimento dentro das regras da plataforma para empresas.</p>
              <div className="tl-chips">
                <span className="tl-chip">Mensagem de utilidade</span>
                <span className="tl-chip">Mensagem de marketing</span>
                <span className="tl-chip">Número verificado</span>
              </div>
            </div>
          </div>
          <div className="tl-item reveal">
            <div className="tl-num">04</div>
            <div className="tl-body">
              <h3>Implementação e suporte contínuo da Traffic Solutions</h3>
              <p>Configuramos o CRM, conectamos o Amigo e a linha oficial, montamos os fluxos de confirmação e reativação, treinamos a equipe e acompanhamos o uso mês a mês — ajustando mensagens, horários e critérios de disparo conforme o resultado real da clínica.</p>
              <div className="tl-chips">
                <span className="tl-chip">Configuração inicial</span>
                <span className="tl-chip">Treinamento da equipe</span>
                <span className="tl-chip">Acompanhamento mensal</span>
              </div>
            </div>
          </div>
        </div>

        <div className="funnel-wrap reveal">
          <div className="funnel-title">Os dois tipos de mensagem que a clínica vai usar</div>
          <div className="funnel-row">
            <div className="funnel-box">
              <div className="k">Mensagem de utilidade</div>
              <div className="d">Confirmação de consulta, lembrete de horário, aviso operacional. Tarifa mais baixa por ser comunicação esperada pelo paciente.</div>
            </div>
            <div className="funnel-arrow">→</div>
            <div className="funnel-box">
              <div className="k">CRM dispara no momento certo</div>
              <div className="d">Regras automáticas decidem quando confirmar, quando reativar e quando é a equipe que precisa entrar na conversa.</div>
            </div>
            <div className="funnel-arrow">→</div>
            <div className="funnel-box">
              <div className="k">Mensagem de marketing</div>
              <div className="d">Reativação de carteira: revisão anual, campanha de exame, retorno de pacientes inativos. Tarifa de campanha, não de transação.</div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPLEMENTAÇÃO */}
      <section id="implementacao">
        <div className="sec-head reveal">
          <div>
            <div className="eyebrow">Implementação</div>
            <h2 className="display">O que a Traffic Solutions entrega</h2>
          </div>
          <p>Tudo incluso no valor de suporte e implementação — sem etapa extra cobrada separadamente.</p>
        </div>

        <div className="conditions-grid">
          <div className="cond-card reveal">
            <h4 className="display">Configuração da operação</h4>
            <ul>
              <li>Integração do CRM com o Amigo (sistema de agendamento já usado pela clínica)</li>
              <li>Criação e verificação da linha oficial de WhatsApp da clínica junto à Meta</li>
              <li>Configuração do CRM com cadastro de pacientes, agenda e funil de atendimento</li>
              <li>Montagem dos fluxos automáticos de confirmação de consulta</li>
              <li>Montagem das campanhas de reativação de carteira (revisão, pós-cirúrgico, exames)</li>
              <li>Dashboard de análise comercial do Kommo, para os gestores acompanharem os números</li>
            </ul>
          </div>
          <div className="cond-card reveal" style={{ transitionDelay: ".08s" }}>
            <h4 className="display">Suporte contínuo, mês a mês</h4>
            <ul>
              <li>Treinamento da equipe da recepção e atendimento no uso do CRM</li>
              <li>Ajuste de mensagens, horários de disparo e critérios de reativação</li>
              <li>Acompanhamento de métricas: confirmações, faltas evitadas, retornos reativados</li>
              <li>Manutenção e leitura do dashboard comercial junto aos gestores</li>
              <li>Suporte direto para dúvidas operacionais do dia a dia</li>
            </ul>
          </div>
        </div>
      </section>

      {/* INVESTIMENTO */}
      <section id="investimento">
        <div className="sec-head reveal">
          <div>
            <div className="eyebrow">Investimento</div>
            <h2 className="display">Dois contratos, dois valores</h2>
          </div>
          <p>A plataforma (CRM) e o suporte da Traffic Solutions são cobrados separadamente. Os números abaixo já são os totais — sem precisar calcular nada.</p>
        </div>

        <div className="pricing-toggle-note reveal">
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <div>
            <strong>Resumo:</strong> a clínica recebe duas cobranças independentes. Uma em <strong>dólar</strong>, para a plataforma (CRM), paga uma única vez no início do período escolhido. Outra em <strong>real</strong>, fixa, todo mês, para o suporte e implementação da Traffic Solutions.
          </div>
        </div>

        {/* BLOCO 1: PLATAFORMA */}
        <div className="invest-block platform reveal">
          <div className="invest-block-head">
            <div>
              <div className="tag-num">1</div>
              <h3 className="display">Plataforma (CRM Kommo)</h3>
              <p>3 usuários · pagamento único, à vista, no Pix · cobrado em dólar</p>
            </div>
            <span className="currency-pill">Cobrança em US$</span>
          </div>

          <div className="big-numbers">
            <div className="big-number-card">
              <div className="bnc-label">Plano de 6 meses</div>
              <div className="bnc-value">US$ 450 <small>à vista</small></div>
              <div className="bnc-note">Acesso liberado por 7 meses</div>
              <div className="bnc-foot">≈ R$ 2.327 na cotação atual (referência)</div>
            </div>
            <div className="big-number-card highlight">
              <span className="bnc-tag">Melhor valor por mês</span>
              <div className="bnc-label">Plano de 12 meses</div>
              <div className="bnc-value">US$ 750 <small>à vista</small></div>
              <div className="bnc-note">Acesso liberado por 13 meses</div>
              <div className="bnc-foot">≈ R$ 3.878 na cotação atual (referência)</div>
            </div>
          </div>
        </div>

        {/* BLOCO 2: SUPORTE */}
        <div className="invest-block support reveal" style={{ transitionDelay: ".08s" }}>
          <div className="invest-block-head">
            <div>
              <div className="tag-num">2</div>
              <h3 className="display">Suporte e implementação Traffic Solutions</h3>
              <p>Valor fixo mensal, em reais, independente do plano de plataforma escolhido</p>
            </div>
            <span className="currency-pill">Cobrança em R$</span>
          </div>

          <div className="big-numbers" style={{ gridTemplateColumns: "1fr", maxWidth: "340px" }}>
            <div className="big-number-card">
              <div className="bnc-label">Mensalidade</div>
              <div className="bnc-value">R$ 1.500 <small>/ mês</small></div>
              <div className="bnc-note">Inclui dashboard comercial e suporte contínuo</div>
              <div className="bnc-foot">Sem variação cambial, sem desconto por antecipação</div>
            </div>
          </div>
        </div>

        {/* TABELA DE APOIO */}
        <div className="breakdown reveal" style={{ marginTop: "48px" }}>
          <div className="breakdown-head">
            <h3 className="display">Resumo para conferência</h3>
            <span>Cotação de referência usada: US$ 1 ≈ R$ 5,17</span>
          </div>
          <div style={{ padding: "8px 34px 30px" }}>
            <table className="simple-table">
              <thead>
                <tr>
                  <th>O que é</th>
                  <th>Cobrança</th>
                  <th>Valor total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Plataforma (CRM) — plano 6 meses</td>
                  <td>Única, em dólar, no início</td>
                  <td>US$ 450</td>
                </tr>
                <tr>
                  <td>Plataforma (CRM) — plano 12 meses</td>
                  <td>Única, em dólar, no início</td>
                  <td>US$ 750</td>
                </tr>
                <tr className="total-row">
                  <td>Suporte e implementação</td>
                  <td>Mensal, em real</td>
                  <td>R$ 1.500 / mês</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CUSTO VARIÁVEL */}
        <div className="variable-box reveal">
          <h4 className="display">Custo variável de mensagens (fora dos dois valores acima)</h4>
          <p>Cobrado separadamente pela Meta, conforme o volume real de mensagens enviadas no mês. Não está incluído nem na plataforma, nem no suporte — é informado aqui como referência para a clínica estimar o uso.</p>
          <div className="var-grid">
            <div className="var-item">
              <div className="vt">
                Mensagem de utilidade
                <small>Confirmação de consulta, lembretes</small>
              </div>
              <div className="vv">R$ 0,03 / msg</div>
            </div>
            <div className="var-item">
              <div className="vt">
                Mensagem de marketing
                <small>Reativação de carteira de pacientes</small>
              </div>
              <div className="vv">R$ 0,35 / msg</div>
            </div>
          </div>
        </div>
      </section>

      {/* CONDIÇÕES */}
      <section id="condicoes">
        <div className="sec-head reveal">
          <div>
            <div className="eyebrow">Condições</div>
            <h2 className="display">Letra clara, sem pegadinha</h2>
          </div>
          <p>O que vale para a plataforma e o que vale para o suporte — são regras independentes.</p>
        </div>

        <div className="conditions-grid">
          <div className="cond-card reveal">
            <h4 className="display">Plataforma (CRM Kommo)</h4>
            <ul>
              <li>Cobrada direto em dólar, no plano escolhido (6 ou 12 meses)</li>
              <li>Pagamento via Pix à vista, sempre antecipado</li>
              <li>Plano de 6 meses: paga 6, usa 7 (1 mês de bônus em tempo)</li>
              <li>Plano de 12 meses: preço de tabela US$ 900, paga US$ 750, usa 13 meses</li>
              <li>Valor em reais varia com a cotação do dólar no dia do pagamento</li>
            </ul>
          </div>
          <div className="cond-card reveal" style={{ transitionDelay: ".08s" }}>
            <h4 className="display">Suporte e implementação</h4>
            <ul>
              <li>Valor fixo de R$ 1.500/mês, sem variação cambial</li>
              <li>Não depende do plano de CRM escolhido (6 ou 12 meses)</li>
              <li>Sem desconto por antecipação — cobrado mês a mês mesmo se o CRM for pago à vista</li>
              <li>Mensagens de utilidade e marketing são cobradas por uso, fora dos dois valores acima</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contato">
        <div className="cta-section reveal">
          <h2 className="display">Vamos colocar a Escola Cearense de Oftalmologia nesse fluxo?</h2>
          <p>Definindo o plano de plataforma (6 ou 12 meses) e a forma de pagamento, já entramos na fase de configuração da linha oficial e do CRM.</p>
          <a href="#" className="cta-btn">Falar com a Traffic Solutions</a>
        </div>
      </section>

      <footer>
        <div>Traffic Solutions — Proposta para Escola Cearense de Oftalmologia · 2026</div>
        <div>Marketing que gera resultados.</div>
      </footer>
    </div>
  );
}
