import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const statsCards = [
  { label: "Total Resumos", value: "48", icon: "📋" },
  { label: "Vendas", value: "12", icon: "🛒", color: "#22c55e" },
  { label: "Taxa de Conversão", value: "25%", icon: "📈" },
  { label: "Qual. Lead Média", value: "7.2", icon: "⭐" },
  { label: "Qual. Vendedor Média", value: "8.1", icon: "👤" },
];

interface LeadRow {
  id: number;
  name: string;
  phone: string;
  resumo: string;
  qualLead: number;
  qualVendedor: number;
  vendeu: boolean;
  valor: string;
  origem: string;
  periodo: string;
}

const leads: LeadRow[] = [
  { id: 1, name: "Maria Santos", phone: "5585999••0010", resumo: "Lead interessada em pacote trimestral, pediu desconto...", qualLead: 9, qualVendedor: 8, vendeu: true, valor: "R$ 1.200", origem: "trafego_pago", periodo: "Jun/2026" },
  { id: 2, name: "João Oliveira", phone: "5585999••0020", resumo: "Perguntou sobre entrega para fora de Fortaleza...", qualLead: 6, qualVendedor: 7, vendeu: false, valor: "—", origem: "trafego_pago", periodo: "Jun/2026" },
  { id: 3, name: "Ana Lima", phone: "5585999••0030", resumo: "Solicitou orçamento para evento corporativo de 50 pessoas...", qualLead: 8, qualVendedor: 9, vendeu: true, valor: "R$ 3.800", origem: "trafego_pago", periodo: "Jun/2026" },
  { id: 4, name: "Carlos Mendes", phone: "5585999••0040", resumo: "Disse que vai pensar e voltar na semana que vem...", qualLead: 4, qualVendedor: 5, vendeu: false, valor: "—", origem: "indefinido", periodo: "Jun/2026" },
  { id: 5, name: "Patrícia Rocha", phone: "5585999••0050", resumo: "Fechou na hora após ver os resultados do Instagram...", qualLead: 10, qualVendedor: 9, vendeu: true, valor: "R$ 980", origem: "trafego_pago", periodo: "Jun/2026" },
];

const conversation = [
  { from: "lead", text: "Oi, vi o anúncio de vocês no Instagram. Quanto custa o pacote mensal?" },
  { from: "vendedor", text: "Olá, Maria! Tudo bem? 😊 O pacote mensal começa em R$ 400. Posso te explicar o que inclui?" },
  { from: "lead", text: "Pode sim, quero saber se tem suporte incluso e se consigo parcelar" },
  { from: "vendedor", text: "Inclui suporte por WhatsApp em horário comercial. Parcelamos em até 3x sem juros. Quer que eu envie a proposta completa?" },
  { from: "lead", text: "[Áudio]: Ah, então me manda sim. Mas eu preciso de algo pra 3 meses, tem desconto pra trimestral?" },
  { from: "vendedor", text: "Para o trimestral temos 15% de desconto, ficaria R$ 1.020 — em 3x de R$ 340. Posso montar pra você?" },
  { from: "lead", text: "Fecha! Me manda o contrato 👍" },
];

function QualBadge({ val }: { val: number }) {
  const color = val >= 8 ? "text-emerald-400 bg-emerald-500/15" : val >= 5 ? "text-amber-400 bg-amber-500/15" : "text-red-400 bg-red-500/15";
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>{val}/10</span>;
}

