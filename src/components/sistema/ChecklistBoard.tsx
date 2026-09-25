import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  Plus,
  Loader2,
  Trash2,
  Search,
  Sparkles,
  Archive,
  ArchiveRestore,
  ChevronRight,
  Wallet,
  BellRing,
  CalendarClock,
  Repeat,
  Users,
  Hourglass,
  Undo2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { MarkdownEditor } from "@/components/sistema/MarkdownEditor";
import { OTIMIZACAO_SNIPPETS } from "@/components/sistema/otimizacaoSnippets";
import { DemandasFixasPanel, type DemandaForm } from "@/components/sistema/DemandasFixasPanel";
import { MudarDiaDemandaDialog } from "@/components/sistema/MudarDiaDemandaDialog";
import {
  alertaDoCliente,
  compararAlertas,
  dateKey,
  demandaEmAlerta,
  diffDias,
  formatHorario,
  ocorrenciaAnterior,
  parseKey,
  prazoEmAlerta,
  statusDemanda,
  statusPrazo,
  type AlertaCliente,
  type DemandaFixa,
  type EstadoPrazo,
  type StatusDemanda,
  type StatusPrazo,
} from "@/components/sistema/checklistAlertas";
import { Reveal, Stagger, StaggerItem } from "@/components/dashboard/Motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  client_id: string;
  titulo: string;
  responsavel: string | null;
  observacao: string | null;
  concluido: boolean;
  ordem: number;
  eh_otimizacao: boolean;
  arquivado: boolean;
  arquivado_em: string | null;
  data_limite: string | null;
  aguardando_cliente: boolean;
}

const ITEM_COLUMNS =
  "id, client_id, titulo, responsavel, observacao, concluido, ordem, eh_otimizacao, arquivado, arquivado_em, data_limite, aguardando_cliente";

const DEMANDA_COLUMNS =
  "id, client_id, titulo, responsavel, recorrencia, dias_semana, dia_mes, data_unica, horario, ativo, ultima_conclusao, aguardando_ocorrencia, observacao, observacao_ocorrencia, created_at";

const normalizarDemanda = (row: any): DemandaFixa => ({
  ...row,
  dias_semana: row.dias_semana || [],
  horario: formatHorario(row.horario || "09:00"),
});

const OCULTOS_STORAGE_KEY = "checklist:clientes-ocultos";

