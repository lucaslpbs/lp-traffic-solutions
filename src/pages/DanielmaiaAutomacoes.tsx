import { useEffect } from 'react';

const PAGE_CSS = `
:root {
  --black: #0e0e0f;
  --white: #f8f6f1;
  --ink: #1a1a1b;
  --muted: #6b6a65;
  --border: #e2dfd8;
  --accent: #c8622a;
  --accent-light: #f5ece5;
  --accent-dark: #9e4a1c;
  --teal: #1d6e5e;
  --teal-light: #e1f0ec;
  --blue: #1e4a82;
  --blue-light: #e8f0fb;
  --amber: #a06820;
  --amber-light: #fdf3e3;
  --surface: #ffffff;
  --surface2: #f3f1ec;
  --serif: 'DM Serif Display', Georgia, serif;
  --sans: 'DM Sans', system-ui, sans-serif;
  --radius: 12px;
  --radius-sm: 6px;
}

#danielmaia-page *, #danielmaia-page *::before, #danielmaia-page *::after { box-sizing: border-box; margin: 0; padding: 0; }
#danielmaia-page { font-family: var(--sans); background: var(--white); color: var(--ink); line-height: 1.6; font-size: 16px; overflow-x: hidden; }

/* NAV */
#danielmaia-page nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(248, 246, 241, 0.92); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border); padding: 0 2rem; height: 56px;
  display: flex; align-items: center; justify-content: space-between;
}
#danielmaia-page .nav-logo { font-family: var(--serif); font-size: 17px; color: var(--ink); letter-spacing: -0.01em; }
#danielmaia-page .nav-links { display: flex; gap: 1.5rem; list-style: none; }
#danielmaia-page .nav-links a { font-size: 13px; font-weight: 400; color: var(--muted); text-decoration: none; transition: color .2s; }
#danielmaia-page .nav-links a:hover { color: var(--ink); }

/* HERO */
#danielmaia-page .hero {
  min-height: 100vh; display: flex; flex-direction: column; justify-content: center;
  padding: 8rem 4rem 6rem; position: relative; overflow: hidden;
}
#danielmaia-page .hero-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 60% 50% at 80% 40%, rgba(200, 98, 42, 0.07) 0%, transparent 70%),
    radial-gradient(ellipse 40% 60% at 20% 70%, rgba(29, 110, 94, 0.05) 0%, transparent 60%);
  pointer-events: none;
}
#danielmaia-page .hero-grid {
  position: absolute; inset: 0;
  background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 60px 60px; opacity: 0.4; pointer-events: none;
}
#danielmaia-page .hero-content { position: relative; max-width: 860px; }
#danielmaia-page .hero-tag {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase;
  color: var(--accent); background: var(--accent-light); padding: 5px 14px; border-radius: 20px;
  margin-bottom: 2rem; border: 1px solid rgba(200, 98, 42, 0.2);
}
#danielmaia-page .hero-tag::before {
  content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
  animation: dma-pulse 2s infinite;
}
@keyframes dma-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .5; transform: scale(1.4); } }
#danielmaia-page h1 {
  font-family: var(--serif); font-size: clamp(2.8rem, 6vw, 5rem);
  line-height: 1.05; letter-spacing: -0.02em; color: var(--ink); margin-bottom: 1.5rem;
}
#danielmaia-page h1 em { font-style: italic; color: var(--accent); }
#danielmaia-page .hero-desc { font-size: 1.15rem; color: var(--muted); max-width: 560px; line-height: 1.7; margin-bottom: 3rem; font-weight: 300; }
#danielmaia-page .hero-stats { display: flex; gap: 3rem; flex-wrap: wrap; }
#danielmaia-page .hero-stat-val { font-family: var(--serif); font-size: 2.4rem; color: var(--ink); line-height: 1; }
#danielmaia-page .hero-stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; text-transform: uppercase; letter-spacing: .06em; font-weight: 400; }
#danielmaia-page .hero-scroll {
  position: absolute; bottom: 3rem; left: 4rem;
  display: flex; align-items: center; gap: 10px;
  font-size: 12px; color: var(--muted); letter-spacing: .06em; text-transform: uppercase;
}
#danielmaia-page .scroll-line { width: 40px; height: 1px; background: var(--muted); animation: dma-scrollLine 2s ease-in-out infinite; }
@keyframes dma-scrollLine { 0%, 100% { width: 40px; opacity: 1; } 50% { width: 20px; opacity: .5; } }

/* SECTIONS */
#danielmaia-page section { padding: 7rem 4rem; }
#danielmaia-page section:nth-child(even) { background: var(--surface2); }
#danielmaia-page .section-label { font-size: 11px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: var(--accent); margin-bottom: 1rem; }
#danielmaia-page .section-title { font-family: var(--serif); font-size: clamp(2rem, 4vw, 3rem); letter-spacing: -0.02em; line-height: 1.1; color: var(--ink); margin-bottom: 1rem; }
#danielmaia-page .section-sub { font-size: 1.05rem; color: var(--muted); font-weight: 300; max-width: 580px; line-height: 1.7; margin-bottom: 3.5rem; }

/* PROBLEMA */
#danielmaia-page .problems-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; }
#danielmaia-page .problem-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 1.75rem; position: relative; overflow: hidden; transition: border-color .2s, transform .2s;
}
#danielmaia-page .problem-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: var(--accent); transform: scaleX(0); transition: transform .3s; transform-origin: left;
}
#danielmaia-page .problem-card:hover { transform: translateY(-2px); border-color: var(--accent); }
#danielmaia-page .problem-card:hover::before { transform: scaleX(1); }
#danielmaia-page .problem-icon { width: 40px; height: 40px; border-radius: 8px; background: var(--accent-light); display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 1rem; }
#danielmaia-page .problem-title { font-size: 15px; font-weight: 500; color: var(--ink); margin-bottom: .5rem; }
#danielmaia-page .problem-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }
#danielmaia-page .problem-cost { margin-top: 1rem; font-size: 12px; font-weight: 500; color: var(--accent); background: var(--accent-light); display: inline-block; padding: 3px 10px; border-radius: 20px; }

/* TABS */
#danielmaia-page .sectors-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 2rem; }
#danielmaia-page .sector-tab {
  font-size: 13px; padding: 7px 16px; border-radius: 20px; border: 1px solid var(--border);
  background: var(--surface); color: var(--muted); cursor: pointer; transition: all .15s; font-family: var(--sans);
}
#danielmaia-page .sector-tab:hover { border-color: var(--accent); color: var(--accent); }
#danielmaia-page .sector-tab.active { background: var(--ink); color: var(--white); border-color: var(--ink); }
#danielmaia-page .sector-content { display: none; }
#danielmaia-page .sector-content.active { display: flex; flex-direction: column; gap: 0; animation: dma-fadeIn .3s ease; }
@keyframes dma-fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

/* ACCORDION */
#danielmaia-page .auto-item {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  margin-bottom: .75rem; overflow: hidden; transition: border-color .2s, box-shadow .2s; cursor: pointer;
}
#danielmaia-page .auto-item:hover { border-color: rgba(200,98,42,.3); }
#danielmaia-page .auto-item.open { border-color: var(--accent); box-shadow: 0 4px 20px rgba(200,98,42,.1); }
#danielmaia-page .auto-item-trigger {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  padding: 1.25rem 1.5rem; cursor: pointer; user-select: none; width: 100%;
  background: none; border: none; text-align: left; font-family: var(--sans);
}
#danielmaia-page .auto-item-trigger:hover { background: rgba(200,98,42,.03); }
#danielmaia-page .auto-trigger-left { display: flex; flex-direction: column; gap: 8px; flex: 1; }
#danielmaia-page .auto-item-header-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
#danielmaia-page .auto-item-name { font-size: 14px; font-weight: 500; color: var(--ink); line-height: 1.4; }
#danielmaia-page .complexity-badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; white-space: nowrap; flex-shrink: 0; }
#danielmaia-page .easy { background: #e6f4ee; color: #1a6b42; }
#danielmaia-page .medium { background: #fef3e2; color: #8a5a00; }
#danielmaia-page .hard { background: #fde8e8; color: #9b2020; }
#danielmaia-page .auto-gain-short { font-size: 12px; color: var(--muted); line-height: 1.5; }
#danielmaia-page .auto-tools { display: flex; gap: 5px; flex-wrap: wrap; }
#danielmaia-page .tool-pill { font-size: 10px; padding: 2px 8px; border-radius: 4px; background: var(--blue-light); color: var(--blue); font-weight: 500; }
#danielmaia-page .auto-chevron {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--muted);
  transition: transform .25s, background .2s, border-color .2s; margin-top: 2px;
}
#danielmaia-page .auto-item.open .auto-chevron { transform: rotate(180deg); background: var(--accent); color: white; border-color: var(--accent); }
#danielmaia-page .auto-detail { max-height: 0; overflow: hidden; transition: max-height .4s cubic-bezier(0.4, 0, 0.2, 1); }
#danielmaia-page .auto-item.open .auto-detail { max-height: 1200px; }
#danielmaia-page .auto-detail-inner { padding: 0 1.5rem 1.5rem; border-top: 1px solid var(--border); }
#danielmaia-page .detail-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-top: 1.25rem; }
@media (max-width: 900px) { #danielmaia-page .detail-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { #danielmaia-page .detail-grid { grid-template-columns: 1fr; } }
#danielmaia-page .detail-block { background: var(--surface2); border-radius: var(--radius-sm); padding: 1rem 1.1rem; border: 1px solid var(--border); }
#danielmaia-page .detail-block.span2 { grid-column: span 2; }
#danielmaia-page .detail-block.span3 { grid-column: span 3; }
@media (max-width: 900px) { #danielmaia-page .detail-block.span3 { grid-column: span 2; } }
@media (max-width: 600px) { #danielmaia-page .detail-block.span2, #danielmaia-page .detail-block.span3 { grid-column: span 1; } }
#danielmaia-page .detail-block-label { font-size: 10px; font-weight: 600; letter-spacing: .09em; text-transform: uppercase; color: var(--accent); margin-bottom: 6px; }
#danielmaia-page .detail-block-text { font-size: 13px; color: var(--ink); line-height: 1.65; }
#danielmaia-page .detail-block-text strong { font-weight: 500; color: var(--ink); }
#danielmaia-page .detail-divider { height: 1px; background: var(--border); margin: 1.25rem 0 0; }
#danielmaia-page .process-steps { display: flex; gap: 0; flex-wrap: wrap; margin-top: .75rem; }
#danielmaia-page .process-step { display: flex; align-items: center; gap: 0; }
#danielmaia-page .ps-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 5px 12px; font-size: 11px; color: var(--ink); white-space: nowrap; line-height: 1.4; }
#danielmaia-page .ps-arrow { font-size: 10px; color: var(--muted); padding: 0 5px; }
#danielmaia-page .detail-alert { background: var(--amber-light); border: 1px solid rgba(160,104,32,.2); border-radius: var(--radius-sm); padding: .75rem 1rem; font-size: 12px; color: #6b4400; line-height: 1.55; margin-top: 1rem; }
#danielmaia-page .detail-alert strong { color: var(--amber); }

/* PLACEHOLDER */
#danielmaia-page .placeholder-section { padding: 4rem 4rem; background: var(--surface2); border-top: 1px dashed var(--border); }
#danielmaia-page .placeholder-inner { max-width: 600px; margin: 0 auto; text-align: center; padding: 3rem; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius); }
#danielmaia-page .placeholder-inner p { font-size: 13px; color: var(--muted); line-height: 1.6; margin-top: .5rem; }

/* FOOTER */
#danielmaia-page footer { background: var(--ink); color: rgba(248,246,241,.4); padding: 3rem 4rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
#danielmaia-page .footer-logo { font-family: var(--serif); font-size: 18px; color: rgba(248,246,241,.7); }
#danielmaia-page .footer-note { font-size: 12px; text-align: right; }

/* ANIMATIONS */
#danielmaia-page .reveal { opacity: 0; transform: translateY(20px); transition: opacity .6s ease, transform .6s ease; }
#danielmaia-page .reveal.visible { opacity: 1; transform: none; }

/* RESPONSIVE */
@media (max-width: 768px) {
  #danielmaia-page section { padding: 5rem 1.5rem; }
  #danielmaia-page .hero { padding: 7rem 1.5rem 5rem; }
  #danielmaia-page h1 { font-size: 2.4rem; }
  #danielmaia-page nav { padding: 0 1.5rem; }
  #danielmaia-page .nav-links { display: none; }
  #danielmaia-page footer { padding: 2rem 1.5rem; }
  #danielmaia-page .hero-scroll { left: 1.5rem; }
  #danielmaia-page .placeholder-section { padding: 3rem 1.5rem; }
}
`;

