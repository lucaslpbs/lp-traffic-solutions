import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 48 : -48, filter: "blur(6px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -48 : 48, filter: "blur(6px)" }),
};

export function QuestionScreen({
  stepKey,
  direction,
  eyebrow,
  title,
  subtitle,
  children,
  onBack,
  onContinue,
  continueLabel = "Continuar",
  showBack = true,
}: {
  stepKey: string;
  direction: number;
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  showBack?: boolean;
}) {
  return (
    <motion.div
      key={stepKey}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-10 sm:px-10"
    >
      <div>
        <span className="rme-eyebrow">{eyebrow}</span>
        <h2 className="rme-display mt-4 text-[clamp(1.6rem,4.4vw,2.6rem)]">{title}</h2>
        {subtitle && (
          <p className="mt-3 text-[1.02rem]" style={{ color: "hsl(var(--rme-paper-dim))" }}>
            {subtitle}
          </p>
        )}
      </div>

      {children && <div className="flex flex-col gap-4">{children}</div>}

      <div className="mt-4 flex items-center gap-4">
        {showBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="rme-pill inline-flex items-center gap-2 px-5 py-3 text-sm font-medium"
            style={{
              background: "hsl(var(--rme-paper) / 0.06)",
              border: "1px solid hsl(var(--rme-paper) / 0.12)",
              color: "hsl(var(--rme-paper-dim))",
            }}
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
        )}
        <button
          type="button"
          onClick={onContinue}
          className="rme-cta rme-pill ml-auto inline-flex items-center gap-3 px-7 py-3.5 text-[0.98rem]"
        >
          {continueLabel}
          <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
        </button>
      </div>
    </motion.div>
  );
}
