import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { inputCls } from "./shared";

interface Registro {
  id: string;
  data: string;
  otimizado: "sim" | "nao";
  obs: string;
}

const formatBR = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export const OtimizacaoForm = () => {
  const [rows, setRows] = useState<Registro[]>([]);
  const [editing, setEditing] = useState<Registro | null>(null);

  const add = () => {
    const novo: Registro = {
      id: String(Date.now()),
      data: new Date().toISOString().slice(0, 10),
      otimizado: "sim",
      obs: "",
    };
    setRows([novo, ...rows]);
  };
  const upd = (id: string, patch: Partial<Registro>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => setRows(rows.filter((r) => r.id !== id));

  const ordered = [...rows].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="button" size="sm" onClick={add}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white h-8"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Nova
        </Button>
      </div>
      <div className="rounded-lg border border-[#2a2a2a] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1c1c1e] sticky top-0">
            <tr className="text-[11px] uppercase tracking-wide text-[#a78bfa]">
              <th className="text-left px-3 py-2.5 font-semibold w-36">Data</th>
              <th className="text-left px-3 py-2.5 font-semibold w-28">Otimizado?</th>
              <th className="text-left px-3 py-2.5 font-semibold">Observações</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {ordered.length === 0 && (
              <tr><td colSpan={4} className="text-center text-zinc-500 py-8 text-sm">Nenhum registro.</td></tr>
            )}
            {ordered.map((r) => (
              <tr key={r.id} className="border-t border-[#2a2a2a] hover:bg-[#1c1c1e] transition-colors">
                <td className="px-2 py-2">
                  <Input
                    type="date"
                    value={r.data}
                    onChange={(e) => upd(r.id, { data: e.target.value })}
                    className={`${inputCls} h-9`}
                  />
                  <div className="text-[10px] text-zinc-500 mt-1 pl-1">{formatBR(r.data)}</div>
                </td>
                <td className="px-2 py-2">
                  <Select
                    value={r.otimizado}
                    onValueChange={(v: "sim" | "nao") => upd(r.id, { otimizado: v })}
                  >
                    <SelectTrigger
                      className={`h-9 border-[#2a2a2a] text-white font-semibold ${
                        r.otimizado === "sim"
                          ? "bg-emerald-600/20 border-emerald-700/50 text-emerald-300"
                          : "bg-red-600/20 border-red-700/50 text-red-300"
                      }`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1c1c1e] border-[#2a2a2a] text-white">
                      <SelectItem value="sim">Sim</SelectItem>
                      <SelectItem value="nao">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-2">
                  <button
                    type="button"
                    onClick={() => setEditing(r)}
                    className="text-left text-sm text-[#a78bfa] hover:text-[#c4b5fd] truncate w-full"
                  >
                    {r.obs ? r.obs.slice(0, 80) : "+ Adicionar observação"}
                  </button>
                </td>
                <td className="px-2 py-2">
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    className="text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="bg-[#111111] border-[#2a2a2a] text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Relatório de otimização · {editing && formatBR(editing.data)}</DialogTitle>
          </DialogHeader>
          <Textarea
            defaultValue={editing?.obs}
            onBlur={(e) => editing && upd(editing.id, { obs: e.target.value })}
            className={`${inputCls} min-h-[300px]`}
            placeholder="Descreva as otimizações realizadas, hipóteses, resultados..."
          />
          <div className="flex justify-end">
            <Button type="button" className="bg-[#7c3aed] hover:bg-[#6d28d9]" onClick={() => setEditing(null)}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