const PAGE_HTML = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet">

<!-- NAV -->
<nav>
  <div class="nav-logo">Automação Jurídica</div>
  <ul class="nav-links">
    <li><a href="#problema">Problema</a></li>
    <li><a href="#automacoes">Automações</a></li>
    <li><a href="#agentes">Agentes IA</a></li>
    <li><a href="#stack">Stack</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#roi">ROI</a></li>
  </ul>
</nav>

<!-- HERO -->
<section class="hero" id="inicio">
  <div class="hero-bg"></div>
  <div class="hero-grid"></div>
  <div class="hero-content">
    <div class="hero-tag">Proposta de Transformação Digital</div>
    <h1>Seu escritório<br>trabalhando em<br><em>modo automático.</em></h1>
    <p class="hero-desc">
      41 automações mapeadas em 11 setores, fluxo de 6 agentes de IA para contratos,
      e um roadmap de 12 meses para transformar um escritório médio em
      uma operação digital de alto desempenho.
    </p>
    <div class="hero-stats">
      <div>
        <div class="hero-stat-val">41</div>
        <div class="hero-stat-label">Automações mapeadas</div>
      </div>
      <div>
        <div class="hero-stat-val">170h</div>
        <div class="hero-stat-label">Economia mensal estimada</div>
      </div>
      <div>
        <div class="hero-stat-val">R$0,42</div>
        <div class="hero-stat-label">Custo por contrato gerado</div>
      </div>
      <div>
        <div class="hero-stat-val">7×</div>
        <div class="hero-stat-label">Retorno sobre investimento</div>
      </div>
    </div>
  </div>
  <div class="hero-scroll">
    <div class="scroll-line"></div>
    Role para explorar
  </div>
