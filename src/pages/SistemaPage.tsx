// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, ListChecks, ListTodo, Target, Workflow, FileText, BookOpen, Library, BarChart3, Image as ImageIcon, ChevronLeft, FolderKanban, Link2 } from "lucide-react";
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
import { ChecklistBoard } from "@/components/sistema/ChecklistBoard";
import { MetasBoard } from "@/components/sistema/MetasBoard";
import { FluxosPage } from "@/components/sistema/FluxosPage";
import { OtimizacaoForm } from "@/components/sistema/forms/OtimizacaoForm";
import { PersonaForm } from "@/components/sistema/PersonaForm";
import { ICPForm } from "@/components/sistema/forms/ICPForm";
import { CriativosGallery } from "@/components/sistema/CriativosGallery";
import { MinhaPaginaTab } from "@/components/dashboard/MinhaPaginaTab";
import type { LinkItem } from "@/components/linktree/LinkPageEditor";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Tab = "clientes" | "demandas" | "checklist" | "metas" | "fluxos";

const nav: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "demandas", label: "Demandas", icon: ListChecks },
  { id: "checklist", label: "Checklist", icon: ListTodo },
  { id: "metas", label: "Metas", icon: Target },
  { id: "fluxos", label: "Fluxos", icon: Workflow },
];

const titles: Record<Tab, string> = {
  clientes: "Clientes",
  demandas: "Demandas",
  checklist: "Checklist por Cliente",
  metas: "Metas de Clientes",
  fluxos: "Fluxos de Trabalho",
};

// ── Client read-only view components ──

type SectionId = "persona" | "icp" | "escopo" | "biblioteca" | "otimizacao" | "criativos" | "pagina-links" | null;

const inputCls = "bg-surface-2 border-surface-3 text-foreground rounded-md cursor-default";

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-sm font-semibold text-primary uppercase tracking-wide border-b border-surface-3 pb-2">
    {children}
  </h4>
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
  { id: "persona" as const, label: "Persona", icon: FileText, description: "Visualizar informações" },
  { id: "icp" as const, label: "ICP", icon: Target, description: "Visualizar informações" },
  { id: "escopo" as const, label: "Escopo do Trabalho", icon: BookOpen, description: "Visualizar informações" },
  { id: "biblioteca" as const, label: "Biblioteca de Referencias", icon: Library, description: "Visualizar informações" },
  { id: "otimizacao" as const, label: "Otimização", icon: BarChart3, description: "Visualizar informações" },
  { id: "criativos" as const, label: "Criativos", icon: ImageIcon, description: "Visualizar informações" },
  { id: "pagina-links" as const, label: "Página de Links", icon: Link2, description: "Editar conteúdo, cores e links" },
];

function ClienteSistemaView() {
  const { clienteVinculadoId } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionId>(null);

  const { data: clienteData, isLoading: loadingClient, refetch: refetchClienteData } = useQuery({
    queryKey: ['sistema-cliente-info', clienteVinculadoId],
    queryFn: async () => {
      const { data } = await supabase
        .from("gestao_clientes")
        .select(
          "nome_cliente, logo_url, link_page_ativo, link_page_slug, link_page_titulo, link_page_bio, link_page_cor_primaria, link_page_cor_secundaria, link_page_cor_fundo, link_page_links"
        )
        .eq("id", clienteVinculadoId!)
        .single();
      return data as {
        nome_cliente: string;
        logo_url: string | null;
        link_page_ativo: boolean;
        link_page_slug: string | null;
        link_page_titulo: string | null;
        link_page_bio: string | null;
        link_page_cor_primaria: string | null;
        link_page_cor_secundaria: string | null;
        link_page_cor_fundo: string | null;
        link_page_links: LinkItem[];
      } | null;
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
      case "persona": return <PersonaForm clientId={clienteVinculadoId || undefined} readOnly />;
      case "icp": return <ICPForm clientId={clienteVinculadoId || undefined} readOnly />;
      case "escopo": return <EscopoReadOnly />;
      case "biblioteca": return <BibliotecaReadOnly />;
      case "otimizacao": return <OtimizacaoForm clientId={clienteVinculadoId || undefined} readOnly />;
      case "criativos": return <CriativosGallery clientId={clienteVinculadoId || undefined} />;
      case "pagina-links":
        return clienteData ? (
          <MinhaPaginaTab
            slug={clienteData.link_page_slug}
            titulo={clienteData.link_page_titulo}
            bio={clienteData.link_page_bio}
            corPrimaria={clienteData.link_page_cor_primaria}
            corSecundaria={clienteData.link_page_cor_secundaria}
            corFundo={clienteData.link_page_cor_fundo}
            links={clienteData.link_page_links ?? []}
            ativo={clienteData.link_page_ativo}
            onSaved={() => refetchClienteData()}
          />
        ) : null;
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
          subtitle={activeSection === "pagina-links" ? clientName : `${clientName} — Somente leitura`}
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
                  <p className="text-sm text-muted-foreground">{section.description}</p>
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
      case "checklist": return <ChecklistBoard />;
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
