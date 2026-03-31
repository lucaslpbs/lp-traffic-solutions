import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { useState } from "react";
import {
  overallNPSData,
  monthlyTimeline,
  perCourseNPS,
  wordFrequency,
  instructorMentions,
  futureCoursesDesired,
} from "./npsData";

type Curso = "Todos" | "ACLS" | "PALS" | "OUTRO" | "APH" | "PHTLS" | "AMLS" | "ATLS";
const CURSOS_FILTER: Curso[] = ["Todos", "ACLS", "PALS", "OUTRO", "APH", "PHTLS", "AMLS", "ATLS"];

// ─── Constantes de dados curados ─────────────────────────────────────────────

const TOP5_POSITIVOS = [
  "O curso foi muito bem ministrado e as aulas práticas foram bem executadas e tive um excelente aprendizado.",
  "Excelentes instrutores, didáticas impecáveis.",
  "Curso muito bom e proveitoso. Professoras excelentes e didáticas.",
  "O curso tem uma didática boa, organizado e os instrutores são bem capacitados e cordiais.",
  "Acho que foi bem didático, bem prático e adorei a metodologia da professora Larissa!",
];

const TOP5_CRITICOS = [
  "O coffee break foi muito ruim. Salgados frios e somente massa, além disso apenas uma opção de bebida. Terrível!!!",
  "O local é muito apertado.",
  "O curso é muito denso para ser realizado apenas em 2 dias.",
  "Voltar as apostilas físicas! Fiquei muito triste quando soube que era digital e solicitei a um amigo que me fornecesse a dele de cursos antigos.",
  "As macas caíram durante realização da RCP. Isso atrapalhou na qualidade das compressões, pois pelo receio de novos incidentes, as compressões tiveram de ser adaptadas. Sugiro obtenção de macas com material mais resistente.",
];

// Instrutores reais (>= 5 menções, sem ruído de parsing)
const INSTRUTORES_REAIS = instructorMentions
  .filter(
    (i) =>
      i.mentions >= 5 &&
      i.avgScore !== null &&
      !i.name.includes("Nota") &&
      !i.name.includes("Instrutores") &&
      !i.name.includes("Prof ") &&
      !i.name.includes("Instrutor ") &&
      !i.name.includes("Dr ") &&
      !i.name.includes("Dra ") &&
      !["Todos", "Ambos", "Vivi"].includes(i.name)
  )
  .slice(0, 10);

// Cursos futuros (sem NENHUM)
const CURSOS_FUTUROS = futureCoursesDesired
  .filter((c) => c.course !== "NENHUM")
  .slice(0, 10);

// Critérios globais (médias ponderadas do dataset completo)
const CRITERIOS = [
  { label: "Cordialidade dos instrutores", nota: 4.88 },
  { label: "Práticas diárias",             nota: 4.85 },
  { label: "Conteúdo ministrado",          nota: 4.72 },
  { label: "Facilidade de inscrição",      nota: 4.70 },
  { label: "Condições do local",           nota: 4.64 },
  { label: "Material / manequins",         nota: 4.46 },
  { label: "Alimentação",                  nota: 4.23 },
];

const MOTIVOS = [
  { motivo: "Indicação",     pct: 41.5 },
  { motivo: "Já conhecia",   pct: 31.7 },
  { motivo: "Credibilidade", pct: 18.7 },
  { motivo: "Por acaso",     pct: 8.1  },
];

// NPS por curso
const CURSOS_NPS = Object.entries(perCourseNPS).map(([nome, d]) => ({
  nome,
  nps: d.npsScore ?? 0,
  total: d.totalResponses,
  promotores: d.promoters,
  detratores: d.detractors,
}));

