import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, FileText, Plus, Download, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { novoId } from "./shared";
import { SecaoLoader } from "./SecaoLoader";

// Bucket privado (ver migration sistema_relatorios_e_acesso_cliente): so a equipe acessa,
// sempre por URL assinada temporaria.
const BUCKET = "client-reports";
const MAX_BYTES = 25 * 1024 * 1024;
const TIPOS = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

interface Arquivo {
  id: string;
  nome: string;
  tamanho: string;
  path: string;
}
interface RelatoriosDados {
  arquivos: Record<string, Arquivo[]>;
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const formatSize = (b: number) => {
  if (b < 1024) return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)}KB`;
  return `${(b / 1024 / 1024).toFixed(1)}MB`;
};

// Chaves do Storage nao aceitam acentos/espacos com seguranca.
const nomeSeguro = (nome: string) =>
  nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "_")
    .replace(/_+/g, "_");

interface EditorProps {
  clientId?: string;
  initial: Partial<RelatoriosDados>;
  update: (mudar: (atual: Partial<RelatoriosDados>) => RelatoriosDados) => Promise<RelatoriosDados>;
}

const RelatoriosEditor = ({ clientId, initial, update }: EditorProps) => {
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [data, setData] = useState<Record<string, Arquivo[]>>(initial.arquivos ?? {});
  const [open, setOpen] = useState<Record<string, boolean>>({
    [`${MESES[hoje.getMonth()]}/${hoje.getFullYear()}`]: true,
  });
  const [enviando, setEnviando] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const toggle = (k: string) => setOpen({ ...open, [k]: !open[k] });

  const upload = async (label: string, mesIdx: number, files: FileList | null) => {
    if (!files?.length || !clientId) return;
    setEnviando(label);
    const enviados: Arquivo[] = [];
    try {
      for (const f of Array.from(files)) {
        if (!TIPOS.includes(f.type)) {
          toast.error(`${f.name}: use PDF ou imagem (PNG, JPG ou WebP).`);
          continue;
        }
        if (f.size > MAX_BYTES) {
          toast.error(`${f.name}: o limite é 25MB por arquivo.`);
          continue;
        }
        const id = novoId();
        const pasta = `${ano}-${String(mesIdx + 1).padStart(2, "0")}`;
        const path = `${clientId}/${pasta}/${id}-${nomeSeguro(f.name)}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, f, { contentType: f.type });
        if (error) {
          console.error("Erro ao enviar relatorio:", error);
          toast.error(`Não foi possível enviar ${f.name}.`);
          continue;
        }
        enviados.push({ id, nome: f.name, tamanho: formatSize(f.size), path });
      }

      if (enviados.length > 0) {
        try {
          const novo = await update((atual) => ({
            arquivos: {
              ...(atual.arquivos ?? {}),
              [label]: [...(atual.arquivos?.[label] ?? []), ...enviados],
            },
          }));
          setData(novo.arquivos);
        } catch (err) {
          // sem o registro o arquivo ficaria invisivel: desfaz o upload
          await supabase.storage.from(BUCKET).remove(enviados.map((a) => a.path));
          throw err;
        }
      }
    } catch (err) {
      console.error("Erro ao salvar relatorios:", err);
      toast.error("Erro ao salvar os relatórios. Tente novamente.");
    } finally {
      setEnviando(null);
    }
  };

  const baixar = async (a: Arquivo) => {
    const { data: link, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(a.path, 60, { download: a.nome });
    if (error || !link?.signedUrl) {
      console.error("Erro ao gerar link do relatorio:", error);
      toast.error("Não foi possível abrir o arquivo.");
      return;
    }
    const el = document.createElement("a");
    el.href = link.signedUrl;
    el.rel = "noopener";
    document.body.appendChild(el);
    el.click();
    el.remove();
  };

  const remover = async (label: string, a: Arquivo) => {
    if (!window.confirm(`Excluir "${a.nome}"?`)) return;
    try {
      // registro primeiro: se o arquivo falhar em sair do bucket, sobra so um arquivo invisivel
      const novo = await update((atual) => ({
        arquivos: {
          ...(atual.arquivos ?? {}),
          [label]: (atual.arquivos?.[label] ?? []).filter((x) => x.id !== a.id),
        },
      }));
      setData(novo.arquivos);
      const { error } = await supabase.storage.from(BUCKET).remove([a.path]);
      if (error) console.error("Arquivo nao removido do bucket:", error);
    } catch (err) {
      console.error("Erro ao excluir relatorio:", err);
      toast.error("Não foi possível excluir. Tente novamente.");
    }
  };

  const meses = MESES.map((m, i) => ({ label: `${m}/${ano}`, mesIdx: i })).reverse();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2 pb-1">
        <button
          type="button"
          onClick={() => setAno(ano - 1)}
          className="h-7 w-7 rounded hover:bg-surface-3 flex items-center justify-center text-muted-foreground"
          aria-label="Ano anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-foreground min-w-[48px] text-center">{ano}</span>
        <button
          type="button"
          onClick={() => setAno(ano + 1)}
          className="h-7 w-7 rounded hover:bg-surface-3 flex items-center justify-center text-muted-foreground"
          aria-label="Próximo ano"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {meses.map(({ label, mesIdx }) => {
        const aberto = open[label];
        const arquivos = data[label] ?? [];
        return (
          <div key={label} className="rounded-lg border border-surface-3 overflow-hidden bg-surface-2">
            <button
              type="button"
              onClick={() => toggle(label)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-surface-3/30 transition-colors"
            >
              <ChevronRight
                className={`h-4 w-4 text-muted-foreground transition-transform ${aberto ? "rotate-90" : ""}`}
              />
              <span className="text-sm font-medium text-foreground">{label}</span>
              {arquivos.length > 0 && (
                <span className="ml-auto text-xs text-muted-foreground">{arquivos.length} arquivo(s)</span>
              )}
            </button>
            {aberto && (
              <div className="px-3 pb-3 space-y-1.5">
                {arquivos.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-card border border-surface-3"
                  >
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm text-foreground flex-1 truncate">{a.nome}</span>
                    <span className="text-xs text-muted-foreground">{a.tamanho}</span>
                    <button
                      type="button"
                      onClick={() => baixar(a)}
                      className="text-muted-foreground hover:text-primary"
                      aria-label={`Baixar ${a.nome}`}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remover(label, a)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Excluir ${a.nome}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <input
                  ref={(el) => (inputRefs.current[label] = el)}
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    upload(label, mesIdx, files).finally(() => {
                      // permite escolher o mesmo arquivo de novo
                      if (inputRefs.current[label]) inputRefs.current[label]!.value = "";
                    });
                  }}
                />
                <button
                  type="button"
                  disabled={enviando !== null}
                  onClick={() => inputRefs.current[label]?.click()}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-light mt-2 disabled:opacity-50"
                >
                  {enviando === label ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enviando...</>
                  ) : (
                    <><Plus className="h-3.5 w-3.5" /> Adicionar relatório</>
                  )}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const RelatoriosForm = ({ clientId }: { clientId?: string }) => (
  <SecaoLoader<RelatoriosDados> clientId={clientId} secao="relatorios" rotulo="os relatórios">
    {({ initial, update }) => (
      <RelatoriosEditor clientId={clientId} initial={initial} update={update} />
    )}
  </SecaoLoader>
);
