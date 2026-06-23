import { useState, useEffect } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Fluxo {
  id: string;
  nome: string;
  descricao: string | null;
  responsavel_id: string | null;
  status: string;
  created_by: string;
}

const adminNomes: Record<string, string> = {
  "92fba5ee-4ed4-4640-af33-d63e28ac21af": "Lucas",
  "13cf5980-37df-4bfa-862b-361285d8cffc": "Taylane",
  "c79815b9-0bc2-49d6-a8fe-e84c9981d4cf": "Developer",
};

const adminList = Object.entries(adminNomes).map(([id, nome]) => ({ id, nome }));

const statusConfig: Record<string, string> = {
  ativo: "bg-emerald-600/20 text-emerald-400 border-emerald-700/50",
  rascunho: "bg-amber-600/20 text-amber-400 border-amber-700/50",
  arquivado: "bg-zinc-700/30 text-zinc-400 border-zinc-700",
};

const emptyForm = {
  nome: "",
  descricao: "",
  responsavel_id: "",
  status: "ativo",
};

export const FluxosPage = () => {
  const { user, isAdmin } = useAuth();
  const [fluxos, setFluxos] = useState<Fluxo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (supabase as any)
      .from("sistema_fluxos")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }: any) => {
        if (error) {
          console.error("Erro ao carregar fluxos:", error);
        } else {
          setFluxos(data || []);
        }
        setLoading(false);
      });
  }, []);

  if (!isAdmin) return null;

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (f: Fluxo) => {
    setEditingId(f.id);
    setForm({
      nome: f.nome,
      descricao: f.descricao || "",
      responsavel_id: f.responsavel_id || "",
      status: f.status,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    const payload: any = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null,
      responsavel_id: form.responsavel_id || null,
      status: form.status,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { error } = await (supabase as any)
        .from("sistema_fluxos")
        .update(payload)
        .eq("id", editingId);
      if (error) {
        toast.error("Erro ao atualizar fluxo");
        console.error(error);
      } else {
        setFluxos((prev) =>
          prev.map((f) =>
            f.id === editingId ? ({ ...f, ...payload } as Fluxo) : f
          )
        );
        toast.success("Fluxo atualizado");
        setDialogOpen(false);
      }
    } else {
      payload.created_by = user?.id;
      const { data, error } = await (supabase as any)
        .from("sistema_fluxos")
        .insert(payload)
        .select("*")
        .single();
      if (error) {
        toast.error("Erro ao criar fluxo");
        console.error(error);
      } else {
        setFluxos((prev) => [data, ...prev]);
        toast.success("Fluxo criado");
        setDialogOpen(false);
      }
    }
    setSaving(false);
  };

  const remove = async () => {
    if (!editingId) return;
    const { error } = await (supabase as any)
      .from("sistema_fluxos")
      .delete()
      .eq("id", editingId);
    if (error) {
      toast.error("Erro ao excluir fluxo");
      console.error(error);
    } else {
      setFluxos((prev) => prev.filter((f) => f.id !== editingId));
      toast.success("Fluxo excluído");
      setDialogOpen(false);
    }
  };

  const inputCls = "bg-[#1c1c1e] border-[#2a2a2a] text-white";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          Processos e SOPs da agência.
        </p>
        <Button
          onClick={openNew}
          className="bg-[#3b82f6] hover:bg-[#3b82f6]/90 gap-1"
        >
          <Plus className="h-4 w-4" /> Novo fluxo
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
        </div>
      ) : fluxos.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 text-sm">
          Nenhum fluxo cadastrado.
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800">
          {fluxos.map((f) => (
            <div
              key={f.id}
              onClick={() => openEdit(f)}
              className="p-4 hover:bg-zinc-900/40 transition flex items-start justify-between gap-4 cursor-pointer"
            >
              <div className="space-y-1">
                <h4 className="font-semibold text-zinc-100">{f.nome}</h4>
                {f.descricao && (
                  <p className="text-sm text-zinc-400">{f.descricao}</p>
                )}
                {f.responsavel_id && (
                  <p className="text-xs text-zinc-500">
                    Responsável: {adminNomes[f.responsavel_id] || f.responsavel_id}
                  </p>
                )}
              </div>
              <Badge
                className={statusConfig[f.status] || statusConfig.ativo}
              >
                {f.status}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          if (!o) setDialogOpen(false);
        }}
      >
        <DialogContent className="bg-[#111111] border-[#2a2a2a] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? "Editar fluxo" : "Novo fluxo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Nome *</Label>
              <Input
                value={form.nome}
                onChange={(e) =>
                  setForm({ ...form, nome: e.target.value })
                }
                className={inputCls}
                placeholder="Nome do fluxo/processo"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Descrição</Label>
              <Textarea
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
                className={`${inputCls} min-h-[80px]`}
                placeholder="Descreva o processo ou SOP"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Responsável</Label>
                <Select
                  value={form.responsavel_id || "__none__"}
                  onValueChange={(v) =>
                    setForm({ ...form, responsavel_id: v === "__none__" ? "" : v })
                  }
                >
                  <SelectTrigger className={inputCls}>
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c1c1e] border-[#2a2a2a] text-white">
                    <SelectItem value="__none__">Nenhum</SelectItem>
                    {adminList.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v })
                  }
                >
                  <SelectTrigger className={inputCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c1c1e] border-[#2a2a2a] text-white">
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="arquivado">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            {editingId ? (
              <Button
                type="button"
                variant="destructive"
                onClick={remove}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" /> Excluir
              </Button>
            ) : (
              <div />
            )}
            <Button
              onClick={save}
              disabled={saving}
              className="bg-[#3b82f6] hover:bg-[#3b82f6]/90"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {editingId ? "Salvar" : "Criar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
