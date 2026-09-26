import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormShell, SaveButton, inputCls, novoId } from "./shared";
import { SecaoLoader } from "./SecaoLoader";
import { useSecaoEditor } from "./useClienteSecao";

interface Tema {
  id: string;
  titulo: string;
  descricao: string;
}

interface LinhasDados {
  temas: Tema[];
}

const LinhasEditor = ({
  initial,
  onSave,
}: {
  initial: Partial<LinhasDados>;
  onSave: (dados: LinhasDados) => Promise<void>;
}) => {
  const { values, setValues, dirty, saving, saved, onSubmit } = useSecaoEditor<LinhasDados>(
    {
      temas: initial.temas?.length
        ? initial.temas
        : [{ id: novoId(), titulo: "Tema 1", descricao: "" }],
    },
    onSave
  );
  const temas = values.temas;
  // aberto/fechado e so visual: fica fora dos dados para nao contar como alteracao
  const [fechados, setFechados] = useState<Record<string, boolean>>({});

  const upd = (i: number, patch: Partial<Tema>) =>
    setValues((prev) => ({
      temas: prev.temas.map((t, idx) => (idx === i ? { ...t, ...patch } : t)),
    }));
  const add = () =>
    setValues((prev) => ({
      temas: [
        ...prev.temas,
        { id: novoId(), titulo: `Tema ${prev.temas.length + 1}`, descricao: "" },
      ],
    }));
  const remove = (i: number) =>
    setValues((prev) => ({ temas: prev.temas.filter((_, idx) => idx !== i) }));

  return (
    <FormShell onSubmit={onSubmit}>
      <SaveButton saved={saved} saving={saving} dirty={dirty} />
      <div className="space-y-2">
        {temas.map((t, i) => {
          const open = !fechados[t.id];
          return (
            <div key={t.id} className="rounded-lg border border-surface-3 bg-surface-2 overflow-hidden">
              <div className="flex items-center gap-2 p-2">
                <button
                  type="button"
                  onClick={() => setFechados((f) => ({ ...f, [t.id]: open }))}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${open ? "" : "-rotate-90"}`}
                  />
                </button>
                <Input
                  value={t.titulo}
                  onChange={(e) => upd(i, { titulo: e.target.value })}
                  className={`${inputCls} h-8 flex-1 border-transparent bg-transparent font-medium`}
                />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-muted-foreground hover:text-destructive p-1.5"
                  aria-label="Remover tema"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div
                className={`grid transition-all duration-200 ${
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-3 pt-0">
                    <Textarea
                      value={t.descricao}
                      onChange={(e) => upd(i, { descricao: e.target.value })}
                      placeholder="Descrição, sub-temas, pautas, exemplos..."
                      className={`${inputCls} min-h-[120px]`}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Button
        type="button"
        onClick={add}
        variant="ghost"
        size="sm"
        className="text-primary hover:text-primary-light hover:bg-surface-2"
      >
        <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar tema
      </Button>
    </FormShell>
  );
};

export const LinhasEditoriaisForm = ({ clientId }: { clientId?: string }) => (
  <SecaoLoader<LinhasDados> clientId={clientId} secao="linhas" rotulo="as linhas editoriais">
    {({ initial, save }) => <LinhasEditor initial={initial} onSave={save} />}
  </SecaoLoader>
);
