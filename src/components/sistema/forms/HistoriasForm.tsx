import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormShell, SaveButton, inputCls } from "./shared";
import { SecaoLoader } from "./SecaoLoader";
import { useSecaoEditor } from "./useClienteSecao";

interface Historia {
  tema: string;
  ano: string;
  tags: string;
}

interface HistoriasDados {
  rows: Historia[];
}

const linhaVazia = (): Historia => ({ tema: "", ano: "", tags: "" });

const HistoriasEditor = ({
  initial,
  onSave,
}: {
  initial: Partial<HistoriasDados>;
  onSave: (dados: HistoriasDados) => Promise<void>;
}) => {
  const {
    values,
    setValues,
    dirty,
    saving,
    saved,
    onSubmit,
  } = useSecaoEditor<HistoriasDados>(
    { rows: initial.rows?.length ? initial.rows : [linhaVazia()] },
    onSave
  );
  const rows = values.rows;

  const update = (i: number, k: keyof Historia, v: string) =>
    setValues((prev) => ({
      rows: prev.rows.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)),
    }));
  const remove = (i: number) =>
    setValues((prev) => ({ rows: prev.rows.filter((_, idx) => idx !== i) }));
  const add = () => setValues((prev) => ({ rows: [...prev.rows, linhaVazia()] }));

  return (
    <FormShell onSubmit={onSubmit}>
      <SaveButton saved={saved} saving={saving} dirty={dirty} />
      <div className="overflow-hidden rounded-lg border border-surface-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2 text-[11px] uppercase tracking-wide text-primary">
              <th className="text-left px-3 py-2.5 font-semibold">Tema e História</th>
              <th className="text-left px-3 py-2.5 font-semibold w-24">Ano</th>
              <th className="text-left px-3 py-2.5 font-semibold w-56">Palavras-chave</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className={`border-t border-surface-3 ${
                  i % 2 === 1 ? "bg-surface-2" : "bg-surface-1"
                }`}
              >
                <td className="px-2 py-2">
                  <Input
                    value={r.tema}
                    onChange={(e) => update(i, "tema", e.target.value)}
                    className={`${inputCls} h-9`}
                    placeholder="Descreva o tema e a história..."
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    value={r.ano}
                    onChange={(e) => update(i, "ano", e.target.value)}
                    className={`${inputCls} h-9`}
                    placeholder="2024"
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    value={r.tags}
                    onChange={(e) => update(i, "tags", e.target.value)}
                    className={`${inputCls} h-9`}
                    placeholder="tag1, tag2, tag3"
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remover linha"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="bg-surface-2 border-t border-surface-3 p-2">
          <Button
            type="button"
            onClick={add}
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary-light hover:bg-surface-3"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar história
          </Button>
        </div>
      </div>
    </FormShell>
  );
};

export const HistoriasForm = ({ clientId }: { clientId?: string }) => (
  <SecaoLoader<HistoriasDados> clientId={clientId} secao="historias" rotulo="o diretório de histórias">
    {({ initial, save }) => <HistoriasEditor initial={initial} onSave={save} />}
  </SecaoLoader>
);
