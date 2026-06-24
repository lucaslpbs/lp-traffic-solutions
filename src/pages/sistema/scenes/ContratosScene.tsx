import { motion } from "framer-motion";

export default function ContratosScene() {
  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full">
        {/* Form icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex-shrink-0 w-20 h-20 rounded-2xl border flex items-center justify-center"
          style={{ background: "rgba(47,111,214,0.08)", borderColor: "rgba(47,111,214,0.25)" }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2f6fd6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </motion.div>

        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="hidden sm:flex items-center origin-left"
        >
          <div className="w-16 h-px" style={{ background: "rgba(47,111,214,0.4)" }} />
          <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-transparent" style={{ borderLeftColor: "rgba(47,111,214,0.4)" }} />
        </motion.div>

        {/* Mobile arrow (vertical) */}
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="sm:hidden flex flex-col items-center origin-top"
        >
          <div className="w-px h-10" style={{ background: "rgba(47,111,214,0.4)" }} />
          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[8px] border-transparent" style={{ borderTopColor: "rgba(47,111,214,0.4)" }} />
        </motion.div>

        {/* Document generating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex-shrink-0 w-20 h-20 rounded-2xl border flex items-center justify-center relative overflow-hidden"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(240,241,242,0.12)" }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F0F1F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          {/* Progress bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 0.7, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 h-1"
            style={{ background: "#2f6fd6" }}
          />
        </motion.div>
      </div>

      {/* Final state */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.8 }}
        className="mt-8 rounded-xl border px-6 py-4 text-center w-full"
        style={{ background: "rgba(52,211,153,0.06)", borderColor: "rgba(52,211,153,0.25)" }}
      >
        <div className="flex items-center justify-center gap-2">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 2.0 }}
            className="text-emerald-400 text-xl"
          >
            ✓
          </motion.span>
          <span className="text-sm font-semibold" style={{ color: "#F0F1F2", fontFamily: "Inter, sans-serif" }}>
            Contrato gerado e enviado para assinatura
          </span>
        </div>
      </motion.div>
    </div>
  );
}
