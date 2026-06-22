import { useEffect, useState } from "react";
import { Users, ListChecks, Target, Workflow, LogOut, FileText, BookOpen, Library, Loader2, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ClienteGallery } from "@/components/sistema/ClienteGallery";
import { KanbanBoard } from "@/components/sistema/KanbanBoard";
import { MetasBoard } from "@/components/sistema/MetasBoard";
import { FluxosPage } from "@/components/sistema/FluxosPage";
import { OtimizacaoForm } from "@/components/sistema/forms/OtimizacaoForm";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

// ── Client read-only view components ──

type SectionId = "persona" | "icp" | "escopo" | "biblioteca" | "otimizacao" | null;

const inputCls = "bg-[#1c1c1e] border-[#2a2a2a] text-white rounded-md cursor-default";

const ReadOnlyField = ({ label, placeholder }: { label: string; placeholder?: string }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-zinc-400">{label}</Label>
    <Input className={inputCls} placeholder={placeholder || "—"} disabled />
  </div>
);

const ReadOnlyTextarea = ({ label, placeholder, rows }: { label: string; placeholder?: string; rows?: number }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-zinc-400">{label}</Label>
    <Textarea className={`${inputCls} min-h-[80px]`} placeholder={placeholder || "—"} disabled rows={rows} />
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-sm font-semibold text-[#3b82f6] uppercase tracking-wide border-b border-[#2a2a2a] pb-2">
    {children}
  </h4>
);

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
    <h4 className="text-sm font-semibold text-zinc-200">{title}</h4>
    <div className="grid gap-3 md:grid-cols-2">{children}</div>
  </div>
);

const ReadOnlyBulletList = ({ items }: { items: string[] }) => (
  <div className="space-y-2">
    {items.map((item, i) => (
      <div key={i} className="flex items-center gap-2">
        <span className="text-[#3b82f6] text-lg leading-none select-none">•</span>
        <Input value={item} className={`${inputCls} flex-1`} disabled />
      </div>
    ))}
  </div>
);

const PersonaReadOnly = () => (
  <div className="space-y-4">
    <SectionCard title="Identificacao">
      <ReadOnlyField label="Nome" />
      <ReadOnlyField label="Idade" />
      <ReadOnlyField label="Genero" />
      <ReadOnlyField label="Onde mora" />
      <ReadOnlyField label="Status de relacionamento" />
      <ReadOnlyTextarea label="Interesses" />
    </SectionCard>
    <SectionCard title="Objetivos e motivacoes">
      <ReadOnlyTextarea label="Desejos" />
      <ReadOnlyTextarea label="O que querem" />
      <ReadOnlyTextarea label="O que fazem" />
      <ReadOnlyTextarea label="O que falam" />
      <ReadOnlyTextarea label="O que pensam" />
    </SectionCard>
    <SectionCard title="Desafios">
      <ReadOnlyTextarea label="Maiores frustracoes" />
      <ReadOnlyTextarea label="Maiores necessidades" />
      <ReadOnlyTextarea label="Maiores dores" />
    </SectionCard>
    <SectionCard title="Trabalho">
      <ReadOnlyField label="Grau de escolaridade" />
      <ReadOnlyField label="Onde trabalha" />
      <ReadOnlyField label="Setor que atua" />
      <ReadOnlyField label="Tamanho da empresa" />
      <ReadOnlyField label="Cargo / Profissao" />
      <ReadOnlyTextarea label="Habilidades boas e ruins" />
      <ReadOnlyTextarea label="Como o trabalho e medido" />
      <ReadOnlyField label="A quem se reporta" />
      <ReadOnlyTextarea label="Responsabilidades" />
      <ReadOnlyTextarea label="Ferramentas que usa" />
      <ReadOnlyTextarea label="Midias sociais que usa" />
    </SectionCard>
    <SectionCard title="Razoes para usar o produto/servico">
      <div className="md:col-span-2">
        <Textarea className={`${inputCls} min-h-[100px]`} disabled placeholder="—" />
      </div>
    </SectionCard>
  </div>
);

const icpSections = [
  "Com quem estamos empatizando?",
  "O que queremos que eles facam?",
  "O que eles veem",
  "O que eles falam?",
  "O que eles fazem?",
  "O que eles escutam?",
  "Dores",
  "Ganhos",
  "Outros pensamentos e sentimentos que motivam o comportamento",
];

