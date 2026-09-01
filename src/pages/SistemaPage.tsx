// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, ListChecks, Target, Workflow, FileText, BookOpen, Library, BarChart3, Image as ImageIcon, ChevronLeft, FolderKanban } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Stagger, StaggerItem, Reveal } from "@/components/dashboard/Motion";
import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/dashboard/Skeletons";
import {
  DashTabs,
  DashTabsList,
  DashTabsTrigger,
  DashTabsPanel,
} from "@/components/dashboard/DashboardTabs";
import { ClienteGallery } from "@/components/sistema/ClienteGallery";
import { KanbanBoard } from "@/components/sistema/KanbanBoard";
import { MetasBoard } from "@/components/sistema/MetasBoard";
import { FluxosPage } from "@/components/sistema/FluxosPage";
import { OtimizacaoForm } from "@/components/sistema/forms/OtimizacaoForm";
import { CriativosGallery } from "@/components/sistema/CriativosGallery";
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

type SectionId = "persona" | "icp" | "escopo" | "biblioteca" | "otimizacao" | "criativos" | null;

const inputCls = "bg-surface-2 border-surface-3 text-foreground rounded-md cursor-default";

const ReadOnlyField = ({ label, placeholder }: { label: string; placeholder?: string }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <Input className={inputCls} placeholder={placeholder || "—"} disabled />
  </div>
);

const ReadOnlyTextarea = ({ label, placeholder, rows }: { label: string; placeholder?: string; rows?: number }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <Textarea className={`${inputCls} min-h-[80px]`} placeholder={placeholder || "—"} disabled rows={rows} />
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-sm font-semibold text-primary uppercase tracking-wide border-b border-surface-3 pb-2">
    {children}
  </h4>
);

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3 rounded-lg border border-border bg-card/40 p-4">
    <h4 className="text-sm font-semibold text-foreground">{title}</h4>
    <div className="grid gap-3 md:grid-cols-2">{children}</div>
  </div>
);

const ReadOnlyBulletList = ({ items }: { items: string[] }) => (
  <div className="space-y-2">
    {items.map((item, i) => (
      <div key={i} className="flex items-center gap-2">
        <span className="text-primary text-lg leading-none select-none">•</span>
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
  { id: "criativos" as const, label: "Criativos", icon: ImageIcon },
];

function ClienteSistemaView() {
  const { clienteVinculadoId } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionId>(null);

  const { data: clienteData, isLoading: loadingClient } = useQuery({
    queryKey: ['sistema-cliente-info', clienteVinculadoId],
    queryFn: async () => {
      const { data } = await supabase
        .from("gestao_clientes")
        .select("nome_cliente, logo_url")
        .eq("id", clienteVinculadoId!)
        .single();
      return data as { nome_cliente: string; logo_url: string | null } | null;
    },
    enabled: !!clienteVinculadoId,
  });

  const clientName = clienteData?.nome_cliente ?? "";
  const clientLogo = clienteData?.logo_url ?? null;

  if (loadingClient) {
    return (
      <div className="p-5 sm:p-8 lg:p-10 max-w-4xl mx-auto space-y-10">
        <PageHeaderSkeleton />
        <CardGridSkeleton count={6} className="md:grid-cols-2 lg:grid-cols-2" />
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
      case "criativos": return <CriativosGallery clientId={clienteVinculadoId || undefined} />;
      default: return null;
    }
  };

  const secaoAtual = clientSections.find((s) => s.id === activeSection);

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-4xl mx-auto">
      <Reveal>
        <PageHeader
          className="mb-8"
          title={secaoAtual ? secaoAtual.label : "Meu Perfil & Materiais"}
          subtitle={`${clientName} — Somente leitura`}
          imageUrl={clientLogo}
          initial={(clientName || "C").charAt(0).toUpperCase()}
          leading={
            activeSection && (
              <button
                onClick={() => setActiveSection(null)}
                aria-label="Voltar para a lista de secoes"
                className="focus-ring p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )
          }
        />
      </Reveal>

      {activeSection ? (
        <Reveal key={activeSection}>{renderSection()}</Reveal>
      ) : (
        <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clientSections.map((section) => {
            const Icon = section.icon;
            return (
              <StaggerItem key={section.id}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className="focus-ring group w-full h-full bg-card border border-border rounded-xl p-6 text-left transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                >
                  <div className="p-3 rounded-lg bg-primary/10 w-fit mb-3 transition-colors group-hover:bg-primary/20">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{section.label}</h3>
                  <p className="text-sm text-muted-foreground">Visualizar informações</p>
                </button>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </div>
  );
}

// ── Admin view (original) ──

function AdminSistemaView() {
  const [tab, setTab] = useState<Tab>("clientes");

  // A nav lateral que existia aqui foi promovida a abas: o shell do /dashboard
  // ja monta uma sidebar (com o proprio "Sair"), e a segunda aninhada dentro
  // dela consumia largura e duplicava a navegacao.
  const renderContent = (id: Tab) => {
    switch (id) {
      case "clientes": return <ClienteGallery />;
      case "demandas": return <KanbanBoard />;
      case "metas": return <MetasBoard />;
      case "fluxos": return <FluxosPage />;
    }
  };

  return (
    <div className="p-5 sm:p-8 lg:p-10 space-y-6">
      <Reveal>
        <PageHeader title={titles[tab]} subtitle="Sistema Traffic Solutions" icon={FolderKanban} />
      </Reveal>

      <DashTabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <DashTabsList>
          {nav.map((n) => {
            const Icon = n.icon;
            return (
              <DashTabsTrigger key={n.id} value={n.id}>
                <Icon className="h-4 w-4" />
                {n.label}
              </DashTabsTrigger>
            );
          })}
        </DashTabsList>

        {nav.map((n) => (
          <DashTabsPanel key={n.id} value={n.id}>
            {renderContent(n.id)}
          </DashTabsPanel>
        ))}
      </DashTabs>
    </div>
  );
}

// ── Main export ──

const SistemaPage = () => {
  const { isAdmin, isColaborador } = useAuth();

  return isAdmin || isColaborador ? <AdminSistemaView /> : <ClienteSistemaView />;
};

export default SistemaPage;
