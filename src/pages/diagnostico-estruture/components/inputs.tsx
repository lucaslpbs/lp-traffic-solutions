import { Plus, Trash2 } from "lucide-react";
import type { ProdutoInput } from "../state";

export function ChoiceGroup<T extends string>({
  value,
  onChange,
  options,
  columns = 1,
}: {
  value: T | "";
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  columns?: 1 | 2;
}) {
  return (
    <div className={`grid gap-3 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="rme-soft flex items-start gap-1 px-5 py-4 text-left text-[1rem] font-semibold transition-all duration-300"
            style={{
              background: active ? "hsl(var(--rme-orange) / 0.14)" : "hsl(var(--rme-paper) / 0.05)",
              border: `1px solid ${active ? "hsl(var(--rme-orange) / 0.7)" : "hsl(var(--rme-paper) / 0.12)"}`,
              color: active ? "hsl(var(--rme-orange-soft))" : "hsl(var(--rme-paper-dim))",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function YesNo({
  value,
  onChange,
  yesLabel = "Sim",
  noLabel = "Não",
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <div className="flex gap-3">
      {[
        { v: true, l: yesLabel },
        { v: false, l: noLabel },
      ].map((opt) => {
        const active = value === opt.v;
        return (
          <button
            key={String(opt.v)}
            type="button"
            onClick={() => onChange(opt.v)}
            className="rme-pill flex-1 px-6 py-4 text-center text-[1rem] font-semibold transition-all duration-300"
            style={{
              background: active ? "var(--rme-grad-orange)" : "hsl(var(--rme-paper) / 0.05)",
              color: active ? "hsl(var(--rme-ink))" : "hsl(var(--rme-paper-dim))",
              border: `1px solid ${active ? "transparent" : "hsl(var(--rme-paper) / 0.12)"}`,
            }}
          >
            {opt.l}
          </button>
        );
      })}
    </div>
  );
}

export function TextField({
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
  autoFocus = true,
  onEnter,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string | null;
  autoFocus?: boolean;
  onEnter?: () => void;
}) {
  return (
    <div>
      <input
        autoFocus={autoFocus}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter?.();
        }}
        placeholder={placeholder}
        className="w-full border-b bg-transparent py-3 text-[1.3rem] outline-none transition-colors duration-300 placeholder:opacity-40"
        style={{
          borderColor: hint ? "hsl(var(--rme-scarlet) / 0.6)" : "hsl(var(--rme-paper) / 0.2)",
          color: "hsl(var(--rme-paper))",
        }}
      />
      {hint && (
        <p className="mt-2 text-xs" style={{ color: "hsl(var(--rme-scarlet))" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function ProdutoList({
  produtos,
  onChange,
  custoLabel,
}: {
  produtos: ProdutoInput[];
  onChange: (produtos: ProdutoInput[]) => void;
  custoLabel: string;
}) {
  function update(i: number, field: keyof ProdutoInput, v: string) {
    onChange(produtos.map((p, idx) => (idx === i ? { ...p, [field]: v } : p)));
  }
  function add() {
    onChange([...produtos, { nome: "", custo: "", precoVenda: "" }]);
  }
  function remove(i: number) {
    onChange(produtos.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-4">
      {produtos.map((p, i) => (
        <div
          key={i}
          className="rme-soft grid grid-cols-1 gap-3 p-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-center"
          style={{ background: "hsl(var(--rme-paper) / 0.05)", border: "1px solid hsl(var(--rme-paper) / 0.1)" }}
        >
          <input
            value={p.nome}
            onChange={(e) => update(i, "nome", e.target.value)}
            placeholder="Nome do produto"
            className="border-b bg-transparent py-2 text-sm outline-none"
            style={{ borderColor: "hsl(var(--rme-paper) / 0.15)", color: "hsl(var(--rme-paper))" }}
          />
          <input
            value={p.custo}
            onChange={(e) => update(i, "custo", e.target.value)}
            placeholder={custoLabel}
            type="number"
            inputMode="decimal"
            className="border-b bg-transparent py-2 text-sm outline-none"
            style={{ borderColor: "hsl(var(--rme-paper) / 0.15)", color: "hsl(var(--rme-paper))" }}
          />
          <input
            value={p.precoVenda}
            onChange={(e) => update(i, "precoVenda", e.target.value)}
            placeholder="Preço de venda"
            type="number"
            inputMode="decimal"
            className="border-b bg-transparent py-2 text-sm outline-none"
            style={{ borderColor: "hsl(var(--rme-paper) / 0.15)", color: "hsl(var(--rme-paper))" }}
          />
          {produtos.length > 1 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="justify-self-start opacity-60 transition-opacity hover:opacity-100 sm:justify-self-end"
              aria-label="Remover produto"
            >
              <Trash2 className="h-4 w-4" style={{ color: "hsl(var(--rme-scarlet))" }} />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="rme-pill inline-flex w-fit items-center gap-2 px-5 py-3 text-sm font-medium"
        style={{
          background: "hsl(var(--rme-paper) / 0.06)",
          border: "1px solid hsl(var(--rme-paper) / 0.15)",
          color: "hsl(var(--rme-orange-soft))",
        }}
      >
        <Plus className="h-4 w-4" /> Adicionar outro produto
      </button>
    </div>
  );
}
