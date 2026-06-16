import { useState } from "react";
import { clientesMock, mesesMetas, metasMock } from "@/lib/sistemaMockData";

export const MetasBoard = () => {
  const [view, setView] = useState<"board" | "tabela">("tabela");
  const ativos = clientesMock.filter((c) => c.status === "ativo");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setView("board")}
          className={`px-3 py-1.5 rounded-md text-sm border ${view === "board" ? "bg-[#3b82f6] border-[#3b82f6] text-white" : "bg-zinc-900 border-zinc-800 text-zinc-300"}`}
        >
          Board
        </button>
        <button
          onClick={() => setView("tabela")}
          className={`px-3 py-1.5 rounded-md text-sm border ${view === "tabela" ? "bg-[#3b82f6] border-[#3b82f6] text-white" : "bg-zinc-900 border-zinc-800 text-zinc-300"}`}
        >
          Tabela
        </button>
      </div>

      {view === "tabela" ? (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/60 text-zinc-400">
              <tr>
                <th className="text-left p-3 sticky left-0 bg-zinc-900/80 z-10">Cliente</th>
                {mesesMetas.map((m) => (
                  <th key={m} className="text-left p-3 min-w-[180px]">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ativos.map((c) => (
                <tr key={c.id} className="border-t border-zinc-800 hover:bg-zinc-900/40">
                  <td className="p-3 font-medium text-zinc-200 sticky left-0 bg-zinc-950">{c.nome}</td>
                  {mesesMetas.map((m) => {
                    const cell = metasMock[c.id][m];
                    return (
                      <td key={m} className="p-3 text-zinc-400">
                        <div className="space-y-0.5">
                          <p className="text-xs"><span className="text-zinc-500">Meta:</span> {cell.meta}</p>
                          <p className="text-xs"><span className="text-zinc-500">Result:</span> {cell.resultado}</p>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {ativos.map((c) => (
            <div key={c.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
              <h4 className="font-semibold text-zinc-100 mb-3">{c.nome}</h4>
              <div className="grid grid-cols-2 gap-2">
                {mesesMetas.map((m) => (
                  <div key={m} className="rounded border border-zinc-800 p-2">
                    <p className="text-[10px] text-zinc-500 uppercase">{m}</p>
                    <p className="text-xs text-zinc-300">{metasMock[c.id][m].meta}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
