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
          className={filtro === "ativo" ? "bg-primary hover:bg-primary/90" : "bg-card border border-border hover:bg-surface-3 text-foreground/85"}
        >
          Ativos
        </Button>
        <Button
          onClick={() => setFiltro("inativo")}
          className={filtro === "inativo" ? "bg-primary hover:bg-primary/90" : "bg-card border border-border hover:bg-surface-3 text-foreground/85"}
        >
          Inativos
        </Button>
        <div className="flex-1" />
        <Button className="bg-primary hover:bg-primary/90 gap-1">
          <Plus className="h-4 w-4" /> Nova
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {lista.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className="group rounded-xl border border-border bg-card/60 hover:border-primary/60 hover:bg-card transition-all overflow-hidden text-left"
            >
              <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-950 overflow-hidden">
                {c.logo ? (
                  <img src={c.logo} alt={c.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary/80">{c.nome.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="p-3 space-y-1.5">
                <p className="text-sm font-medium text-foreground truncate">{c.nome}</p>
                <Badge className={c.status === "ativo"
                  ? "bg-success/20 text-success border-success/50"
                  : "bg-zinc-700/30 text-muted-foreground border-border"}>
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