// Top palavras (remover ruído)
const TOP_PALAVRAS = wordFrequency
  .filter((w) => !["nada", "tudo", "gostei", "perfeito", "ótimo", "excelente"].includes(w.word))
  .slice(0, 15);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function npsColor(nps: number): string {
  if (nps >= 70) return "#1D9E75";
  if (nps >= 50) return "#3B82F6";
  if (nps >= 0)  return "#EF9F27";
  return "#E24B4A";
}

function notaColor(nota: number): string {
  if (nota >= 4.7) return "#1D9E75";
  if (nota >= 4.4) return "#3B82F6";
  return "#EF9F27";
}

function scoreColor(score: number): string {
  if (score >= 9.9) return "#1D9E75";
  if (score >= 9.5) return "#3B82F6";
  return "#EF9F27";
}

function npsLabel(nps: number): string {
  if (nps >= 75) return "Zona de Excelência";
  if (nps >= 50) return "Zona de Qualidade";
  if (nps >= 0)  return "Zona de Aperfeiçoamento";
  return "Zona Crítica";
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
  icon?: string;
}

function KpiCard({ label, value, color, sub, icon }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-muted/40 rounded-2xl p-4 flex flex-col gap-1 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </span>
        {icon && <span className="text-base">{icon}</span>}
      </div>
      <span className="text-2xl font-bold mt-1" style={color ? { color } : undefined}>
        {value}
      </span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

interface FeedbackCardProps {
  texto: string;
  tipo: "positivo" | "critico";
  rank: number;
}

const FEEDBACK_STYLES = {
  positivo: {
    border: "#1D9E75",
    bg: "#D1FAE5",
    icon: "★",
    iconColor: "#1D9E75",
  },
  critico: {
    border: "#E24B4A",
    bg: "#FEE2E2",
    icon: "↑",
    iconColor: "#E24B4A",
  },
};

function FeedbackCard({ texto, tipo, rank }: FeedbackCardProps) {
  const s = FEEDBACK_STYLES[tipo];
  return (
    <div
      className="rounded-xl p-4 flex gap-3 relative"
      style={{ borderLeft: `4px solid ${s.border}`, backgroundColor: s.bg + "44" }}
    >
      <span
        className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: s.border, color: "#fff" }}
      >
        {rank}
      </span>
      <p className="text-sm leading-relaxed flex-1 text-foreground">{texto}</p>
    </div>
  );
}

interface BarEndLabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
}

function BarEndLabel({ x = 0, y = 0, width = 0, height = 0, value }: BarEndLabelProps) {
  return (
    <text x={x + width + 6} y={y + height / 2} dominantBaseline="central" fontSize={11} fill="#6B7280">
      {value}
    </text>
  );
}

interface CenterLabelProps {
  cx?: number;
  cy?: number;
  score: number;
}

function CenterLabel({ cx = 0, cy = 0, score }: CenterLabelProps) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
      <tspan x={cx} dy="-0.5em" fontSize={26} fontWeight={700} fill="#1D9E75">
        {score}
      </tspan>
      <tspan x={cx} dy="1.5em" fontSize={10} fill="#6B7280">
        NPS Score
      </tspan>
    </text>
  );
}

interface TimelineTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function TimelineTooltip({ active, payload, label }: TimelineTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">{payload[0].value} avaliações</p>
    </div>
  );
}

