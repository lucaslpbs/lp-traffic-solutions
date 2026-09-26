import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inputCls, novoId } from "./shared";
import { SecaoLoader } from "./SecaoLoader";

type Status = "publicado" | "rascunho" | "agendado" | "todo";
interface Entrada {
  id: string;
  data: string;
  titulo: string;
  status: Status;
  plataforma: string;
  obs: string;
}
interface CalendarioDados {
  entradas: Entrada[];
}
type Rascunho = Omit<Entrada, "id" | "data">;

const STATUS_META: Record<Status, { label: string; cls: string }> = {
  publicado: { label: "Publicado", cls: "bg-success/30 text-success border-success/50" },
  rascunho: { label: "Rascunho", cls: "bg-zinc-600/30 text-foreground/85 border-border/50" },
  agendado: { label: "Agendado", cls: "bg-primary/30 text-primary border-primary/50" },
  todo: { label: "Para Fazer", cls: "bg-warning/30 text-warning border-warning/50" },
};

const PLATAFORMAS = ["Instagram", "Facebook", "LinkedIn", "TikTok", "YouTube", "Blog", "WhatsApp"];
const TABS = ["Calendário", "Por Status", "Lista geral", "Publicados"];
const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const fmt = (d: Date) => d.toISOString().slice(0, 10);
const rascunhoVazio = (): Rascunho => ({
  titulo: "", status: "rascunho", plataforma: "Instagram", obs: "",
});

interface EditorProps {
  initial: Partial<CalendarioDados>;
  update: (mudar: (atual: Partial<CalendarioDados>) => CalendarioDados) => Promise<CalendarioDados>;
}

