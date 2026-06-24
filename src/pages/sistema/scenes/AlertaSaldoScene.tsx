import { motion } from "framer-motion";

const alerts = [
  {
    client: "Studio Bella",
    saldo: "R$ 142,30",
    time: "07:42",
  },
  {
    client: "Doce Sabor",
    saldo: "R$ 88,15",
    time: "09:18",
  },
  {
    client: "Casa Aurora",
    saldo: "R$ 201,00",
    time: "11:05",
  },
];

export default function AlertaSaldoScene() {
  return (
    <div className="flex justify-center">
      {/* WhatsApp group frame */}
      <div
        className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{ background: "#0b141a", borderColor: "rgba(240,241,242,0.15)" }}
      >
        {/* Group header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "rgba(240,241,242,0.08)", background: "rgba(255,255,255,0.03)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm" style={{ background: "rgba(47,111,214,0.2)", color: "#2f6fd6" }}>
            TS
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: "#F0F1F2", fontFamily: "Inter, sans-serif" }}>TS - Alertas Automáticos</div>
            <div className="text-[10px]" style={{ color: "#c9cdd1" }}>Sistema · Você</div>
          </div>
        </div>

        {/* Messages */}
        <div className="px-3 py-4 space-y-3" style={{ background: "linear-gradient(180deg, rgba(11,20,26,1), rgba(15,24,30,1))" }}>
          {alerts.map((alert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.35 }}
              className="max-w-[90%] rounded-xl px-4 py-3 relative"
              style={{
                background: "rgba(32,44,52,0.95)",
                borderLeft: "3px solid rgba(245,158,11,0.6)",
              }}
            >
              <div className="text-[12px] leading-relaxed space-y-1.5" style={{ color: "#F0F1F2", fontFamily: "Inter, sans-serif" }}>
                <p className="font-bold text-[13px]">⚠️ ALERTA DE SALDO META ADS ⚠️</p>
                <p className="text-[11px]" style={{ color: "#c9cdd1" }}>
                  O saldo da conta <strong style={{ color: "#F0F1F2" }}>{alert.client}</strong> está abaixo do limite mínimo definido.
                </p>
                <p className="text-[12px]">
                  Saldo atual: <strong style={{ color: "#f59e0b" }}>{alert.saldo}</strong>
                </p>
              </div>
              <div className="flex justify-end mt-1">
                <span className="text-[9px]" style={{ color: "rgba(240,241,242,0.4)" }}>
                  {alert.time} ✓✓
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