</section>

<!-- PROBLEMA -->
<section id="problema">
  <div class="section-label">O diagnóstico</div>
  <h2 class="section-title">Onde o tempo e o dinheiro<br>estão se perdendo hoje</h2>
  <p class="section-sub">
    Escritórios de médio porte com atuação completa acumulam ineficiências em
    cada área. Identificamos as 10 maiores sangrias operacionais.
  </p>
  <div class="problems-grid reveal">
    <div class="problem-card">
      <div class="problem-icon">⚖️</div>
      <div class="problem-title">Contratos feitos à mão</div>
      <div class="problem-desc">2 a 4 horas de advogado sênior para cada contrato. Retrabalho em cláusulas padrão. Inconsistência entre documentos.</div>
      <div class="problem-cost">~120h/mês desperdiçadas</div>
    </div>
    <div class="problem-card">
      <div class="problem-icon">📅</div>
      <div class="problem-title">Prazos controlados na cabeça</div>
      <div class="problem-desc">Planilhas desatualizadas, Post-its, memória humana. Um prazo perdido pode custar o processo inteiro.</div>
      <div class="problem-cost">Risco jurídico e financeiro</div>
    </div>
    <div class="problem-card">
      <div class="problem-icon">📞</div>
      <div class="problem-title">Atendimento reativo</div>
      <div class="problem-desc">Clientes ligando para saber do processo. Secretária interrompida 40+ vezes por dia. Informação que deveria chegar proativamente.</div>
      <div class="problem-cost">~35h/mês em interrupções</div>
    </div>
    <div class="problem-card">
      <div class="problem-icon">💰</div>
      <div class="problem-title">Cobranças esquecidas</div>
      <div class="problem-desc">Inadimplência por falta de cobrança sistemática. Honorários parcelados sem acompanhamento. Fluxo de caixa imprevisível.</div>
      <div class="problem-cost">15–30% de inadimplência</div>
    </div>
    <div class="problem-card">
      <div class="problem-icon">🗂️</div>
      <div class="problem-title">Documentos espalhados</div>
      <div class="problem-desc">E-mails, WhatsApp, pen drives, Google Drive sem estrutura. Horas procurando um documento que deveria estar a 2 cliques.</div>
      <div class="problem-cost">~20h/mês em busca manual</div>
    </div>
    <div class="problem-card">
      <div class="problem-icon">🔒</div>
      <div class="problem-title">LGPD sem controle</div>
      <div class="problem-desc">Dados de clientes em múltiplos lugares sem inventário. Consentimentos não documentados. Exposição a multas da ANPD.</div>
      <div class="problem-cost">Multa até 2% do faturamento</div>
    </div>
    <div class="problem-card">
      <div class="problem-icon">👥</div>
      <div class="problem-title">Produtividade invisível</div>
      <div class="problem-desc">Com 30+ funcionários, é impossível saber quem está sobrecarregado, quem está ocioso e quanto custa cada hora por processo sem um sistema.</div>
      <div class="problem-cost">~40h/mês de alocação errada</div>
    </div>
    <div class="problem-card">
      <div class="problem-icon">📝</div>
      <div class="problem-title">Qualidade inconsistente entre advogados</div>
      <div class="problem-desc">O padrão de uma petição varia por autor. Peças incompletas passam pelo protocolo, gerando retrabalho e dano à reputação do escritório.</div>
      <div class="problem-cost">Retrabalho em 20–30% das peças</div>
    </div>
    <div class="problem-card">
      <div class="problem-icon">🧠</div>
      <div class="problem-title">Conhecimento que sai com o advogado</div>
      <div class="problem-desc">Quando um profissional deixa o escritório, leva na cabeça estratégias, contatos e know-how que nunca foram documentados.</div>
      <div class="problem-cost">3–6 meses para júnior ser produtivo</div>
    </div>
    <div class="problem-card">
      <div class="problem-icon">💹</div>
      <div class="problem-title">Clientes que custam mais do que pagam</div>
      <div class="problem-desc">Sem timesheet vinculado ao honorário, o escritório não sabe quais clientes são rentáveis. 20% dos clientes consomem 60% do tempo.</div>
      <div class="problem-cost">Margem real desconhecida</div>
    </div>
  </div>
