import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Chamado {
  id: string;
  client_id: string;
  mensagem: string;
  resposta_admin: string | null;
  status: "aberto" | "respondido" | "concluido";
  created_at: string;
  respondido_at: string | null;
  concluido_at: string | null;
  nome_cliente?: string;
}

const statusConfig = {
  aberto: { label: "Aberto", cls: "bg-yellow-600/20 text-yellow-400 border-yellow-700/50" },
  respondido: { label: "Respondido", cls: "bg-blue-600/20 text-blue-400 border-blue-700/50" },
  concluido: { label: "Concluído", cls: "bg-emerald-600/20 text-emerald-400 border-emerald-700/50" },
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

// ── Client View ──

function ClienteChamadosView() {
  const { user, clienteVinculadoId } = useAuth();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const fetchChamados = async () => {
    if (!clienteVinculadoId) { setLoading(false); return; }
    const { data, error } = await (supabase as any)
      .from("sistema_chamados")
      .select("*")
      .eq("client_id", clienteVinculadoId)
      .order("created_at", { ascending: false });
    if (!error && data) setChamados(data);
    setLoading(false);
  };

  useEffect(() => { fetchChamados(); }, [clienteVinculadoId]);

  const enviar = async () => {
    if (!mensagem.trim() || !user || !clienteVinculadoId) return;
    setEnviando(true);
    const { error } = await (supabase as any)
      .from("sistema_chamados")
      .insert({
        client_id: clienteVinculadoId,
        created_by: user.id,
        mensagem: mensagem.trim(),
      });
    if (error) {
      toast.error("Erro ao enviar chamado");
      console.error(error);
    } else {
      toast.success("Chamado enviado com sucesso");
      setMensagem("");
      fetchChamados();
    }
    setEnviando(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Fale com o suporte</h1>
        <p className="text-sm text-zinc-400">Envie uma mensagem e nossa equipe responderá em breve.</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <Textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Descreva sua dúvida ou solicitação..."
          className="bg-[#1c1c1e] border-[#2a2a2a] text-white min-h-[120px] placeholder:text-zinc-600"
        />
        <div className="flex justify-end">
          <Button
            onClick={enviar}
            disabled={!mensagem.trim() || enviando}
            className="bg-[#3b82f6] hover:bg-[#3b82f6]/90 gap-2"
          >
            {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Enviar
          </Button>
        </div>
      </div>

      {chamados.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-200">Meus chamados</h2>
          <div className="space-y-3">
            {chamados.map((c) => {
              const cfg = statusConfig[c.status];
              return (
                <div key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <p className="text-xs text-zinc-500">{formatDate(c.created_at)}</p>
                      <p className="text-sm text-zinc-200">{c.mensagem}</p>
                    </div>
                    <Badge className={cfg.cls}>{cfg.label}</Badge>
                  </div>
                  {c.resposta_admin && (
                    <div className="border-t border-zinc-800 pt-3">
                      <p className="text-xs text-zinc-500 mb-1">Resposta do suporte{c.respondido_at ? ` · ${formatDate(c.respondido_at)}` : ""}</p>
                      <p className="text-sm text-zinc-300">{c.resposta_admin}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Admin View ──

type FilterTab = "aberto" | "respondido" | "concluido" | "todos";

function AdminChamadosView() {
  const { user } = useAuth();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("aberto");
  const [respondendo, setRespondendo] = useState<Chamado | null>(null);
  const [resposta, setResposta] = useState("");
  const [enviando, setEnviando] = useState(false);

  const fetchChamados = async () => {
    const { data, error } = await (supabase as any)
      .from("sistema_chamados")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) { console.error(error); setLoading(false); return; }

    const clientIds = [...new Set((data as any[]).map((c: any) => c.client_id))];
    let clientesMap: Record<string, string> = {};
    if (clientIds.length > 0) {
      const { data: clientes } = await (supabase as any)
        .from("gestao_clientes")
        .select("id, nome_cliente")
        .in("id", clientIds);
      if (clientes) {
        clientesMap = Object.fromEntries((clientes as any[]).map((c: any) => [c.id, c.nome_cliente]));
      }
    }

    setChamados(
      (data as any[]).map((c: any) => ({
        ...c,
        nome_cliente: clientesMap[c.client_id] || c.client_id,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchChamados(); }, []);

  const filtered = filter === "todos" ? chamados : chamados.filter((c) => c.status === filter);

  const responder = async () => {
    if (!respondendo || !resposta.trim() || !user) return;
    setEnviando(true);
    const { error } = await (supabase as any)
      .from("sistema_chamados")
      .update({
        resposta_admin: resposta.trim(),
        respondido_por: user.id,
        status: "respondido",
        respondido_at: new Date().toISOString(),
      })
      .eq("id", respondendo.id);
    if (error) {
      toast.error("Erro ao responder");
      console.error(error);
    } else {
      toast.success("Resposta enviada");
      setRespondendo(null);
      setResposta("");
      fetchChamados();
    }
    setEnviando(false);
  };

  const concluir = async (id: string) => {
    const { error } = await (supabase as any)
      .from("sistema_chamados")
      .update({
        status: "concluido",
        concluido_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) {
      toast.error("Erro ao concluir");
      console.error(error);
    } else {
      toast.success("Chamado concluído");
      fetchChamados();
    }
  };

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "aberto", label: "Abertos" },
    { id: "respondido", label: "Respondidos" },
    { id: "concluido", label: "Concluídos" },
    { id: "todos", label: "Todos" },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Chamados</h1>
        <p className="text-sm text-zinc-400">Gerencie as solicitações de suporte dos clientes.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button
            key={t.id}
            onClick={() => setFilter(t.id)}
            size="sm"
            className={filter === t.id
              ? "bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white"
              : "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300"
            }
          >
            {t.label}
            {t.id !== "todos" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({chamados.filter((c) => c.status === t.id).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>Nenhum chamado {filter !== "todos" ? statusConfig[filter as keyof typeof statusConfig]?.label.toLowerCase() : "encontrado"}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const cfg = statusConfig[c.status];
            return (
              <div key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-100">{c.nome_cliente}</span>
                      <span className="text-xs text-zinc-500">· {formatDate(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-zinc-300">{c.mensagem}</p>
                  </div>
                  <Badge className={cfg.cls}>{cfg.label}</Badge>
                </div>

                {c.resposta_admin && (
                  <div className="border-t border-zinc-800 pt-3">
                    <p className="text-xs text-zinc-500 mb-1">Resposta{c.respondido_at ? ` · ${formatDate(c.respondido_at)}` : ""}</p>
                    <p className="text-sm text-zinc-300">{c.resposta_admin}</p>
                  </div>
                )}

                {c.status !== "concluido" && (
                  <div className="flex gap-2 pt-1">
                    {c.status === "aberto" && (
                      <Button
                        size="sm" variant="outline"
                        onClick={() => { setRespondendo(c); setResposta(c.resposta_admin || ""); }}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white gap-1.5"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Responder
                      </Button>
                    )}
                    {c.status === "respondido" && !c.resposta_admin && (
                      <Button
                        size="sm" variant="outline"
                        onClick={() => { setRespondendo(c); setResposta(""); }}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white gap-1.5"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Responder
                      </Button>
                    )}
                    <Button
                      size="sm" variant="outline"
                      onClick={() => concluir(c.id)}
                      className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-600/20 gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!respondendo} onOpenChange={(o) => { if (!o) { setRespondendo(null); setResposta(""); } }}>
        <DialogContent className="bg-[#111111] border-[#2a2a2a] text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              Responder chamado — {respondendo?.nome_cliente}
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-3 mb-2">
            <p className="text-xs text-zinc-500 mb-1">Mensagem do cliente:</p>
            <p className="text-sm text-zinc-300">{respondendo?.mensagem}</p>
          </div>
          <Textarea
            value={resposta}
            onChange={(e) => setResposta(e.target.value)}
            className="bg-[#1c1c1e] border-[#2a2a2a] text-white min-h-[150px] placeholder:text-zinc-600"
            placeholder="Escreva sua resposta..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setRespondendo(null); setResposta(""); }} className="border-zinc-700 text-zinc-300">
              Cancelar
            </Button>
            <Button
              onClick={responder}
              disabled={!resposta.trim() || enviando}
              className="bg-[#3b82f6] hover:bg-[#3b82f6]/90 gap-2"
            >
              {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar resposta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Main export ──

const ChamadosPage = () => {
  const { isAdmin, loading, loadingRole } = useAuth();

  if (loading || loadingRole) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  return (
    <div className="dashboard-theme min-h-screen bg-black text-zinc-100">
      {isAdmin ? <AdminChamadosView /> : <ClienteChamadosView />}
    </div>
  );
};

export default ChamadosPage;