// Seção de título reutilizável
function SectionTitle({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <h2 className="font-bold text-base text-foreground">{title}</h2>
      {badge && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function NpsDashboard() {
  const [cursoAtivo, setCursoAtivo] = useState<Curso>("Todos");

  // ── Dados filtrados pelo curso selecionado ───────────────────────────────
  const cursoData = cursoAtivo !== "Todos" ? perCourseNPS[cursoAtivo] : null;

  const npsScore      = cursoData ? (cursoData.npsScore ?? 0)      : overallNPSData.npsScore;
  const totalResponses = cursoData ? cursoData.totalResponses        : overallNPSData.totalResponses;
  const promoters     = cursoData ? cursoData.promoters             : overallNPSData.promoters;
  const passives      = cursoData ? cursoData.passives              : overallNPSData.passives;
  const detractors    = cursoData ? cursoData.detractors            : overallNPSData.detractors;
  const promotersPct  = cursoData ? +((promoters / totalResponses) * 100).toFixed(1) : overallNPSData.promotersPct;
  const passivesPct   = cursoData ? +((passives  / totalResponses) * 100).toFixed(1) : overallNPSData.passivesPct;
  const detractorsPct = cursoData ? +((detractors/ totalResponses) * 100).toFixed(1) : overallNPSData.detractorsPct;

  // Critérios: usa sub-dimensões do curso se filtrado, senão globais
  const criteriosAtivos = cursoData
    ? [
        { label: "Cordialidade dos instrutores", nota: cursoData.avgSubDimensions.cordialidadeInstrutores ?? 0 },
        { label: "Práticas diárias",             nota: cursoData.avgSubDimensions.praticas              ?? 0 },
        { label: "Conteúdo ministrado",          nota: cursoData.avgSubDimensions.conteudo              ?? 0 },
        { label: "Facilidade de inscrição",      nota: cursoData.avgSubDimensions.facilidadeInscricao   ?? 0 },
        { label: "Condições do local",           nota: cursoData.avgSubDimensions.condicoesLocal        ?? 0 },
        { label: "Material / manequins",         nota: cursoData.avgSubDimensions.material              ?? 0 },
        { label: "Alimentação",                  nota: cursoData.avgSubDimensions.alimentacao           ?? 0 },
      ]
    : CRITERIOS;

  const pieData = [
    { name: "Promotores",  value: promoters,  color: "#1D9E75" },
    { name: "Passivos",    value: passives,    color: "#EF9F27" },
    { name: "Detratores",  value: detractors,  color: "#E24B4A" },
  ];

  const motivoColors = ["#1D9E75", "#3B82F6", "#8B5CF6", "#EF9F27"];

  // Radar normalizado para 0-100
  const radarData = criteriosAtivos.map((c) => ({
    subject: c.label.split(" ")[0],
    fullLabel: c.label,
    value: Math.round((c.nota / 5) * 100),
  }));

  const feedbackRate = Math.round((373 / overallNPSData.totalResponses) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-background dark:to-muted/20 p-4 md:p-6 lg:p-8 space-y-6">

      {/* ── 1. HEADER ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-muted/40 rounded-2xl p-6 border border-border/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-bold text-2xl text-foreground">Dashboard NPS — NC Saúde</h1>
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
              >
                ✓ {npsLabel(npsScore)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {totalResponses.toLocaleString()} avaliações · Atualizado em 31/03/2026 · Baseado em dados reais do Kommo CRM
            </p>
          </div>
          {/* Destaque NPS */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl px-6 py-4 text-white shadow-lg">
            <div className="text-center">
              <div className="text-4xl font-black leading-none">{npsScore}</div>
              <div className="text-xs mt-1 opacity-80 font-medium">NPS Score</div>
            </div>
            <div className="text-xs space-y-1 opacity-90">
              <div>▲ {promoters} promotores</div>
              <div>◆ {passives} passivos</div>
              <div>▼ {detractors} detratores</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTRO POR CURSO ────────────────────────────────────── */}
      <div className="bg-white dark:bg-muted/40 rounded-2xl px-4 py-3 border border-border/50 shadow-sm flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-1">
          Filtrar por curso:
        </span>
        {CURSOS_FILTER.map((curso) => (
          <button
            key={curso}
            onClick={() => setCursoAtivo(curso)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={
              cursoAtivo === curso
                ? { backgroundColor: "#1D9E75", color: "#fff", boxShadow: "0 1px 4px rgba(29,158,117,.35)" }
                : { backgroundColor: "transparent", color: "#6B7280", border: "1px solid #E5E7EB" }
            }
          >
            {curso}
            {curso !== "Todos" && (
              <span className="ml-1.5 text-[10px] opacity-70">
                ({perCourseNPS[curso]?.totalResponses ?? 0})
              </span>
            )}
          </button>
        ))}
        {cursoAtivo !== "Todos" && (
          <span className="ml-auto text-xs text-muted-foreground italic">
            Mostrando dados de <strong>{cursoAtivo}</strong> · {totalResponses} avaliações
          </span>
        )}
      </div>

      {/* ── 2. KPI CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          label="Score NPS"
          value={npsScore}
          color="#1D9E75"
          sub={npsLabel(npsScore)}
          icon="🏆"
        />
        <KpiCard
          label="Promotores"
          value={promoters.toLocaleString()}
          color="#1D9E75"
          sub={`${promotersPct}% do total`}
          icon="★"
        />
        <KpiCard
          label="Passivos"
          value={passives.toLocaleString()}
          sub={`${passivesPct}% do total`}
          icon="◆"
        />
        <KpiCard
          label="Detratores"
          value={detractors.toLocaleString()}
          color="#E24B4A"
          sub={`${detractorsPct}% do total`}
          icon="▼"
        />
        <KpiCard
          label="Total"
          value={totalResponses.toLocaleString()}
          sub="avaliações coletadas"
          icon="📋"
        />
        <KpiCard
          label="Taxa feedback"
          value={`${feedbackRate}%`}
          color="#3B82F6"
          sub="comentaram"
          icon="💬"
        />
      </div>

      {/* ── 3. DISTRIBUIÇÃO + EVOLUÇÃO MENSAL ───────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Donut */}
        <div className="bg-white dark:bg-muted/40 rounded-2xl p-5 border border-border/50 shadow-sm">
          <SectionTitle title="Distribuição NPS" />
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
                <CenterLabel cx={undefined} cy={undefined} score={npsScore} />
              </Pie>
              <Tooltip formatter={(v: number) => [v.toLocaleString(), ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 text-sm mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-bold" style={{ color: item.color }}>
                  {((item.value / totalResponses) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Evolução Mensal */}
        <div className="bg-white dark:bg-muted/40 rounded-2xl p-5 border border-border/50 shadow-sm">
          <SectionTitle title="Evolução mensal" badge={`Pico: Nov/25 (173)`} />
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyTimeline as unknown as { month: string; count: number }[]} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
              <defs>
                <linearGradient id="colorQtd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1D9E75" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1D9E75" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<TimelineTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#1D9E75"
                strokeWidth={2.5}
                fill="url(#colorQtd)"
                dot={{ fill: "#1D9E75", r: 3 }}
                activeDot={{ r: 5 }}
                name="Avaliações"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 4. NPS POR CURSO ────────────────────────────────────── */}
      <div className="bg-white dark:bg-muted/40 rounded-2xl p-5 border border-border/50 shadow-sm">
        <SectionTitle title="NPS por curso" badge="Score (promotores − detratores) / total × 100" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {CURSOS_NPS.map((c) => (
            <div
              key={c.nome}
              className="rounded-xl p-4 border border-border/40 flex items-center gap-3"
              style={{ borderLeftWidth: 4, borderLeftColor: npsColor(c.nps) }}
            >
              <div className="flex-1">
                <div className="font-bold text-sm">{c.nome}</div>
                <div className="text-xs text-muted-foreground">{c.total} avaliações</div>
              </div>
              <div className="text-xl font-black" style={{ color: npsColor(c.nps) }}>
                {c.nps.toFixed(0)}
              </div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={CURSOS_NPS} margin={{ left: 0, right: 20, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 80]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [`${v.toFixed(1)}`, "NPS Score"]} />
            <Bar dataKey="nps" radius={[6, 6, 0, 0]} name="NPS Score">
              {CURSOS_NPS.map((c, i) => (
                <Cell key={i} fill={npsColor(c.nps)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── 5. CRITÉRIOS + RADAR ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Barras horizontais por critério */}
        <div className="bg-white dark:bg-muted/40 rounded-2xl p-5 border border-border/50 shadow-sm">
          <SectionTitle title="Qualidade por critério" badge="Escala 1–5" />
          <ResponsiveContainer width="100%" height={CRITERIOS.length * 46 + 20}>
            <BarChart
              data={CRITERIOS}
              layout="vertical"
              margin={{ left: 8, right: 52, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" domain={[3.8, 5.0]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="label" width={185} tick={{ fontSize: 11.5 }} />
              <Tooltip formatter={(v: number) => [v.toFixed(2), "Nota média"]} />
              <Bar dataKey="nota" radius={[0, 5, 5, 0]} label={<BarEndLabel />}>
                {CRITERIOS.map((c, i) => (
                  <Cell key={i} fill={notaColor(c.nota)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="bg-white dark:bg-muted/40 rounded-2xl p-5 border border-border/50 shadow-sm">
          <SectionTitle title="Radar de qualidade" badge="% do máximo (5.0)" />
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar
                name="Nota"
                dataKey="value"
                stroke="#1D9E75"
                fill="#1D9E75"
                fillOpacity={0.25}
                strokeWidth={2}
                dot={{ r: 4, fill: "#1D9E75" }}
              />
              <Tooltip formatter={(v: number) => [`${v}%`, "% do máximo"]} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 6. TOP 5 POSITIVOS + TOP 5 CRÍTICOS ─────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Top 5 Positivos */}
        <div className="bg-white dark:bg-muted/40 rounded-2xl p-5 border border-border/50 shadow-sm">
          <SectionTitle
            title="Top 5 comentários positivos"
            badge={`de ${promoters} promotores`}
          />
          <div className="space-y-3">
            {TOP5_POSITIVOS.map((t, i) => (
              <FeedbackCard key={i} texto={t} tipo="positivo" rank={i + 1} />
            ))}
          </div>
        </div>

        {/* Top 5 Críticos */}
        <div className="bg-white dark:bg-muted/40 rounded-2xl p-5 border border-border/50 shadow-sm">
          <SectionTitle
            title="Top 5 pontos de melhoria"
            badge={`de ${detractors} detratores`}
          />
          <div className="space-y-3">
            {TOP5_CRITICOS.map((t, i) => (
              <FeedbackCard key={i} texto={t} tipo="critico" rank={i + 1} />
            ))}
          </div>
        </div>
      </div>

      {/* ── 7. O QUE MAIS COMENTARAM ────────────────────────────── */}
      <div className="bg-white dark:bg-muted/40 rounded-2xl p-5 border border-border/50 shadow-sm">
        <SectionTitle
          title="O que mais comentaram"
          badge={`${feedbackRate}% dos respondentes deixaram comentários`}
        />
        <p className="text-xs text-muted-foreground mb-4">
          Frequência de palavras nos {373} comentários abertos (stopwords removidas)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Barras */}
          <ResponsiveContainer width="100%" height={TOP_PALAVRAS.length * 36 + 20}>
            <BarChart
              data={TOP_PALAVRAS as unknown as { word: string; count: number }[]}
              layout="vertical"
              margin={{ left: 8, right: 52, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="word" width={100} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [v, "menções"]} />
              <Bar dataKey="count" radius={[0, 5, 5, 0]} fill="#3B82F6" name="Menções">
                {TOP_PALAVRAS.map((_, i) => {
                  const alpha = 1 - i * 0.05;
                  return <Cell key={i} fill={`rgba(59,130,246,${alpha})`} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Tags visuais */}
          <div className="flex flex-wrap gap-2 content-start">
            {(wordFrequency as unknown as { word: string; count: number }[]).slice(0, 25).map((w, i) => {
              const maxCount = wordFrequency[0].count;
              const size = 11 + Math.round((w.count / maxCount) * 10);
              const opacity = 0.5 + (w.count / maxCount) * 0.5;
              return (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium cursor-default hover:bg-blue-100 transition-colors"
                  style={{ fontSize: size, opacity }}
                >
                  {w.word}
                  <span className="ml-1.5 text-[10px] opacity-70">({w.count})</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 8. TOP INSTRUTORES ───────────────────────────────────── */}
      <div className="bg-white dark:bg-muted/40 rounded-2xl p-5 border border-border/50 shadow-sm">
        <SectionTitle
          title="Ranking de instrutores"
          badge="Nota média 1–10 pelos alunos"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {INSTRUTORES_REAIS.map((inst, i) => (
            <div
              key={inst.name}
              className="rounded-xl p-4 border border-border/40 flex flex-col gap-2 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: i < 3 ? "#1D9E75" : "#3B82F6" }}
                >
                  {i + 1}
                </span>
                <span className="text-xs text-muted-foreground">{inst.mentions} menções</span>
              </div>
              <div className="font-bold text-sm">{inst.name}</div>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-2xl font-black"
                  style={{ color: scoreColor(inst.avgScore as number) }}
                >
                  {(inst.avgScore as number).toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">/ 10</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${((inst.avgScore as number) / 10) * 100}%`,
                    backgroundColor: scoreColor(inst.avgScore as number),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 9. POR QUE ESCOLHEU + CURSOS FUTUROS ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Por que escolheu */}
        <div className="bg-white dark:bg-muted/40 rounded-2xl p-5 border border-border/50 shadow-sm">
          <SectionTitle title="Por que escolheu a NC Saúde?" />
          <div className="grid grid-cols-2 gap-3">
            {MOTIVOS.map((m, i) => (
              <div
                key={m.motivo}
                className="rounded-xl p-4 flex flex-col gap-2 border border-border/40"
              >
                <span className="text-sm text-muted-foreground">{m.motivo}</span>
                <span className="text-2xl font-black" style={{ color: motivoColors[i] }}>
                  {m.pct}%
                </span>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${m.pct}%`, backgroundColor: motivoColors[i] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cursos futuros desejados */}
        <div className="bg-white dark:bg-muted/40 rounded-2xl p-5 border border-border/50 shadow-sm">
          <SectionTitle title="Cursos que os alunos querem fazer" badge="top 10" />
          <div className="space-y-2">
            {CURSOS_FUTUROS.map((c, i) => {
              const maxCount = CURSOS_FUTUROS[0].count;
              const pct = Math.round((c.count / maxCount) * 100);
              const colors = ["#1D9E75", "#3B82F6", "#8B5CF6", "#EF9F27", "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16", "#06B6D4"];
              return (
                <div key={c.course} className="flex items-center gap-3">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ backgroundColor: colors[i % colors.length] }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium truncate">{c.course}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">{c.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 10. AVALIAÇÕES + NOTA POR CURSO ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="bg-white dark:bg-muted/40 rounded-2xl p-5 border border-border/50 shadow-sm">
          <SectionTitle title="Volume de avaliações por curso" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CURSOS_NPS} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#3B82F6" radius={[5, 5, 0, 0]} name="Avaliações" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-muted/40 rounded-2xl p-5 border border-border/50 shadow-sm">
          <SectionTitle title="Promotores vs Detratores por curso" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CURSOS_NPS} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="promotores" fill="#1D9E75" radius={[4, 4, 0, 0]} name="Promotores" stackId="a" />
              <Bar dataKey="detratores" fill="#E24B4A" radius={[0, 0, 0, 0]} name="Detratores" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── RODAPÉ ──────────────────────────────────────────────── */}
      <div className="text-center text-xs text-muted-foreground py-4 border-t border-border/30">
        Dados exportados do Kommo CRM em 31/03/2026 · {totalResponses} respostas · NC Saúde
      </div>

    </div>
  );
}
