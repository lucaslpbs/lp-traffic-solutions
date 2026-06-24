import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Negocio = "Studio Bella" | "Vita Clean" | "Doce Sabor";

const negocios: { name: Negocio; nicho: string }[] = [
  { name: "Studio Bella", nicho: "Moda" },
  { name: "Vita Clean", nicho: "Saúde" },
  { name: "Doce Sabor", nicho: "Alimentação" },
];

const prompts: Record<Negocio, string> = {
  "Studio Bella":
    'Você é o SDR da Studio Bella. Tom: descontraído, pode usar emoji com moderação. Sempre pergunte tamanho e cor antes de passar o preço. Nunca fale mal da concorrência.',
  "Vita Clean":
    'Você é o SDR da Vita Clean. Tom: formal e tranquilizador. Sempre pergunte qual procedimento o lead tem interesse e se já é paciente. Nunca prometa resultado sem avaliação.',
  "Doce Sabor":
    'Você é o SDR da Doce Sabor. Tom: caloroso, pode usar emoji de comida. Sempre pergunte a data do evento antes de falar de orçamento.',
};

interface Msg {
  from: "lead" | "sdr";
  text: string;
}

const conversations: Record<Negocio, Msg[]> = {
  "Studio Bella": [
    { from: "lead", text: "Oi! Quanto custa aquele vestido florido que vi no Instagram?" },
    { from: "sdr", text: "Oi! 😊 Que bom que gostou! Pra eu te passar o valor certinho, me conta: qual tamanho você usa e tem preferência de cor?" },
    { from: "lead", text: "Uso M, quero o azul marinho" },
    { from: "sdr", text: "Perfeito! O vestido florido azul marinho no M tá R$ 289,90 ✨ Quer que eu reserve pra você?" },
  ],
  "Vita Clean": [
    { from: "lead", text: "Olá, gostaria de saber sobre o procedimento de limpeza de pele" },
    { from: "sdr", text: "Olá! Obrigado pelo contato. A limpeza de pele é um dos nossos procedimentos mais procurados. Você já é paciente da Vita Clean?" },
    { from: "lead", text: "Não, seria a primeira vez" },
    { from: "sdr", text: "Seja bem-vinda! Para garantir o melhor resultado, o primeiro passo é uma avaliação com nossa especialista — sem custo. Posso agendar para você?" },
  ],
  "Doce Sabor": [
    { from: "lead", text: "Oi, vocês fazem encomenda de bolo pra aniversário?" },
    { from: "sdr", text: "Oii! 🎂 Fazemos sim, com todo carinho! Pra quando seria o evento?" },
    { from: "lead", text: "Dia 15 do mês que vem, pra 40 pessoas" },
    { from: "sdr", text: "Que delícia! 🍰 Pra 40 pessoas temos opções a partir de R$ 320. Posso te mandar nosso cardápio completo com fotos?" },
  ],
};

export default function SdrAtendimentoScene() {
  const [active, setActive] = useState<Negocio>("Studio Bella");

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Part A — Prompt panel */}
      <div className="lg:w-[380px] shrink-0">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider block mb-3"
          style={{ color: "#2f6fd6", fontFamily: "Inter, sans-serif" }}
        >
          Prompt do SDR — por negócio
        </span>

        {/* Segmented control */}
        <div
          className="flex rounded-lg overflow-hidden border mb-4"
          style={{ borderColor: "rgba(240,241,242,0.12)" }}
        >
          {negocios.map((n) => (
            <button
              key={n.name}
              onClick={() => setActive(n.name)}
              className="flex-1 py-2 text-[11px] font-medium transition-all duration-200"
              style={{
                background: active === n.name ? "#2f6fd6" : "transparent",
                color: active === n.name ? "#fff" : "#c9cdd1",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {n.name}
            </button>
          ))}
        </div>

        {/* Prompt editor */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border p-4 relative"
            style={{
              background: "rgba(0,0,0,0.35)",
              borderColor: "rgba(47,111,214,0.25)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>
              <span
                className="text-[9px] font-medium"
                style={{ color: "#c9cdd1" }}
              >
                prompt_{active.toLowerCase().replace(/ /g, "_")}.txt
              </span>
            </div>
            <p
              className="text-[12px] leading-relaxed"
              style={{
                color: "#F0F1F2",
                fontFamily: "'Courier New', Consolas, monospace",
              }}
            >
              {prompts[active]}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                className="inline-block w-[2px] h-[14px] ml-0.5 align-middle"
                style={{ background: "#2f6fd6" }}
              />
            </p>
          </motion.div>
        </AnimatePresence>

        <p
          className="text-[10px] mt-3 leading-relaxed"
          style={{ color: "#c9cdd1", fontFamily: "Inter, sans-serif" }}
        >
          Você edita quando quiser — o robô já responde diferente a partir da
          próxima conversa.
        </p>
      </div>

      {/* Part B — Chat preview */}
      <div className="flex-1">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider block mb-3"
          style={{ color: "#2f6fd6", fontFamily: "Inter, sans-serif" }}
        >
          Preview — conversa em tempo real
        </span>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border overflow-hidden"
            style={{
              background: "#0b141a",
              borderColor: "rgba(240,241,242,0.15)",
            }}
          >
            {/* Chat header */}
            <div
              className="flex items-center gap-2.5 px-4 py-3 border-b"
              style={{
                borderColor: "rgba(240,241,242,0.08)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: "rgba(47,111,214,0.2)",
                  color: "#2f6fd6",
                }}
              >
                {active[0]}
              </div>
              <div>
                <div
                  className="text-xs font-medium"
                  style={{ color: "#F0F1F2", fontFamily: "Inter, sans-serif" }}
                >
                  Lead — Via Anúncio Meta
                </div>
                <div className="text-[9px]" style={{ color: "#c9cdd1" }}>
                  Online agora
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              className="px-3 py-4 space-y-2.5 min-h-[260px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(11,20,26,1), rgba(15,24,30,1))",
              }}
            >
              {conversations[active].map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.25 }}
                  className={`flex ${msg.from === "lead" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className="max-w-[82%] rounded-2xl px-4 py-2.5"
                    style={{
                      background:
                        msg.from === "lead"
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(47,111,214,0.15)",
                      color: "#F0F1F2",
                      fontFamily: "Inter, sans-serif",
                      borderBottomLeftRadius:
                        msg.from === "lead" ? 4 : undefined,
                      borderBottomRightRadius:
                        msg.from === "sdr" ? 4 : undefined,
                    }}
                  >
                    <span
                      className="text-[9px] font-semibold flex items-center gap-1 mb-0.5"
                      style={{
                        color:
                          msg.from === "lead" ? "#c9cdd1" : "#2f6fd6",
                      }}
                    >
                      {msg.from === "lead" ? (
                        "Lead"
                      ) : (
                        <>
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1.07A7.001 7.001 0 0113 23h-2a7.001 7.001 0 01-6.93-6H3a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zm-2 10a2 2 0 100 4 2 2 0 000-4zm4 0a2 2 0 100 4 2 2 0 000-4z" />
                          </svg>
                          SDR · {active}
                        </>
                      )}
                    </span>
                    <span className="text-[12px] leading-relaxed block">
                      {msg.text}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
