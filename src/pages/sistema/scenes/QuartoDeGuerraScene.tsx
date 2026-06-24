import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const periods = ["Hoje", "7 dias", "15 dias", "30 dias"] as const;
type Period = typeof periods[number];

interface Ad {
  name: string;
  thumb: string;
  status: "green" | "yellow" | "red";
  gasto: number;
  conversas: number;
  custoConv: number;
  visitasIg: number;
  cliquesLink: number;
  ctr: number;
  cpc: number;
  freq: number;
  impressoes: number;
  alcance: number;
  cliques: number;
  cpm: number;
  alerts: { col: string; text: string; color: "red" | "yellow" }[];
  spark: { v: number }[];
}

interface AdSet {
  name: string;
  ads: Ad[];
}

interface Campaign {
  name: string;
  objective: string;
  objColor: string;
  adSets: AdSet[];
}

interface Client {
  name: string;
  campaigns: Campaign[];
}

const data: Client[] = [
  {
    name: "Studio Bella",
    campaigns: [
      {
        name: "Lançamento Verão",
        objective: "Mensagens",
        objColor: "#2f6fd6",
        adSets: [
          {
            name: "Mulheres 25-40 — Fortaleza",
            ads: [
              {
                name: "Reels - Coleção Nova",
                thumb: "linear-gradient(135deg, #e879f9, #f472b6)",
                status: "red",
                gasto: 580, conversas: 12, custoConv: 48.33, visitasIg: 320, cliquesLink: 180, ctr: 1.2, cpc: 3.22, freq: 2.8, impressoes: 18400, alcance: 6500, cliques: 220, cpm: 31.52,
                alerts: [
                  { col: "Custo/Conv", text: "▲382.1%", color: "red" },
                  { col: "Frequência", text: "▲45%", color: "yellow" },
                ],
                spark: [{ v: 40 }, { v: 55 }, { v: 70 }, { v: 90 }, { v: 120 }, { v: 140 }, { v: 130 }],
              },
              {
                name: "Carrossel - Promoção",
                thumb: "linear-gradient(135deg, #60a5fa, #818cf8)",
                status: "green",
                gasto: 320, conversas: 28, custoConv: 11.43, visitasIg: 540, cliquesLink: 310, ctr: 3.1, cpc: 1.03, freq: 1.4, impressoes: 22100, alcance: 15800, cliques: 685, cpm: 14.48,
                alerts: [],
                spark: [{ v: 80 }, { v: 75 }, { v: 82 }, { v: 78 }, { v: 85 }, { v: 80 }, { v: 83 }],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Vita Clean",
    campaigns: [
      {
        name: "Captação Leads Saúde",
        objective: "Tráfego",
        objColor: "#22c55e",
        adSets: [
          {
            name: "Interesse: Bem-estar — CE",
            ads: [
              {
                name: "Vídeo Depoimento",
                thumb: "linear-gradient(135deg, #34d399, #06b6d4)",
                status: "yellow",
                gasto: 410, conversas: 19, custoConv: 21.58, visitasIg: 280, cliquesLink: 195, ctr: 2.1, cpc: 2.10, freq: 2.1, impressoes: 19500, alcance: 9200, cliques: 410, cpm: 21.03,
                alerts: [
                  { col: "Custo/Conv", text: "▲28%", color: "yellow" },
                ],
                spark: [{ v: 50 }, { v: 60 }, { v: 55 }, { v: 70 }, { v: 80 }, { v: 75 }, { v: 85 }],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Doce Sabor",
    campaigns: [
      {
        name: "Delivery Weekend",
        objective: "Engajamento",
        objColor: "#a855f7",
        adSets: [
          {
            name: "Raio 5km — Horário Almoço",
            ads: [
              {
                name: "Stories - Combo do Dia",
                thumb: "linear-gradient(135deg, #fb923c, #f97316)",
                status: "red",
                gasto: 720, conversas: 8, custoConv: 90.00, visitasIg: 150, cliquesLink: 95, ctr: 0.8, cpc: 7.58, freq: 3.5, impressoes: 24000, alcance: 6800, cliques: 192, cpm: 30.00,
                alerts: [
                  { col: "Custo/Conv", text: "▲520%", color: "red" },
                  { col: "CTR", text: "▼62%", color: "red" },
                ],
                spark: [{ v: 60 }, { v: 80 }, { v: 110 }, { v: 140 }, { v: 160 }, { v: 180 }, { v: 170 }],
              },
              {
                name: "Feed - Cardápio Novo",
                thumb: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                status: "green",
                gasto: 280, conversas: 32, custoConv: 8.75, visitasIg: 620, cliquesLink: 410, ctr: 3.8, cpc: 0.68, freq: 1.2, impressoes: 17600, alcance: 14700, cliques: 669, cpm: 15.91,
                alerts: [],
                spark: [{ v: 70 }, { v: 68 }, { v: 72 }, { v: 75 }, { v: 70 }, { v: 73 }, { v: 71 }],
              },
            ],
          },
        ],
      },
    ],
  },
];

const critCount = data.flatMap(c => c.campaigns.flatMap(cm => cm.adSets.flatMap(as => as.ads))).filter(a => a.status === "red").length;
const warnCount = data.flatMap(c => c.campaigns.flatMap(cm => cm.adSets.flatMap(as => as.ads))).filter(a => a.status === "yellow").length;
const okCount = data.flatMap(c => c.campaigns.flatMap(cm => cm.adSets.flatMap(as => as.ads))).filter(a => a.status === "green").length;

const columns = ["Gasto", "Conv.", "Custo/Conv", "Vis. IG", "Cliq. Link", "CTR", "CPC", "Freq.", "Impr.", "Alcance", "Cliques", "CPM"];

function getAdValues(ad: Ad): string[] {
  return [
    `R$ ${ad.gasto}`, String(ad.conversas), `R$ ${ad.custoConv.toFixed(2)}`,
    String(ad.visitasIg), String(ad.cliquesLink), `${ad.ctr}%`, `R$ ${ad.cpc.toFixed(2)}`,
    ad.freq.toFixed(1), ad.impressoes.toLocaleString("pt-BR"), ad.alcance.toLocaleString("pt-BR"),
    String(ad.cliques), `R$ ${ad.cpm.toFixed(2)}`,
  ];
}

function AlertBadge({ alert }: { alert: { text: string; color: "red" | "yellow" } }) {
  return (
    <span className={`ml-1 text-[9px] font-bold px-1 py-0.5 rounded ${alert.color === "red" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>
      {alert.text}
    </span>
  );
}

export default function QuartoDeGuerraScene() {
  const [period, setPeriod] = useState<Period>("7 dias");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "Studio Bella": true, "Studio Bella>Lançamento Verão": true, "Studio Bella>Lançamento Verão>Mulheres 25-40 — Fortaleza": true });
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [alertsOnly, setAlertsOnly] = useState(false);

  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const periodCompare: Record<Period, string> = {
    "Hoje": "ontem",
    "7 dias": "7 dias anteriores",
    "15 dias": "15 dias anteriores",
    "30 dias": "30 dias anteriores",
  };

  const filteredData = alertsOnly
    ? data.map(client => ({
        ...client,
        campaigns: client.campaigns.map(c => ({
          ...c,
          adSets: c.adSets.map(as => ({
            ...as,
            ads: as.ads.filter(a => a.alerts.length > 0),
          })).filter(as => as.ads.length > 0),
        })).filter(c => c.adSets.length > 0),
      })).filter(cl => cl.campaigns.length > 0)
    : data;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(47,111,214,0.2)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2f6fd6" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>
          </div>
          <span className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F0F1F2" }}>Quarto de Guerra</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px]" style={{ color: "#ef4444" }}><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{critCount} críticos</span>
          <span className="flex items-center gap-1 text-[10px]" style={{ color: "#f59e0b" }}><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />{warnCount} atenção</span>
          <span className="flex items-center gap-1 text-[10px]" style={{ color: "#22c55e" }}><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{okCount} saudáveis</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {periods.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p ? "bg-[#2f6fd6]/20 text-[#2f6fd6] border border-[#2f6fd6]/40" : "text-[#c9cdd1] border border-[rgba(240,241,242,0.08)] hover:bg-white/[0.03]"}`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >{p}</button>
        ))}
        <span className="text-[10px] ml-2" style={{ color: "#c9cdd1" }}>Comparando com: {periodCompare[period]}</span>
        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <div
              className={`w-8 h-4 rounded-full relative transition-colors ${alertsOnly ? "bg-[#2f6fd6]" : "bg-[rgba(240,241,242,0.15)]"}`}
              onClick={() => setAlertsOnly(!alertsOnly)}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${alertsOnly ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span className="text-[10px]" style={{ color: "#c9cdd1" }}>Só alertas</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-x-auto" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(240,241,242,0.12)" }}>
        {/* Column header */}
        <div className="flex items-center min-w-[1100px] px-4 py-2 border-b" style={{ borderColor: "rgba(240,241,242,0.06)" }}>
          <div className="w-[280px] shrink-0 text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#c9cdd1" }}>Hierarquia</div>
          {columns.map(col => (
            <div key={col} className="w-[70px] shrink-0 text-[9px] font-semibold uppercase tracking-wider text-center" style={{ color: "#c9cdd1" }}>{col}</div>
          ))}
        </div>

        {/* Rows */}
        {filteredData.map(client => {
          const cKey = client.name;
          return (
            <div key={cKey}>
              {/* L1: Client */}
              <button onClick={() => toggle(cKey)} className="flex items-center w-full min-w-[1100px] px-4 py-2.5 border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "rgba(240,241,242,0.04)" }}>
                <div className="w-[280px] shrink-0 flex items-center gap-2 text-left">
                  <span className="text-[10px]" style={{ color: "#c9cdd1" }}>{expanded[cKey] ? "▼" : "▶"}</span>
                  <span className="text-xs font-semibold" style={{ color: "#F0F1F2" }}>{client.name}</span>
                </div>
              </button>

              <AnimatePresence>
                {expanded[cKey] && client.campaigns.map(camp => {
                  const cmKey = `${cKey}>${camp.name}`;
                  return (
                    <motion.div key={cmKey} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      {/* L2: Campaign */}
                      <button onClick={() => toggle(cmKey)} className="flex items-center w-full min-w-[1100px] px-4 py-2 border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "rgba(240,241,242,0.04)" }}>
                        <div className="w-[280px] shrink-0 flex items-center gap-2 pl-5 text-left">
                          <span className="text-[10px]" style={{ color: "#c9cdd1" }}>{expanded[cmKey] ? "▼" : "▶"}</span>
                          <span className="text-[11px] font-medium" style={{ color: "#F0F1F2" }}>{camp.name}</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: `${camp.objColor}20`, color: camp.objColor }}>{camp.objective}</span>
                        </div>
                      </button>

                      <AnimatePresence>
                        {expanded[cmKey] && camp.adSets.map(adSet => {
                          const asKey = `${cmKey}>${adSet.name}`;
                          return (
                            <motion.div key={asKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              {/* L3: Ad Set */}
                              <button onClick={() => toggle(asKey)} className="flex items-center w-full min-w-[1100px] px-4 py-2 border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "rgba(240,241,242,0.04)" }}>
                                <div className="w-[280px] shrink-0 flex items-center gap-2 pl-10 text-left">
                                  <span className="text-[10px]" style={{ color: "#c9cdd1" }}>{expanded[asKey] ? "▼" : "▶"}</span>
                                  <span className="text-[11px]" style={{ color: "#c9cdd1" }}>{adSet.name}</span>
                                </div>
                              </button>

                              <AnimatePresence>
                                {expanded[asKey] && adSet.ads.map((ad, ai) => {
                                  const values = getAdValues(ad);
                                  return (
                                    <motion.div
                                      key={ai}
                                      initial={{ opacity: 0, y: 4 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0 }}
                                      transition={{ delay: ai * 0.05 }}
                                      className="flex items-center min-w-[1100px] px-4 py-2.5 border-b hover:bg-[rgba(47,111,214,0.03)] transition-colors"
                                      style={{ borderColor: "rgba(240,241,242,0.04)" }}
                                    >
                                      {/* L4: Ad */}
                                      <div className="w-[280px] shrink-0 flex items-center gap-2.5 pl-14">
                                        <div className="w-8 h-8 rounded-md shrink-0" style={{ background: ad.thumb }} />
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${ad.status === "green" ? "bg-emerald-400" : ad.status === "yellow" ? "bg-amber-400" : "bg-red-400"}`} style={{ boxShadow: `0 0 6px ${ad.status === "green" ? "rgba(52,211,153,0.5)" : ad.status === "yellow" ? "rgba(251,191,36,0.5)" : "rgba(239,68,68,0.5)"}` }} />
                                        <span className="text-[11px] truncate" style={{ color: "#F0F1F2" }}>{ad.name}</span>
                                      </div>
                                      {values.map((val, vi) => {
                                        const cellId = `${ad.name}-${columns[vi]}`;
                                        const alert = ad.alerts.find(a => a.col === columns[vi]);
                                        return (
                                          <div
                                            key={vi}
                                            className="w-[70px] shrink-0 text-center text-[10px] font-medium relative"
                                            style={{ color: "#F0F1F2" }}
                                            onMouseEnter={() => setHoveredCell(cellId)}
                                            onMouseLeave={() => setHoveredCell(null)}
                                          >
                                            {val}
                                            {alert && <AlertBadge alert={alert} />}
                                            {hoveredCell === cellId && (
                                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 px-2 py-1 rounded text-[9px] whitespace-nowrap pointer-events-none" style={{ background: "#1e293b", border: "1px solid rgba(47,111,214,0.3)", color: "#F0F1F2" }}>
                                                {columns[vi]}: {val}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </motion.div>
                                  );
                                })}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
