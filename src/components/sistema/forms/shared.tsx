import { useState, ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const inputCls =
  "bg-[#1c1c1e] border-[#2a2a2a] text-white rounded-md placeholder:text-zinc-600";

export const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h4 className="text-sm font-semibold text-[#a78bfa] uppercase tracking-wide border-b border-[#2a2a2a] pb-2">
    {children}
  </h4>
);

export const FieldLabel = ({ children }: { children: ReactNode }) => (
  <Label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">
    {children}
  </Label>
);

export const SaveButton = ({ saved }: { saved?: boolean }) => (
  <div className="sticky bottom-0 -mx-1 bg-gradient-to-t from-[#111111] via-[#111111] to-transparent pt-4 pb-1 flex items-center justify-end gap-3">
    {saved && <span className="text-xs text-emerald-400">Salvo</span>}
    <Button type="submit" className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white">
      Salvar
    </Button>
  </div>
);

export function useSaved() {
  const [saved, setSaved] = useState(false);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };
  return { saved, onSubmit };
}

interface BulletListProps {
  items: string[];
  setItems: (v: string[]) => void;
  placeholder?: string;
  placeholders?: string[];
  minItems?: number;
  asLink?: boolean;
}

export const BulletList = ({
  items,
  setItems,
  placeholder = "Adicionar item...",
  placeholders,
  minItems = 0,
  asLink = false,
}: BulletListProps) => {
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
          <span className="text-[#7c3aed] text-lg leading-none select-none">•</span>
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
              className="text-xs text-[#a78bfa] hover:underline px-2"
            >
              abrir
            </a>
          )}
          <button
            type="button"
            onClick={() => remove(i)}
            disabled={items.length <= minItems}
            className="text-zinc-500 hover:text-red-400 disabled:opacity-30 transition-colors"
            aria-label="Remover"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-[#a78bfa] hover:text-[#c4b5fd] transition-colors pl-5"
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
