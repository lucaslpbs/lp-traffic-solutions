import { useState, useRef } from "react";
import { ChevronRight, FileText, Plus, Download } from "lucide-react";

interface Arquivo {
  id: string;
  nome: string;
  tamanho: string;
  url?: string;
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

export const RelatoriosForm = () => {
  const ano = new Date().getFullYear();
  const mesAtual = new Date().getMonth();
  const [data, setData] = useState<Record<string, Arquivo[]>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({
    [`${MESES[mesAtual]}/${ano}`]: true,
  });
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const toggle = (k: string) => setOpen({ ...open, [k]: !open[k] });

  const upload = (k: string, files: FileList | null) => {
    if (!files) return;
    const novos: Arquivo[] = Array.from(files).map((f) => ({
      id: String(Date.now()) + f.name,
      nome: f.name,
      tamanho: formatSize(f.size),
      url: URL.createObjectURL(f),
    }));
    setData({ ...data, [k]: [...(data[k] ?? []), ...novos] });
  };

  const meses = MESES.map((m, i) => ({ label: `${m}/${ano}`, mesIdx: i }))
    .reverse();

  return (
    <div className="space-y-2">
      {meses.map(({ label }) => {
        const aberto = open[label];
        const arquivos = data[label] ?? [];
        return (
          <div
            key={label}
            className={`rounded-lg border border-surface-3 overflow-hidden transition-colors ${
              aberto ? "bg-surface-2" : "bg-surface-2"
            }`}
          >
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
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground flex-1 truncate">{a.nome}</span>
                    <span className="text-xs text-muted-foreground">{a.tamanho}</span>
                    <a
                      href={a.url}
                      download={a.nome}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ))}
                <input
                  ref={(el) => (inputRefs.current[label] = el)}
                  type="file"
                  accept="application/pdf,image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => upload(label, e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => inputRefs.current[label]?.click()}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-light mt-2"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar relatório
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