</section>

<!-- AUTOMAÇÕES -->
<section id="automacoes">
  <div class="section-label">O que automatizamos</div>
  <h2 class="section-title">41 automações, 11 setores,<br>um só objetivo</h2>
  <p class="section-sub">
    Clique em cada automação para ver em detalhe o porquê, como funciona e o que muda na prática.
    Linguagem de negócio, sem jargão técnico.
  </p>
  <div class="sectors-tabs">
    <button class="sector-tab active" onclick="dmaShowSector('admin', this)">🔵 Administrativo</button>
    <button class="sector-tab" onclick="dmaShowSector('atend', this)">📞 Atendimento</button>
    <button class="sector-tab" onclick="dmaShowSector('contratos', this)">📋 Contratos</button>
    <button class="sector-tab" onclick="dmaShowSector('processos', this)">⚖️ Processos</button>
    <button class="sector-tab" onclick="dmaShowSector('trabalhista', this)">💼 Trabalhista</button>
    <button class="sector-tab" onclick="dmaShowSector('lgpd', this)">🔒 LGPD</button>
    <button class="sector-tab" onclick="dmaShowSector('pessoas', this)">👥 Pessoas</button>
    <button class="sector-tab" onclick="dmaShowSector('qualidade', this)">📝 Qualidade</button>
    <button class="sector-tab" onclick="dmaShowSector('conhecimento', this)">🧠 Conhecimento</button>
    <button class="sector-tab" onclick="dmaShowSector('rentabilidade', this)">💹 Rentabilidade</button>
  </div>

  <!-- ADMINISTRATIVO -->
  <div id="sector-admin" class="sector-content active">

    <div class="auto-item" onclick="dmaToggleItem(this)">
      <button class="auto-item-trigger">
        <div class="auto-trigger-left">
          <div class="auto-item-header-row">
            <div class="auto-item-name">Dashboard financeiro automatizado</div>
            <span class="complexity-badge easy">🟢 Fácil</span>
          </div>
          <div class="auto-gain-short">Elimina ~15h/mês de lançamentos manuais. KPIs financeiros em tempo real.</div>
          <div class="auto-tools"><span class="tool-pill">n8n</span><span class="tool-pill">Google Sheets</span><span class="tool-pill">Claude API</span></div>
        </div>
        <div class="auto-chevron">▾</div>
      </button>
      <div class="auto-detail">
        <div class="auto-detail-inner">
          <div class="detail-grid">
            <div class="detail-block">
              <div class="detail-block-label">Por que fazer isso?</div>
              <div class="detail-block-text">Hoje alguém no escritório gasta horas toda semana coletando números de diferentes lugares — quanto entrou de honorários, quanto está em aberto, quais processos geraram despesa. Esse trabalho é 100% manual e sujeito a erro. Sócios tomam decisões financeiras com dados atrasados e incompletos. Um dashboard automático elimina esse desperdício e coloca os números certos na frente de quem precisa decidir, toda manhã, sem que ninguém precise montar planilha.</div>
            </div>
            <div class="detail-block">
              <div class="detail-block-label">Como funciona na prática?</div>
              <div class="detail-block-text">O sistema puxa automaticamente os dados do sistema de cobrança (Asaas), do Google Sheets onde ficam os honorários e do controle de despesas. Todo dia de manhã consolida tudo em um painel visual. A IA ainda redige um resumo em texto — tipo "este mês está 12% acima do mesmo período do ano passado, mas a inadimplência subiu 3 pontos" — e envia por e-mail ou WhatsApp para os sócios.</div>
            </div>
            <div class="detail-block">
              <div class="detail-block-label">O que muda no dia a dia?</div>
              <div class="detail-block-text">A secretária financeira para de montar relatórios manuais. Os sócios passam a ter visão clara do caixa sem precisar perguntar para ninguém. Reuniões de resultado ficam mais curtas porque os dados já chegam prontos. Decisões de contratar, investir ou renegociar passam a ser tomadas com informação real, não estimativa.</div>
            </div>
            <div class="detail-block span3">
              <div class="detail-block-label">Como o processo acontece (passo a passo)</div>
              <div class="process-steps">
                <div class="process-step"><div class="ps-box">Todo dia às 8h</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">Sistema coleta dados do Asaas + planilhas</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">IA consolida e interpreta os números</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">Painel atualizado automaticamente</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">Resumo enviado aos sócios por WhatsApp</div></div>
              </div>
            </div>
          </div>
          <div class="detail-alert"><strong>Atenção realista:</strong> O dashboard é tão bom quanto os dados que alimentam ele. Se os lançamentos de honorários estiverem inconsistentes nas planilhas, o painel vai refletir isso. A implantação exige uma limpeza inicial dos dados — isso leva 2 a 3 dias, mas é feito uma única vez.</div>
        </div>
      </div>
    </div>

    <div class="auto-item" onclick="dmaToggleItem(this)">
      <button class="auto-item-trigger">
        <div class="auto-trigger-left">
          <div class="auto-item-header-row">
            <div class="auto-item-name">Cobrança automática de honorários</div>
            <span class="complexity-badge easy">🟢 Fácil</span>
          </div>
          <div class="auto-gain-short">Reduz inadimplência em 30–40%. Boleto e lembrete no dia certo, sem esforço humano.</div>
          <div class="auto-tools"><span class="tool-pill">n8n</span><span class="tool-pill">Asaas</span><span class="tool-pill">WhatsApp API</span></div>
        </div>
        <div class="auto-chevron">▾</div>
      </button>
      <div class="auto-detail">
        <div class="auto-detail-inner">
          <div class="detail-grid">
            <div class="detail-block">
              <div class="detail-block-label">Por que fazer isso?</div>
              <div class="detail-block-text">A maioria dos clientes inadimplentes não deixou de pagar por má-fé — deixou porque ninguém cobrou no momento certo. Escritório de advocacia não é banco; os advogados não foram treinados para cobrar, e frequentemente evitam essa conversa com clientes. O resultado é um volume silencioso de honorários vencidos que corrói o caixa todo mês. Uma cobrança automática e consistente resolve 70% da inadimplência sem nenhum desgaste de relacionamento.</div>
            </div>
            <div class="detail-block">
              <div class="detail-block-label">Como funciona na prática?</div>
              <div class="detail-block-text">Quando um honorário é cadastrado, o sistema já agenda automaticamente os avisos: 5 dias antes do vencimento (aviso amigável), no dia do vencimento (lembrete com link de pagamento), e 3 e 7 dias após o vencimento (cobranças progressivamente mais diretas). O boleto ou Pix é gerado automaticamente pelo Asaas e o link enviado via WhatsApp. Se o cliente pagar, o sistema para de enviar mensagens automaticamente.</div>
            </div>
            <div class="detail-block">
              <div class="detail-block-label">O que muda no dia a dia?</div>
              <div class="detail-block-text">A secretária para completamente de fazer ligações de cobrança. O advogado não precisa mais ter essa conversa desconfortável. O caixa fica mais previsível porque os recebimentos passam a chegar nas datas esperadas. Clientes que pagam em dia continuam sendo tratados com normalidade; os que atrasam recebem a cobrança de forma automatizada e impessoal, sem constrangimento.</div>
            </div>
            <div class="detail-block span3">
              <div class="detail-block-label">Fluxo de cobrança</div>
              <div class="process-steps">
                <div class="process-step"><div class="ps-box">Honorário cadastrado</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">D-5: aviso amigável via WhatsApp</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">D0: lembrete + link de pagamento</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">D+3 e D+7: cobrança progressiva</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">Pagamento confirmado → fluxo encerra</div></div>
              </div>
            </div>
          </div>
          <div class="detail-alert"><strong>Atenção realista:</strong> Clientes corporativos e de longo relacionamento podem se sentir mal com cobranças automáticas por WhatsApp. Recomenda-se configurar uma exceção para esses perfis, mantendo o contato pessoal para eles e o automático para os demais.</div>
        </div>
      </div>
    </div>

    <div class="auto-item" onclick="dmaToggleItem(this)">
      <button class="auto-item-trigger">
        <div class="auto-trigger-left">
          <div class="auto-item-header-row">
            <div class="auto-item-name">Onboarding de novo cliente</div>
            <span class="complexity-badge easy">🟢 Fácil</span>
          </div>
          <div class="auto-gain-short">Economiza 2h por cliente novo. Coleta documentos, cria pasta no Drive e envia boas-vindas automaticamente.</div>
          <div class="auto-tools"><span class="tool-pill">Typeform</span><span class="tool-pill">n8n</span><span class="tool-pill">Google Drive</span></div>
        </div>
        <div class="auto-chevron">▾</div>
      </button>
      <div class="auto-detail">
        <div class="auto-detail-inner">
          <div class="detail-grid">
            <div class="detail-block">
              <div class="detail-block-label">Por que fazer isso?</div>
              <div class="detail-block-text">Toda vez que um novo cliente é aceito, alguém no escritório precisa: ligar para pedir documentos, enviar e-mail listando o que falta, esperar o cliente mandar cada coisa por vez, criar uma pasta no Drive, registrar no sistema, enviar os dados bancários, enviar o contrato de prestação de serviços. São pelo menos 2 horas de trabalho administrativo espalhadas ao longo de dias — e a experiência do cliente na primeira semana fica fragmentada e pouco profissional.</div>
            </div>
            <div class="detail-block">
              <div class="detail-block-label">Como funciona na prática?</div>
              <div class="detail-block-text">Ao confirmar o novo cliente, o advogado dispara um único link de formulário. O cliente preenche tudo online: dados pessoais, documentos (enviados como anexo), histórico do caso, autorização de representação e aceite do contrato de honorários já com assinatura digital. Em segundos, o sistema cria a pasta no Drive com o nome do cliente, arquiva cada documento no lugar certo, registra no CRM e envia ao cliente um e-mail de boas-vindas com as próximas etapas.</div>
            </div>
            <div class="detail-block">
              <div class="detail-block-label">O que muda no dia a dia?</div>
              <div class="detail-block-text">A secretária para de fazer a "dança dos documentos" a cada novo cliente. O advogado começa a trabalhar no caso com tudo já organizado. O cliente tem uma primeira impressão de organização e profissionalismo. O escritório passa a ter um processo de entrada padronizado — independente de quem fez o atendimento inicial.</div>
            </div>
            <div class="detail-block span3">
              <div class="detail-block-label">Fluxo de entrada do cliente</div>
              <div class="process-steps">
                <div class="process-step"><div class="ps-box">Cliente aceito pelo advogado</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">Link do formulário enviado</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">Cliente preenche e envia documentos</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">Sistema cria pasta + registra no CRM</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">E-mail de boas-vindas enviado ao cliente</div></div>
              </div>
            </div>
          </div>
          <div class="detail-alert"><strong>Atenção realista:</strong> Clientes mais velhos ou com pouca familiaridade com tecnologia podem ter dificuldade com o formulário online. Mantenha o processo manual como alternativa para esses casos — o sistema não precisa ser obrigatório, apenas padrão.</div>
        </div>
      </div>
    </div>

    <div class="auto-item" onclick="dmaToggleItem(this)">
      <button class="auto-item-trigger">
        <div class="auto-trigger-left">
          <div class="auto-item-header-row">
            <div class="auto-item-name">Controle de prazos multi-canal</div>
            <span class="complexity-badge medium">🟡 Médio</span>
          </div>
          <div class="auto-gain-short">Alertas ao advogado + secretária 3 dias, 1 dia e no dia do prazo. Prazo perdido zerado.</div>
          <div class="auto-tools"><span class="tool-pill">n8n</span><span class="tool-pill">Google Calendar</span><span class="tool-pill">WhatsApp</span></div>
        </div>
        <div class="auto-chevron">▾</div>
      </button>
      <div class="auto-detail">
        <div class="auto-detail-inner">
          <div class="detail-grid">
            <div class="detail-block">
              <div class="detail-block-label">Por que fazer isso?</div>
              <div class="detail-block-text">Prazo perdido em processo judicial é uma das faltas mais graves que um advogado pode cometer. Pode significar perda definitiva do processo, responsabilidade civil, processo no OAB e dano irreparável ao cliente. Hoje os prazos são controlados por planilhas, agendas e memória — todos métodos falhos. Quando o advogado está com uma semana pesada, doente ou com a agenda lotada, o risco aumenta exponencialmente.</div>
            </div>
            <div class="detail-block">
              <div class="detail-block-label">Como funciona na prática?</div>
              <div class="detail-block-text">Quando um prazo é cadastrado (seja via DataJud automático ou lançamento manual), o sistema agenda três alertas automáticos: 72 horas antes, 24 horas antes e no dia do prazo. Cada alerta vai por WhatsApp para o advogado responsável e para a secretária. O alerta contém o processo, o cliente, o que precisa ser feito e o prazo exato. Se o prazo for cumprido (petição protocolada), os lembretes seguintes são cancelados automaticamente.</div>
            </div>
            <div class="detail-block">
              <div class="detail-block-label">O que muda no dia a dia?</div>
              <div class="detail-block-text">O advogado para de depender exclusivamente da sua própria agenda. A secretária vira uma segunda camada de segurança. Sócios passam a dormir tranquilos sabendo que nenhum prazo vai ser perdido por esquecimento. O escritório elimina seu maior risco operacional com um sistema simples e confiável.</div>
            </div>
            <div class="detail-block span3">
              <div class="detail-block-label">Cadência de alertas</div>
              <div class="process-steps">
                <div class="process-step"><div class="ps-box">Prazo cadastrado no sistema</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">D-3: alerta para advogado + secretária</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">D-1: lembrete urgente com detalhes do ato</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">D0: alerta no dia com horário limite</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">Petição protocolada → alertas encerrados</div></div>
              </div>
            </div>
          </div>
          <div class="detail-alert"><strong>Atenção realista:</strong> O sistema só funciona se os prazos forem cadastrados. A disciplina de cadastrar todo prazo assim que ele aparece (intimação, decisão, despacho) precisa se tornar um hábito da equipe. Isso exige treinamento e os primeiros 30 dias de uso são críticos para criar o comportamento.</div>
        </div>
      </div>
    </div>

    <div class="auto-item" onclick="dmaToggleItem(this)">
      <button class="auto-item-trigger">
        <div class="auto-trigger-left">
          <div class="auto-item-header-row">
            <div class="auto-item-name">Relatório mensal para sócios</div>
            <span class="complexity-badge medium">🟡 Médio</span>
          </div>
          <div class="auto-gain-short">Relatório de KPIs + análise de IA em 5 minutos. Antes: 4h manual por sócio.</div>
          <div class="auto-tools"><span class="tool-pill">n8n</span><span class="tool-pill">Claude API</span><span class="tool-pill">Google Slides</span></div>
        </div>
        <div class="auto-chevron">▾</div>
      </button>
      <div class="auto-detail">
        <div class="auto-detail-inner">
          <div class="detail-grid">
            <div class="detail-block">
              <div class="detail-block-label">Por que fazer isso?</div>
              <div class="detail-block-text">Todo início de mês, alguém precisa montar o relatório de gestão para a reunião de sócios. Isso consome de 3 a 5 horas: puxar dados de diferentes fontes, fazer os cálculos, montar a apresentação, redigir a narrativa. É trabalho de baixíssimo valor agregado sendo feito por quem tem o maior custo-hora do escritório. Além disso, os relatórios variam em formato dependendo de quem os fez.</div>
            </div>
            <div class="detail-block">
              <div class="detail-block-label">Como funciona na prática?</div>
              <div class="detail-block-text">No primeiro dia útil de cada mês, o sistema coleta automaticamente todos os dados do período anterior — faturamento, inadimplência, processos encerrados, novos clientes, honorários por área. A IA recebe esses números e redige uma análise gerencial em texto corrido: o que melhorou, o que piorou, quais tendências preocupam e quais recomendam ação. O resultado é uma apresentação pronta em Google Slides enviada para os sócios antes das 9h.</div>
            </div>
            <div class="detail-block">
              <div class="detail-block-label">O que muda no dia a dia?</div>
              <div class="detail-block-text">A reunião de sócios começa com todos já tendo lido o relatório. As discussões são estratégicas, não operacionais. O tempo que antes ia para montar planilha agora vai para decidir. A consistência do relatório — mesmo formato, mesmas métricas todo mês — permite comparar períodos com facilidade real.</div>
            </div>
            <div class="detail-block span3">
              <div class="detail-block-label">Geração do relatório mensal</div>
              <div class="process-steps">
                <div class="process-step"><div class="ps-box">1º dia útil do mês, 7h</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">Sistema coleta dados do mês anterior</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">IA redige análise gerencial em texto</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">Apresentação Google Slides gerada</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">Enviado aos sócios antes das 9h</div></div>
              </div>
            </div>
          </div>
          <div class="detail-alert"><strong>Atenção realista:</strong> O relatório automático é um ponto de partida, não um substituto para o julgamento dos sócios. A IA identifica padrões nos números, mas interpretações estratégicas — como decidir abrir uma nova área ou demitir alguém — continuam sendo responsabilidade humana.</div>
        </div>
      </div>
    </div>

  </div><!-- /sector-admin -->

  <!-- ATENDIMENTO -->
  <div id="sector-atend" class="sector-content">

    <div class="auto-item" onclick="dmaToggleItem(this)">
      <button class="auto-item-trigger">
        <div class="auto-trigger-left">
          <div class="auto-item-header-row">
            <div class="auto-item-name">Triagem inteligente de WhatsApp</div>
            <span class="complexity-badge medium">🟡 Médio</span>
          </div>
          <div class="auto-gain-short">IA classifica urgência, área e responsável. Responde fora do horário com informações reais do caso.</div>
          <div class="auto-tools"><span class="tool-pill">Evolution API</span><span class="tool-pill">n8n</span><span class="tool-pill">Claude API</span></div>
        </div>
        <div class="auto-chevron">▾</div>
      </button>
      <div class="auto-detail">
        <div class="auto-detail-inner">
          <div class="detail-grid">
            <div class="detail-block">
              <div class="detail-block-label">Por que fazer isso?</div>
              <div class="detail-block-text">O WhatsApp do escritório recebe dezenas de mensagens por dia. Clientes perguntando sobre seus processos, leads novos pedindo informações, mensagens urgentes misturadas com as que podem esperar. Hoje a secretária lê tudo, tenta resolver o que pode, encaminha o restante e frequentemente interrompe os advogados para perguntas que poderiam ser respondidas com as informações já disponíveis no sistema. É um gargalo humano que custa caro.</div>
            </div>
            <div class="detail-block">
              <div class="detail-block-label">Como funciona na prática?</div>
              <div class="detail-block-text">Toda mensagem recebida no WhatsApp passa primeiro pela IA. Ela identifica quem é o cliente, consulta o status atual do processo desse cliente no sistema, e responde com a informação correta. Se a mensagem for urgente (prazo, audiência, decisão importante), escala imediatamente para o advogado responsável com contexto resumido. Se for fora do horário, responde com o que for possível e registra para acompanhamento. Só o que realmente precisa de humano chega a um humano.</div>
            </div>
            <div class="detail-block">
              <div class="detail-block-label">O que muda no dia a dia?</div>
              <div class="detail-block-text">A secretária para de responder perguntas repetitivas sobre status de processo. Os advogados são interrompidos apenas para o que realmente precisa deles. Clientes que mandam mensagem às 22h recebem resposta imediata com informação real — não um "voltaremos em breve". A percepção de qualidade de atendimento aumenta significativamente sem aumentar o custo.</div>
            </div>
            <div class="detail-block span3">
              <div class="detail-block-label">Fluxo de triagem</div>
              <div class="process-steps">
                <div class="process-step"><div class="ps-box">Mensagem recebida no WhatsApp</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">IA identifica cliente + consulta sistema</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">Urgente? Escala para advogado</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">Rotina? Responde automaticamente</div><div class="ps-arrow">→</div></div>
                <div class="process-step"><div class="ps-box">Interação registrada no sistema</div></div>
              </div>
            </div>
          </div>
          <div class="detail-alert"><strong>Atenção realista:</strong> A IA não substitui o advogado em questões jurídicas complexas. Ela lida com perguntas operacionais (status, datas, documentos). Qualquer orientação jurídica deve ser tratada por um humano — o sistema deve ser configurado para escalar automaticamente esse tipo de pergunta.</div>
        </div>
      </div>
    </div>

  </div><!-- /sector-atend -->

  <!-- SETORES RESTANTES — cole o conteúdo de cada aba aqui -->
  <div id="sector-contratos" class="sector-content">
    <div style="padding: 3rem; text-align: center; color: var(--muted); font-size: 14px; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius);">
      Conteúdo da aba <strong>Contratos</strong> — adicione as automações aqui.
    </div>
  </div>
  <div id="sector-processos" class="sector-content">
    <div style="padding: 3rem; text-align: center; color: var(--muted); font-size: 14px; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius);">
      Conteúdo da aba <strong>Processos</strong> — adicione as automações aqui.
    </div>
  </div>
  <div id="sector-trabalhista" class="sector-content">
    <div style="padding: 3rem; text-align: center; color: var(--muted); font-size: 14px; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius);">
      Conteúdo da aba <strong>Trabalhista</strong> — adicione as automações aqui.
    </div>
  </div>
  <div id="sector-lgpd" class="sector-content">
    <div style="padding: 3rem; text-align: center; color: var(--muted); font-size: 14px; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius);">
      Conteúdo da aba <strong>LGPD</strong> — adicione as automações aqui.
    </div>
  </div>
  <div id="sector-pessoas" class="sector-content">
    <div style="padding: 3rem; text-align: center; color: var(--muted); font-size: 14px; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius);">
      Conteúdo da aba <strong>Pessoas</strong> — adicione as automações aqui.
    </div>
  </div>
  <div id="sector-qualidade" class="sector-content">
    <div style="padding: 3rem; text-align: center; color: var(--muted); font-size: 14px; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius);">
      Conteúdo da aba <strong>Qualidade</strong> — adicione as automações aqui.
    </div>
  </div>
  <div id="sector-conhecimento" class="sector-content">
    <div style="padding: 3rem; text-align: center; color: var(--muted); font-size: 14px; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius);">
      Conteúdo da aba <strong>Conhecimento</strong> — adicione as automações aqui.
    </div>
  </div>
  <div id="sector-rentabilidade" class="sector-content">
    <div style="padding: 3rem; text-align: center; color: var(--muted); font-size: 14px; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius);">
      Conteúdo da aba <strong>Rentabilidade</strong> — adicione as automações aqui.
    </div>
  </div>

