import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ClienteContent } from "@/components/sistema/ClienteContent";

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
      <div className="dashboard-theme min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  if (!cliente || !clientId) {
    return (
      <div className="dashboard-theme min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Cliente não encontrado.</p>
          <button
            onClick={() => navigate("/dashboard/sistema")}
            className="text-[#3b82f6] hover:underline text-sm"
          >
            ← Voltar para Sistema
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-theme min-h-screen bg-black text-zinc-100 flex flex-col">
      {/* Page header */}
      <div className="border-b border-zinc-800 px-6 py-3 flex items-center gap-4 bg-zinc-950/40 backdrop-blur shrink-0">
        <button
          onClick={() => navigate("/dashboard/sistema")}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <div className="w-px h-6 bg-zinc-800" />
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
            {cliente.logo ? (
              <img
                src={cliente.logo}
                alt={cliente.nome}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-[#3b82f6]">
                {cliente.nome.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-white truncate">
              {cliente.nome}
            </h1>
            <Badge
              className={`text-[10px] h-4 ${
                cliente.status === "ativo"
                  ? "bg-emerald-600/20 text-emerald-400 border-emerald-700"
                  : "bg-zinc-700/30 text-zinc-400 border-zinc-700"
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
