import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownEditor } from "@/components/sistema/MarkdownEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { inputCls } from "./shared";

interface Registro {
  id: string;
  data: string;
  otimizado: boolean;
  observacoes: string;
}

interface Props {
  clientId?: string;
  readOnly?: boolean;
}

const formatBR = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export const OtimizacaoForm = ({ clientId, readOnly = false }: Props) => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Registro | null>(null);
  const [editingObs, setEditingObs] = useState("");
  const [viewingObs, setViewingObs] = useState<Registro | null>(null);

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    (supabase as any)
      .from("sistema_otimizacoes")
      .select("id, data, otimizado, observacoes")
      .eq("client_id", clientId)
      .order("data", { ascending: false })
      .then(({ data, error }: any) => {
        if (error) {
          console.error("Erro ao buscar otimizacoes:", error);
        } else if (data) {
          setRows(
            data.map((r: any) => ({
              id: r.id,
              data: r.data,
              otimizado: r.otimizado,
              observacoes: r.observacoes || "",
            }))
          );
        }
        setLoading(false);
      });
  }, [clientId]);

  const add = async () => {
    if (!clientId || !user) return;
    const novo = {
      client_id: clientId,
      data: new Date().toISOString().slice(0, 10),
      otimizado: true,
      observacoes: "",
      created_by: user.id,
    };
    const { data, error } = await (supabase as any)
      .from("sistema_otimizacoes")
      .insert(novo)
      .select("id, data, otimizado, observacoes")
      .single();
    if (error) {
      toast.error("Erro ao criar registro");
      console.error(error);
      return;
    }
    setRows([
      { id: data.id, data: data.data, otimizado: data.otimizado, observacoes: data.observacoes || "" },
      ...rows,
    ]);
  };

  const upd = async (id: string, patch: Partial<Registro>) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    const dbPatch: any = { updated_at: new Date().toISOString() };
    if (patch.data !== undefined) dbPatch.data = patch.data;
    if (patch.otimizado !== undefined) dbPatch.otimizado = patch.otimizado;
    if (patch.observacoes !== undefined) dbPatch.observacoes = patch.observacoes;
    const { error } = await (supabase as any)
      .from("sistema_otimizacoes")
      .update(dbPatch)
      .eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar");
      console.error(error);
    }
  };

  const remove = async (id: string) => {
    setRows(rows.filter((r) => r.id !== id));
    const { error } = await (supabase as any)
      .from("sistema_otimizacoes")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Erro ao apagar");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex justify-end">
          <Button
            type="button" size="sm" onClick={add}
            className="bg-primary hover:bg-primary/90 text-foreground h-8"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Nova
          </Button>
        </div>
      )}
      <div className="rounded-lg border border-surface-3 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 sticky top-0">
            <tr className="text-[11px] uppercase tracking-wide text-primary">
              <th className="text-left px-3 py-2.5 font-semibold w-36">Data</th>
              <th className="text-left px-3 py-2.5 font-semibold w-28">Otimizado?</th>
              <th className="text-left px-3 py-2.5 font-semibold">Observações</th>
              {!readOnly && <th className="w-10" />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={readOnly ? 3 : 4} className="text-center text-muted-foreground py-8 text-sm">Nenhum registro.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-surface-3 hover:bg-surface-2 transition-colors">
                <td className="px-2 py-2">
                  {readOnly ? (
                    <span className="text-foreground text-sm pl-1">{formatBR(r.data)}</span>
                  ) : (
                    <>
                      <Input
                        type="date"
                        value={r.data}
                        onChange={(e) => upd(r.id, { data: e.target.value })}
                        className={`${inputCls} h-9`}
                      />
                      <div className="text-[10px] text-muted-foreground mt-1 pl-1">{formatBR(r.data)}</div>
                    </>
                  )}
                </td>
                <td className="px-2 py-2">
                  {readOnly ? (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        r.otimizado
                          ? "bg-success/20 text-success border border-success/50"
                          : "bg-destructive/20 text-destructive border border-destructive/50"
                      }`}
                    >
                      {r.otimizado ? "Sim" : "Não"}
                    </span>
                  ) : (
                    <Select
                      value={r.otimizado ? "sim" : "nao"}
                      onValueChange={(v) => upd(r.id, { otimizado: v === "sim" })}
                    >
                      <SelectTrigger
                        className={`h-9 border-surface-3 text-foreground font-semibold ${
                          r.otimizado
                            ? "bg-success/20 border-success/50 text-success"
                            : "bg-destructive/20 border-destructive/50 text-destructive"
                        }`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-surface-2 border-surface-3 text-foreground">
                        <SelectItem value="sim">Sim</SelectItem>
                        <SelectItem value="nao">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </td>
                <td className="px-2 py-2">
                  {readOnly ? (
                    r.observacoes ? (
                      <button
                        type="button"
                        onClick={() => setViewingObs(r)}
                        className="text-left text-sm text-foreground/85 hover:text-primary-light truncate w-full block cursor-pointer"
                      >
                        {r.observacoes.slice(0, 80)}{r.observacoes.length > 80 ? "…" : ""}
                      </button>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setEditing(r); setEditingObs(r.observacoes); }}
                      className="text-left text-sm text-primary hover:text-primary-light truncate w-full"
                    >
                      {r.observacoes ? r.observacoes.slice(0, 80) : "+ Adicionar observação"}
                    </button>
                  )}
                </td>
                {!readOnly && (
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="bg-surface-1 border-surface-3 text-foreground max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">Relatório de otimização · {editing && formatBR(editing.data)}</DialogTitle>
            </DialogHeader>
            <MarkdownEditor
              value={editingObs}
              onChange={setEditingObs}
              placeholder="Descreva as otimizações realizadas, hipóteses, resultados..."
              minHeight="300px"
            />
            <div className="flex justify-end">
              <Button type="button" className="bg-primary hover:bg-primary/90" onClick={() => { if (editing) upd(editing.id, { observacoes: editingObs }); setEditing(null); }}>
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={!!viewingObs} onOpenChange={(o) => !o && setViewingObs(null)}>
        <DialogContent className="bg-surface-1 border-surface-3 text-foreground max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Otimização · {viewingObs && formatBR(viewingObs.data)}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <MarkdownEditor value={viewingObs?.observacoes || ""} readOnly />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
