import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fluxosMock } from "@/lib/sistemaMockData";

export const FluxosPage = () => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">Processos e SOPs da agência.</p>
        <Button className="bg-[#3b82f6] hover:bg-[#3b82f6]/90 gap-1">
          <Plus className="h-4 w-4" /> Novo fluxo
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800">
        {fluxosMock.map((f) => (
          <div key={f.id} className="p-4 hover:bg-zinc-900/40 transition flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-semibold text-zinc-100">{f.nome}</h4>
              <p className="text-sm text-zinc-400">{f.descricao}</p>
              <p className="text-xs text-zinc-500">Responsável: {f.responsavel}</p>
            </div>
            <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-700/50">
              {f.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};