const ICPReadOnly = () => (
  <div className="space-y-6">
    {icpSections.map((s) => (
      <section key={s} className="space-y-3">
        <SectionTitle>{s}</SectionTitle>
        <ReadOnlyBulletList items={["", "", ""]} />
      </section>
    ))}
  </div>
);

const EscopoReadOnly = () => (
  <div className="space-y-6">
    <section className="space-y-3">
      <SectionTitle>Links importantes</SectionTitle>
      <ReadOnlyBulletList items={["", "", ""]} />
    </section>
    <section className="space-y-3">
      <SectionTitle>Combinados com o cliente</SectionTitle>
      <ReadOnlyBulletList items={[""]} />
    </section>
    <section className="space-y-3">
      <SectionTitle>Rotinas definidas</SectionTitle>
      <ReadOnlyBulletList items={[""]} />
    </section>
  </div>
);

const BibliotecaReadOnly = () => (
  <div className="space-y-3">
    <SectionTitle>Referencias e materiais de estudo do cliente</SectionTitle>
    <Textarea className={`${inputCls} min-h-[400px]`} disabled placeholder="—" />
  </div>
);

const clientSections = [
  { id: "persona" as const, label: "Persona", icon: FileText },
  { id: "icp" as const, label: "ICP", icon: Target },
  { id: "escopo" as const, label: "Escopo do Trabalho", icon: BookOpen },
  { id: "biblioteca" as const, label: "Biblioteca de Referencias", icon: Library },
  { id: "otimizacao" as const, label: "Otimização", icon: BarChart3 },
];

function ClienteSistemaView() {
  const { clienteVinculadoId } = useAuth();
  const [clientName, setClientName] = useState("");
  const [clientLogo, setClientLogo] = useState<string | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionId>(null);
  const [logoBroken, setLogoBroken] = useState(false);

  useEffect(() => {
    if (!clienteVinculadoId) {
      setLoadingClient(false);
      return;
    }

    supabase
      .from("gestao_clientes")
      .select("nome_cliente, logo_url")
      .eq("id", clienteVinculadoId)
      .single()
      .then(({ data }) => {
        if (data) {
          setClientName((data as any).nome_cliente ?? "");
          setClientLogo((data as any).logo_url ?? null);
        }
        setLoadingClient(false);
      });
  }, [clienteVinculadoId]);

  if (loadingClient) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "persona": return <PersonaReadOnly />;
      case "icp": return <ICPReadOnly />;
      case "escopo": return <EscopoReadOnly />;
      case "biblioteca": return <BibliotecaReadOnly />;
      case "otimizacao": return <OtimizacaoForm clientId={clienteVinculadoId || undefined} readOnly />;
      default: return null;
    }
  };

  const showLogo = clientLogo && !logoBroken;

  return (
    <div className="dashboard-theme min-h-screen bg-black text-zinc-100">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          {activeSection && (
            <button
              onClick={() => setActiveSection(null)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}
          {showLogo ? (
            <img
              src={clientLogo!}
              alt={clientName}
              className="h-12 w-12 rounded-xl object-cover border border-zinc-800"
              onError={() => setLogoBroken(true)}
            />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-[#3b82f6]/10 border border-zinc-800 flex items-center justify-center">
              <span className="text-[#3b82f6] font-bold text-lg">{(clientName || "C").charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activeSection ? clientSections.find((s) => s.id === activeSection)?.label : "Meu Perfil & Materiais"}
            </h1>
            <p className="text-zinc-400 text-sm">{clientName} — Somente leitura</p>
          </div>
        </div>

        {activeSection ? (
          renderSection()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="group bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 text-left transition-all duration-300 hover:border-[#3b82f6]/50 hover:shadow-lg hover:shadow-[#3b82f6]/5 hover:-translate-y-0.5"
                >
                  <div className="p-3 rounded-lg bg-[#3b82f6]/10 w-fit mb-3">
                    <Icon className="h-5 w-5 text-[#3b82f6]" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">{section.label}</h3>
                  <p className="text-sm text-zinc-400">Visualizar informacoes</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Admin view (original) ──

function AdminSistemaView() {
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
}

// ── Main export ──

const SistemaPage = () => {
  const { isAdmin } = useAuth();

  return isAdmin ? <AdminSistemaView /> : <ClienteSistemaView />;
};

export default SistemaPage;
