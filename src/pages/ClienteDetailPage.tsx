import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ClienteContent } from "@/components/sistema/ClienteContent";
import { Shimmer } from "@/components/dashboard/Skeletons";

interface ClienteData {
  nome: string;
  logo?: string;
  status: string;
}

const ClienteDetailPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<ClienteData | null>(null);

  useEffect(() => {
    if (!clientId) return;
    (supabase as any)
      .from("gestao_clientes")
      .select("nome_cliente, logo_url, status")
      .eq("id", clientId)
      .single()
      .then(({ data, error }: any) => {
        if (!error && data) {
          setCliente({
            nome: data.nome_cliente || "",
            logo: data.logo_url || undefined,
            status: data.status || "ativo",
          });
        }
        setLoading(false);
      });
  }, [clientId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col" role="status" aria-label="Carregando cliente">
        <div className="border-b border-border px-6 py-3 flex items-center gap-4">
          <Shimmer className="h-5 w-20" />
          <div className="w-px h-6 bg-surface-3" />
          <Shimmer className="h-9 w-9 rounded-lg" />
          <div className="space-y-1.5">
            <Shimmer className="h-4 w-40" />
            <Shimmer className="h-3 w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (!cliente || !clientId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Cliente não encontrado.</p>
          <button
            onClick={() => navigate("/dashboard/sistema")}
            className="focus-ring rounded text-primary hover:underline text-sm"
          >
            ← Voltar para Sistema
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Page header */}
      <div className="border-b border-border px-6 py-3 flex items-center gap-4 bg-background/40 backdrop-blur shrink-0">
        <button
          onClick={() => navigate("/dashboard/sistema")}
          className="focus-ring rounded flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <div className="w-px h-6 bg-surface-3" />
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
            {cliente.logo ? (
              <img
                src={cliente.logo}
                alt={cliente.nome}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-primary">
                {cliente.nome.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-foreground truncate">
              {cliente.nome}
            </h1>
            <Badge
              className={`text-[10px] h-4 ${
                cliente.status === "ativo"
                  ? "bg-success/20 text-success border-success"
                  : "bg-surface-3 text-muted-foreground border-border"
              }`}
            >
              {cliente.status === "ativo" ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Shared sidebar + content */}
      <ClienteContent clientId={clientId} />
    </div>
  );
};

export default ClienteDetailPage;
