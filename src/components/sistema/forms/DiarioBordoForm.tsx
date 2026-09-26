import { useRef, useState } from "react";
import { ChevronRight, Plus, Trash2, Bold, Italic, List, Heading2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { inputCls, novoId } from "./shared";
import { SecaoLoader } from "./SecaoLoader";

interface Entrada {
  id: string;
  data: string;
  conteudo: string;
}
interface Bucket {
  key: string;
  entradas: Entrada[];
}
interface DiarioDados {
  buckets: Bucket[];
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const chaveAtual = () => {
  const now = new Date();
  return `${MESES[now.getMonth()]}/${now.getFullYear()}`;
};

// "Setembro/2026" -> numero para ordenar (mais recente primeiro)
const ordemChave = (key: string) => {
  const [mes, ano] = key.split("/");
  return Number(ano) * 12 + MESES.indexOf(mes);
};

/** Sempre mostra o mes atual (mesmo vazio), do mais recente para o mais antigo. */
const paraTela = (buckets: Bucket[]): Bucket[] => {
  const atual = chaveAtual();
  const lista = buckets.some((b) => b.key === atual) ? buckets : [...buckets, { key: atual, entradas: [] }];
  return [...lista].sort((a, b) => ordemChave(b.key) - ordemChave(a.key));
};

/** Meses sem nenhuma entrada nao precisam ir para o banco. */
const paraBanco = (buckets: Bucket[]): Bucket[] => buckets.filter((b) => b.entradas.length > 0);

const adicionarEntrada = (lista: Bucket[], key: string, nova: Entrada): Bucket[] =>
  lista.some((b) => b.key === key)
    ? lista.map((b) => (b.key === key ? { ...b, entradas: [nova, ...b.entradas] } : b))
    : [...lista, { key, entradas: [nova] }];

interface EditorProps {
  initial: Partial<DiarioDados>;
  update: (mudar: (atual: Partial<DiarioDados>) => DiarioDados) => Promise<DiarioDados>;
}

const DiarioEditor = ({ initial, update }: EditorProps) => {
  const [buckets, setBuckets] = useState<Bucket[]>(paraTela(initial.buckets ?? []));
  const [open, setOpen] = useState<Record<string, boolean>>({ [chaveAtual()]: true });
  const [editing, setEditing] = useState<{ bucketKey: string; entrada: Entrada } | null>(null);
  const [askDate, setAskDate] = useState<string | null>(null);
  const [novaData, setNovaData] = useState("");
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const toggle = (k: string) => setOpen({ ...open, [k]: !open[k] });

  /** Aplica a mudanca sobre a versao mais recente do banco e atualiza a tela. */
  const aplicar = async (op: (lista: Bucket[]) => Bucket[]): Promise<boolean> => {
    setSaving(true);
    try {
      const novo = await update((atual) => ({ buckets: paraBanco(op(atual.buckets ?? [])) }));
      setBuckets(paraTela(novo.buckets));
      return true;
    } catch (err) {
      console.error("Erro ao salvar diario de bordo:", err);
      toast.error("Erro ao salvar. Tente novamente.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const startNew = (bucketKey: string) => {
    setNovaData("");
    setAskDate(bucketKey);
  };

  const confirmNew = async () => {
    if (!askDate || !novaData.trim()) return;
    const nova: Entrada = { id: novoId(), data: novaData.trim(), conteudo: "" };
    const bucketKey = askDate;
    const ok = await aplicar((lista) => adicionarEntrada(lista, bucketKey, nova));
    if (ok) {
      setAskDate(null);
      setEditing({ bucketKey, entrada: nova });
    }
  };

  const deleteEntrada = async (bucketKey: string, id: string) => {
    if (!window.confirm("Excluir esta entrada do diário?")) return;
    await aplicar((lista) =>
      lista.map((b) =>
        b.key === bucketKey ? { ...b, entradas: b.entradas.filter((e) => e.id !== id) } : b
      )
    );
  };

  const htmlDoEditor = () => sanitizeHtml(editorRef.current?.innerHTML ?? "");

  const fecharEditor = () => {
    if (
      editing &&
      htmlDoEditor() !== sanitizeHtml(editing.entrada.conteudo) &&
      !window.confirm("Descartar as alterações não salvas?")
    ) {
      return;
    }
    setEditing(null);
  };

  const salvarEditor = async () => {
    if (!editing) return;
    const { bucketKey, entrada } = editing;
    const html = htmlDoEditor();
    const ok = await aplicar((lista) =>
      lista.map((b) =>
        b.key === bucketKey
          ? { ...b, entradas: b.entradas.map((e) => (e.id === entrada.id ? { ...e, conteudo: html } : e)) }
          : b
      )
    );
    if (ok) setEditing(null);
  };

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
                      aria-label="Excluir entrada"
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

      <Dialog open={!!askDate} onOpenChange={(o) => !o && !saving && setAskDate(null)}>
        <DialogContent className="bg-surface-1 border-surface-3 text-foreground max-w-sm">
          <DialogHeader><DialogTitle className="text-foreground">Nova entrada</DialogTitle></DialogHeader>
          <Input
            placeholder="Ex: 10/06/2025 ou 10 a 12/06/2025"
            value={novaData}
            onChange={(e) => setNovaData(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmNew()}
            className={inputCls}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={saving} onClick={() => setAskDate(null)}>Cancelar</Button>
            <Button type="button" disabled={saving} className="bg-primary hover:bg-primary/90" onClick={confirmNew}>
              {saving ? "Criando..." : "Criar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && !saving && fecharEditor()}>
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
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="min-h-[300px] max-h-[50vh] overflow-y-auto bg-surface-2 border border-surface-3 rounded-md p-3 text-foreground text-sm focus:outline-none focus:border-primary/60"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(editing?.entrada.conteudo ?? "") }}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={saving} onClick={fecharEditor}>Fechar</Button>
            <Button type="button" disabled={saving} className="bg-primary hover:bg-primary/90" onClick={salvarEditor}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const DiarioBordoForm = ({ clientId }: { clientId?: string }) => (
  <SecaoLoader<DiarioDados> clientId={clientId} secao="diario" rotulo="o diário de bordo">
    {({ initial, update }) => <DiarioEditor initial={initial} update={update} />}
  </SecaoLoader>
);
