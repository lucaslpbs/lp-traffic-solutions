import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ClienteModal } from "./ClienteModal";

export interface SistemaCliente {
  id: string;
  nome: string;
  logo?: string;
  status: "ativo" | "inativo";
}

export const ClienteGallery = () => {
  const [filtro, setFiltro] = useState<"ativo" | "inativo">("ativo");
  const [selected, setSelected] = useState<SistemaCliente | null>(null);
  const [clientes, setClientes] = useState<SistemaCliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any)
      .from("gestao_clientes")
      .select("id, nome_cliente, logo_url, status")
      .order("nome_cliente")
      .then(({ data, error }: any) => {
        if (!error && data) {
          setClientes(
            data.map((c: any) => ({
              id: c.id,
              nome: c.nome_cliente || "",
              logo: c.logo_url || undefined,
              status: c.status === "ativo" ? "ativo" as const : "inativo" as const,
            }))
          );
        }
        setLoading(false);
      });
  }, []);

  const lista = clientes.filter((c) => c.status === filtro);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => setFiltro("ativo")}
          className={filtro === "ativo" ? "bg-[#3b82f6] hover:bg-[#3b82f6]/90" : "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300"}
        >
          Ativos
        </Button>
        <Button
          onClick={() => setFiltro("inativo")}
          className={filtro === "inativo" ? "bg-[#3b82f6] hover:bg-[#3b82f6]/90" : "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300"}
        >
          Inativos
        </Button>
        <div className="flex-1" />
        <Button className="bg-[#3b82f6] hover:bg-[#3b82f6]/90 gap-1">
          <Plus className="h-4 w-4" /> Nova
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {lista.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-[#3b82f6]/60 hover:bg-zinc-900 transition-all overflow-hidden text-left"
            >
              <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                {c.logo ? (
                  <img src={c.logo} alt={c.nome} className="h-10 w-10 rounded object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-[#3b82f6]/80">{c.nome.charAt(0)}</span>
                )}
              </div>
              <div className="p-3 space-y-1.5">
                <p className="text-sm font-medium text-zinc-100 line-clamp-1">{c.nome}</p>
                <Badge className={c.status === "ativo"
                  ? "bg-emerald-600/20 text-emerald-400 border-emerald-700/50"
                  : "bg-zinc-700/30 text-zinc-400 border-zinc-700"}>
                  {c.status === "ativo" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      )}

      <ClienteModal cliente={selected} onClose={() => setSelected(null)} />
    </div>
  );
};
