import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  ComposedChart, ResponsiveContainer, XAxis, YAxis, Tooltip,
} from "recharts";

const clients = [
  { name: "Studio Bella", nicho: "Moda", campaigns: 4 },
  { name: "Vita Clean", nicho: "Saúde", campaigns: 3 },
  { name: "Doce Sabor", nicho: "Alimentação", campaigns: 5 },
  { name: "Casa Aurora", nicho: "Decoração", campaigns: 2 },
  { name: "Pet Mania", nicho: "Pet Shop", campaigns: 3 },
  { name: "Looks da Ana", nicho: "Moda", campaigns: 4 },
];

const stats = [
  { label: "Total de Clientes", value: 6, icon: "📄", color: "#2f6fd6" },
  { label: "Campanhas Ativas", value: 21, icon: "📈", color: "#22c55e" },
  { label: "Relatórios Disponíveis", value: 42, icon: "💬", color: "#2f6fd6" },
];

const metrics = [
  { label: "Valor Total Gasto", value: 4280, prefix: "R$ ", icon: "💰" },
  { label: "Total de Conversas", value: 312, icon: "💬" },
  { label: "Custo por Conversa", value: 13.72, prefix: "R$ ", icon: "💬", decimals: 2 },
  { label: "Total de Compras", value: 87, icon: "📊" },
  { label: "Impressões", value: 145200, icon: "👁" },
  { label: "Alcance", value: 89400, icon: "👥" },
  { label: "CPM Médio", value: 29.48, prefix: "R$ ", icon: "👁", decimals: 2 },
  { label: "CTR Médio", value: 2.34, suffix: "%", icon: "👆", decimals: 2 },
  { label: "Cliques Totais", value: 3398, icon: "👆" },
  { label: "Cliques no Link", value: 2140, icon: "🔗" },
  { label: "Visitas Instagram", value: 1820, icon: "📷" },
  { label: "Visualizações 3s", value: 28400, icon: "🎬" },
];

const chartSpend = Array.from({ length: 14 }, (_, i) => ({ d: `${i + 1}/06`, v: 180 + Math.random() * 200 }));
const chartConversas = Array.from({ length: 14 }, (_, i) => ({ d: `${i + 1}/06`, bar: 15 + Math.floor(Math.random() * 20), line: 10 + Math.floor(Math.random() * 15) }));
const chartImpress = Array.from({ length: 14 }, (_, i) => ({ d: `${i + 1}/06`, v: 8000 + Math.random() * 5000 }));
const chartCliques = Array.from({ length: 14 }, (_, i) => ({ d: `${i + 1}/06`, v: 150 + Math.floor(Math.random() * 150) }));

function Counter({ end, decimals = 0, prefix = "", suffix = "" }: { end: number; decimals?: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(eased * end);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end]);
  const formatted = decimals > 0
    ? val.toFixed(decimals).replace(".", ",")
    : Math.round(val).toLocaleString("pt-BR");
  return <span>{prefix}{formatted}{suffix}</span>;
}

