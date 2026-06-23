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
          <div key={b.key} className="rounded-lg border border-[#2a2a2a] bg-[#1c1c1e] overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(b.key)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-[#2a2a2a]/30"
            >
              <ChevronRight className={`h-4 w-4 text-zinc-400 transition-transform ${aberto ? "rotate-90" : ""}`} />
              <span className="text-sm font-medium text-white">{b.key}</span>
              <span className="ml-auto text-xs text-zinc-500">{b.entradas.length}</span>
            </button>
            {aberto && (
              <div className="px-3 pb-3 space-y-1">
                {b.entradas.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-[#0f0f0f] border border-[#2a2a2a] hover:border-[#3b82f6]/40 cursor-pointer group"
                    onClick={() => setEditing({ bucketKey: b.key, entrada: e })}
                  >
                    <span className="text-sm text-white flex-1">{e.data}</span>
                    <button
                      type="button"
                      onClick={(ev) => { ev.stopPropagation(); deleteEntrada(b.key, e.id); }}
                      className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => startNew(b.key)}
                  className="flex items-center gap-1.5 text-xs text-[#3b82f6] hover:text-[#60a5fa] mt-2"
                >
                  <Plus className="h-3.5 w-3.5" /> Nova entrada
                </button>
              </div>
            )}
          </div>
        );
      })}

      <Dialog open={!!askDate} onOpenChange={(o) => !o && setAskDate(null)}>
        <DialogContent className="bg-[#111111] border-[#2a2a2a] text-white max-w-sm">
          <DialogHeader><DialogTitle className="text-white">Nova entrada</DialogTitle></DialogHeader>
          <Input
            placeholder="Ex: 10/06/2025 ou 10 a 12/06/2025"
            value={novaData}
            onChange={(e) => setNovaData(e.target.value)}
            className={inputCls}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setAskDate(null)}>Cancelar</Button>
            <Button type="button" className="bg-[#3b82f6] hover:bg-[#3b82f6]/90" onClick={confirmNew}>Criar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="bg-[#111111] border-[#2a2a2a] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">{editing?.entrada.data}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-1 border-b border-[#2a2a2a] pb-2">
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
                className="h-7 w-7 rounded hover:bg-[#2a2a2a] flex items-center justify-center text-zinc-300"
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            className="min-h-[300px] max-h-[50vh] overflow-y-auto bg-[#1c1c1e] border border-[#2a2a2a] rounded-md p-3 text-white text-sm focus:outline-none focus:border-[#3b82f6]/60"
            dangerouslySetInnerHTML={{ __html: editing?.entrada.conteudo ?? "" }}
            onBlur={(e) => editing && updateEntrada(editing.bucketKey, editing.entrada.id, e.currentTarget.innerHTML)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Fechar</Button>
            <Button type="button" className="bg-[#3b82f6] hover:bg-[#3b82f6]/90" onClick={() => setEditing(null)}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
