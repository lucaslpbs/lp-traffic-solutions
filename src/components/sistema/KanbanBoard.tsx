import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { colunasKanban, demandasMock, clientesMock } from "@/lib/sistemaMockData";

const abas = ["Minhas demandas", "Esta semana", "Atrasadas", "Lista geral"];

const prioridadeColor: Record<string, string> = {
  alta: "bg-red-600/20 text-red-400 border-red-700/50",
  media: "bg-amber-600/20 text-amber-400 border-amber-700/50",
  baixa: "bg-zinc-700/30 text-zinc-400 border-zinc-700",
};

export const KanbanBoard = () => {
  const [aba, setAba] = useState(abas[3]);

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
        <Button className="bg-[#3b82f6] hover:bg-[#3b82f6]/90 gap-1">
          <Plus className="h-4 w-4" /> Nova demanda
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {colunasKanban.map((col) => {
          const cards = demandasMock.filter((d) => d.status === col.id);
          return (
            <div key={col.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 min-h-[300px]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">{col.label}</h4>
                <span className="text-xs text-zinc-500">{cards.length}</span>
              </div>
              <div className="space-y-2">
                {cards.map((d) => {
                  const cliente = clientesMock.find((c) => c.id === d.clienteId);
                  return (
                    <div key={d.id} className="rounded-md border border-zinc-800 bg-zinc-950 p-3 space-y-2 hover:border-[#3b82f6]/60 cursor-pointer">
                      <p className="text-sm text-zinc-100 font-medium">{d.titulo}</p>
                      <p className="text-xs text-zinc-500">{cliente?.nome}</p>
                      <div className="flex items-center justify-between">
                        <Badge className={prioridadeColor[d.prioridade]}>{d.prioridade}</Badge>
                        <span className="text-[10px] text-zinc-500">{d.entrega}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500">Resp: {d.responsavel}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
