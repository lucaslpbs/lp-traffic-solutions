import { useState, useEffect } from "react";
import { Plus, Loader2, Trash2, Check } from "lucide-react";
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

interface Meta {
  id: string;
  titulo: string;
  descricao: string | null;
  mes: number;
  ano: number;
  valor_meta: number | null;
  valor_atual: number | null;
  concluida: boolean;
  created_by: string;
}

const mesesNomes = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const emptyForm = {
  titulo: "",
  descricao: "",
  valor_meta: "",
  valor_atual: "",
};

export const MetasBoard = () => {
  const { user, isAdmin } = useAuth();
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    (supabase as any)
      .from("sistema_metas")
      .select("*")
      .eq("mes", mes)
      .eq("ano", ano)
      .order("created_at", { ascending: false })
      .then(({ data, error }: any) => {
        if (error) {
          console.error("Erro ao carregar metas:", error);
        } else {
          setMetas(data || []);
        }
        setLoading(false);
      });
  }, [mes, ano]);

  if (!isAdmin) return null;

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (m: Meta) => {
    setEditingId(m.id);
    setForm({
      titulo: m.titulo,
      descricao: m.descricao || "",
      valor_meta: m.valor_meta != null ? String(m.valor_meta) : "",
      valor_atual: m.valor_atual != null ? String(m.valor_atual) : "",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    setSaving(true);
    const payload: any = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      mes,
      ano,
      valor_meta: form.valor_meta ? parseFloat(form.valor_meta) : null,
      valor_atual: form.valor_atual ? parseFloat(form.valor_atual) : null,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { error } = await (supabase as any)
        .from("sistema_metas")
        .update(payload)
        .eq("id", editingId);
      if (error) {
        toast.error("Erro ao atualizar meta");
        console.error(error);
      } else {
        setMetas((prev) =>
          prev.map((m) =>
            m.id === editingId ? ({ ...m, ...payload } as Meta) : m
          )
        );
        toast.success("Meta atualizada");
        setDialogOpen(false);
      }
    } else {
      payload.created_by = user?.id;
      const { data, error } = await (supabase as any)
        .from("sistema_metas")
        .insert(payload)
        .select("*")
        .single();
      if (error) {
        toast.error("Erro ao criar meta");
        console.error(error);
      } else {
        setMetas((prev) => [data, ...prev]);
        toast.success("Meta criada");
        setDialogOpen(false);
      }
    }
    setSaving(false);
  };

  const remove = async () => {
    if (!editingId) return;
    const { error } = await (supabase as any)
      .from("sistema_metas")
      .delete()
      .eq("id", editingId);
    if (error) {
      toast.error("Erro ao excluir meta");
      console.error(error);
    } else {
      setMetas((prev) => prev.filter((m) => m.id !== editingId));
      toast.success("Meta excluída");
      setDialogOpen(false);
    }
  };

  const toggleConcluida = async (meta: Meta) => {
    const next = !meta.concluida;
    setMetas((prev) =>
      prev.map((m) => (m.id === meta.id ? { ...m, concluida: next } : m))
    );
    const { error } = await (supabase as any)
      .from("sistema_metas")
      .update({ concluida: next, updated_at: new Date().toISOString() })
      .eq("id", meta.id);
    if (error) {
      toast.error("Erro ao atualizar meta");
      console.error(error);
    }
  };

  const anoOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 1 + i);

  const inputCls = "bg-[#1c1c1e] border-[#2a2a2a] text-white";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={String(mes)}
          onValueChange={(v) => setMes(Number(v))}
        >
          <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 text-zinc-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1c1c1e] border-[#2a2a2a] text-white">
            {mesesNomes.map((nome, i) => (
              <SelectItem key={i} value={String(i + 1)}>
                {nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(ano)}
          onValueChange={(v) => setAno(Number(v))}
        >
          <SelectTrigger className="w-[100px] bg-zinc-900 border-zinc-800 text-zinc-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1c1c1e] border-[#2a2a2a] text-white">
            {anoOptions.map((a) => (
              <SelectItem key={a} value={String(a)}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button
          onClick={openNew}
          className="bg-[#3b82f6] hover:bg-[#3b82f6]/90 gap-1"
        >
          <Plus className="h-4 w-4" /> Nova meta
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
        </div>
      ) : metas.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 text-sm">
          Nenhuma meta para {mesesNomes[mes - 1]} de {ano}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {metas.map((m) => {
            const pct =
              m.valor_meta && m.valor_meta > 0
                ? Math.min(
                    100,
                    Math.round(((m.valor_atual || 0) / m.valor_meta) * 100)
                  )
                : null;
            return (
              <div
                key={m.id}
                onClick={() => openEdit(m)}
                className={`rounded-lg border bg-zinc-900/40 p-4 space-y-3 cursor-pointer transition hover:border-[#3b82f6]/60 ${
                  m.concluida
                    ? "border-emerald-700/50"
                    : "border-zinc-800"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4
                    className={`font-semibold text-sm ${
                      m.concluida
                        ? "text-emerald-400 line-through"
                        : "text-zinc-100"
                    }`}
                  >
                    {m.titulo}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleConcluida(m);
                    }}
                    className={`shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition ${
                      m.concluida
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "border-zinc-600 hover:border-[#3b82f6] text-transparent hover:text-zinc-500"
                    }`}
                    title={m.concluida ? "Marcar como pendente" : "Marcar como concluída"}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
                {m.descricao && (
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {m.descricao}
                  </p>
                )}
                {pct !== null && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>
                        {m.valor_atual ?? 0} / {m.valor_meta}
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          m.concluida ? "bg-emerald-500" : "bg-[#3b82f6]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
                {pct === null && m.valor_meta == null && (
                  <Badge className="bg-zinc-700/30 text-zinc-400 border-zinc-700 text-xs">
                    Qualitativa
                  </Badge>
                )}
              </div>
            );
          })}
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
              {editingId ? "Editar meta" : "Nova meta"} — {mesesNomes[mes - 1]}{" "}
              {ano}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Título *</Label>
              <Input
                value={form.titulo}
                onChange={(e) =>
                  setForm({ ...form, titulo: e.target.value })
                }
                className={inputCls}
                placeholder="Ex: Faturamento total"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Descrição</Label>
              <Textarea
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
                className={`${inputCls} min-h-[60px]`}
                placeholder="Detalhes da meta"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">
                  Valor da meta (numérico)
                </Label>
                <Input
                  type="number"
                  step="any"
                  value={form.valor_meta}
                  onChange={(e) =>
                    setForm({ ...form, valor_meta: e.target.value })
                  }
                  className={inputCls}
                  placeholder="Ex: 50000"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Valor atual</Label>
                <Input
                  type="number"
                  step="any"
                  value={form.valor_atual}
                  onChange={(e) =>
                    setForm({ ...form, valor_atual: e.target.value })
                  }
                  className={inputCls}
                  placeholder="Ex: 32000"
                />
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