</section>

<!-- AGENTES — cole o HTML da seção aqui -->
<section id="agentes" style="background: var(--ink);">
  <div class="placeholder-inner" style="max-width:600px;margin:0 auto;text-align:center;padding:3rem;background:rgba(255,255,255,0.05);border:1px dashed rgba(255,255,255,0.15);border-radius:var(--radius);">
    <div class="section-label" style="color:rgba(200,98,42,.9)">Agentes IA</div>
    <h2 class="section-title" style="color:#f8f6f1;">Seção de Agentes</h2>
    <p style="color:rgba(248,246,241,.4);font-size:13px;margin-top:1rem;">Cole aqui o HTML da seção de Agentes IA (pipeline de agentes).</p>
  </div>
</section>

<!-- STACK — cole o HTML da seção aqui -->
<section id="stack">
  <div class="placeholder-inner" style="max-width:600px;margin:0 auto;text-align:center;padding:3rem;background:var(--surface);border:1px dashed var(--border);border-radius:var(--radius);">
    <div class="section-label">Stack Tecnológico</div>
    <h2 class="section-title">Seção de Stack</h2>
    <p style="color:var(--muted);font-size:13px;margin-top:1rem;">Cole aqui o HTML da seção de Stack Tecnológico.</p>
  </div>
</section>

