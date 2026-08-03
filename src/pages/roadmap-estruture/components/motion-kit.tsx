import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";

/* ---------- Reveal ao entrar na viewport ---------- */
export function Reveal({
  children,
  delay = 0,
  y = 42,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Número que conta progressivamente ---------- */
export function CountUp({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 18 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, mv, to]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      setDisplay(
        v.toLocaleString("pt-BR", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }),
      );
    });
    return unsub;
  }, [spring, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ---------- Barra que preenche animando ---------- */
export function FillBar({
  value,
  max = 100,
  tone = "orange",
}: {
  value: number;
  max?: number;
  tone?: "orange" | "scarlet" | "muted";
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const bg =
    tone === "scarlet"
      ? "hsl(var(--rme-scarlet))"
      : tone === "muted"
        ? "hsl(var(--rme-paper) / 0.25)"
        : "var(--rme-grad-orange)";
  return (
    <div
      className="h-[6px] w-full rme-pill overflow-hidden"
      style={{ background: "hsl(var(--rme-paper) / 0.08)" }}
    >
      <motion.div
        className="h-full rme-pill"
        style={{ background: bg }}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

/* ---------- Blob orgânico com parallax leve ---------- */
export function Blob({
  color,
  size = 520,
  top,
  left,
  right,
  bottom,
  opacity = 0.24,
  speed = 90,
}: {
  color: string;
  size?: number;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  opacity?: number;
  speed?: number;
}) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, speed]);
  return (
    <motion.div
      aria-hidden="true"
      className="rme-blob"
      style={{
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        background: color,
        opacity,
        y,
      }}
    />
  );
}

/* ---------- Linha SVG que "desenha" conforme o scroll ---------- */
export function DrawnLine({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 35%"],
  });
  const pathLength = useSpring(scrollYProgress, { stiffness: 70, damping: 24 });

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <svg viewBox="0 0 40 1000" preserveAspectRatio="none" className="h-full w-full">
        <motion.path
          d="M20 0 C 4 160, 36 300, 20 460 C 4 620, 36 780, 20 1000"
          fill="none"
          stroke="hsl(var(--rme-orange))"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ pathLength, opacity: 0.75 }}
        />
      </svg>
    </div>
  );
}
