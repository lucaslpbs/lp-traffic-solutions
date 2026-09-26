import { useLayoutEffect, useRef, ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const inputCls =
  "bg-surface-2 border-surface-3 text-foreground rounded-md placeholder:text-muted-foreground/80";

/** Garante ao menos `min` linhas (vazias) numa lista de itens salva. */
export const completar = (itens: string[] | undefined, min: number): string[] => {
  const lista = [...(itens ?? [])];
  while (lista.length < min) lista.push("");
  return lista;
};

/** Id para itens de lista (crypto.randomUUID so existe em contexto seguro). */
export const novoId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** Textarea que cresce conforme o conteudo (campos curtos parecem um input). */
export const AutoTextarea = ({
  className,
  value,
  ...props
}: React.ComponentProps<typeof Textarea>) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const fit = () => {
      const el = ref.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight + 2}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [value]);

  return (
    <Textarea
      ref={ref}
      rows={1}
      value={value}
      className={cn("min-h-[38px] resize-none overflow-hidden", className)}
      {...props}
    />
  );
};

export const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h4 className="text-sm font-semibold text-primary uppercase tracking-wide border-b border-surface-3 pb-2">
    {children}
  </h4>
);

export const FieldLabel = ({ children }: { children: ReactNode }) => (
  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
    {children}
  </Label>
);

export const SaveButton = ({
  saved,
  saving,
  dirty,
}: {
  saved?: boolean;
  saving?: boolean;
  dirty?: boolean;
}) => (
  <div className="flex items-center justify-end gap-3">
    {saved ? (
      <span className="text-xs text-success">Salvo</span>
    ) : (
      dirty && !saving && <span className="text-xs text-muted-foreground">Alterações não salvas</span>
    )}
    <Button
      type="submit"
      disabled={saving}
      className="bg-primary hover:bg-primary/90 text-foreground h-9"
    >
      {saving ? "Salvando..." : "Salvar"}
    </Button>
  </div>
);

interface BulletListProps {
  items: string[];
  setItems: (v: string[]) => void;
  placeholder?: string;
  placeholders?: string[];
  minItems?: number;
  asLink?: boolean;
  readOnly?: boolean;
}

export const BulletList = ({
  items,
  setItems,
  placeholder = "Adicionar item...",
  placeholders,
  minItems = 0,
  asLink = false,
  readOnly = false,
}: BulletListProps) => {
  if (readOnly) {
    const preenchidos = items.filter((it) => it.trim() !== "");
    if (preenchidos.length === 0) return <p className="text-sm text-muted-foreground pl-5">—</p>;
    return (
      <ul className="space-y-1.5">
        {preenchidos.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className="text-primary text-lg leading-none select-none">•</span>
            {asLink && /^https?:\/\//.test(it) ? (
              <a
                href={it}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {it}
              </a>
            ) : (
              <span className="whitespace-pre-wrap break-words">{it}</span>
            )}
          </li>
        ))}
      </ul>
    );
  }

  const update = (i: number, v: string) => {
    const next = [...items];
    next[i] = v;
    setItems(next);
  };
  const remove = (i: number) => {
    if (items.length <= minItems) return;
    setItems(items.filter((_, idx) => idx !== i));
  };
  const add = () => setItems([...items, ""]);

  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <span className="text-primary text-lg leading-none select-none">•</span>
          <Input
            value={it}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholders?.[i] ?? placeholder}
            className={`${inputCls} flex-1`}
          />
          {asLink && it && /^https?:\/\//.test(it) && (
            <a
              href={it}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline px-2"
            >
              abrir
            </a>
          )}
          <button
            type="button"
            onClick={() => remove(i)}
            disabled={items.length <= minItems}
            className="text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
            aria-label="Remover"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-light transition-colors pl-5"
      >
        <Plus className="h-3.5 w-3.5" /> Adicionar
      </button>
    </div>
  );
};

export const FormShell = ({
  children,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}) => (
  <form onSubmit={onSubmit} className="space-y-6 pb-2">
    {children}
  </form>
);