function ScreenA({ onSelect }: { onSelect: (name: string) => void }) {
  return (
    <div>
      <div className="mb-6">
        <h4 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F0F1F2" }}>
          Bem-vindo ao Dashboard
        </h4>
        <p className="text-sm mt-1" style={{ color: "#c9cdd1", fontFamily: "Inter, sans-serif" }}>
          Selecione um cliente para visualizar seus relatórios de desempenho
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border px-4 py-3 flex items-center gap-3"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(240,241,242,0.12)" }}
          >
            <span className="text-xl">{s.icon}</span>
            <div>
              <div className="text-xs" style={{ color: "#c9cdd1" }}>{s.label}</div>
              <div className="text-lg font-bold" style={{ color: "#F0F1F2", fontFamily: "'Space Grotesk', sans-serif" }}>
                <Counter end={s.value} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {clients.map((c, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            onClick={() => onSelect(c.name)}
            className="text-left rounded-xl border px-5 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#2f6fd6]/40 group"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(240,241,242,0.12)" }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold group-hover:text-[#2f6fd6] transition-colors" style={{ color: "#F0F1F2", fontFamily: "Inter, sans-serif" }}>
                {c.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
                {c.campaigns} campanhas
              </span>
            </div>
            <span className="text-xs" style={{ color: "#c9cdd1" }}>{c.nicho}</span>
            <span className="block text-xs mt-2 font-medium" style={{ color: "#2f6fd6" }}>Ver relatório →</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function ScreenB({ clientName, onBack }: { clientName: string; onBack: () => void }) {
  const [activeTab] = useState<"msg" | "site">("msg");

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="text-sm px-3 py-1.5 rounded-lg border transition-colors hover:bg-white/[0.05]" style={{ color: "#2f6fd6", borderColor: "rgba(47,111,214,0.3)" }}>
          ← Voltar
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(47,111,214,0.2)", color: "#2f6fd6" }}>
          {clientName[0]}
        </div>
        <div>
          <span className="text-sm font-semibold" style={{ color: "#F0F1F2" }}>{clientName}</span>
          <span className="text-[10px] ml-2" style={{ color: "#c9cdd1" }}>ID: #40{Math.floor(Math.random() * 90 + 10)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs" style={{ borderColor: "rgba(240,241,242,0.12)", color: "#c9cdd1" }}>
          <span>01/06/2026</span><span>—</span><span>14/06/2026</span>
        </div>
        <button className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(47,111,214,0.15)", color: "#2f6fd6" }}>Filtrar</button>
        <button className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ borderColor: "rgba(240,241,242,0.12)", color: "#c9cdd1" }}>PDF</button>
      </div>

      <div className="flex gap-2 mb-4">
        <button className={`px-3 py-1.5 rounded-lg text-xs font-medium ${activeTab === "msg" ? "bg-[#2f6fd6]/20 text-[#2f6fd6] border border-[#2f6fd6]/40" : "text-[#c9cdd1] border border-[rgba(240,241,242,0.08)]"}`}>Mensagem</button>
        <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#c9cdd1] border border-[rgba(240,241,242,0.08)]">Site</button>
      </div>

      <div className="mb-4">
        <h5 className="text-sm font-semibold" style={{ color: "#F0F1F2", fontFamily: "'Space Grotesk', sans-serif" }}>
          {clientName} — Mensagem
        </h5>
        <p className="text-[10px] mt-0.5" style={{ color: "#c9cdd1" }}>Período: 01/06/2026 - 14/06/2026</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mb-6">
        {metrics.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-lg border px-3 py-3 transition-all duration-200 hover:border-[#2f6fd6]/30"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(240,241,242,0.10)" }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{m.icon}</span>
              <span className="text-[10px]" style={{ color: "#c9cdd1" }}>{m.label}</span>
            </div>
            <div className="text-base font-bold" style={{ color: "#F0F1F2", fontFamily: "'Space Grotesk', sans-serif" }}>
              <Counter end={m.value} decimals={m.decimals} prefix={m.prefix} suffix={m.suffix} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "Valor Gasto por Dia", chart: (
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartSpend}><XAxis dataKey="d" hide /><YAxis hide /><Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(47,111,214,0.3)", borderRadius: 8, fontSize: 11 }} /><Area type="monotone" dataKey="v" stroke="#2f6fd6" fill="rgba(47,111,214,0.15)" strokeWidth={2} /></AreaChart>
            </ResponsiveContainer>
          )},
          { title: "Conversas Iniciadas", chart: (
            <ResponsiveContainer width="100%" height={140}>
              <ComposedChart data={chartConversas}><XAxis dataKey="d" hide /><YAxis hide /><Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(47,111,214,0.3)", borderRadius: 8, fontSize: 11 }} /><Bar dataKey="bar" fill="rgba(34,197,94,0.5)" radius={[3,3,0,0]} /><Line type="monotone" dataKey="line" stroke="#f97316" strokeWidth={2} dot={false} /></ComposedChart>
            </ResponsiveContainer>
          )},
          { title: "Impressões por Dia", chart: (
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chartImpress}><XAxis dataKey="d" hide /><YAxis hide /><Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(47,111,214,0.3)", borderRadius: 8, fontSize: 11 }} /><Line type="monotone" dataKey="v" stroke="#f97316" strokeWidth={2} dot={false} /></LineChart>
            </ResponsiveContainer>
          )},
          { title: "Cliques por Dia", chart: (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartCliques}><XAxis dataKey="d" hide /><YAxis hide /><Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(47,111,214,0.3)", borderRadius: 8, fontSize: 11 }} /><Bar dataKey="v" fill="rgba(139,92,246,0.5)" radius={[3,3,0,0]} /></BarChart>
            </ResponsiveContainer>
          )},
        ].map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="rounded-xl border p-4"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(240,241,242,0.10)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: "#F0F1F2" }}>{c.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded cursor-pointer hover:bg-white/5" style={{ color: "#c9cdd1" }}>Esconder</span>
            </div>
            {c.chart}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function WhatsAppCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-6 rounded-xl border p-5"
      style={{ background: "rgba(37,211,102,0.04)", borderColor: "rgba(37,211,102,0.2)" }}
    >
      <p className="text-xs font-medium mb-3" style={{ color: "#c9cdd1", fontFamily: "Inter, sans-serif" }}>
        Esse mesmo relatório também chega automaticamente no grupo do WhatsApp do cliente, todo dia.
      </p>
      <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.3)" }}>
        <div className="text-[11px] leading-relaxed space-y-1" style={{ color: "#F0F1F2", fontFamily: "Inter, sans-serif" }}>
          <p className="font-bold">📊 RELATÓRIO DIÁRIO 📊</p>
          <p><strong>Cliente:</strong> Studio Bella</p>
          <p><strong>Plataforma:</strong> Meta Ads</p>
          <p><strong>Data:</strong> 14/06/2026</p>
          <div className="my-2 h-px" style={{ background: "rgba(240,241,242,0.1)" }} />
          <p className="font-semibold text-[10px]">📌 Campanha: Lançamento Verão</p>
          <p className="text-[10px]">Status: ✅ Ativo · Objetivo: Mensagens</p>
          <p className="text-[10px]">💰 Investido: R$ 285,40</p>
          <p className="text-[10px]">💬 Conversas: 23 · Custo/conversa: R$ 12,41</p>
          <p className="text-[10px]">👁 Impressões: 12.400 · CPM: R$ 23,02</p>
          <p className="text-[10px]">👆 Cliques: 342</p>
          <div className="my-2 h-px" style={{ background: "rgba(240,241,242,0.1)" }} />
          <p className="text-[10px]">📊 <strong>Resumo:</strong> 23 conversas por R$ 285,40 — CPA de R$ 12,41</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function RelatoriosScene() {
  const [screen, setScreen] = useState<"A" | "B">("A");
  const [selectedClient, setSelectedClient] = useState("Studio Bella");

  return (
    <div>
      <AnimatePresence mode="wait">
        {screen === "A" ? (
          <motion.div key="a" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <ScreenA onSelect={(name) => { setSelectedClient(name); setScreen("B"); }} />
          </motion.div>
        ) : (
          <motion.div key="b" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
            <ScreenB clientName={selectedClient} onBack={() => setScreen("A")} />
          </motion.div>
        )}
      </AnimatePresence>
      <WhatsAppCard />
    </div>
  );
}
