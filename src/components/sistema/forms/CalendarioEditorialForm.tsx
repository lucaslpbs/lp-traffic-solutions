import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inputCls } from "./shared";

type Status = "publicado" | "rascunho" | "agendado" | "todo";
interface Entrada {
  id: string;
  data: string;
  titulo: string;
  status: Status;
  plataforma: string;
  obs: string;
}

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

export const CalendarioEditorialForm = () => {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [tab, setTab] = useState(TABS[0]);
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<Entrada, "id" | "data">>({
    titulo: "", status: "rascunho", plataforma: "Instagram", obs: "",
  });

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
    setDraft({ titulo: "", status: "rascunho", plataforma: "Instagram", obs: "" });
    setModalDate(date ?? fmt(today));
  };

  const save = () => {
    if (!modalDate || !draft.titulo.trim()) return;
    setEntradas([
      ...entradas,
      { id: String(Date.now()), data: modalDate, ...draft },
    ]);
    setModalDate(null);
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
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!d}
                  onClick={() => d && openNew(fmt(d))}
                  className={`min-h-[88px] p-1.5 text-left border-b border-r border-surface-3 transition-colors ${
                    d ? "hover:bg-surface-2" : "bg-background"
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
                        {entriesFor(d).slice(0, 3).map((e) => (
                          <div
                            key={e.id}
                            className={`text-[10px] px-1.5 py-0.5 rounded border truncate ${STATUS_META[e.status].cls}`}
                          >
                            {e.titulo}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </button>
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
                      <div key={e.id} className="px-3 py-2 flex justify-between text-sm border-t border-surface-3">
                        <span className="text-foreground">{e.titulo}</span>
                        <span className="text-muted-foreground text-xs">{e.data} · {e.plataforma}</span>
                      </div>
                    ))}
                  </div>
                );
              });
            }
            return list.map((e) => (
              <div key={e.id} className="px-3 py-2 flex justify-between items-center text-sm border-b border-surface-3 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STATUS_META[e.status].cls}`}>
                    {STATUS_META[e.status].label}
                  </span>
                  <span className="text-foreground">{e.titulo}</span>
                </div>
                <span className="text-muted-foreground text-xs">{e.data} · {e.plataforma}</span>
              </div>
            ));
          })()}
        </div>
      )}

      <Dialog open={!!modalDate} onOpenChange={(o) => !o && setModalDate(null)}>
        <DialogContent className="bg-surface-1 border-surface-3 text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nova entrada · {modalDate}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
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
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setModalDate(null)}>Cancelar</Button>
              <Button type="button" className="bg-primary hover:bg-primary/90" onClick={save}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
