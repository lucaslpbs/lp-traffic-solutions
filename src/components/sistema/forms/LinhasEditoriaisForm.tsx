import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormShell, SaveButton, inputCls, useSaved } from "./shared";

interface Tema {
  id: string;
  titulo: string;
  descricao: string;
  open: boolean;
}

export const LinhasEditoriaisForm = () => {
  const { saved, onSubmit } = useSaved();
  const [temas, setTemas] = useState<Tema[]>([
    { id: "1", titulo: "Tema 1", descricao: "", open: true },
  ]);

  const upd = (i: number, patch: Partial<Tema>) => {
    const next = [...temas];
    next[i] = { ...next[i], ...patch };
    setTemas(next);
  };
  const add = () =>
    setTemas([
      ...temas,
      { id: String(Date.now()), titulo: `Tema ${temas.length + 1}`, descricao: "", open: true },
    ]);
  const remove = (i: number) => setTemas(temas.filter((_, idx) => idx !== i));

  return (
    <FormShell onSubmit={onSubmit}>
      <div className="space-y-2">
        {temas.map((t, i) => (
          <div key={t.id} className="rounded-lg border border-[#2a2a2a] bg-[#1c1c1e] overflow-hidden">
            <div className="flex items-center gap-2 p-2">
              <button
                type="button"
                onClick={() => upd(i, { open: !t.open })}
                className="text-zinc-400 hover:text-white p-1"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${t.open ? "" : "-rotate-90"}`}
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
                className="text-zinc-500 hover:text-red-400 p-1.5"
                aria-label="Remover tema"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div
              className={`grid transition-all duration-200 ${
                t.open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
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
        ))}
      </div>
      <Button
        type="button"
        onClick={add}
        variant="ghost"
        size="sm"
        className="text-[#a78bfa] hover:text-[#c4b5fd] hover:bg-[#1c1c1e]"
      >
        <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar tema
      </Button>
      <SaveButton saved={saved} />
    </FormShell>
  );
};