const lerOcultos = (): string[] => {
  try {
    const raw = window.localStorage.getItem(OCULTOS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
};

interface ClienteOption {
  id: string;
  nome: string;
  status: string;
  cor: string | null;
  intensidade: number;
  saldoAtual: number | null;
  saldoAtualizadoEm: string | null;
  saldoTipo: string | null;
  saldoUltimaRecargaValor: number | null;
  saldoUltimaRecargaData: string | null;
}

type Filtro = "todos" | "pendentes" | "lucas" | "lane";
type Tom = "done" | "progress" | "paused" | "todo" | "vazio";

const filtros: { id: Filtro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "pendentes", label: "Só pendentes" },
  { id: "lucas", label: "Com Lucas" },
  { id: "lane", label: "Com Lane" },
];

const tomBadge: Record<Tom, string> = {
  done: "bg-success/15 text-success border-success/40",
  progress: "bg-warning/15 text-warning border-warning/40",
  paused: "bg-destructive/15 text-destructive border-destructive/40",
  todo: "bg-surface-3 text-muted-foreground border-border",
  vazio: "bg-surface-3 text-muted-foreground border-border",
};

const tomBorda: Record<Tom, string> = {
  done: "border-l-success",
  progress: "border-l-warning",
  paused: "border-l-destructive",
  todo: "border-l-border",
  vazio: "border-l-border",
};

const tomFill: Record<Tom, string> = {
  done: "bg-success",
  progress: "bg-warning",
  paused: "bg-destructive",
  todo: "bg-muted-foreground/40",
  vazio: "bg-muted-foreground/40",
};

const tomLabel: Record<Tom, string> = {
  done: "Concluído",
  progress: "Em andamento",
  paused: "Pausado",
  todo: "Não iniciado",
  vazio: "Sem itens",
};

const emptyDraft = { titulo: "", responsavel: "", otimizacao: false, dataLimite: "" };

const chipPrazo: Record<EstadoPrazo, string> = {
  atrasado: "bg-warning text-warning-foreground border-warning",
  hoje: "bg-warning text-warning-foreground border-warning",
  amanha: "text-warning border-warning/50",
  futuro: "text-muted-foreground border-border",
};

const formatBRL = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const paletaCores = [
  "#7f1d1d",
  "#7c2d12",
  "#78350f",
  "#713f12",
  "#365314",
  "#14532d",
  "#064e3b",
  "#134e4a",
  "#164e63",
  "#1e3a8a",
  "#312e81",
  "#4c1d95",
  "#581c87",
  "#701a75",
  "#831843",
  "#881337",
];

type CardCssVars = CSSProperties & { [key: `--${string}`]: string };

const hexToHsl = (hex: string): [number, number, number] => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

const clienteCardStyle = (cor: string | null, intensidade: number): CardCssVars | undefined => {
  if (!cor) return undefined;
  const alpha = Math.max(0.15, Math.min(1, intensidade / 100));
  const [h, s, l] = hexToHsl(cor);
  const l1 = Math.min(42, Math.max(12, l + 8));
  const l2 = Math.max(6, Math.min(30, l - 12));
  const style: CardCssVars = {
    backgroundColor: "hsl(var(--card))",
    backgroundImage: `linear-gradient(135deg, hsl(${h} ${s}% ${l1}% / ${alpha}) 0%, hsl(${h} ${s}% ${l2}% / ${alpha}) 100%)`,
  };
  if (alpha >= 0.45) {
    style["--foreground"] = "0 0% 100%";
    style["--muted-foreground"] = "0 0% 100% / 0.72";
    style["--border"] = "0 0% 100% / 0.3";
    style["--surface-2"] = "0 0% 100% / 0.14";
    style["--surface-3"] = "0 0% 100% / 0.22";
  }
  return style;
};

const ColorSwatchPicker = ({
  cor,
  intensidade,
  onChangeCor,
  onPreviewIntensidade,
  onCommitIntensidade,
}: {
  cor: string | null;
  intensidade: number;
  onChangeCor: (cor: string | null) => void;
  onPreviewIntensidade: (valor: number) => void;
  onCommitIntensidade: (valor: number) => void;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        type="button"
        title={cor ? "Alterar cor do cliente" : "Definir cor do cliente"}
        aria-label="Escolher cor do cliente"
        className="h-6 w-6 shrink-0 rounded-md border-2 border-white/60 shadow-sm ring-1 ring-black/10 hover:border-white transition-colors"
        style={{ backgroundColor: cor || "transparent" }}
      />
    </PopoverTrigger>
    <PopoverContent className="w-56 p-3 bg-surface-1 border-surface-3">
      <p className="font-mono-plex text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        Cor do cliente
      </p>
      <div className="grid grid-cols-8 gap-1.5">
        {paletaCores.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => onChangeCor(hex)}
            title={hex}
            className={`h-5 w-5 rounded-md transition-transform hover:scale-110 ${
              cor === hex ? "ring-2 ring-offset-2 ring-offset-surface-1 ring-foreground" : ""
            }`}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dashed border-border">
        <input
          type="color"
          value={cor || "#334155"}
          onChange={(e) => onChangeCor(e.target.value)}
          className="h-7 w-7 rounded cursor-pointer bg-transparent border border-border/70"
          title="Cor personalizada"
        />
        <span className="text-[11px] text-muted-foreground flex-1">Personalizada</span>
        {cor && (
          <button
            type="button"
            onClick={() => onChangeCor(null)}
            className="text-[11px] text-muted-foreground hover:text-destructive"
          >
            Remover
          </button>
        )}
      </div>
      {cor && (
        <div className="mt-3 pt-3 border-t border-dashed border-border space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="font-mono-plex text-[10px] uppercase tracking-wider text-muted-foreground">
              Intensidade
            </p>
            <span className="font-mono-plex text-[10px] text-muted-foreground">{intensidade}%</span>
          </div>
          <Slider
            value={[intensidade]}
            min={15}
            max={100}
            step={5}
            onValueChange={([v]) => onPreviewIntensidade(v)}
            onValueCommit={([v]) => onCommitIntensidade(v)}
          />
        </div>
      )}
    </PopoverContent>
  </Popover>
);

const proximaSegunda = (agora: Date): string => {
  const d = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  d.setDate(d.getDate() + (((1 - d.getDay() + 7) % 7) || 7));
  return dateKey(d);
};

const dataCompleta = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && Number(v.slice(0, 4)) >= 2000;

const PrazoPicker = ({
  value,
  status,
  agora,
  variant,
  onChange,
}: {
  value: string | null;
  status?: StatusPrazo | null;
  agora: Date;
  variant: "item" | "draft";
  onChange: (valor: string | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const escolher = (v: string | null) => {
    onChange(v);
    setOpen(false);
  };
  const atalhos = [
    { label: "Hoje", valor: dateKey(agora) },
    { label: "Amanhã", valor: dateKey(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1)) },
    { label: "Segunda", valor: proximaSegunda(agora) },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === "draft" ? (
          <button
            type="button"
            className={`h-8 shrink-0 px-2.5 rounded-full border flex items-center gap-1 text-[10px] font-mono-plex uppercase tracking-wider transition-colors ${
              value
                ? "bg-warning/15 border-warning/50 text-warning"
                : "bg-surface-2 border-surface-3 text-muted-foreground hover:border-warning/40"
            }`}
            title="Data limite (opcional)"
          >
            <CalendarClock className="h-3 w-3" />
            {value ? parseKey(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : "Prazo"}
          </button>
        ) : (
          <button
            type="button"
            className={`shrink-0 flex items-center gap-1 transition-opacity ${
              status
                ? `rounded-full border px-1.5 py-px font-mono-plex text-[9px] uppercase tracking-wider ${chipPrazo[status.estado]}`
                : "text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-warning"
            }`}
            title={value ? "Alterar data limite" : "Definir data limite"}
          >
            <CalendarClock className="h-3.5 w-3.5" />
            {status && status.rotulo}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-60 p-3 bg-surface-1 border-surface-3" align="end">
        <p className="font-mono-plex text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Data limite
        </p>
        <Input
          type="date"
          value={value || ""}
          onChange={(e) => {
            if (dataCompleta(e.target.value)) onChange(e.target.value);
          }}
          className="bg-surface-2 border-surface-3 h-9"
        />
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {atalhos.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => escolher(a.valor)}
              className="font-mono-plex px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider border border-border text-muted-foreground hover:border-warning/60 hover:text-warning transition-colors"
            >
              {a.label}
            </button>
          ))}
          {value && (
            <button
              type="button"
              onClick={() => escolher(null)}
              className="ml-auto text-[11px] text-muted-foreground hover:text-destructive"
            >
              Remover
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ClienteFilter = ({
  clientes,
  ocultos,
  alertaPorCliente,
  alertasOcultos,
  onToggle,
  onMostrarTodos,
  onOcultarTodos,
}: {
  clientes: ClienteOption[];
  ocultos: Set<string>;
  alertaPorCliente: Record<string, AlertaCliente | null>;
  alertasOcultos: number;
  onToggle: (id: string) => void;
  onMostrarTodos: () => void;
  onOcultarTodos: () => void;
}) => {
  const [termo, setTermo] = useState("");
  const total = clientes.length;
  const ocultosNaVisao = clientes.filter((c) => ocultos.has(c.id)).length;
  const filtrando = ocultosNaVisao > 0;
  const lista = clientes.filter((c) => !termo.trim() || c.nome.toLowerCase().includes(termo.trim().toLowerCase()));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Escolher quais clientes aparecem no quadro"
          className={`relative font-mono-plex px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${
            filtrando
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          <Users className="h-3 w-3" />
          Clientes
          {filtrando && (
            <span className="rounded-full bg-primary-foreground/20 px-1.5 text-[9px]">
              {total - ocultosNaVisao}/{total}
            </span>
          )}
          {alertasOcultos > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(var(--alert-red))] px-1 text-[9px] text-white"
              title={`${alertasOcultos} cliente${alertasOcultos !== 1 ? "s" : ""} com alerta oculto${alertasOcultos !== 1 ? "s" : ""} pelo filtro`}
            >
              {alertasOcultos}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3 bg-surface-1 border-surface-3">
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono-plex text-[10px] uppercase tracking-wider text-muted-foreground">
            Clientes no quadro
          </p>
          <span className="font-mono-plex text-[10px] text-muted-foreground">
            {total - ocultosNaVisao}/{total}
          </span>
        </div>
        <Input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar..."
          className="bg-surface-2 border-surface-3 h-8 text-sm"
        />
        <div className="flex items-center gap-3 mt-2 text-[11px]">
          <button type="button" onClick={onMostrarTodos} className="text-muted-foreground hover:text-primary">
            Marcar todos
          </button>
          <button type="button" onClick={onOcultarTodos} className="text-muted-foreground hover:text-primary">
            Desmarcar todos
          </button>
        </div>
        <div className="mt-2 max-h-64 overflow-y-auto -mx-1 px-1 space-y-0.5">
          {lista.map((c) => {
            const alerta = alertaPorCliente[c.id];
            return (
              <label
                key={c.id}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-foreground cursor-pointer hover:bg-surface-2"
              >
                <Checkbox checked={!ocultos.has(c.id)} onCheckedChange={() => onToggle(c.id)} />
                <span className="flex-1 truncate">{c.nome}</span>
                {alerta && (
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      alerta.tipo === "fixa" ? "bg-[hsl(var(--alert-red))]" : "bg-warning"
                    }`}
                    title={alerta.tipo === "fixa" ? "Demanda fixa em alerta" : "Item com data limite chegando"}
                  />
                )}
              </label>
            );
          })}
          {lista.length === 0 && <p className="text-xs text-muted-foreground py-3 text-center">Nenhum cliente.</p>}
        </div>
        {alertasOcultos > 0 && (
          <p className="mt-2 pt-2 border-t border-dashed border-border text-[11px] text-destructive">
            {alertasOcultos} cliente{alertasOcultos !== 1 ? "s" : ""} com alerta fora do quadro.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
};

const formatDiaLabel = (diaKey: string) => {
  if (!diaKey || diaKey === "sem-data") return "Sem data";
  const d = new Date(`${diaKey}T00:00:00`);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
};

const CheckMark = ({ done, onClick }: { done: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={done ? "Marcar como pendente" : "Marcar como concluído"}
    className={`mt-1 h-5 w-5 shrink-0 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${
      done ? "bg-success border-success" : "border-border hover:border-primary"
    }`}
  >
    {done && (
      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
        <path
          d="M2.3 6.3l2.6 2.6 4.8-5.4"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </button>
);

/**
 * Linha de demanda fixa no topo do card.
 *  - em alerta (dia/atrasada): faixa vinho com a pilula vermelha do horario;
 *  - pendente cliente: faixa azul (fiz a minha parte, falta o cliente);
 *  - proxima (ainda nao e o dia): linha normal, sem cor, que da para concluir antes;
 *  - feita: faixa verde.
 * A observacao aparece em todos os estados e vale so para a ocorrencia atual.
 */
const DemandaFixaLinha = ({
  status,
  onToggle,
  onPendente,
  onObservacao,
}: {
  status: StatusDemanda;
  onToggle: () => void;
  onPendente: () => void;
  onObservacao: (texto: string) => void;
}) => {
  const { demanda } = status;
  const feita = status.estado === "feita";
  const aguardando = status.estado === "aguardando";
  const alerta = demandaEmAlerta(status);
  const responsavel = demanda.responsavel;

  const observacao = (className: string) => (
    <input
      key={`dobs-${demanda.id}-${status.ocorrencia}`}
      defaultValue={status.observacao}
      onBlur={(e) => onObservacao(e.target.value)}
      placeholder="Observação (opcional)"
      className={className}
    />
  );

  if (!alerta && !aguardando && !feita) {
    return (
      <div className="group flex items-start gap-2.5 py-1.5 px-1.5 -mx-1.5 rounded-lg hover:bg-surface-2">
        <CheckMark done={false} onClick={onToggle} />
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-medium text-foreground">{demanda.titulo}</p>
          <p className="mt-0.5 flex items-center gap-1 font-mono-plex text-[10px] uppercase tracking-wider text-muted-foreground">
            <Repeat className="h-3 w-3 shrink-0" />
            {status.rotulo}
            {responsavel && <> · {responsavel}</>}
          </p>
          {observacao("mt-0.5 w-full bg-transparent text-[11px] italic text-warning/90 outline-none focus:underline decoration-dashed placeholder:text-muted-foreground/50 placeholder:not-italic")}
        </div>
        <button
          type="button"
          onClick={onPendente}
          title="Já enviei, pendente do cliente"
          aria-label="Marcar como pendente do cliente"
          className="mt-1 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-[hsl(var(--wait-blue-light))]"
        >
          <Hourglass className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  const superficie = feita
    ? "border border-success/40 bg-success/15"
    : aguardando
      ? "wait-surface border text-white"
      : "alert-surface border text-white";

  return (
    <div className={`flex items-start gap-2.5 rounded-lg px-2.5 py-2 ${superficie}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={
          feita
            ? "Desfazer: marcar demanda fixa como pendente"
            : aguardando
              ? "Cliente respondeu: concluir demanda fixa"
              : "Marcar demanda fixa como feita"
        }
        title={feita ? "Desfazer" : aguardando ? "Cliente respondeu: concluir" : "Marcar como feita"}
        className={`mt-px h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
          feita
            ? "bg-success border-success"
            : aguardando
              ? "border-[hsl(var(--wait-blue-light))] hover:bg-[hsl(var(--wait-blue)/0.5)]"
              : "border-[hsl(0_72%_55%)] hover:bg-[hsl(var(--alert-red)/0.4)]"
        }`}
      >
        {feita && (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
            <path
              d="M2.3 6.3l2.6 2.6 4.8-5.4"
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {aguardando && <Hourglass className="h-2.5 w-2.5 text-[hsl(var(--wait-blue-light))]" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[13px] font-semibold leading-tight ${feita ? "text-muted-foreground line-through" : ""}`}>
            {demanda.titulo}
          </p>
          {!feita && !aguardando && <BellRing className="h-4 w-4 shrink-0 text-[hsl(0_72%_55%)]" />}
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono-plex text-[10px] uppercase tracking-wider">
          {feita ? (
            <span className="text-success">{status.rotulo}</span>
          ) : aguardando ? (
            <span className="rounded-full bg-[hsl(var(--wait-blue))] px-2.5 py-0.5 text-white">{status.rotulo}</span>
          ) : (
            <span className="rounded-full bg-[hsl(var(--alert-red))] px-2.5 py-0.5 text-white">{status.rotulo}</span>
          )}
          {responsavel && <span className={feita ? "text-muted-foreground" : "text-white/70"}>{responsavel}</span>}
          {!feita && (
            <button
              type="button"
              onClick={onPendente}
              title={aguardando ? "Voltar ao alerta" : "Já enviei, pendente do cliente"}
              className="ml-auto flex items-center gap-1 rounded-full border border-white/30 px-2 py-0.5 text-[9px] text-white/85 transition-colors hover:bg-white/10"
            >
              {aguardando ? <Undo2 className="h-3 w-3" /> : <Hourglass className="h-3 w-3" />}
              {aguardando ? "Reabrir" : "Pendente cliente"}
            </button>
          )}
        </p>
        {observacao(
          `mt-1.5 w-full bg-transparent text-[11px] italic outline-none focus:underline decoration-dashed placeholder:not-italic ${
            feita
              ? "text-muted-foreground placeholder:text-muted-foreground/50"
              : "text-white/80 placeholder:text-white/40"
          }`
        )}
      </div>
    </div>
  );
};

export const ChecklistBoard = () => {
  const { user, isAdmin } = useAuth();
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [demandas, setDemandas] = useState<DemandaFixa[]>([]);
  const [mudarDia, setMudarDia] = useState<{ demanda: DemandaFixa; ocorrencia: string } | null>(null);
  const [agora, setAgora] = useState(() => new Date());
  const [ocultos, setOcultos] = useState<string[]>(lerOcultos);
  const [viewMode, setViewMode] = useState<"quadro" | "concluidas" | "fixas">("quadro");
  const [visao, setVisao] = useState<"ativos" | "inativos">("ativos");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busca, setBusca] = useState("");
  const [drafts, setDrafts] = useState<Record<string, typeof emptyDraft>>({});
  const [otimItem, setOtimItem] = useState<ChecklistItem | null>(null);
  const [otimTexto, setOtimTexto] = useState("");
  const [otimSaving, setOtimSaving] = useState(false);
  const [saldoItem, setSaldoItem] = useState<ClienteOption | null>(null);
  const [saldoValor, setSaldoValor] = useState("");
  const [saldoSaving, setSaldoSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      (supabase as any)
        .from("gestao_clientes")
        .select(
          "id, nome_cliente, status, checklist_cor, checklist_cor_intensidade, saldo_atual, saldo_atualizado_em, saldo_tipo, saldo_ultima_recarga_valor, saldo_ultima_recarga_data"
        )
        .order("nome_cliente"),
      (supabase as any)
        .from("sistema_checklist_itens")
        .select(ITEM_COLUMNS)
        .order("ordem", { ascending: true }),
      (supabase as any)
        .from("sistema_checklist_demandas_fixas")
        .select(DEMANDA_COLUMNS)
        .order("created_at", { ascending: true }),
    ]).then(([cliRes, itemRes, demRes]: any[]) => {
      if (!cliRes.error && cliRes.data)
        setClientes(
          cliRes.data.map((c: any) => ({
            id: c.id,
            nome: c.nome_cliente,
            status: c.status,
            cor: c.checklist_cor,
            intensidade: c.checklist_cor_intensidade ?? 100,
            saldoAtual: c.saldo_atual,
            saldoAtualizadoEm: c.saldo_atualizado_em,
            saldoTipo: c.saldo_tipo,
            saldoUltimaRecargaValor: c.saldo_ultima_recarga_valor,
            saldoUltimaRecargaData: c.saldo_ultima_recarga_data,
          }))
        );
      if (!itemRes.error && itemRes.data) setItems(itemRes.data);
      if (!demRes.error && demRes.data) setDemandas(demRes.data.map(normalizarDemanda));
      else if (demRes.error) console.error(demRes.error);
      setLoading(false);
    });
  }, []);

  // Reavalia alertas (horario da demanda fixa, virada do dia) sem recarregar a
  // tela. So troca o estado quando o minuto muda, para nao re-renderizar o
  // quadro inteiro a cada tick.
  useEffect(() => {
    const id = window.setInterval(() => {
      setAgora((prev) => {
        const now = new Date();
        return now.getMinutes() === prev.getMinutes() && dateKey(now) === dateKey(prev) ? prev : now;
      });
    }, 15_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(OCULTOS_STORAGE_KEY, JSON.stringify(ocultos));
    } catch {
      // localStorage indisponivel (aba anonima etc.): o filtro so nao persiste.
    }
  }, [ocultos]);

  const itemsByClient = useMemo(() => {
    const map: Record<string, ChecklistItem[]> = {};
    for (const it of items) {
      if (it.arquivado) continue;
      if (!map[it.client_id]) map[it.client_id] = [];
      map[it.client_id].push(it);
    }
    return map;
  }, [items]);

  const arquivadosPorCliente = useMemo(() => {
    const map: Record<string, ChecklistItem[]> = {};
    for (const it of items) {
      if (!it.arquivado) continue;
      if (!map[it.client_id]) map[it.client_id] = [];
      map[it.client_id].push(it);
    }
    return map;
  }, [items]);

  const totalArquivados = useMemo(() => items.filter((it) => it.arquivado).length, [items]);

  const clientesComArquivados = useMemo(
    () =>
      clientes
        .filter((c) => (arquivadosPorCliente[c.id] || []).length > 0)
        .filter((c) => !busca.trim() || c.nome.toLowerCase().includes(busca.trim().toLowerCase()))
        .sort((a, b) => a.nome.localeCompare(b.nome)),
    [clientes, arquivadosPorCliente, busca]
  );

  const clientesNaVisao = useMemo(
    () => clientes.filter((c) => (visao === "ativos" ? c.status === "ativo" : c.status !== "ativo")),
    [clientes, visao]
  );

  const { itemsTotal, itemsDone } = useMemo(() => {
    const clientIds = new Set(clientesNaVisao.map((c) => c.id));
    const relevantes = items.filter((it) => clientIds.has(it.client_id));
    return {
      itemsTotal: relevantes.length,
      itemsDone: relevantes.filter((it) => it.concluido).length,
    };
  }, [items, clientesNaVisao]);

  const overallPct = itemsTotal ? itemsDone / itemsTotal : 0;

  const getDraft = (clientId: string) => drafts[clientId] || emptyDraft;
  const setDraft = (clientId: string, patch: Partial<typeof emptyDraft>) =>
    setDrafts((prev) => ({ ...prev, [clientId]: { ...getDraft(clientId), ...patch } }));

  const getTom = (client: ClienteOption, clientItems: ChecklistItem[]): Tom => {
    if (client.status !== "ativo") return "paused";
    if (clientItems.length === 0) return "vazio";
    const done = clientItems.filter((it) => it.concluido).length;
    if (done === clientItems.length) return "done";
    if (done === 0) return "todo";
    return "progress";
  };

  // Demandas fixas do dia/atrasadas por cliente (ja avaliadas contra "agora").
  const demandasPorCliente = useMemo(() => {
    const map: Record<string, StatusDemanda[]> = {};
    for (const d of demandas) {
      const status = statusDemanda(d, agora);
      if (!status) continue;
      if (!map[d.client_id]) map[d.client_id] = [];
      map[d.client_id].push(status);
    }
    const peso = (st: StatusDemanda) =>
      demandaEmAlerta(st) ? 0 : st.estado === "aguardando" ? 1 : st.estado === "proxima" ? 2 : 3;
    for (const lista of Object.values(map)) lista.sort((a, b) => peso(a) - peso(b) || a.quando - b.quando);
    return map;
  }, [demandas, agora]);

  const alertaPorCliente = useMemo(() => {
    const map: Record<string, AlertaCliente | null> = {};
    for (const c of clientes) {
      const prazos = (itemsByClient[c.id] || []).map((it) => statusPrazo(it, agora));
      map[c.id] = alertaDoCliente(demandasPorCliente[c.id] || [], prazos);
    }
    return map;
  }, [clientes, itemsByClient, demandasPorCliente, agora]);

  const totalFixasAtivas = useMemo(() => demandas.filter((d) => d.ativo).length, [demandas]);

  const totalFixasEmAlerta = useMemo(
    () => Object.values(demandasPorCliente).reduce((n, lista) => n + lista.filter(demandaEmAlerta).length, 0),
    [demandasPorCliente]
  );

  const ocultosSet = useMemo(() => new Set(ocultos), [ocultos]);

  const toggleOculto = (id: string) =>
    setOcultos((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Marcar/desmarcar todos afeta so os clientes da visao atual (ativos/inativos),
  // preservando o que o usuario ocultou na outra visao.
  const mostrarTodos = () => {
    const ids = new Set(clientesNaVisao.map((c) => c.id));
    setOcultos((prev) => prev.filter((id) => !ids.has(id)));
  };

  const ocultarTodos = () =>
    setOcultos((prev) => [...new Set([...prev, ...clientesNaVisao.map((c) => c.id)])]);

  const ocultosNaVisao = clientesNaVisao.filter((c) => ocultosSet.has(c.id)).length;
  const alertasOcultos = clientesNaVisao.filter((c) => ocultosSet.has(c.id) && alertaPorCliente[c.id]).length;

  // Cliente em alerta sobe para o topo (vermelho antes de ambar, o mais antigo primeiro);
  // os demais mantem a ordem alfabetica.
  const visibleClientes = clientesNaVisao
    .filter((c) => {
      if (ocultosSet.has(c.id)) return false;
      if (busca.trim() && !c.nome.toLowerCase().includes(busca.trim().toLowerCase())) return false;
      const clientItems = itemsByClient[c.id] || [];
      if (filtro === "pendentes") return clientItems.some((it) => !it.concluido);
      if (filtro === "lucas" || filtro === "lane")
        return clientItems.some((it) => (it.responsavel || "").toLowerCase().includes(filtro));
      return true;
    })
    .sort((a, b) => compararAlertas(alertaPorCliente[a.id], alertaPorCliente[b.id]));

  const addItem = async (clientId: string) => {
    const draft = getDraft(clientId);
    const titulo = draft.titulo.trim();
    if (!titulo || !user) return;
    const ordem = (itemsByClient[clientId] || []).length;
    const payload = {
      client_id: clientId,
      titulo,
      responsavel: draft.responsavel.trim() || null,
      concluido: false,
      ordem,
      eh_otimizacao: draft.otimizacao,
      data_limite: draft.dataLimite || null,
      created_by: user.id,
    };
    const { data, error } = await (supabase as any)
      .from("sistema_checklist_itens")
      .insert(payload)
      .select(ITEM_COLUMNS)
      .single();
    if (error) {
      toast.error("Erro ao adicionar item");
      console.error(error);
      return;
    }
    setItems((prev) => [...prev, data]);
    setDraft(clientId, emptyDraft);
  };

  const toggleItem = async (item: ChecklistItem) => {
    const novo = !item.concluido;
    setItems((prev) =>
      prev.map((it) =>
        it.id === item.id ? { ...it, concluido: novo, ...(novo ? { aguardando_cliente: false } : {}) } : it
      )
    );
    const { error } = await (supabase as any)
      .from("sistema_checklist_itens")
      .update({ concluido: novo, ...(novo ? { aguardando_cliente: false } : {}), updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, concluido: item.concluido, aguardando_cliente: item.aguardando_cliente } : it
        )
      );
      toast.error("Erro ao atualizar item");
      console.error(error);
      return;
    }
    if (novo && item.eh_otimizacao) {
      setOtimItem(item);
      setOtimTexto(item.titulo + (item.observacao ? `\n\n${item.observacao}` : ""));
    }
  };

  // "Pendente cliente": fiz a minha parte, falta o cliente. O item segue aberto e destacado em
  // azul; se tiver data limite, ela continua avisando quando chegar (e o dia de cobrar).
  const toggleAguardandoCliente = async (item: ChecklistItem) => {
    const novo = !item.aguardando_cliente;
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, aguardando_cliente: novo } : it)));
    const { error } = await (supabase as any)
      .from("sistema_checklist_itens")
      .update({ aguardando_cliente: novo, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) {
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, aguardando_cliente: item.aguardando_cliente } : it))
      );
      toast.error("Erro ao atualizar item");
      console.error(error);
    }
  };

  const toggleOtimizacaoFlag = async (item: ChecklistItem) => {
    const novo = !item.eh_otimizacao;
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, eh_otimizacao: novo } : it)));
    const { error } = await (supabase as any)
      .from("sistema_checklist_itens")
      .update({ eh_otimizacao: novo, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) {
      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, eh_otimizacao: item.eh_otimizacao } : it)));
      toast.error("Erro ao atualizar item");
      console.error(error);
    }
  };

  const closeOtimModal = () => {
    if (otimTexto.trim() && !window.confirm("Descartar o registro de otimização?")) return;
    setOtimItem(null);
    setOtimTexto("");
  };

  const saveOtim = async () => {
    if (!otimItem || !user) return;
    setOtimSaving(true);
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await (supabase as any).from("sistema_otimizacoes").insert({
      client_id: otimItem.client_id,
      data: today,
      otimizado: true,
      observacoes: otimTexto.trim() || null,
      created_by: user.id,
    });
    if (error) {
      toast.error("Erro ao registrar otimização");
      console.error(error);
    } else {
      const clienteNome = clientes.find((c) => c.id === otimItem.client_id)?.nome;
      toast.success(`Otimização registrada para ${clienteNome}`);
      setOtimItem(null);
      setOtimTexto("");
    }
    setOtimSaving(false);
  };

  const commitField = async (item: ChecklistItem, field: "titulo" | "responsavel" | "observacao", value: string) => {
    const trimmed = value.trim();
    if (field === "titulo" && !trimmed) return;
    const dbValue = field === "titulo" ? trimmed : trimmed || null;
    if (dbValue === (item as any)[field]) return;
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, [field]: dbValue } : it)));
    const { error } = await (supabase as any)
      .from("sistema_checklist_itens")
      .update({ [field]: dbValue, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) {
      toast.error("Erro ao salvar alteração");
      console.error(error);
    }
  };

  const setPrazo = async (item: ChecklistItem, valor: string | null) => {
    if (valor === item.data_limite) return;
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, data_limite: valor } : it)));
    const { error } = await (supabase as any)
      .from("sistema_checklist_itens")
      .update({ data_limite: valor, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) {
      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, data_limite: item.data_limite } : it)));
      toast.error("Erro ao salvar data limite");
      console.error(error);
    }
  };

  const salvarDemanda = async (valores: DemandaForm, id: string | null): Promise<boolean> => {
    if (!user) return false;
    const campos = {
      client_id: valores.client_id,
      titulo: valores.titulo.trim(),
      responsavel: valores.responsavel.trim() || null,
      recorrencia: valores.recorrencia,
      dias_semana: valores.recorrencia === "semanal" ? [...valores.dias_semana].sort((a, b) => a - b) : [],
      dia_mes: valores.recorrencia === "mensal" ? Number(valores.dia_mes) : null,
      data_unica: valores.recorrencia === "unica" ? valores.data_unica : null,
      horario: valores.horario,
    };
    const query = (supabase as any).from("sistema_checklist_demandas_fixas");
    const { data, error } = id
      ? await query
          .update({ ...campos, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select(DEMANDA_COLUMNS)
          .single()
      : await query
          .insert({ ...campos, created_by: user.id })
          .select(DEMANDA_COLUMNS)
          .single();
    if (error) {
      toast.error("Erro ao salvar demanda fixa");
      console.error(error);
      return false;
    }
    const salva = normalizarDemanda(data);
    setDemandas((prev) => (id ? prev.map((d) => (d.id === id ? salva : d)) : [...prev, salva]));
    toast.success(id ? "Demanda fixa atualizada" : "Demanda fixa cadastrada");
    return true;
  };

  const patchDemanda = async (demanda: DemandaFixa, patch: Partial<DemandaFixa>, erroMsg: string) => {
    setDemandas((prev) => prev.map((d) => (d.id === demanda.id ? { ...d, ...patch } : d)));
    const { error } = await (supabase as any)
      .from("sistema_checklist_demandas_fixas")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", demanda.id);
    if (error) {
      setDemandas((prev) => prev.map((d) => (d.id === demanda.id ? demanda : d)));
      toast.error(erroMsg);
      console.error(error);
      return false;
    }
    return true;
  };

  const alternarDemandaAtiva = (demanda: DemandaFixa) =>
    patchDemanda(demanda, { ativo: !demanda.ativo }, "Erro ao atualizar demanda fixa");

  // Marca a ocorrencia como feita (em alerta ou antecipada); numa ocorrencia ja feita, desfaz.
  // Desfazer volta para a ocorrencia anterior em vez de limpar, senao uma ocorrencia antiga,
  // ja resolvida, reapareceria como atrasada.
  const marcarDemandaFeita = async (status: StatusDemanda) => {
    const desfazendo = status.estado === "feita";
    const ok = await patchDemanda(
      status.demanda,
      {
        ultima_conclusao: desfazendo ? ocorrenciaAnterior(status.demanda, status.ocorrencia) : status.ocorrencia,
        ...(desfazendo ? {} : { aguardando_ocorrencia: null }),
      },
      "Erro ao atualizar demanda fixa"
    );
    // Estava pendente do cliente e ele so resolveu depois de mais de um dia: oferece mudar o dia
    // fixo (ex.: de sexta para segunda) ou manter como esta.
    if (
      ok &&
      status.estado === "aguardando" &&
      status.demanda.recorrencia !== "unica" &&
      diffDias(dateKey(agora), status.ocorrencia) > 1
    ) {
      setMudarDia({ demanda: status.demanda, ocorrencia: status.ocorrencia });
    }
  };

  // Salva o novo dia e ja marca hoje como resolvido: sem isso, mudar sexta -> segunda no proprio
  // dia de segunda faria a demanda de hoje aparecer como pendente logo depois de concluida.
  const salvarNovoDia = async (patch: Partial<DemandaFixa>) => {
    if (!mudarDia) return;
    const atual = demandas.find((d) => d.id === mudarDia.demanda.id) ?? mudarDia.demanda;
    const ok = await patchDemanda(
      atual,
      { ...patch, ultima_conclusao: dateKey(agora) },
      "Erro ao mudar o dia da demanda fixa"
    );
    if (ok) {
      toast.success("Dia da demanda fixa atualizado");
      setMudarDia(null);
    }
  };

  // "Pendente cliente": fiz a minha parte, falta o cliente. Tira o alerta mas mantem a demanda
  // aberta no card; clicar de novo (Reabrir) volta ao alerta.
  const alternarPendenteCliente = (status: StatusDemanda) =>
    patchDemanda(
      status.demanda,
      { aguardando_ocorrencia: status.estado === "aguardando" ? null : status.ocorrencia },
      "Erro ao atualizar demanda fixa"
    );

  // A observacao vale so para a ocorrencia atual (some quando a proxima passa a valer).
  const salvarObservacaoDemanda = (status: StatusDemanda, texto: string) => {
    const valor = texto.trim();
    if (valor === status.observacao) return;
    patchDemanda(
      status.demanda,
      { observacao: valor || null, observacao_ocorrencia: valor ? status.ocorrencia : null },
      "Erro ao salvar observação"
    );
  };

  const excluirDemanda = async (demanda: DemandaFixa) => {
    if (!window.confirm(`Excluir a demanda fixa "${demanda.titulo}"?`)) return;
    setDemandas((prev) => prev.filter((d) => d.id !== demanda.id));
    const { error } = await (supabase as any)
      .from("sistema_checklist_demandas_fixas")
      .delete()
      .eq("id", demanda.id);
    if (error) {
      setDemandas((prev) => [...prev, demanda]);
      toast.error("Erro ao excluir demanda fixa");
      console.error(error);
    }
  };

  const previewClienteIntensidade = (clientId: string, intensidade: number) => {
    setClientes((prev) => prev.map((c) => (c.id === clientId ? { ...c, intensidade } : c)));
  };

  const updateClienteCor = async (
    clientId: string,
    patch: { cor?: string | null; intensidade?: number }
  ) => {
    const anterior = clientes.find((c) => c.id === clientId);
    setClientes((prev) => prev.map((c) => (c.id === clientId ? { ...c, ...patch } : c)));
    const payload: Record<string, unknown> = {};
    if (patch.cor !== undefined) payload.checklist_cor = patch.cor;
    if (patch.intensidade !== undefined) payload.checklist_cor_intensidade = patch.intensidade;
    const { error } = await (supabase as any).from("gestao_clientes").update(payload).eq("id", clientId);
    if (error) {
      if (anterior)
        setClientes((prev) => prev.map((c) => (c.id === clientId ? anterior : c)));
      toast.error("Erro ao salvar cor do cliente");
      console.error(error);
    }
  };

  const openSaldoModal = (c: ClienteOption) => {
    setSaldoItem(c);
    setSaldoValor("");
  };

  const closeSaldoModal = () => {
    setSaldoItem(null);
    setSaldoValor("");
  };

  const saveSaldo = async () => {
    if (!saldoItem) return;
    const valorNum = parseFloat(saldoValor.replace(",", "."));
    if (!valorNum || valorNum <= 0) {
      toast.error("Informe um valor válido de recarga");
      return;
    }
    setSaldoSaving(true);
    try {
      const res = await fetch(
        "https://n8n.trafficsolutions.cloud/webhook/registrar-recarga-cliente",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "registrar_recarga",
            client_id: saldoItem.id,
            valor: valorNum,
            timestamp: new Date().toISOString(),
          }),
        }
      );
      if (!res.ok) throw new Error(`Webhook retornou status ${res.status}`);
      const agora = new Date().toISOString();
      setClientes((prev) =>
        prev.map((c) =>
          c.id === saldoItem.id
            ? {
                ...c,
                saldoAtual: valorNum,
                saldoAtualizadoEm: agora,
                saldoUltimaRecargaValor: valorNum,
                saldoUltimaRecargaData: agora,
              }
            : c
        )
      );
      toast.success(`Recarga de ${formatBRL(valorNum)} registrada para ${saldoItem.nome}`);
      closeSaldoModal();
    } catch (err) {
      toast.error("Erro ao registrar recarga. Verifique se o fluxo de automação está ativo.");
      console.error(err);
    } finally {
      setSaldoSaving(false);
    }
  };

  const archiveItem = async (item: ChecklistItem) => {
    const agora = new Date().toISOString();
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, arquivado: true, arquivado_em: agora } : it))
    );
    const { error } = await (supabase as any)
      .from("sistema_checklist_itens")
      .update({ arquivado: true, arquivado_em: agora, updated_at: agora })
      .eq("id", item.id);
    if (error) {
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, arquivado: false, arquivado_em: null } : it))
      );
      toast.error("Erro ao arquivar item");
      console.error(error);
    } else {
      toast.success("Tarefa arquivada");
    }
  };

  const restoreItem = async (item: ChecklistItem) => {
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, arquivado: false, arquivado_em: null } : it))
    );
    const { error } = await (supabase as any)
      .from("sistema_checklist_itens")
      .update({ arquivado: false, arquivado_em: null, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, arquivado: true, arquivado_em: item.arquivado_em } : it
        )
      );
      toast.error("Erro ao restaurar item");
      console.error(error);
    }
  };

  const removeItem = async (item: ChecklistItem) => {
    if (!window.confirm(`Excluir "${item.titulo}"?`)) return;
    setItems((prev) => prev.filter((it) => it.id !== item.id));
    const { error } = await (supabase as any)
      .from("sistema_checklist_itens")
      .delete()
      .eq("id", item.id);
    if (error) {
      toast.error("Erro ao excluir item");
      console.error(error);
    }
  };

  const inputCls = "bg-surface-2 border-surface-3 text-foreground";

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-surface-2 p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            <div className="flex-1 space-y-3 min-w-0">
              <p className="font-mono-plex text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                Progresso geral do checklist
              </p>
              <ProgressBar
                pct={overallPct}
                className="h-3"
                fillClassName="bg-gradient-to-r from-primary via-primary to-accent"
                brilho
                aria-label="Progresso geral do checklist"
              />
            </div>
            <div className="text-right shrink-0">
              <p className="font-serif text-5xl font-semibold leading-none bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                {Math.round(overallPct * 100)}%
              </p>
              <p className="font-mono-plex text-[10px] uppercase tracking-wider text-muted-foreground mt-1.5">
                {itemsDone}/{itemsTotal} concluídos
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setViewMode("quadro")}
          className={`font-mono-plex px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider border transition-colors ${
            viewMode === "quadro"
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          Quadro
        </button>
        <button
          onClick={() => setViewMode("concluidas")}
          className={`font-mono-plex px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${
            viewMode === "concluidas"
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          <Archive className="h-3 w-3" />
          Concluídas
          {totalArquivados > 0 && (
            <span
              className={`rounded-full px-1.5 text-[9px] ${
                viewMode === "concluidas" ? "bg-primary-foreground/20" : "bg-surface-3"
              }`}
            >
              {totalArquivados}
            </span>
          )}
        </button>

        <button
          onClick={() => setViewMode("fixas")}
          className={`relative font-mono-plex px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${
            viewMode === "fixas"
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          <Repeat className="h-3 w-3" />
          Demandas fixas
          {totalFixasAtivas > 0 && (
            <span
              className={`rounded-full px-1.5 text-[9px] ${
                viewMode === "fixas" ? "bg-primary-foreground/20" : "bg-surface-3"
              }`}
            >
              {totalFixasAtivas}
            </span>
          )}
          {totalFixasEmAlerta > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(var(--alert-red))] px-1 text-[9px] text-white"
              title={`${totalFixasEmAlerta} demanda${totalFixasEmAlerta !== 1 ? "s" : ""} fixa${totalFixasEmAlerta !== 1 ? "s" : ""} em alerta`}
            >
              {totalFixasEmAlerta}
            </span>
          )}
        </button>

        {viewMode === "quadro" && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            {(["ativos", "inativos"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVisao(v)}
                className={`font-mono-plex px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider border transition-colors ${
                  visao === v
                    ? "bg-foreground border-foreground text-background"
                    : "bg-card border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {v === "ativos" ? "Clientes ativos" : "Clientes inativos"}
              </button>
            ))}
            <div className="w-px h-6 bg-border mx-1" />
            {filtros.map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className={`font-mono-plex px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider border transition-colors ${
                  filtro === f.id
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
            <div className="w-px h-6 bg-border mx-1" />
            <ClienteFilter
              clientes={clientesNaVisao}
              ocultos={ocultosSet}
              alertaPorCliente={alertaPorCliente}
              alertasOcultos={alertasOcultos}
              onToggle={toggleOculto}
              onMostrarTodos={mostrarTodos}
              onOcultarTodos={ocultarTodos}
            />
          </>
        )}
        <div className="flex-1" />
        <div className="relative w-full sm:w-56">
          <Search className="h-3.5 w-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar cliente..."
            className={`${inputCls} h-9 pl-9 rounded-full`}
          />
        </div>
      </div>

      <datalist id="checklist-responsaveis">
        <option value="Lucas" />
        <option value="Lane" />
        <option value="Lucas e Lane" />
      </datalist>

      {viewMode === "fixas" ? (
        <DemandasFixasPanel
          clientes={clientes}
          demandas={demandas}
          agora={agora}
          busca={busca}
          onSalvar={salvarDemanda}
          onAlternarAtiva={alternarDemandaAtiva}
          onExcluir={excluirDemanda}
          onMarcarFeita={marcarDemandaFeita}
        />
      ) : viewMode === "concluidas" ? (
        <div className="space-y-2">
          {clientesComArquivados.map((c) => {
              const arqs = arquivadosPorCliente[c.id] || [];
              const porDia: Record<string, ChecklistItem[]> = {};
              for (const it of arqs) {
                const key = (it.arquivado_em || "").slice(0, 10) || "sem-data";
                if (!porDia[key]) porDia[key] = [];
                porDia[key].push(it);
              }
              const dias = Object.keys(porDia).sort((a, b) => b.localeCompare(a));
              return (
                <details key={c.id} className="group rounded-lg border border-border bg-card/40">
                  <summary className="cursor-pointer select-none list-none flex items-center justify-between gap-2 px-3.5 py-2.5">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-90" />
                      {c.nome}
                    </span>
                    <span className="font-mono-plex text-[10px] uppercase tracking-wider text-muted-foreground">
                      {arqs.length} arquivada{arqs.length !== 1 ? "s" : ""}
                    </span>
                  </summary>
                  <div className="px-3.5 pb-3 space-y-1.5">
                    {dias.map((dia) => (
                      <details key={dia} className="group/dia rounded-md bg-surface-2/60">
                        <summary className="cursor-pointer select-none list-none flex items-center justify-between gap-2 px-2.5 py-1.5">
                          <span className="flex items-center gap-1.5 text-xs text-foreground/85">
                            <ChevronRight className="h-3 w-3 text-muted-foreground transition-transform group-open/dia:rotate-90" />
                            {formatDiaLabel(dia)}
                          </span>
                          <span className="font-mono-plex text-[10px] text-muted-foreground">
                            {porDia[dia].length}
                          </span>
                        </summary>
                        <ul className="px-2.5 pb-2 pt-0.5 space-y-0.5">
                          {porDia[dia].map((it) => (
                            <li
                              key={it.id}
                              className="group/item flex items-center gap-2 text-[12.5px] text-muted-foreground py-1 px-1.5 -mx-1.5 rounded-md hover:bg-surface-2"
                            >
                              <span className="flex-1 min-w-0 truncate line-through decoration-muted-foreground/50">
                                {it.titulo}
                              </span>
                              {it.responsavel && (
                                <span className="font-mono-plex text-[9px] uppercase tracking-wider shrink-0">
                                  {it.responsavel}
                                </span>
                              )}
                              <button
                                onClick={() => restoreItem(it)}
                                className="opacity-0 group-hover/item:opacity-100 hover:text-primary transition-opacity shrink-0"
                                title="Restaurar para o quadro"
                              >
                                <ArchiveRestore className="h-3.5 w-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ))}
                  </div>
                </details>
              );
            })}
          {clientesComArquivados.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {totalArquivados === 0
                ? "Nenhuma tarefa arquivada ainda. Conclua um item e clique no ícone de arquivo para movê-lo para cá."
                : "Nenhum cliente encontrado para esta busca."}
            </p>
          )}
        </div>
      ) : (
      <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleClientes.map((c) => {
          const clientItems = itemsByClient[c.id] || [];
          const done = clientItems.filter((it) => it.concluido).length;
          const total = clientItems.length;
          const pct = total ? done / total : 0;
          const draft = getDraft(c.id);
          const tom = getTom(c, clientItems);

          const cardStyle = clienteCardStyle(c.cor, c.intensidade);
          const fixas = demandasPorCliente[c.id] || [];
          const alerta = alertaPorCliente[c.id];

          // Em alerta: borda com uma luz que percorre o contorno (ver .checklist-alert no index.css).
          // Vermelho = demanda fixa; ambar = data limite de item.
          const moldura = alerta
            ? `border-2 ${
                alerta.tipo === "fixa"
                  ? "checklist-alert"
                  : "checklist-alert checklist-alert-prazo"
              } ${cardStyle ? "" : "bg-card/50"}`
            : `border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${
                cardStyle ? "" : `${tomBorda[tom]} border-l-4 bg-card/50`
              }`;

          return (
            <StaggerItem key={c.id} layout="position">
              <div
                style={cardStyle}
                className={`h-full rounded-xl ${moldura} p-5 space-y-3.5 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-serif text-lg font-semibold tracking-tight text-foreground truncate">
                    {c.nome}
                  </h4>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`font-mono-plex text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${tomBadge[tom]}`}
                    >
                      {tom === "paused"
                        ? c.status.charAt(0).toUpperCase() + c.status.slice(1)
                        : tomLabel[tom]}
                    </span>
                    <button
                      type="button"
                      onClick={() => openSaldoModal(c)}
                      className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-success hover:border-success/50 transition-colors"
                      title="Adicionar saldo (recarga via PIX)"
                    >
                      <Wallet className="h-3.5 w-3.5" />
                    </button>
                    <ColorSwatchPicker
                      cor={c.cor}
                      intensidade={c.intensidade}
                      onChangeCor={(cor) => updateClienteCor(c.id, { cor })}
                      onPreviewIntensidade={(valor) => previewClienteIntensidade(c.id, valor)}
                      onCommitIntensidade={(valor) => updateClienteCor(c.id, { intensidade: valor })}
                    />
                  </div>
                </div>

                {fixas.length > 0 && (
                  <div className="space-y-1.5">
                    {fixas.map((st) => (
                      <DemandaFixaLinha
                        key={st.demanda.id}
                        status={st}
                        onToggle={() => marcarDemandaFeita(st)}
                        onPendente={() => alternarPendenteCliente(st)}
                        onObservacao={(texto) => salvarObservacaoDemanda(st, texto)}
                      />
                    ))}
                  </div>
                )}

                {c.saldoUltimaRecargaValor != null && (
                  <div className="flex items-center justify-between gap-2 -mt-1.5 px-0.5 font-mono-plex text-[10px] uppercase tracking-wider">
                    <span className="text-muted-foreground">
                      Recarga {formatBRL(c.saldoUltimaRecargaValor)}
                      {c.saldoUltimaRecargaData && <> · {formatDataHora(c.saldoUltimaRecargaData)}</>}
                    </span>
                    {c.saldoAtual != null && (
                      <span className={c.saldoAtual <= 0 ? "text-destructive" : "text-success"}>
                        Restante {formatBRL(c.saldoAtual)}
                      </span>
                    )}
                  </div>
                )}

                {total > 0 && (
                  <div className="space-y-1">
                    <ProgressBar pct={pct} className="h-1.5" fillClassName={tomFill[tom]} aria-label={`Progresso de ${c.nome}`} />
                    <p className="font-mono-plex text-[10px] uppercase tracking-wider text-muted-foreground">
                      {done}/{total} concluídos
                    </p>
                  </div>
                )}

                <div className="space-y-0.5">
                  {clientItems.length === 0 && fixas.length === 0 && (
                    <p className="text-xs text-muted-foreground py-1">Nenhum item ainda.</p>
                  )}
                  {clientItems.map((it) => {
                    const prazo = statusPrazo(it, agora);
                    return (
                    <div
                      key={it.id}
                      className={`group flex items-start gap-2.5 py-1.5 px-1.5 -mx-1.5 rounded-lg ${
                        prazoEmAlerta(prazo)
                          ? "bg-warning/15 ring-1 ring-warning/50"
                          : it.aguardando_cliente && !it.concluido
                            ? "bg-[hsl(var(--wait-blue)/0.2)] ring-1 ring-[hsl(var(--wait-blue)/0.6)]"
                            : "hover:bg-surface-2"
                      }`}
                    >
                      <CheckMark done={it.concluido} onClick={() => toggleItem(it)} />
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <input
                          key={`titulo-${it.id}`}
                          defaultValue={it.titulo}
                          onBlur={(e) => commitField(it, "titulo", e.target.value)}
                          className={`w-full bg-transparent text-[13.5px] font-medium outline-none focus:underline decoration-dashed underline-offset-2 ${
                            it.concluido ? "text-muted-foreground line-through" : "text-foreground"
                          }`}
                        />
                        <div className="flex items-center gap-2">
                          <input
                            key={`obs-${it.id}`}
                            defaultValue={it.observacao || ""}
                            onBlur={(e) => commitField(it, "observacao", e.target.value)}
                            placeholder="Observação (opcional)"
                            className="min-w-0 flex-1 bg-transparent text-[11px] italic text-warning/90 outline-none focus:underline decoration-dashed placeholder:text-muted-foreground/50 placeholder:not-italic"
                          />
                          {it.aguardando_cliente && !it.concluido && (
                            <span className="shrink-0 rounded-full bg-[hsl(var(--wait-blue))] px-1.5 py-px font-mono-plex text-[9px] uppercase tracking-wider text-white">
                              Pendente cliente
                            </span>
                          )}
                          <PrazoPicker
                            variant="item"
                            value={it.data_limite}
                            status={prazo}
                            agora={agora}
                            onChange={(valor) => setPrazo(it, valor)}
                          />
                        </div>
                      </div>
                      <input
                        key={`resp-${it.id}`}
                        list="checklist-responsaveis"
                        defaultValue={it.responsavel || ""}
                        onBlur={(e) => commitField(it, "responsavel", e.target.value)}
                        placeholder="—"
                        title={it.responsavel || ""}
                        className="font-mono-plex w-[4.5rem] shrink-0 bg-transparent text-[10px] uppercase tracking-wider text-muted-foreground outline-none focus:underline decoration-dashed text-right mt-1.5 text-ellipsis"
                      />
                      {!it.concluido && (
                        <button
                          onClick={() => toggleAguardandoCliente(it)}
                          className={`shrink-0 mt-1 transition-opacity ${
                            it.aguardando_cliente
                              ? "text-[hsl(var(--wait-blue-light))] opacity-100"
                              : "text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-[hsl(var(--wait-blue-light))]"
                          }`}
                          title={
                            it.aguardando_cliente
                              ? "Pendente do cliente — clique para reabrir"
                              : "Já enviei, pendente do cliente"
                          }
                        >
                          <Hourglass className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleOtimizacaoFlag(it)}
                        className={`shrink-0 mt-1 transition-opacity ${
                          it.eh_otimizacao
                            ? "text-accent opacity-100"
                            : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-accent"
                        }`}
                        title={
                          it.eh_otimizacao
                            ? "Otimização: sim — ao concluir, registra na Otimização do cliente"
                            : "Marcar como otimização"
                        }
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </button>
                      {it.concluido && (
                        <button
                          onClick={() => archiveItem(it)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity shrink-0 mt-1"
                          title="Arquivar tarefa concluída"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => removeItem(it)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0 mt-1"
                        title="Excluir item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-dashed border-border">
                  <Input
                    value={draft.titulo}
                    onChange={(e) => setDraft(c.id, { titulo: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addItem(c.id);
                    }}
                    placeholder="Adicionar item ao checklist..."
                    className={`${inputCls} h-8 text-sm flex-1 basis-40 rounded-full px-3.5`}
                  />
                  <Input
                    value={draft.responsavel}
                    onChange={(e) => setDraft(c.id, { responsavel: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addItem(c.id);
                    }}
                    list="checklist-responsaveis"
                    placeholder="Resp."
                    className={`${inputCls} h-8 text-sm w-20 rounded-full px-3`}
                  />
                  <button
                    type="button"
                    onClick={() => setDraft(c.id, { otimizacao: !draft.otimizacao })}
                    className={`h-8 shrink-0 px-2.5 rounded-full border flex items-center gap-1 text-[10px] font-mono-plex uppercase tracking-wider transition-colors ${
                      draft.otimizacao
                        ? "bg-accent/15 border-accent/50 text-accent"
                        : "bg-surface-2 border-surface-3 text-muted-foreground hover:border-accent/40"
                    }`}
                    title="Ao concluir, registra como Otimização do cliente"
                  >
                    <Sparkles className="h-3 w-3" />
                    Otim.
                  </button>
                  <PrazoPicker
                    variant="draft"
                    value={draft.dataLimite || null}
                    agora={agora}
                    onChange={(valor) => setDraft(c.id, { dataLimite: valor || "" })}
                  />
                  <button
                    onClick={() => addItem(c.id)}
                    className="h-8 w-8 shrink-0 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-primary-foreground transition-transform hover:scale-105"
                    title="Adicionar"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </StaggerItem>
          );
        })}
        {visibleClientes.length === 0 && (
          <div className="text-sm text-muted-foreground py-8 text-center md:col-span-2 space-y-2">
            <p>
              {ocultosNaVisao > 0 && ocultosNaVisao === clientesNaVisao.length
                ? "Todos os clientes estão fora do quadro pelo filtro de clientes."
                : "Nenhum cliente encontrado para este filtro."}
            </p>
            {ocultosNaVisao > 0 && (
              <button type="button" onClick={mostrarTodos} className="text-primary hover:underline">
                Mostrar todos os clientes
              </button>
            )}
          </div>
        )}
      </Stagger>
      )}

      <MudarDiaDemandaDialog
        demanda={mudarDia ? (demandas.find((d) => d.id === mudarDia.demanda.id) ?? mudarDia.demanda) : null}
        ocorrencia={mudarDia?.ocorrencia ?? null}
        agora={agora}
        onFechar={() => setMudarDia(null)}
        onSalvar={salvarNovoDia}
      />

      <Dialog open={!!otimItem} onOpenChange={(o) => { if (!o) closeOtimModal(); }}>
        <DialogContent
          className="bg-surface-1 border-surface-3 text-foreground w-[96vw] max-w-[1400px] h-[92vh] flex flex-col gap-3 p-4 sm:p-5"
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
              e.preventDefault();
              if (!otimSaving) saveOtim();
            }
          }}
        >
          <DialogHeader className="flex-row items-start justify-between gap-3 space-y-0 pr-8">
            <div className="min-w-0 space-y-1">
              <DialogTitle className="text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent shrink-0" />
                Registrar otimização
                {otimItem && (
                  <span className="text-muted-foreground font-normal text-sm truncate">
                    · {clientes.find((c) => c.id === otimItem.client_id)?.nome}
                  </span>
                )}
              </DialogTitle>
              <p className="hidden sm:block text-xs text-muted-foreground">
                Este item do checklist está marcado como otimização. Ao salvar, ele vira um registro na aba
                Otimização do cliente.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={closeOtimModal}
                className="px-3.5 py-1.5 rounded-full text-sm border border-border text-foreground/85 hover:bg-surface-3"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveOtim}
                disabled={otimSaving}
                title="Salvar (Ctrl+S)"
                className="px-4 py-1.5 rounded-full text-sm bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-1.5"
              >
                {otimSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Salvar
              </button>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <MarkdownEditor
              value={otimTexto}
              onChange={setOtimTexto}
              placeholder={"# Título da campanha\n\nDescreva as otimizações realizadas, hipóteses, resultados...\n\nDica: use o menu \"Blocos\" para inserir estruturas prontas."}
              minHeight="100%"
              preview
              snippets={OTIMIZACAO_SNIPPETS}
              autoFocus
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!saldoItem} onOpenChange={(o) => { if (!o) closeSaldoModal(); }}>
        <DialogContent className="bg-surface-1 border-surface-3 text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4 text-success" />
              Adicionar saldo
              {saldoItem && (
                <span className="text-muted-foreground font-normal text-sm">· {saldoItem.nome}</span>
              )}
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground -mt-2">
            Informe o valor que o cliente colocou (ex: via PIX). A partir de agora o valor será descontado
            automaticamente conforme o gasto da conta de anúncio, e você é avisado quando estiver acabando.
          </p>
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            autoFocus
            value={saldoValor}
            onChange={(e) => setSaldoValor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveSaldo();
            }}
            placeholder="Valor recarregado (R$)"
            className="bg-surface-2 border-surface-3"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeSaldoModal}
              className="px-3.5 py-1.5 rounded-full text-sm border border-border text-foreground/85 hover:bg-surface-3"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveSaldo}
              disabled={saldoSaving}
              className="px-4 py-1.5 rounded-full text-sm bg-success hover:bg-success/90 text-success-foreground flex items-center gap-1.5"
            >
              {saldoSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Salvar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
