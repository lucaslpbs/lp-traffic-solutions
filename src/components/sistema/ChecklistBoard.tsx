import { useEffect, useMemo, useState } from "react";
import { Plus, Loader2, Trash2, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
}

interface ClienteOption {
  id: string;
  nome: string;
  status: string;
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
        .select("id, nome_cliente, status")
        .order("nome_cliente"),
      (supabase as any)
        .from("sistema_checklist_itens")
        .select("id, client_id, titulo, responsavel, observacao, concluido, ordem, eh_otimizacao")
        .order("ordem", { ascending: true }),
    ]).then(([cliRes, itemRes]: any[]) => {
      if (!cliRes.error && cliRes.data)
        setClientes(
          cliRes.data.map((c: any) => ({ id: c.id, nome: c.nome_cliente, status: c.status }))
        );
      if (!itemRes.error && itemRes.data) setItems(itemRes.data);
      setLoading(false);
    });
  }, []);

  if (!isAdmin) return null;

  const itemsByClient = useMemo(() => {
    const map: Record<string, ChecklistItem[]> = {};
    for (const it of items) {
      if (!map[it.client_id]) map[it.client_id] = [];
      map[it.client_id].push(it);
    }
    return map;
  }, [items]);

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
      .select("id, client_id, titulo, responsavel, observacao, concluido, ordem, eh_otimizacao")
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

      <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleClientes.map((c) => {
          const clientItems = itemsByClient[c.id] || [];
          const done = clientItems.filter((it) => it.concluido).length;
          const total = clientItems.length;
          const pct = total ? done / total : 0;
          const draft = getDraft(c.id);
          const tom = getTom(c, clientItems);

          return (
            <StaggerItem key={c.id}>
              <div
                className={`h-full rounded-xl border border-border ${tomBorda[tom]} border-l-4 bg-card/50 p-5 space-y-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-serif text-lg font-semibold tracking-tight text-foreground truncate">
                    {c.nome}
                  </h4>
                  <span
                    className={`font-mono-plex shrink-0 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${tomBadge[tom]}`}
                  >
                    {tom === "paused"
                      ? c.status.charAt(0).toUpperCase() + c.status.slice(1)
                      : tomLabel[tom]}
                  </span>
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
