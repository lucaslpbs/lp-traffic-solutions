import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Plus, Loader2, Trash2, Search, Sparkles, Archive, ArchiveRestore, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { MarkdownEditor } from "@/components/sistema/MarkdownEditor";
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
}

interface ClienteOption {
  id: string;
  nome: string;
  status: string;
  cor: string | null;
  intensidade: number;
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

const emptyDraft = { titulo: "", responsavel: "", otimizacao: false };

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

export const ChecklistBoard = () => {
  const { user, isAdmin } = useAuth();
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"quadro" | "concluidas">("quadro");
  const [visao, setVisao] = useState<"ativos" | "inativos">("ativos");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busca, setBusca] = useState("");
  const [drafts, setDrafts] = useState<Record<string, typeof emptyDraft>>({});
  const [otimItem, setOtimItem] = useState<ChecklistItem | null>(null);
  const [otimTexto, setOtimTexto] = useState("");
  const [otimSaving, setOtimSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      (supabase as any)
        .from("gestao_clientes")
        .select("id, nome_cliente, status, checklist_cor, checklist_cor_intensidade")
        .order("nome_cliente"),
      (supabase as any)
        .from("sistema_checklist_itens")
        .select("id, client_id, titulo, responsavel, observacao, concluido, ordem, eh_otimizacao, arquivado, arquivado_em")
        .order("ordem", { ascending: true }),
    ]).then(([cliRes, itemRes]: any[]) => {
      if (!cliRes.error && cliRes.data)
        setClientes(
          cliRes.data.map((c: any) => ({
            id: c.id,
            nome: c.nome_cliente,
            status: c.status,
            cor: c.checklist_cor,
            intensidade: c.checklist_cor_intensidade ?? 100,
          }))
        );
      if (!itemRes.error && itemRes.data) setItems(itemRes.data);
      setLoading(false);
    });
  }, []);

  if (!isAdmin) return null;

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

  const visibleClientes = clientesNaVisao.filter((c) => {
    if (busca.trim() && !c.nome.toLowerCase().includes(busca.trim().toLowerCase())) return false;
    const clientItems = itemsByClient[c.id] || [];
    if (filtro === "pendentes") return clientItems.some((it) => !it.concluido);
    if (filtro === "lucas" || filtro === "lane")
      return clientItems.some((it) => (it.responsavel || "").toLowerCase().includes(filtro));
    return true;
  });

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
      created_by: user.id,
    };
    const { data, error } = await (supabase as any)
      .from("sistema_checklist_itens")
      .insert(payload)
      .select("id, client_id, titulo, responsavel, observacao, concluido, ordem, eh_otimizacao, arquivado, arquivado_em")
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
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, concluido: novo } : it)));
    const { error } = await (supabase as any)
      .from("sistema_checklist_itens")
      .update({ concluido: novo, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) {
      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, concluido: item.concluido } : it)));
      toast.error("Erro ao atualizar item");
      console.error(error);
      return;
    }
    if (novo && item.eh_otimizacao) {
      setOtimItem(item);
      setOtimTexto(item.titulo + (item.observacao ? `\n\n${item.observacao}` : ""));
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

      {viewMode === "concluidas" ? (
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

          return (
            <StaggerItem key={c.id}>
              <div
                style={cardStyle}
                className={`h-full rounded-xl border border-border ${
                  cardStyle ? "" : `${tomBorda[tom]} border-l-4 bg-card/50`
                } p-5 space-y-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30`}
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
                    <ColorSwatchPicker
                      cor={c.cor}
                      intensidade={c.intensidade}
                      onChangeCor={(cor) => updateClienteCor(c.id, { cor })}
                      onPreviewIntensidade={(valor) => previewClienteIntensidade(c.id, valor)}
                      onCommitIntensidade={(valor) => updateClienteCor(c.id, { intensidade: valor })}
                    />
                  </div>
                </div>

                {total > 0 && (
                  <div className="space-y-1">
                    <ProgressBar pct={pct} className="h-1.5" fillClassName={tomFill[tom]} aria-label={`Progresso de ${c.nome}`} />
                    <p className="font-mono-plex text-[10px] uppercase tracking-wider text-muted-foreground">
                      {done}/{total} concluídos
                    </p>
                  </div>
                )}

                <div className="space-y-0.5">
                  {clientItems.length === 0 && (
                    <p className="text-xs text-muted-foreground py-1">Nenhum item ainda.</p>
                  )}
                  {clientItems.map((it) => (
                    <div
                      key={it.id}
                      className="group flex items-start gap-2.5 py-1.5 px-1.5 -mx-1.5 rounded-lg hover:bg-surface-2"
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
                        <input
                          key={`obs-${it.id}`}
                          defaultValue={it.observacao || ""}
                          onBlur={(e) => commitField(it, "observacao", e.target.value)}
                          placeholder="Observação (opcional)"
                          className="w-full bg-transparent text-[11px] italic text-warning/90 outline-none focus:underline decoration-dashed placeholder:text-muted-foreground/50 placeholder:not-italic"
                        />
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
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-dashed border-border">
                  <Input
                    value={draft.titulo}
                    onChange={(e) => setDraft(c.id, { titulo: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addItem(c.id);
                    }}
                    placeholder="Adicionar item ao checklist..."
                    className={`${inputCls} h-8 text-sm flex-1 rounded-full px-3.5`}
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
          <p className="text-sm text-muted-foreground py-8 text-center md:col-span-2">
            Nenhum cliente encontrado para este filtro.
          </p>
        )}
      </Stagger>
      )}

      <Dialog open={!!otimItem} onOpenChange={(o) => { if (!o) closeOtimModal(); }}>
        <DialogContent className="bg-surface-1 border-surface-3 text-foreground max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              Registrar otimização
              {otimItem && (
                <span className="text-muted-foreground font-normal text-sm">
                  · {clientes.find((c) => c.id === otimItem.client_id)?.nome}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground -mt-2">
            Este item do checklist está marcado como otimização. Ao concluir, ele vira um registro na aba
            Otimização do cliente.
          </p>
          <MarkdownEditor
            value={otimTexto}
            onChange={setOtimTexto}
            placeholder="Descreva as otimizações realizadas, hipóteses, resultados..."
            minHeight="220px"
          />
          <div className="flex justify-end gap-2 pt-1">
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
              className="px-4 py-1.5 rounded-full text-sm bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-1.5"
            >
              {otimSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Salvar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