<!-- ROADMAP — cole o HTML da seção aqui -->
<section id="roadmap">
  <div class="placeholder-inner" style="max-width:600px;margin:0 auto;text-align:center;padding:3rem;background:var(--surface);border:1px dashed var(--border);border-radius:var(--radius);">
    <div class="section-label">Roadmap</div>
    <h2 class="section-title">Seção de Roadmap</h2>
    <p style="color:var(--muted);font-size:13px;margin-top:1rem;">Cole aqui o HTML da seção de Roadmap.</p>
  </div>
</section>

<!-- ROI — cole o HTML da seção aqui -->
<section id="roi">
  <div class="placeholder-inner" style="max-width:600px;margin:0 auto;text-align:center;padding:3rem;background:var(--surface);border:1px dashed var(--border);border-radius:var(--radius);">
    <div class="section-label">ROI</div>
    <h2 class="section-title">Seção de ROI</h2>
    <p style="color:var(--muted);font-size:13px;margin-top:1rem;">Cole aqui o HTML da seção de Retorno sobre Investimento.</p>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-logo">Daniel Maia · Automação Jurídica</div>
  <div class="footer-note">Proposta confidencial · Uso restrito</div>
</footer>
`;

export default function DanielmaiaAutomacoes() {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'danielmaia-page-css';
    style.textContent = PAGE_CSS;
    document.head.appendChild(style);

    (window as any).dmaShowSector = function (id: string, tab: HTMLElement) {
      document.querySelectorAll('#danielmaia-page .sector-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('#danielmaia-page .sector-tab').forEach(el => el.classList.remove('active'));
      const sector = document.getElementById('sector-' + id);
      if (sector) sector.classList.add('active');
      if (tab) tab.classList.add('active');
    };

    (window as any).dmaToggleItem = function (item: HTMLElement) {
      item.classList.toggle('open');
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });

    const revealTimer = setTimeout(() => {
      document.querySelectorAll('#danielmaia-page .reveal').forEach(el => observer.observe(el));
    }, 100);

    return () => {
      document.getElementById('danielmaia-page-css')?.remove();
      delete (window as any).dmaShowSector;
      delete (window as any).dmaToggleItem;
      clearTimeout(revealTimer);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      id="danielmaia-page"
      dangerouslySetInnerHTML={{ __html: PAGE_HTML }}
    />
  );
}