const CalendarioEditor = ({ initial, update }: EditorProps) => {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [tab, setTab] = useState(TABS[0]);
  const [entradas, setEntradas] = useState<Entrada[]>(initial.entradas ?? []);
  // modal aberto: `id` presente = editando; ausente = nova entrada
  const [modal, setModal] = useState<{ id?: string; data: string } | null>(null);
  const [draft, setDraft] = useState<Rascunho>(rascunhoVazio());
  const [saving, setSaving] = useState(false);

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const arr: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [cursor]);

  const openNew = (date?: string) => {
    setDraft(rascunhoVazio());
    setModal({ data: date ?? fmt(today) });
  };

  const openEdit = (e: Entrada) => {
    const { id, data, ...resto } = e;
    setDraft(resto);
    setModal({ id, data });
  };

  /** Aplica a mudanca sobre a versao mais recente do banco e atualiza a tela. */
  const aplicar = async (op: (lista: Entrada[]) => Entrada[]): Promise<boolean> => {
    setSaving(true);
    try {
      const novo = await update((atual) => ({ entradas: op(atual.entradas ?? []) }));
      setEntradas(novo.entradas);
      return true;
    } catch (err) {
      console.error("Erro ao salvar calendario editorial:", err);
      toast.error("Erro ao salvar. Tente novamente.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const salvar = async () => {
    if (!modal || !modal.data || !draft.titulo.trim()) return;
    const { id, data } = modal;
    const ok = await aplicar((lista) =>
      id && lista.some((e) => e.id === id)
        ? lista.map((e) => (e.id === id ? { ...e, ...draft, data } : e))
        : [...lista, { id: id ?? novoId(), data, ...draft }]
    );
    if (ok) setModal(null);
  };

  const excluir = async () => {
    if (!modal?.id) return;
    if (!window.confirm("Excluir esta entrada?")) return;
    const id = modal.id;
    const ok = await aplicar((lista) => lista.filter((e) => e.id !== id));
    if (ok) setModal(null);
  };

  const entriesFor = (d: Date) => entradas.filter((e) => e.data === fmt(d));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button" variant="outline" size="icon"
            className="h-8 w-8 bg-surface-2 border-surface-3 hover:bg-surface-3"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-semibold text-foreground min-w-[140px] text-center">
            {MESES[cursor.getMonth()]} {cursor.getFullYear()}
          </div>
          <Button
            type="button" variant="outline" size="icon"
            className="h-8 w-8 bg-surface-2 border-surface-3 hover:bg-surface-3"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button" variant="outline" size="sm"
            className="h-8 bg-surface-2 border-surface-3 hover:bg-surface-3 text-xs"
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
          >
            Hoje
          </Button>
        </div>
        <Button
          type="button" size="sm"
          className="bg-primary hover:bg-primary/90 text-foreground h-8"
          onClick={() => openNew()}
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Nova
        </Button>
      </div>

      <div className="flex gap-1 border-b border-surface-3">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`text-xs px-3 py-2 transition-colors ${
              tab === t
                ? "text-primary border-b-2 border-primary -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Calendário" && (
        <div className="rounded-lg overflow-hidden border border-surface-3 bg-card">
          <div className="grid grid-cols-7 bg-surface-2 border-b border-surface-3">
            {DIAS.map((d) => (
              <div key={d} className="px-2 py-2 text-[10px] uppercase tracking-wide text-muted-foreground text-center font-semibold">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              const isToday = d && fmt(d) === fmt(today);
              const doDia = d ? entriesFor(d) : [];
              return (
                <div
                  key={i}
                  role={d ? "button" : undefined}
                  tabIndex={d ? 0 : -1}
                  onClick={() => d && openNew(fmt(d))}
                  onKeyDown={(ev) => {
                    if (d && (ev.key === "Enter" || ev.key === " ")) {
                      ev.preventDefault();
                      openNew(fmt(d));
                    }
                  }}
                  className={`min-h-[88px] p-1.5 text-left border-b border-r border-surface-3 transition-colors ${
                    d ? "hover:bg-surface-2 cursor-pointer" : "bg-background"
                  }`}
                >
                  {d && (
                    <>
                      <div
                        className={`text-xs mb-1 inline-flex items-center justify-center h-5 w-5 rounded-full ${
                          isToday ? "bg-primary text-foreground font-bold" : "text-muted-foreground"
                        }`}
                      >
                        {d.getDate()}
                      </div>
                      <div className="space-y-0.5">
                        {doDia.slice(0, 3).map((e) => (
                          <button
                            type="button"
                            key={e.id}
                            onClick={(ev) => { ev.stopPropagation(); openEdit(e); }}
                            className={`block w-full text-left text-[10px] px-1.5 py-0.5 rounded border truncate ${STATUS_META[e.status].cls}`}
                          >
                            {e.titulo}
                          </button>
                        ))}
                        {doDia.length > 3 && (
                          <div className="text-[10px] text-muted-foreground px-1">+{doDia.length - 3}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab !== "Calendário" && (
        <div className="rounded-lg border border-surface-3 bg-surface-2 overflow-hidden">
          {(() => {
            const list = tab === "Publicados"
              ? entradas.filter((e) => e.status === "publicado")
              : entradas;
            if (list.length === 0) {
              return <div className="p-8 text-center text-muted-foreground text-sm">Nenhuma entrada ainda.</div>;
            }
            if (tab === "Por Status") {
              return (Object.keys(STATUS_META) as Status[]).map((st) => {
                const items = list.filter((e) => e.status === st);
                if (!items.length) return null;
                return (
                  <div key={st} className="border-b border-surface-3 last:border-0">
                    <div className="px-3 py-2 text-xs text-primary uppercase bg-card font-semibold">
                      {STATUS_META[st].label} ({items.length})
                    </div>
                    {items.map((e) => (
                      <button
                        type="button"
                        key={e.id}
                        onClick={() => openEdit(e)}
                        className="w-full px-3 py-2 flex justify-between text-sm border-t border-surface-3 text-left hover:bg-surface-3/40"
                      >
                        <span className="text-foreground">{e.titulo}</span>
                        <span className="text-muted-foreground text-xs">{e.data} · {e.plataforma}</span>
                      </button>
                    ))}
                  </div>
                );
              });
            }
            return list.map((e) => (
              <button
                type="button"
                key={e.id}
                onClick={() => openEdit(e)}
                className="w-full px-3 py-2 flex justify-between items-center text-sm border-b border-surface-3 last:border-0 text-left hover:bg-surface-3/40"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STATUS_META[e.status].cls}`}>
                    {STATUS_META[e.status].label}
                  </span>
                  <span className="text-foreground">{e.titulo}</span>
                </div>
                <span className="text-muted-foreground text-xs">{e.data} · {e.plataforma}</span>
              </button>
            ));
          })()}
        </div>
      )}

      <Dialog open={!!modal} onOpenChange={(o) => !o && !saving && setModal(null)}>
        <DialogContent className="bg-surface-1 border-surface-3 text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {modal?.id ? "Editar entrada" : "Nova entrada"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="date"
              value={modal?.data ?? ""}
              onChange={(e) => modal && setModal({ ...modal, data: e.target.value })}
              className={inputCls}
            />
            <Input
              placeholder="Título"
              value={draft.titulo}
              onChange={(e) => setDraft({ ...draft, titulo: e.target.value })}
              className={inputCls}
            />
            <Select value={draft.status} onValueChange={(v: Status) => setDraft({ ...draft, status: v })}>
              <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
              <SelectContent className="bg-surface-2 border-surface-3 text-foreground">
                {(Object.keys(STATUS_META) as Status[]).map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={draft.plataforma} onValueChange={(v) => setDraft({ ...draft, plataforma: v })}>
              <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
              <SelectContent className="bg-surface-2 border-surface-3 text-foreground">
                {PLATAFORMAS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Observações"
              value={draft.obs}
              onChange={(e) => setDraft({ ...draft, obs: e.target.value })}
              className={inputCls}
            />
            <div className="flex items-center gap-2">
              {modal?.id && (
                <Button
                  type="button" variant="ghost" disabled={saving}
                  className="text-destructive hover:text-destructive mr-auto"
                  onClick={excluir}
                >
                  Excluir
                </Button>
              )}
              <Button type="button" variant="ghost" disabled={saving} className="ml-auto" onClick={() => setModal(null)}>
                Cancelar
              </Button>
              <Button type="button" disabled={saving} className="bg-primary hover:bg-primary/90" onClick={salvar}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const CalendarioEditorialForm = ({ clientId }: { clientId?: string }) => (
  <SecaoLoader<CalendarioDados> clientId={clientId} secao="calendario" rotulo="o calendário editorial">
    {({ initial, update }) => <CalendarioEditor initial={initial} update={update} />}
  </SecaoLoader>
);
