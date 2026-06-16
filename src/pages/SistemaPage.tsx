import { useState } from "react";
import { Users, ListChecks, Target, Workflow, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ClienteGallery } from "@/components/sistema/ClienteGallery";
import { KanbanBoard } from "@/components/sistema/KanbanBoard";
import { MetasBoard } from "@/components/sistema/MetasBoard";
import { FluxosPage } from "@/components/sistema/FluxosPage";

type Tab = "clientes" | "demandas" | "metas" | "fluxos";

const nav: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "demandas", label: "Demandas", icon: ListChecks },
  { id: "metas", label: "Metas", icon: Target },
  { id: "fluxos", label: "Fluxos", icon: Workflow },
];

const titles: Record<Tab, string> = {
  clientes: "Clientes",
  demandas: "Demandas",
  metas: "Metas de Clientes",
  fluxos: "Fluxos de Trabalho",
};

const SistemaPage = () => {
  const [tab, setTab] = useState<Tab>("clientes");
  const { signOut } = useAuth();

  const renderContent = () => {
    switch (tab) {
      case "clientes": return <ClienteGallery />;
      case "demandas": return <KanbanBoard />;
      case "metas": return <MetasBoard />;
      case "fluxos": return <FluxosPage />;
    }
  };

  return (
    <div className="dashboard-theme min-h-screen bg-black text-zinc-100 flex w-full">
      <aside className="w-60 border-r border-zinc-800 bg-zinc-950 flex flex-col">
        <div className="h-16 border-b border-zinc-800 px-5 flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-[#3b82f6] flex items-center justify-center font-bold">T</div>
          <div className="leading-tight">
            <p className="text-xs text-zinc-400">Traffic Solutions</p>
            <p className="text-sm font-semibold">Sistema</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                  active
                    ? "bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/30"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 border border-transparent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </button>
            );
          })}
        </nav>
        <button
          onClick={() => signOut()}
          className="m-3 flex items-center gap-2 px-3 py-2 rounded-md text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-950/40 backdrop-blur sticky top-0 z-10">
          <h1 className="text-lg font-semibold">{titles[tab]}</h1>
          <span className="text-xs text-zinc-500">Sistema Traffic Solutions</span>
        </header>
        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  );
};

export default SistemaPage;
