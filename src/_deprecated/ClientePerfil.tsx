import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, BookOpen, Target, Library, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ClientInfo {
  nome_cliente: string;
  logo_url: string | null;
}

type SectionId = 'persona' | 'icp' | 'escopo' | 'biblioteca' | null;

const ClienteLogo = ({ url, name, size = 'h-14 w-14' }: { url: string | null | undefined; name: string; size?: string }) => {
  const [broken, setBroken] = useState(false);
  const showImg = url && !broken;
  return showImg ? (
    <img
      src={url}
      alt={name}
      className={`${size} rounded-xl object-cover border border-[#2a2a2a]`}
      onError={() => setBroken(true)}
    />
  ) : (
    <div className={`${size} rounded-xl bg-[#7c3aed]/10 border border-[#2a2a2a] flex items-center justify-center`}>
      <span className="text-[#7c3aed] font-bold text-lg">{name.charAt(0).toUpperCase()}</span>
    </div>
  );
};

const inputCls = 'bg-[#1c1c1e] border-[#2a2a2a] text-white rounded-md cursor-default';

const ReadOnlyField = ({ label, placeholder }: { label: string; placeholder?: string }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-zinc-400">{label}</Label>
    <Input className={inputCls} placeholder={placeholder || '—'} disabled />
  </div>
);

const ReadOnlyTextarea = ({ label, placeholder, rows }: { label: string; placeholder?: string; rows?: number }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-zinc-400">{label}</Label>
    <Textarea className={`${inputCls} min-h-[80px]`} placeholder={placeholder || '—'} disabled rows={rows} />
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-sm font-semibold text-[#a78bfa] uppercase tracking-wide border-b border-[#2a2a2a] pb-2">
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
        <span className="text-[#7c3aed] text-lg leading-none select-none">•</span>
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
  'Com quem estamos empatizando?',
  'O que queremos que eles facam?',
  'O que eles veem',
  'O que eles falam?',
  'O que eles fazem?',
  'O que eles escutam?',
  'Dores',
  'Ganhos',
  'Outros pensamentos e sentimentos que motivam o comportamento',
];

const ICPReadOnly = () => (
  <div className="space-y-6">
    {icpSections.map((s) => (
      <section key={s} className="space-y-3">
        <SectionTitle>{s}</SectionTitle>
        <ReadOnlyBulletList items={['', '', '']} />
      </section>
    ))}
  </div>
);

const EscopoReadOnly = () => (
  <div className="space-y-6">
    <section className="space-y-3">
      <SectionTitle>Links importantes</SectionTitle>
      <ReadOnlyBulletList items={['', '', '']} />
    </section>
    <section className="space-y-3">
      <SectionTitle>Combinados com o cliente</SectionTitle>
      <ReadOnlyBulletList items={['']} />
    </section>
    <section className="space-y-3">
      <SectionTitle>Rotinas definidas</SectionTitle>
      <ReadOnlyBulletList items={['']} />
    </section>
  </div>
);

const BibliotecaReadOnly = () => (
  <div className="space-y-3">
    <SectionTitle>Referencias e materiais de estudo do cliente</SectionTitle>
    <Textarea
      className={`${inputCls} min-h-[400px]`}
      disabled
      placeholder="—"
    />
  </div>
);

const sections = [
  { id: 'persona' as const, label: 'Persona', icon: FileText },
  { id: 'icp' as const, label: 'ICP', icon: Target },
  { id: 'escopo' as const, label: 'Escopo do Trabalho', icon: BookOpen },
  { id: 'biblioteca' as const, label: 'Biblioteca de Referencias', icon: Library },
];

export default function ClientePerfil() {
  const { clienteVinculadoId } = useAuth();
  const navigate = useNavigate();
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionId>(null);

  useEffect(() => {
    if (!clienteVinculadoId) {
      setLoadingClient(false);
      return;
    }

    supabase
      .from('gestao_clientes')
      .select('nome_cliente, logo_url')
      .eq('id', clienteVinculadoId)
      .single()
      .then(({ data }) => {
        if (data) setClientInfo(data as ClientInfo);
        setLoadingClient(false);
      });
  }, [clienteVinculadoId]);

  if (loadingClient) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#7c3aed]" />
      </div>
    );
  }

  const clientName = clientInfo?.nome_cliente ?? 'Cliente';

  const renderSection = () => {
    switch (activeSection) {
      case 'persona': return <PersonaReadOnly />;
      case 'icp': return <ICPReadOnly />;
      case 'escopo': return <EscopoReadOnly />;
      case 'biblioteca': return <BibliotecaReadOnly />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => activeSection ? setActiveSection(null) : navigate('/hub')}
            className="p-2 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <ClienteLogo url={clientInfo?.logo_url} name={clientName} size="h-12 w-12" />
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activeSection ? sections.find(s => s.id === activeSection)?.label : 'Meu Perfil & Materiais'}
            </h1>
            <p className="text-[#a1a1aa] text-sm">{clientName} — Somente leitura</p>
          </div>
        </div>

        {activeSection ? (
          renderSection()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="group bg-[#1c1c1e] border border-[#2a2a2a] rounded-xl p-6 text-left transition-all duration-300 hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/5 hover:-translate-y-0.5"
                >
                  <div className="p-3 rounded-lg bg-[#7c3aed]/10 w-fit mb-3">
                    <Icon className="h-5 w-5 text-[#7c3aed]" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">{section.label}</h3>
                  <p className="text-sm text-[#a1a1aa]">Visualizar informacoes</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
