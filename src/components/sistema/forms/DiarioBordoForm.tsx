import { useState } from "react";
import { ChevronRight, Plus, Trash2, Bold, Italic, List, Heading2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { inputCls } from "./shared";

interface Entrada {
  id: string;
  data: string;
  conteudo: string;
}
interface Bucket {
  key: string;
  entradas: Entrada[];
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const DiarioBordoForm = () => {
  const now = new Date();
  const initialKey = `${MESES[now.getMonth()]}/${now.getFullYear()}`;
  const [buckets, setBuckets] = useState<Bucket[]>([{ key: initialKey, entradas: [] }]);
  const [open, setOpen] = useState<Record<string, boolean>>({ [initialKey]: true });
  const [editing, setEditing] = useState<{ bucketKey: string; entrada: Entrada } | null>(null);
  const [askDate, setAskDate] = useState<string | null>(null);
  const [novaData, setNovaData] = useState("");

  const toggle = (k: string) => setOpen({ ...open, [k]: !open[k] });

  const startNew = (bucketKey: string) => {
    setNovaData("");
    setAskDate(bucketKey);
  };

  const confirmNew = () => {
    if (!askDate || !novaData.trim()) return;
    const nova: Entrada = { id: String(Date.now()), data: novaData, conteudo: "" };
    setBuckets(buckets.map((b) => b.key === askDate ? { ...b, entradas: [nova, ...b.entradas] } : b));
    setEditing({ bucketKey: askDate, entrada: nova });
    setAskDate(null);
  };

  const updateEntrada = (bucketKey: string, id: string, conteudo: string) =>
    setBuckets(buckets.map((b) =>
      b.key === bucketKey
        ? { ...b, entradas: b.entradas.map((e) => e.id === id ? { ...e, conteudo } : e) }
        : b
    ));

  const deleteEntrada = (bucketKey: string, id: string) =>
    setBuckets(buckets.map((b) =>
      b.key === bucketKey ? { ...b, entradas: b.entradas.filter((e) => e.id !== id) } : b
    ));

  const applyFormat = (cmd: string) => {
    document.execCommand(cmd, false);
  };

  return (
    <div className="space-y-2">
      {buckets.map((b) => {
        const aberto = open[b.key];
        return (
          <div key={b.key} className="rounded-lg border border-surface-3 bg-surface-2 overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(b.key)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-surface-3/30"
            >
              <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${aberto ? "rotate-90" : ""}`} />
              <span className="text-sm font-medium text-foreground">{b.key}</span>
              <span className="ml-auto text-xs text-muted-foreground">{b.entradas.length}</span>
            </button>
            {aberto && (
              <div className="px-3 pb-3 space-y-1">
                {b.entradas.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-card border border-surface-3 hover:border-primary/40 cursor-pointer group"
                    onClick={() => setEditing({ bucketKey: b.key, entrada: e })}
                  >
                    <span className="text-sm text-foreground flex-1">{e.data}</span>
                    <button
                      type="button"
                      onClick={(ev) => { ev.stopPropagation(); deleteEntrada(b.key, e.id); }}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => startNew(b.key)}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-light mt-2"
                >
                  <Plus className="h-3.5 w-3.5" /> Nova entrada
                </button>
              </div>
            )}
          </div>
        );
      })}

      <Dialog open={!!askDate} onOpenChange={(o) => !o && setAskDate(null)}>
        <DialogContent className="bg-surface-1 border-surface-3 text-foreground max-w-sm">
          <DialogHeader><DialogTitle className="text-foreground">Nova entrada</DialogTitle></DialogHeader>
          <Input
            placeholder="Ex: 10/06/2025 ou 10 a 12/06/2025"
            value={novaData}
            onChange={(e) => setNovaData(e.target.value)}
            className={inputCls}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setAskDate(null)}>Cancelar</Button>
            <Button type="button" className="bg-primary hover:bg-primary/90" onClick={confirmNew}>Criar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="bg-surface-1 border-surface-3 text-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editing?.entrada.data}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-1 border-b border-surface-3 pb-2">
            {[
              { icon: Bold, cmd: "bold" },
              { icon: Italic, cmd: "italic" },
              { icon: List, cmd: "insertUnorderedList" },
              { icon: Heading2, cmd: "formatBlock" },
            ].map(({ icon: Icon, cmd }) => (
              <button
                key={cmd}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyFormat(cmd === "formatBlock" ? "h2" : cmd); }}
                className="h-7 w-7 rounded hover:bg-surface-3 flex items-center justify-center text-foreground/85"
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            className="min-h-[300px] max-h-[50vh] overflow-y-auto bg-surface-2 border border-surface-3 rounded-md p-3 text-foreground text-sm focus:outline-none focus:border-primary/60"
            dangerouslySetInnerHTML={{ __html: editing?.entrada.conteudo ?? "" }}
            onBlur={(e) => editing && updateEntrada(editing.bucketKey, editing.entrada.id, e.currentTarget.innerHTML)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Fechar</Button>
            <Button type="button" className="bg-primary hover:bg-primary/90" onClick={() => setEditing(null)}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