function ScreenA({ onSelect }: { onSelect: (lead: LeadRow) => void }) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(47,111,214,0.2)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2f6fd6" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
        </div>
        <div>
          <span className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F0F1F2" }}>Painel Studio Bella — Resumos & Conversas</span>
          <span className="block text-[10px]" style={{ color: "#c9cdd1" }}>Dispositivos monitorados: iPhone Vendas, Samsung Loja</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-5">
        {statsCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-xl border px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(240,241,242,0.12)" }}>
            <div className="text-xs mb-0.5" style={{ color: "#c9cdd1" }}>{s.icon} {s.label}</div>
            <div className="text-base font-bold" style={{ color: s.color || "#F0F1F2", fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Donut */}
        <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(240,241,242,0.10)" }}>
          <span className="text-xs font-medium mb-3 block" style={{ color: "#F0F1F2" }}>Conversão de Vendas</span>
          <div className="flex items-center justify-center gap-4">
            <svg width="100" height="100" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3" stroke="rgba(240,241,242,0.08)" />
              <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3" stroke="#22c55e" strokeDasharray="25 75" strokeDashoffset="25" strokeLinecap="round" />
              <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3" stroke="#ef4444" strokeDasharray="75 25" strokeDashoffset="100" strokeLinecap="round" />
              <text x="18" y="19.5" textAnchor="middle" fontSize="5" fill="#F0F1F2" fontFamily="Space Grotesk">25%</text>
            </svg>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[10px]" style={{ color: "#c9cdd1" }}>Vendeu (12)</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-[10px]" style={{ color: "#c9cdd1" }}>Não vendeu (36)</span></div>
            </div>
          </div>
        </div>

        {/* Lead quality bars */}
        <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(240,241,242,0.10)" }}>
          <span className="text-xs font-medium mb-3 block" style={{ color: "#F0F1F2" }}>Qualidade dos Leads</span>
          <div className="space-y-3">
            {[
              { label: "Alto (8-10)", pct: 35, color: "#22c55e" },
              { label: "Médio (5-7)", pct: 45, color: "#f59e0b" },
              { label: "Baixo (1-4)", pct: 20, color: "#ef4444" },
            ].map((bar, i) => (
              <div key={i}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span style={{ color: "#c9cdd1" }}>{bar.label}</span>
                  <span style={{ color: bar.color }}>{bar.pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(240,241,242,0.08)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.pct}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
                    className="h-full rounded-full"
                    style={{ background: bar.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-x-auto" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(240,241,242,0.12)" }}>
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[40px_1fr_1.5fr_60px_60px_50px_70px_50px_80px_70px] gap-2 px-4 py-2 border-b" style={{ borderColor: "rgba(240,241,242,0.06)" }}>
            {["ID", "Lead", "Resumo", "Q.Lead", "Q.Vend", "Vendeu?", "Valor", "F-Up", "Origem", "Período"].map(h => (
              <span key={h} className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#c9cdd1" }}>{h}</span>
            ))}
          </div>
          {leads.map((lead, i) => (
            <motion.button
              key={lead.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onSelect(lead)}
              className="grid grid-cols-[40px_1fr_1.5fr_60px_60px_50px_70px_50px_80px_70px] gap-2 items-center px-4 py-3 border-b w-full text-left hover:bg-[rgba(47,111,214,0.04)] transition-colors"
              style={{ borderColor: "rgba(240,241,242,0.04)" }}
            >
              <span className="text-[10px]" style={{ color: "#c9cdd1" }}>{lead.id}</span>
              <div>
                <span className="text-[11px] font-medium block" style={{ color: "#F0F1F2" }}>{lead.name}</span>
                <span className="text-[9px]" style={{ color: "#c9cdd1" }}>{lead.phone}</span>
              </div>
              <span className="text-[10px] truncate" style={{ color: "#c9cdd1" }}>{lead.resumo}</span>
              <QualBadge val={lead.qualLead} />
              <QualBadge val={lead.qualVendedor} />
              <span className={`text-[10px] font-semibold ${lead.vendeu ? "text-emerald-400" : "text-red-400"}`}>{lead.vendeu ? "Sim" : "Não"}</span>
              <span className="text-[10px] font-medium" style={{ color: "#F0F1F2" }}>{lead.valor}</span>
              <span className="text-center">📋</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${lead.origem === "trafego_pago" ? "bg-[#2f6fd6]/10 text-[#2f6fd6]" : "bg-[rgba(240,241,242,0.06)] text-[#c9cdd1]"}`}>{lead.origem === "trafego_pago" ? "Tráfego" : "Indef."}</span>
              <span className="text-[10px]" style={{ color: "#c9cdd1" }}>{lead.periodo}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScreenB({ lead, onBack }: { lead: LeadRow; onBack: () => void }) {
  return (
    <div>
      <button onClick={onBack} className="text-sm px-3 py-1.5 rounded-lg border transition-colors hover:bg-white/[0.05] mb-4" style={{ color: "#2f6fd6", borderColor: "rgba(47,111,214,0.3)" }}>
        ← Voltar ao painel
      </button>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="text-sm font-semibold" style={{ color: "#F0F1F2" }}>{lead.name}</span>
        <span className="text-[10px]" style={{ color: "#c9cdd1" }}>{lead.phone}</span>
        <QualBadge val={lead.qualLead} />
        <span className={`text-[10px] font-semibold ${lead.vendeu ? "text-emerald-400" : "text-red-400"}`}>{lead.vendeu ? "✓ Vendeu" : "✗ Não vendeu"}</span>
        {lead.vendeu && <span className="text-[10px] font-medium" style={{ color: "#F0F1F2" }}>{lead.valor}</span>}
      </div>

      {/* Conversation */}
      <div className="rounded-xl border p-4 mb-5 max-h-[320px] overflow-y-auto" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(240,241,242,0.10)" }}>
        <span className="text-[10px] font-semibold uppercase tracking-wider block mb-3" style={{ color: "#2f6fd6" }}>Conversa</span>
        <div className="space-y-2.5">
          {conversation.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              className={`flex ${msg.from === "lead" ? "justify-start" : "justify-end"}`}
            >
              <div
                className="max-w-[80%] rounded-2xl px-4 py-2.5 text-[12px] leading-relaxed"
                style={{
                  background: msg.from === "lead" ? "rgba(255,255,255,0.06)" : "rgba(47,111,214,0.12)",
                  color: "#F0F1F2", fontFamily: "Inter, sans-serif",
                  borderBottomLeftRadius: msg.from === "lead" ? 4 : undefined,
                  borderBottomRightRadius: msg.from === "vendedor" ? 4 : undefined,
                }}
              >
                <span className="text-[9px] font-semibold block mb-0.5" style={{ color: msg.from === "lead" ? "#c9cdd1" : "#2f6fd6" }}>
                  {msg.from === "lead" ? "Lead" : "Vendedor"}
                </span>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Summary */}
      <div className="rounded-xl border p-4 mb-4" style={{ background: "rgba(47,111,214,0.05)", borderColor: "rgba(47,111,214,0.2)" }}>
        <span className="text-[10px] font-semibold uppercase tracking-wider block mb-2" style={{ color: "#2f6fd6" }}>Resumo da Conversa</span>
        <p className="text-[12px] leading-relaxed" style={{ color: "#F0F1F2", fontFamily: "Inter, sans-serif" }}>
          Lead demonstrou alto interesse no pacote trimestral. Negociou desconto e fechou rapidamente após proposta personalizada. Tempo total de negociação: ~15 minutos. Valor fechado: R$ 1.020 (3x R$ 340).
        </p>
      </div>

      {/* Points */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl border p-4" style={{ background: "rgba(34,197,94,0.04)", borderColor: "rgba(34,197,94,0.15)" }}>
          <span className="text-[10px] font-semibold uppercase tracking-wider block mb-2" style={{ color: "#22c55e" }}>✓ Pontos Positivos do Vendedor</span>
          <ul className="space-y-1.5">
            <li className="text-[11px] flex items-start gap-1.5" style={{ color: "#F0F1F2" }}><span className="text-emerald-400 mt-0.5">✓</span>Respondeu rápido e com cordialidade</li>
            <li className="text-[11px] flex items-start gap-1.5" style={{ color: "#F0F1F2" }}><span className="text-emerald-400 mt-0.5">✓</span>Ofereceu opção de parcelamento proativamente</li>
            <li className="text-[11px] flex items-start gap-1.5" style={{ color: "#F0F1F2" }}><span className="text-emerald-400 mt-0.5">✓</span>Apresentou desconto sem desvalorizar o serviço</li>
          </ul>
        </div>
        <div className="rounded-xl border p-4" style={{ background: "rgba(239,68,68,0.04)", borderColor: "rgba(239,68,68,0.15)" }}>
          <span className="text-[10px] font-semibold uppercase tracking-wider block mb-2" style={{ color: "#ef4444" }}>⚠ Erros do Vendedor</span>
          <ul className="space-y-1.5">
            <li className="text-[11px] flex items-start gap-1.5" style={{ color: "#F0F1F2" }}><span className="text-red-400 mt-0.5">⚠</span>Não perguntou como a lead conheceu a empresa</li>
            <li className="text-[11px] flex items-start gap-1.5" style={{ color: "#F0F1F2" }}><span className="text-red-400 mt-0.5">⚠</span>Não agendou follow-up de pós-venda</li>
          </ul>
        </div>
      </div>

      {/* Next step */}
      <div className="rounded-xl border p-4 mb-4" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(240,241,242,0.10)" }}>
        <span className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: "#f59e0b" }}>🎯 Próximo Passo Sugerido</span>
        <p className="text-[11px]" style={{ color: "#F0F1F2" }}>Enviar mensagem de boas-vindas com instruções de onboarding em até 24h.</p>
      </div>

      <div className="flex gap-4 text-[9px]" style={{ color: "#c9cdd1" }}>
        <span>Lead ID: #{lead.id}</span>
        <span>Vendedor ID: #V-012</span>
        <span>Período: {lead.periodo}</span>
      </div>
    </div>
  );
}

export default function RoboVendasScene() {
  const [screen, setScreen] = useState<"A" | "B">("A");
  const [selectedLead, setSelectedLead] = useState<LeadRow>(leads[0]);

  return (
    <AnimatePresence mode="wait">
      {screen === "A" ? (
        <motion.div key="a" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
          <ScreenA onSelect={(lead) => { setSelectedLead(lead); setScreen("B"); }} />
        </motion.div>
      ) : (
        <motion.div key="b" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
          <ScreenB lead={selectedLead} onBack={() => setScreen("A")} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
