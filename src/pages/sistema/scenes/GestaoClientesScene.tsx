import { useState } from "react";
import { motion } from "framer-motion";

const statsCards = [
  { label: "Total de Clientes", value: "6", icon: "👥", color: "#2f6fd6" },
  { label: "Clientes Ativos", value: "5", icon: "✅", color: "#22c55e" },
  { label: "MRR Total", value: "R$ 5.240", icon: "💰", color: "#22c55e" },
  { label: "Vencendo esta semana", value: "2", icon: "📅", color: "#f97316" },
];

interface ClientRow {
  id: number;
  name: string;
  nicho: string;
  contaAnuncio: string;
  whatsapp: string;
  valor: string;
  vencimento: string;
  status: "Ativo" | "Pausado";
  ultimoContato: string;
  cobranca: "Pendente" | "Enviada";
  fluxos: boolean;
}

const clients: ClientRow[] = [
  { id: 1, name: "Studio Bella", nicho: "Moda", contaAnuncio: "act_88210045", whatsapp: "5585999100000", valor: "R$ 1.200", vencimento: "Dia 10", status: "Ativo", ultimoContato: "22/06/2026", cobranca: "Enviada", fluxos: true },
  { id: 2, name: "Vita Clean", nicho: "Saúde", contaAnuncio: "act_77320089", whatsapp: "5585999120000", valor: "R$ 980", vencimento: "Dia 15", status: "Ativo", ultimoContato: "21/06/2026", cobranca: "Pendente", fluxos: true },
  { id: 3, name: "Doce Sabor", nicho: "Alimentação", contaAnuncio: "act_66430012", whatsapp: "5585999140000", valor: "R$ 750", vencimento: "Dia 5", status: "Ativo", ultimoContato: "20/06/2026", cobranca: "Enviada", fluxos: true },
  { id: 4, name: "Casa Aurora", nicho: "Decoração", contaAnuncio: "act_55540078", whatsapp: "5585999160000", valor: "R$ 890", vencimento: "Dia 20", status: "Ativo", ultimoContato: "19/06/2026", cobranca: "Pendente", fluxos: true },
  { id: 5, name: "Pet Mania", nicho: "Pet Shop", contaAnuncio: "act_44650034", whatsapp: "5585999180000", valor: "R$ 1.420", vencimento: "Dia 8", status: "Pausado", ultimoContato: "18/06/2026", cobranca: "Pendente", fluxos: false },
  { id: 6, name: "Looks da Ana", nicho: "Moda", contaAnuncio: "act_33760056", whatsapp: "5585999200000", valor: "R$ 600", vencimento: "Dia 12", status: "Ativo", ultimoContato: "22/06/2026", cobranca: "Enviada", fluxos: true },
];

export default function GestaoClientesScene() {
  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contaAnuncio.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(47,111,214,0.2)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2f6fd6" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <span className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F0F1F2" }}>Gestão de Clientes</span>
            <span className="block text-xs" style={{ color: "#c9cdd1" }}>Contratos, automações e cobranças</span>
          </div>
        </div>
        <button className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: "rgba(47,111,214,0.15)", color: "#2f6fd6" }}>
          + Novo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {statsCards.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border px-4 py-3"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(240,241,242,0.12)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{s.icon}</span>
              <span className="text-[10px]" style={{ color: "#c9cdd1" }}>{s.label}</span>
            </div>
            <div className="text-lg font-bold" style={{ color: "#F0F1F2", fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por nome ou conta..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-xs border bg-transparent outline-none focus:border-[#2f6fd6]/50 transition-colors"
          style={{ borderColor: "rgba(240,241,242,0.12)", color: "#F0F1F2", fontFamily: "Inter, sans-serif" }}
        />
        <select className="px-3 py-2 rounded-lg text-xs border bg-transparent cursor-pointer" style={{ borderColor: "rgba(240,241,242,0.12)", color: "#c9cdd1", background: "#161819" }}>
          <option>Todos status</option>
          <option>Ativo</option>
          <option>Pausado</option>
        </select>
        <select className="px-3 py-2 rounded-lg text-xs border bg-transparent cursor-pointer" style={{ borderColor: "rgba(240,241,242,0.12)", color: "#c9cdd1", background: "#161819" }}>
          <option>Todos contratos</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-x-auto" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(240,241,242,0.12)" }}>
        <div className="min-w-[1000px]">
          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_120px_130px_80px_70px_70px_90px_80px_80px_80px] gap-2 px-4 py-2.5 border-b" style={{ borderColor: "rgba(240,241,242,0.06)" }}>
            {["#", "Nome", "Conta Anúncio", "WhatsApp", "Valor", "Venc.", "Status", "Últ. Contato", "Cobrança", "Fluxos", "Ações"].map(h => (
              <span key={h} className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#c9cdd1", fontFamily: "Inter, sans-serif" }}>{h}</span>
            ))}
          </div>

          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onMouseEnter={() => setHoveredRow(c.id)}
              onMouseLeave={() => setHoveredRow(null)}
              className="grid grid-cols-[40px_1fr_120px_130px_80px_70px_70px_90px_80px_80px_80px] gap-2 items-center px-4 py-3 border-b transition-colors"
              style={{
                borderColor: "rgba(240,241,242,0.04)",
                background: hoveredRow === c.id ? "rgba(47,111,214,0.04)" : "transparent",
              }}
            >
              <span className="text-[10px]" style={{ color: "#c9cdd1" }}>{c.id}</span>
              <div>
                <span className="text-[11px] font-medium block" style={{ color: "#F0F1F2" }}>{c.name}</span>
                <span className="text-[9px]" style={{ color: "#c9cdd1" }}>{c.nicho}</span>
              </div>
              <span className="text-[10px] font-mono" style={{ color: "#c9cdd1" }}>{c.contaAnuncio}</span>
              <span className="text-[10px]" style={{ color: "#c9cdd1" }}>{c.whatsapp.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, "+$1 ($2) $3-$4")}</span>
              <span className="text-[11px] font-semibold" style={{ color: "#F0F1F2" }}>{c.valor}</span>
              <span className="text-[10px]" style={{ color: "#c9cdd1" }}>{c.vencimento}</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold inline-block text-center ${c.status === "Ativo" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                {c.status}
              </span>
              <span className="text-[10px]" style={{ color: "#c9cdd1" }}>{c.ultimoContato}</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium inline-block text-center ${c.cobranca === "Enviada" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                {c.cobranca}
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium inline-block text-center ${c.fluxos ? "bg-[#2f6fd6]/10 text-[#2f6fd6]" : "bg-[rgba(240,241,242,0.06)] text-[#c9cdd1]"}`}>
                {c.fluxos ? "✓ Ativas" : "— Inativas"}
              </span>
              <div className="flex gap-1.5">
                {["👁", "💬", "✏️", "▶"].map((icon, idx) => (
                  <span key={idx} className="cursor-pointer text-[11px] hover:scale-110 transition-transform">{icon}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
