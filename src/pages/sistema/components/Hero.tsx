import { useEffect, useRef, useState } from "react";
import { useMousePosition } from "../hooks/useMousePosition";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface Particle {
  x: number;
  y: number;
  speed: number;
  opacity: number;
  fadeDelay: number;
  fadeStart: number;
  fadingOut: boolean;
  reset: (canvas: HTMLCanvasElement) => void;
  update: () => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

const previewRows = [
  {
    client: "Studio Bella",
    campaign: "Lançamento Verão",
    adSet: "Mulheres 25-40 — Fortaleza",
    spend: "R$ 1.240",
    spark: [{ v: 320 }, { v: 290 }, { v: 380 }, { v: 520 }, { v: 580 }],
    alert: { type: "danger" as const, text: "⚠ custo 38% acima" },
  },
  {
    client: "Vita Clean",
    campaign: "Captação Leads",
    adSet: "Interesse: Saúde — CE",
    spend: "R$ 890",
    spark: [{ v: 180 }, { v: 200 }, { v: 210 }, { v: 250 }, { v: 230 }],
    alert: null,
  },
  {
    client: "Doce Sabor",
    campaign: "Delivery App",
    adSet: "Raio 5km — Almoço",
    spend: "R$ 2.100",
    spark: [{ v: 450 }, { v: 420 }, { v: 500 }, { v: 530 }, { v: 560 }],
    alert: { type: "warning" as const, text: "⚠ subiu 12%" },
  },
];

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const { mouse, handleMouseMove } = useMousePosition();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const createParticle = (canvas: HTMLCanvasElement): Particle => {
    const particle: Particle = {
      x: 0, y: 0, speed: 0, opacity: 1,
      fadeDelay: 0, fadeStart: 0, fadingOut: false,
      reset(c: HTMLCanvasElement) {
        this.x = Math.random() * c.width;
        this.y = Math.random() * c.height;
        this.speed = Math.random() / 5 + 0.1;
        this.opacity = 1;
        this.fadeDelay = Math.random() * 600 + 100;
        this.fadeStart = Date.now() + this.fadeDelay;
        this.fadingOut = false;
      },
      update() {
        this.y -= this.speed;
        if (this.y < 0) this.reset(canvas);
        if (!this.fadingOut && Date.now() > this.fadeStart) this.fadingOut = true;
        if (this.fadingOut) {
          this.opacity -= 0.008;
          if (this.opacity <= 0) this.reset(canvas);
        }
      },
      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = `rgba(216, 230, 255, ${this.opacity})`;
        ctx.fillRect(this.x, this.y, 0.4, Math.random() * 2 + 1);
      },
    };
    particle.reset(canvas);
    particle.y = Math.random() * canvas.height;
    return particle;
  };

  const initParticles = (canvas: HTMLCanvasElement) => {
    const count = Math.floor((canvas.width * canvas.height) / 6000);
    particlesRef.current = [];
    for (let i = 0; i < count; i++) particlesRef.current.push(createParticle(canvas));
  };

  const animate = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesRef.current.forEach((p) => { p.update(); p.draw(ctx); });
    animationRef.current = requestAnimationFrame(() => animate(canvas, ctx));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas);
    };
    handleResize();
    animate(canvas, ctx);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleMouse = (e: React.MouseEvent) => {
    handleMouseMove(e);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x: y * -6, y: x * 6 });
  };

  return (
    <section
      id="hero"
      onMouseMove={handleMouse}
      className="relative w-full overflow-hidden"
      style={{
        minHeight: "100vh",
        background: "#161819",
        backgroundImage: "linear-gradient(0deg, rgba(47,111,214,0.06), rgba(8,35,71,0.10))",
      }}
    >
      <style>{`
        @property --p { syntax: '<percentage>'; initial-value: 0%; inherits: false; }
        @keyframes ts-load { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes ts-up { 100% { transform: translateY(0); } }
        @keyframes ts-pulse { 0% { --p: 0%; } 50% { --p: 300%; } 100% { --p: 300%; } }
        @keyframes ts-spotlight {
          0% { transform: rotateZ(0deg) scale(1); filter: blur(15px) opacity(0.5); }
          20% { transform: rotateZ(-1deg) scale(1.2); filter: blur(16px) opacity(0.6); }
          40% { transform: rotateZ(2deg) scale(1.3); filter: blur(14px) opacity(0.4); }
          60% { transform: rotateZ(-2deg) scale(1.2); filter: blur(15px) opacity(0.6); }
          80% { transform: rotateZ(1deg) scale(1.1); filter: blur(13px) opacity(0.4); }
          100% { transform: rotateZ(0deg) scale(1); filter: blur(15px) opacity(0.5); }
        }
        @keyframes ts-loadrot { 0% { transform: rotate(0deg) scale(0); } 100% { transform: scale(1); } }
        @keyframes ts-accentload { 0% { opacity: 0; transform: scale(0); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes ts-ctapulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes ts-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>

      {/* Spotlight with mouse parallax */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 mx-auto overflow-hidden"
        style={{
          height: "42em", width: "100%",
          transform: `translate(${mouse.x}px, ${mouse.y}px)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              borderRadius: "0 0 50% 50%",
              position: "absolute", left: 0, right: 0, margin: "0 auto", top: "3em",
              width: "30em", height: "max(42em, 86vh)",
              backgroundImage:
                "conic-gradient(from 0deg at 50% -5%, transparent 45%, rgba(47,111,214,.30) 49%, rgba(47,111,214,.45) 50%, rgba(47,111,214,.30) 51%, transparent 55%)",
              transformOrigin: "50% 0",
              filter: "blur(15px) opacity(0.5)", zIndex: -1,
              transform: i === 0 ? "rotate(20deg)" : i === 1 ? "rotate(-20deg)" : "rotate(0deg)",
              animation: i === 0
                ? "ts-load 2s ease-in-out forwards, ts-loadrot 2s ease-in-out forwards, ts-spotlight 17s ease-in-out infinite"
                : i === 1
                ? "ts-load 2s ease-in-out forwards, ts-loadrot 2s ease-in-out forwards, ts-spotlight 14s ease-in-out infinite"
                : "ts-load 2s ease-in-out forwards, ts-loadrot 2s ease-in-out forwards, ts-spotlight 21s ease-in-out infinite reverse",
            }}
          />
        ))}
      </div>

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ animation: "ts-load 0.4s ease-in-out forwards", width: "100%", height: "100%" }}
      />

      <div className="pointer-events-none absolute top-0 left-0 right-0 w-full" style={{ height: "42em", zIndex: -2 }}>
        {[6, 11, 16, 24, 29].map((top, i) => (
          <div key={`h-${i}`} className="absolute right-0 left-0 mx-auto w-full" style={{
            top: `${top}em`, height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(240,241,242,.12), transparent)",
            opacity: 0, transform: "scale(0)", animation: "ts-accentload 2s ease-out 2.4s forwards",
          }} />
        ))}
        {[24, 34, -24, -34].map((left, i) => (
          <div key={`v-${i}`} className="absolute top-0" style={{
            left: left > 0 ? `${left}em` : "auto",
            right: left < 0 ? `${Math.abs(left)}em` : "auto",
            margin: "auto", width: "1px", height: "100%",
            background: "rgba(240,241,242,.12)",
            opacity: 0, transform: "scale(0)", animation: "ts-accentload 2s ease-out 2s forwards",
          }} />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-[2] flex flex-col items-center justify-center text-center px-[6vw] pt-28 pb-16 lg:pt-32 lg:pb-20">
        <div
          className="uppercase tracking-[0.28em] text-[0.78rem] font-semibold"
          style={{ fontFamily: "Inter, sans-serif", color: "#2f6fd6", opacity: 0, animation: "ts-load 1.4s ease-in-out 0.2s forwards" }}
        >
          Traffic Solutions · Sistema de Operação
        </div>

        <div className="relative mt-[22px]" style={{ opacity: 0, transform: "translateY(-1.2em)", animation: "ts-load 2s ease-in-out 0.5s forwards" }}>
          <h1
            className="m-0 leading-[1.05]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(2.2rem, 5.5vw, 4.2rem)", color: "#F0F1F2" }}
          >
            O sistema da sua agência.
            <br />
            <span style={{
              background: `radial-gradient(2em 2em at 50% 50%, transparent calc(var(--p, 0%) - 2em), #2f6fd6 calc(var(--p, 0%) - 1em), #2f6fd6 calc(var(--p, 0%) - 0.4em), transparent var(--p, 0%)), linear-gradient(0deg, #184892 30%, #2f6fd6 100%)`,
              backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              textShadow: "0 2px 20px rgba(47,111,214,.35)", animation: "ts-pulse 9s linear 1.4s infinite",
            }}>
              Pra você ganhar tempo de volta.
            </span>
          </h1>
        </div>

        <p
          className="mt-[26px] max-w-[580px] text-[1.08rem] leading-[1.65]"
          style={{
            color: "#c9cdd1", fontFamily: "Inter, sans-serif",
            opacity: 0, transform: "translateY(1em)",
            animation: "ts-load 2s ease-out 1.6s forwards, ts-up 1.4s ease-out 1.6s forwards",
          }}
        >
          Relatórios automáticos, quarto de guerra, robô de atendimento e mais — rodando juntos, com alerta antes que algo saia do controle.
        </p>

        <a
          href="https://wa.me/5585998088064"
          target="_blank"
          rel="noreferrer"
          className="mt-[38px] inline-flex items-center gap-[10px] rounded-full px-[34px] py-[16px] font-semibold text-[0.96rem] text-white no-underline hover:brightness-110 transition-all"
          style={{
            background: "#184892",
            opacity: 0,
            animation: "ts-load 2s ease-out 2.1s forwards, ts-ctapulse 2.4s ease-in-out 3s infinite",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Falar no WhatsApp
        </a>

        {/* Dashboard preview card with 3D tilt */}
        <div
          className="mt-14 w-full max-w-3xl"
          style={{
            perspective: "1000px",
            opacity: 0,
            animation: "ts-load 2s ease-out 2.4s forwards",
          }}
        >
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              background: "rgba(15,18,21,0.95)",
              borderColor: "rgba(240,241,242,0.12)",
              boxShadow: "0 25px 80px rgba(0,0,0,0.5), 0 0 40px rgba(47,111,214,0.08)",
              transformStyle: "preserve-3d",
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: "transform 0.15s ease-out",
              animation: "ts-float 6s ease-in-out infinite",
            }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "rgba(240,241,242,0.08)" }}>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md text-[10px]" style={{ background: "rgba(255,255,255,0.05)", color: "#c9cdd1", fontFamily: "Inter, sans-serif" }}>
                  app.trafficsolutions.com.br/guerra
                </div>
              </div>
            </div>

            {/* Mini header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "rgba(240,241,242,0.06)" }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(47,111,214,0.2)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2f6fd6" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </div>
                <span className="text-xs font-semibold" style={{ color: "#F0F1F2", fontFamily: "'Space Grotesk', sans-serif" }}>Quarto de Guerra</span>
              </div>
              <div className="flex gap-1.5">
                <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded" style={{ color: "#ef4444" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />1 crítico
                </span>
                <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded" style={{ color: "#f59e0b" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />1 atenção
                </span>
                <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded" style={{ color: "#22c55e" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />1 saudável
                </span>
              </div>
            </div>

            {/* Mini table */}
            <div className="hidden sm:grid grid-cols-[auto_1fr_1fr_80px_80px_auto] gap-3 px-4 py-2 border-b text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#c9cdd1", borderColor: "rgba(240,241,242,0.06)", fontFamily: "Inter, sans-serif" }}>
              <span></span><span>Cliente / Campanha</span><span>Conjunto</span><span>Gasto</span><span>Trend</span><span></span>
            </div>
            {previewRows.map((row, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_80px] sm:grid-cols-[auto_1fr_1fr_80px_80px_auto] gap-3 items-center px-4 py-2.5 border-b" style={{ borderColor: "rgba(240,241,242,0.04)" }}>
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
                <div>
                  <div className="text-[11px] font-medium" style={{ color: "#F0F1F2" }}>{row.client}</div>
                  <div className="text-[9px]" style={{ color: "#c9cdd1" }}>{row.campaign}</div>
                </div>
                <div className="text-[9px] hidden sm:block" style={{ color: "#c9cdd1" }}>{row.adSet}</div>
                <div className="text-[11px] font-semibold" style={{ color: "#F0F1F2", fontFamily: "'Space Grotesk', sans-serif" }}>{row.spend}</div>
                <div className="h-6 hidden sm:block">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={row.spark}>
                      <Line type="monotone" dataKey="v" stroke={row.alert?.type === "danger" ? "#ef4444" : row.alert?.type === "warning" ? "#f59e0b" : "#2f6fd6"} strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  {row.alert && (
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${row.alert.type === "danger" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>
                      {row.alert.text}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-10 text-[0.74rem] uppercase tracking-[0.18em]"
          style={{ color: "#c9cdd1", opacity: 0, animation: "ts-load 2s ease-out 2.8s forwards" }}
        >
          Role para ver o sistema funcionando
        </div>
      </div>
    </section>
  );
}
