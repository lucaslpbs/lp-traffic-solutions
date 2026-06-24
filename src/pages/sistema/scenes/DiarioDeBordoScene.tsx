import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Cadencia = "Diário" | "Semanal" | "Mensal";

interface ClientConfig {
  name: string;
  cadencia: Cadencia;
}

const reportData: Record<Cadencia, { label: string; periodo: string; investido: string; conversas: string; custoConv: string; impressoes: string; cpm: string; cliques: string; resumo: string }> = {
  "Diário": {
    label: "RELATÓRIO DIÁRIO",
    periodo: "23/06/2026",
    investido: "R$ 285,40",
    conversas: "23",
    custoConv: "R$ 12,41",
    impressoes: "12.400",
    cpm: "R$ 23,02",
    cliques: "342",
    resumo: "23 conversas por R$ 285,40 — CPA de R$ 12,41",
  },
  "Semanal": {
    label: "RELATÓRIO SEMANAL",
    periodo: "17/06 a 23/06/2026",
    investido: "R$ 1.890,20",
    conversas: "156",
    custoConv: "R$ 12,12",
    impressoes: "84.600",
    cpm: "R$ 22,34",
    cliques: "2.310",
    resumo: "156 conversas por R$ 1.890,20 em 7 dias — CPA de R$ 12,12",
  },
  "Mensal": {
    label: "RELATÓRIO MENSAL",
    periodo: "01/06 a 30/06/2026",
    investido: "R$ 7.640,00",
    conversas: "614",
    custoConv: "R$ 12,44",
    impressoes: "348.200",
    cpm: "R$ 21,94",
    cliques: "9.820",
    resumo: "614 conversas por R$ 7.640,00 em 30 dias — CPA de R$ 12,44",
  },
};

const cadencias: Cadencia[] = ["Diário", "Semanal", "Mensal"];

export default function DiarioDeBordoScene() {
  const [configs, setConfigs] = useState<ClientConfig[]>([
    { name: "Studio Bella", cadencia: "Diário" },
    { name: "Vita Clean", cadencia: "Semanal" },
    { name: "Doce Sabor", cadencia: "Mensal" },
  ]);
  const [highlighted, setHighlighted] = useState(0);

  const handleCadenciaChange = (index: number, cad: Cadencia) => {
    setConfigs(prev => prev.map((c, i) => i === index ? { ...c, cadencia: cad } : c));
    setHighlighted(index);
  };

  const activeClient = configs[highlighted];
  const data = reportData[activeClient.cadencia];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Part A — Config panel */}
      <div className="lg:w-[340px] shrink-0 space-y-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider block mb-2" style={{ color: "#2f6fd6", fontFamily: "Inter, sans-serif" }}>
          Configuração por cliente
        </span>
        {configs.map((client, i) => (
          <motion.div
            key={client.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border px-4 py-3.5 transition-all duration-300"
            style={{
              background: highlighted === i ? "rgba(47,111,214,0.06)" : "rgba(255,255,255,0.03)",
              borderColor: highlighted === i ? "rgba(47,111,214,0.4)" : "rgba(240,241,242,0.12)",
            }}
          >
            <div className="text-sm font-medium mb-2.5" style={{ color: "#F0F1F2", fontFamily: "Inter, sans-serif" }}>
              {client.name}
              {highlighted === i && (
                <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-[#2f6fd6]/20 text-[#2f6fd6] font-semibold">
                  preview ativo
                </span>
              )}
            </div>
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "rgba(240,241,242,0.12)" }}>
              {cadencias.map(cad => (
                <button
                  key={cad}
                  onClick={() => handleCadenciaChange(i, cad)}
                  className="flex-1 py-1.5 text-[11px] font-medium transition-all duration-200"
                  style={{
                    background: client.cadencia === cad ? "#2f6fd6" : "transparent",
                    color: client.cadencia === cad ? "#fff" : "#c9cdd1",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {cad}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Part B — WhatsApp preview */}
      <div className="flex-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider block mb-2" style={{ color: "#2f6fd6", fontFamily: "Inter, sans-serif" }}>
          Preview — {activeClient.name}
        </span>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeClient.name}-${activeClient.cadencia}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border overflow-hidden"
            style={{ background: "#0b141a", borderColor: "rgba(240,241,242,0.15)" }}
          >
            {/* Group header */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 border-b" style={{ borderColor: "rgba(240,241,242,0.08)", background: "rgba(255,255,255,0.03)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "rgba(47,111,214,0.2)", color: "#2f6fd6" }}>
                TS
              </div>
              <div>
                <div className="text-xs font-medium" style={{ color: "#F0F1F2" }}>TS - {activeClient.name}</div>
                <div className="text-[9px]" style={{ color: "#c9cdd1" }}>Sistema · Você · Cliente</div>
              </div>
            </div>

            {/* Message bubble */}
            <div className="px-3 py-4" style={{ background: "linear-gradient(180deg, rgba(11,20,26,1), rgba(15,24,30,1))" }}>
              <div
                className="max-w-[95%] rounded-xl px-4 py-3"
                style={{ background: "rgba(32,44,52,0.95)" }}
              >
                <div className="text-[11px] leading-[1.7] space-y-1" style={{ color: "#F0F1F2", fontFamily: "Inter, sans-serif" }}>
                  <p className="font-bold text-[12px]">📊 {data.label} 📊</p>
                  <p className="text-[10px]"><strong>Cliente:</strong> {activeClient.name}</p>
                  <p className="text-[10px]"><strong>Plataforma:</strong> Meta Ads</p>
                  <p className="text-[10px]"><strong>Data:</strong> {data.periodo}</p>

                  <div className="my-2 h-px" style={{ background: "rgba(240,241,242,0.1)" }} />

                  <p className="font-semibold text-[10px]">📌 Campanha: Lançamento Verão</p>
                  <p className="text-[10px]">Status: ✅ Ativo · Objetivo: Mensagens</p>
                  <p className="text-[10px]">💰 Investido: {data.investido}</p>
                  <p className="text-[10px]">💬 Conversas: {data.conversas} · Custo/conversa: {data.custoConv}</p>
                  <p className="text-[10px]">👁 Impressões: {data.impressoes} · CPM: {data.cpm}</p>
                  <p className="text-[10px]">👆 Cliques: {data.cliques}</p>

                  <div className="my-2 h-px" style={{ background: "rgba(240,241,242,0.1)" }} />

                  <p className="text-[10px]">📊 <strong>Resumo:</strong> {data.resumo}</p>
                </div>
                <div className="flex justify-end mt-1.5">
                  <span className="text-[8px]" style={{ color: "rgba(240,241,242,0.35)" }}>08:00 ✓✓</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
