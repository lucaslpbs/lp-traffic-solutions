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
import { MarkdownEditor } from "@/components/sistema/MarkdownEditor";
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

type DemandaStatus =
  | "todo"
  | "doing"
  | "review_cliente"
  | "review_interno"
  | "ajustar"
  | "done";

interface Demanda {
  id: string;
  titulo: string;
  descricao: string | null;
  client_id: string | null;
  responsavel_id: string | null;
  status: DemandaStatus;
  prioridade: string;
  prazo: string | null;
  created_by: string;
}

interface ClienteOption {
  id: string;
  nome: string;
}

const adminNomes: Record<string, string> = {
  "92fba5ee-4ed4-4640-af33-d63e28ac21af": "Lucas",
  "13cf5980-37df-4bfa-862b-361285d8cffc": "Taylane",
  "c79815b9-0bc2-49d6-a8fe-e84c9981d4cf": "Developer",
};

const adminList = Object.entries(adminNomes).map(([id, nome]) => ({ id, nome }));

const colunas: { id: DemandaStatus; label: string }[] = [
  { id: "todo", label: "Para fazer" },
  { id: "doing", label: "Em andamento" },
  { id: "review_cliente", label: "Revisão do cliente" },
  { id: "review_interno", label: "Revisão interna" },
  { id: "ajustar", label: "Para ajustar" },
  { id: "done", label: "Concluído" },
];

const abas = ["Minhas demandas", "Esta semana", "Atrasadas", "Lista geral"];

const prioridadeColor: Record<string, string> = {
  alta: "bg-red-600/20 text-red-400 border-red-700/50",
  media: "bg-amber-600/20 text-amber-400 border-amber-700/50",
  baixa: "bg-zinc-700/30 text-zinc-400 border-zinc-700",
};

const formatDate = (iso: string | null) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const emptyForm = {
  titulo: "",
  descricao: "",
  client_id: "",
  responsavel_id: "",
  status: "todo" as DemandaStatus,
  prioridade: "media",
  prazo: "",
};

