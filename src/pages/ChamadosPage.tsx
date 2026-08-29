import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "@/components/sistema/MarkdownEditor";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Send, CheckCircle2, MessageSquare, Headphones } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Stagger, StaggerItem, Reveal } from "@/components/dashboard/Motion";
import { ListSkeleton, PageHeaderSkeleton } from "@/components/dashboard/Skeletons";
import {
  DashTabs,
  DashTabsList,
  DashTabsTrigger,
  DashTabsPanel,
} from "@/components/dashboard/DashboardTabs";
import { ChamadoCard } from "@/components/chamados/ChamadoCard";
import { statusConfig, type Chamado, type ChamadoStatus } from "@/components/chamados/types";

// ── Estado vazio compartilhado ──

const EmptyState = ({ texto }: { texto: string }) => (
  <div className="text-center py-16 text-muted-foreground">
    <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
    <p>{texto}</p>
  </div>
);

// ── Client View ──

function ClienteChamadosView() {
  const { user, clienteVinculadoId } = useAuth();
  const qc = useQueryClient();
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const { data: chamados = [], isLoading: loading } = useQuery({
    queryKey: ['chamados-cliente', clienteVinculadoId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("sistema_chamados")
        .select("*")
        .eq("client_id", clienteVinculadoId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Chamado[];
    },
    enabled: !!clienteVinculadoId,
  });

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
      qc.invalidateQueries({ queryKey: ['chamados-cliente'] });
    }
    setEnviando(false);
  };

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-3xl mx-auto space-y-10">
      <Reveal>
        <PageHeader
          title="Fale com o suporte"
          subtitle="Envie uma mensagem e nossa equipe responderá em breve."
          icon={Headphones}
        />
      </Reveal>

      <Reveal delay={0.05}>
        <div className="rounded-xl border border-border bg-card/60 p-5 space-y-4 transition-colors focus-within:border-primary/50">
          <MarkdownEditor
            value={mensagem}
            onChange={setMensagem}
            placeholder="Descreva sua dúvida ou solicitação..."
            minHeight="120px"
          />
          <div className="flex justify-end">
            <Button
              onClick={enviar}
              disabled={!mensagem.trim() || enviando}
              className="bg-primary hover:bg-primary-hover text-primary-foreground gap-2"
            >
              {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar
            </Button>
          </div>
        </div>
      </Reveal>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/90">
          Meus chamados
        </h2>

        {loading ? (
          <ListSkeleton rows={3} />
        ) : chamados.length === 0 ? (
          <EmptyState texto="Você ainda não abriu nenhum chamado." />
        ) : (
          <Stagger className="space-y-3">
            {chamados.map((c) => (
              <StaggerItem key={c.id}>
                <ChamadoCard chamado={c} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}

// ── Admin View ──

type FilterTab = ChamadoStatus | "todos";

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: "aberto", label: "Abertos" },
  { id: "respondido", label: "Respondidos" },
  { id: "concluido", label: "Concluídos" },
  { id: "todos", label: "Todos" },
];

function AdminChamadosView() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<FilterTab>("aberto");
  const [respondendo, setRespondendo] = useState<Chamado | null>(null);
  const [resposta, setResposta] = useState("");
  const [enviando, setEnviando] = useState(false);

  const { data: chamados = [], isLoading: loading } = useQuery({
    queryKey: ['chamados-admin'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("sistema_chamados")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

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

      return (data as any[]).map((c: any) => ({
        ...c,
        nome_cliente: clientesMap[c.client_id] || c.client_id,
      })) as Chamado[];
    },
  });

  const invalidateChamados = () => qc.invalidateQueries({ queryKey: ['chamados-admin'] });

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
      invalidateChamados();
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
      invalidateChamados();
    }
  };

  const abrirResposta = (c: Chamado) => {
    setRespondendo(c);
    setResposta(c.resposta_admin || "");
  };

  const fecharResposta = () => {
    setRespondendo(null);
    setResposta("");
  };

  const acoesDe = (c: Chamado) => {
    if (c.status === "concluido") return null;
    const podeResponder = c.status === "aberto" || (c.status === "respondido" && !c.resposta_admin);
    return (
      <>
        {podeResponder && (
          <Button size="sm" variant="outline" onClick={() => abrirResposta(c)} className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> Responder
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => concluir(c.id)}
          className="border-success/50 text-success hover:bg-success/15 hover:text-success gap-1.5"
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
        </Button>
      </>
    );
  };

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8">
      <Reveal>
        <PageHeader
          title="Chamados"
          subtitle="Gerencie as solicitações de suporte dos clientes."
          icon={Headphones}
        />
      </Reveal>

      <DashTabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
        <DashTabsList>
          {filterTabs.map((t) => (
            <DashTabsTrigger key={t.id} value={t.id}>
              {t.label}
              {t.id !== "todos" && (
                <span className="text-xs opacity-70">
                  ({chamados.filter((c) => c.status === t.id).length})
                </span>
              )}
            </DashTabsTrigger>
          ))}
        </DashTabsList>

        {filterTabs.map((t) => (
          <DashTabsPanel key={t.id} value={t.id}>
            {loading ? (
              <ListSkeleton rows={4} />
            ) : filtered.length === 0 ? (
              <EmptyState
                texto={`Nenhum chamado ${
                  t.id !== "todos" ? statusConfig[t.id].label.toLowerCase() : "encontrado"
                }.`}
              />
            ) : (
              <Stagger className="space-y-3">
                {filtered.map((c) => (
                  <StaggerItem key={c.id}>
                    <ChamadoCard chamado={c} showCliente actions={acoesDe(c)} />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </DashTabsPanel>
        ))}
      </DashTabs>

      <Dialog open={!!respondendo} onOpenChange={(o) => { if (!o) fecharResposta(); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Responder chamado — {respondendo?.nome_cliente}</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg bg-surface-2/60 border border-border p-3 mb-2">
            <p className="text-xs text-muted-foreground mb-1">Mensagem do cliente:</p>
            <div className="text-sm text-foreground/85">
              <MarkdownEditor value={respondendo?.mensagem || ""} readOnly />
            </div>
          </div>
          <MarkdownEditor
            value={resposta}
            onChange={setResposta}
            placeholder="Escreva sua resposta..."
            minHeight="150px"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={fecharResposta}>
              Cancelar
            </Button>
            <Button
              onClick={responder}
              disabled={!resposta.trim() || enviando}
              className="bg-primary hover:bg-primary-hover text-primary-foreground gap-2"
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

  // O fundo e o tema vem do DashboardLayout — a pagina so entrega o conteudo.
  if (loading || loadingRole) {
    return (
      <div className="p-5 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8">
        <PageHeaderSkeleton />
        <ListSkeleton rows={4} />
      </div>
    );
  }

  return isAdmin ? <AdminChamadosView /> : <ClienteChamadosView />;
};

export default ChamadosPage;