export const KanbanBoard = () => {
  const { user, isAdmin } = useAuth();
  const [aba, setAba] = useState(abas[3]);
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [otimStep, setOtimStep] = useState<"confirm" | "select-client" | "report" | null>(null);
  const [otimClientId, setOtimClientId] = useState("");
  const [otimReport, setOtimReport] = useState("");
  const [otimSaving, setOtimSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      (supabase as any)
        .from("sistema_demandas")
        .select("*")
        .order("created_at", { ascending: false }),
      (supabase as any)
        .from("gestao_clientes")
        .select("id, nome_cliente")
        .order("nome_cliente"),
    ]).then(([demRes, cliRes]: any[]) => {
      if (!demRes.error && demRes.data) setDemandas(demRes.data);
      if (!cliRes.error && cliRes.data)
        setClientes(
          cliRes.data.map((c: any) => ({ id: c.id, nome: c.nome_cliente }))
        );
      setLoading(false);
    });
  }, []);

  if (!isAdmin) return null;

  const filtered = demandas.filter((d) => {
    switch (aba) {
      case "Minhas demandas":
        return d.responsavel_id === user?.id || d.created_by === user?.id;
      case "Esta semana": {
        if (!d.prazo) return false;
        const now = new Date();
        const day = now.getDay();
        const start = new Date(now);
        start.setDate(now.getDate() - day);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        const p = new Date(d.prazo + "T00:00:00");
        return p >= start && p <= end;
      }
      case "Atrasadas": {
        if (!d.prazo) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(d.prazo + "T00:00:00") < today && d.status !== "done";
      }
      default:
        return true;
    }
  });

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (d: Demanda) => {
    setEditingId(d.id);
    setForm({
      titulo: d.titulo,
      descricao: d.descricao || "",
      client_id: d.client_id || "",
      responsavel_id: d.responsavel_id || "",
      status: d.status,
      prioridade: d.prioridade || "media",
      prazo: d.prazo || "",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    setSaving(true);
    const oldStatus = editingId
      ? demandas.find((d) => d.id === editingId)?.status
      : undefined;
    const payload: any = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      client_id: form.client_id || null,
      responsavel_id: form.responsavel_id || null,
      status: form.status,
      prioridade: form.prioridade,
      prazo: form.prazo || null,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { error } = await (supabase as any)
        .from("sistema_demandas")
        .update(payload)
        .eq("id", editingId);
      if (error) {
        toast.error("Erro ao atualizar demanda");
        console.error(error);
      } else {
        setDemandas((prev) =>
          prev.map((d) =>
            d.id === editingId ? ({ ...d, ...payload } as Demanda) : d
          )
        );
        toast.success("Demanda atualizada");
        setDialogOpen(false);
        if (form.status === "done" && oldStatus !== "done") {
          startOtimFlow(form.client_id || null);
        }
      }
    } else {
      payload.created_by = user?.id;
      const { data, error } = await (supabase as any)
        .from("sistema_demandas")
        .insert(payload)
        .select("*")
        .single();
      if (error) {
        toast.error("Erro ao criar demanda");
        console.error(error);
      } else {
        setDemandas((prev) => [data, ...prev]);
        toast.success("Demanda criada");
        setDialogOpen(false);
        if (form.status === "done") {
          startOtimFlow(form.client_id || null);
        }
      }
    }
    setSaving(false);
  };

  const remove = async () => {
    if (!editingId) return;
    const { error } = await (supabase as any)
      .from("sistema_demandas")
      .delete()
      .eq("id", editingId);
    if (error) {
      toast.error("Erro ao excluir demanda");
      console.error(error);
    } else {
      setDemandas((prev) => prev.filter((d) => d.id !== editingId));
      toast.success("Demanda excluída");
      setDialogOpen(false);
    }
  };

  const changeStatus = async (
    e: React.MouseEvent,
    id: string,
    newStatus: DemandaStatus
  ) => {
    e.stopPropagation();
    const demanda = demandas.find((d) => d.id === id);
    const movingToDone = newStatus === "done" && demanda?.status !== "done";

    setDemandas((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
    const { error } = await (supabase as any)
      .from("sistema_demandas")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error("Erro ao mover demanda");
      console.error(error);
    } else if (movingToDone) {
      startOtimFlow(demanda?.client_id || null);
    }
  };

  const getClienteNome = (clientId: string | null) => {
    if (!clientId) return null;
    return clientes.find((c) => c.id === clientId)?.nome || null;
  };

  const getColIdx = (status: DemandaStatus) =>
    colunas.findIndex((c) => c.id === status);

  const resetOtimFlow = () => {
    setOtimStep(null);
    setOtimClientId("");
    setOtimReport("");
  };

  const startOtimFlow = (clientId: string | null) => {
    setOtimClientId(clientId || "");
    setOtimStep("confirm");
  };

  const handleOtimConfirm = () => {
    if (otimClientId) {
      setOtimStep("report");
    } else {
      setOtimStep("select-client");
    }
  };

  const handleOtimClientSelect = () => {
    if (!otimClientId) {
      toast.error("Selecione um cliente");
      return;
    }
    setOtimStep("report");
  };

  const handleOtimSave = async () => {
    if (!user) return;
    setOtimSaving(true);
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await (supabase as any)
      .from("sistema_otimizacoes")
      .insert({
        client_id: otimClientId,
        data: today,
        otimizado: true,
        observacoes: otimReport.trim() || null,
        created_by: user.id,
      });
    if (error) {
      toast.error("Erro ao registrar otimização");
      console.error(error);
    } else {
      const clienteNome = clientes.find((c) => c.id === otimClientId)?.nome;
      toast.success(`Otimização registrada para ${clienteNome}`);
      resetOtimFlow();
    }
    setOtimSaving(false);
  };

  const handleOtimReportClose = () => {
    if (otimReport.trim() && !window.confirm("Descartar relatório de otimização?")) {
      return;
    }
    resetOtimFlow();
  };

  const inputCls = "bg-[#1c1c1e] border-[#2a2a2a] text-white";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {abas.map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={`px-3 py-1.5 rounded-md text-sm border transition ${
              aba === a
                ? "bg-[#3b82f6] border-[#3b82f6] text-white"
                : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {a}
          </button>
        ))}
        <div className="flex-1" />
        <Button
          onClick={openNew}
          className="bg-[#3b82f6] hover:bg-[#3b82f6]/90 gap-1"
        >
          <Plus className="h-4 w-4" /> Nova demanda
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {colunas.map((col) => {
            const cards = filtered.filter((d) => d.status === col.id);
            return (
              <div
                key={col.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 min-h-[300px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
                    {col.label}
                  </h4>
                  <span className="text-xs text-zinc-500">{cards.length}</span>
                </div>
                <div className="space-y-2">
                  {cards.map((d) => {
                    const clienteNome = getClienteNome(d.client_id);
                    const colIdx = getColIdx(d.status);
                    return (
                      <div
                        key={d.id}
                        onClick={() => openEdit(d)}
                        className="rounded-md border border-zinc-800 bg-zinc-950 p-3 space-y-2 hover:border-[#3b82f6]/60 cursor-pointer"
                      >
                        <p className="text-sm text-zinc-100 font-medium">
                          {d.titulo}
                        </p>
                        {clienteNome && (
                          <p className="text-xs text-zinc-500">{clienteNome}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge
                            className={
                              prioridadeColor[d.prioridade] ||
                              prioridadeColor.media
                            }
                          >
                            {d.prioridade}
                          </Badge>
                          {d.prazo && (
                            <span className="text-[10px] text-zinc-500">
                              {formatDate(d.prazo)}
                            </span>
                          )}
                        </div>
                        {d.responsavel_id && (
                          <p className="text-[10px] text-zinc-500">
                            Resp: {adminNomes[d.responsavel_id] || d.responsavel_id}
                          </p>
                        )}
                        <div className="flex gap-1 pt-1">
                          {colIdx > 0 && (
                            <button
                              onClick={(e) =>
                                changeStatus(
                                  e,
                                  d.id,
                                  colunas[colIdx - 1].id
                                )
                              }
                              className="text-[10px] text-zinc-500 hover:text-[#3b82f6] transition"
                              title={`Mover para ${colunas[colIdx - 1].label}`}
                            >
                              ← {colunas[colIdx - 1].label.split(" ")[0]}
                            </button>
                          )}
                          <div className="flex-1" />
                          {colIdx < colunas.length - 1 && (
                            <button
                              onClick={(e) =>
                                changeStatus(
                                  e,
                                  d.id,
                                  colunas[colIdx + 1].id
                                )
                              }
                              className="text-[10px] text-zinc-500 hover:text-[#3b82f6] transition"
                              title={`Mover para ${colunas[colIdx + 1].label}`}
                            >
                              {colunas[colIdx + 1].label.split(" ")[0]} →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
        <DialogContent className="bg-[#111111] border-[#2a2a2a] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? "Editar demanda" : "Nova demanda"}
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
                placeholder="Título da demanda"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Descrição</Label>
              <MarkdownEditor
                value={form.descricao}
                onChange={(v) => setForm({ ...form, descricao: v })}
                placeholder="Descrição da demanda"
                minHeight="80px"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Cliente</Label>
                <Select
                  value={form.client_id || "__none__"}
                  onValueChange={(v) =>
                    setForm({ ...form, client_id: v === "__none__" ? "" : v })
                  }
                >
                  <SelectTrigger className={inputCls}>
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c1c1e] border-[#2a2a2a] text-white max-h-60">
                    <SelectItem value="__none__">Nenhum (interno)</SelectItem>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as DemandaStatus })
                  }
                >
                  <SelectTrigger className={inputCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c1c1e] border-[#2a2a2a] text-white">
                    {colunas.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Prioridade</Label>
                <Select
                  value={form.prioridade}
                  onValueChange={(v) =>
                    setForm({ ...form, prioridade: v })
                  }
                >
                  <SelectTrigger className={inputCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c1c1e] border-[#2a2a2a] text-white">
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Prazo</Label>
                <Input
                  type="date"
                  value={form.prazo}
                  onChange={(e) =>
                    setForm({ ...form, prazo: e.target.value })
                  }
                  className={inputCls}
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

      {/* Otimização — Passo 1: confirmar */}
      <Dialog
        open={otimStep === "confirm"}
        onOpenChange={(o) => { if (!o) resetOtimFlow(); }}
      >
        <DialogContent className="bg-[#111111] border-[#2a2a2a] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Demanda concluída</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-300">
            Ir para otimização do cliente?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={resetOtimFlow}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Não
            </Button>
            <Button
              onClick={handleOtimConfirm}
              className="bg-[#3b82f6] hover:bg-[#3b82f6]/90"
            >
              Sim
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Otimização — Passo 2: selecionar cliente (quando demanda não tem client_id) */}
      <Dialog
        open={otimStep === "select-client"}
        onOpenChange={(o) => { if (!o) resetOtimFlow(); }}
      >
        <DialogContent className="bg-[#111111] border-[#2a2a2a] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Selecionar cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">
              Selecione o cliente para registrar a otimização:
            </p>
            <Select
              value={otimClientId || "__none__"}
              onValueChange={(v) =>
                setOtimClientId(v === "__none__" ? "" : v)
              }
            >
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1c1c1e] border-[#2a2a2a] text-white max-h-60">
                <SelectItem value="__none__">Selecione...</SelectItem>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={resetOtimFlow}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleOtimClientSelect}
              className="bg-[#3b82f6] hover:bg-[#3b82f6]/90"
            >
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Otimização — Passo 3: relatório */}
      <Dialog
        open={otimStep === "report"}
        onOpenChange={(o) => { if (!o) handleOtimReportClose(); }}
      >
        <DialogContent className="bg-[#111111] border-[#2a2a2a] text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              Relatório de otimização · {formatDate(new Date().toISOString().slice(0, 10))}
            </DialogTitle>
          </DialogHeader>
          <MarkdownEditor
            value={otimReport}
            onChange={setOtimReport}
            placeholder="Descreva as otimizações realizadas, hipóteses, resultados..."
            minHeight="300px"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleOtimSave}
              disabled={otimSaving}
              className="bg-[#7c3aed] hover:bg-[#6d28d9]"
            >
              {otimSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
