import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { AutoTextarea, SaveButton } from "./forms/shared";
import { useClienteSecao, useSecaoEditor } from "./forms/useClienteSecao";

const SECAO = "persona";

const PERSONA_SECOES = [
  {
    titulo: "Identificação",
    campos: [
      { id: "nome", label: "Nome" },
      { id: "idade", label: "Idade" },
      { id: "genero", label: "Gênero" },
      { id: "onde_mora", label: "Onde mora" },
      { id: "status_relacionamento", label: "Status de relacionamento" },
      { id: "interesses", label: "Interesses" },
    ],
  },
  {
    titulo: "Objetivos e motivações",
    campos: [
      { id: "desejos", label: "Desejos", placeholder: "• item" },
      { id: "o_que_querem", label: "O que querem" },
      { id: "o_que_fazem", label: "O que fazem" },
      { id: "o_que_falam", label: "O que falam" },
      { id: "o_que_pensam", label: "O que pensam" },
    ],
  },
  {
    titulo: "Desafios",
    campos: [
      { id: "frustracoes", label: "Maiores frustrações" },
      { id: "necessidades", label: "Maiores necessidades" },
      { id: "dores", label: "Maiores dores" },
    ],
  },
  {
    titulo: "Trabalho",
    campos: [
      { id: "escolaridade", label: "Grau de escolaridade" },
      { id: "onde_trabalha", label: "Onde trabalha" },
      { id: "setor", label: "Setor que atua" },
      { id: "tamanho_empresa", label: "Tamanho da empresa" },
      { id: "cargo", label: "Cargo / Profissão" },
      { id: "habilidades", label: "Habilidades boas e ruins" },
      { id: "como_medido", label: "Como o trabalho é medido" },
      { id: "reporta_a", label: "A quem se reporta" },
      { id: "responsabilidades", label: "Responsabilidades" },
      { id: "ferramentas", label: "Ferramentas que usa" },
      { id: "midias_sociais", label: "Mídias sociais que usa" },
    ],
  },
];

type PersonaDados = Record<string, string>;

const inputCls = "bg-background border-border text-foreground";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {children}
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3 rounded-lg border border-border bg-card/40 p-4">
    <h4 className="text-sm font-semibold text-foreground">{title}</h4>
    <div className="grid gap-3 md:grid-cols-2">{children}</div>
  </div>
);

interface EditorProps {
  initial: Partial<PersonaDados>;
  onSave: (dados: PersonaDados) => Promise<void>;
  readOnly: boolean;
}

const PersonaEditor = ({ initial, onSave, readOnly }: EditorProps) => {
  const { values, setValues, dirty, saving, saved, onSubmit } = useSecaoEditor<PersonaDados>(
    { ...initial } as PersonaDados,
    onSave
  );

  const fieldProps = (id: string, placeholder?: string) => ({
    value: values[id] ?? "",
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [id]: e.target.value })),
    readOnly,
    placeholder: readOnly ? "—" : placeholder,
    className: inputCls,
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!readOnly && <SaveButton saved={saved} saving={saving} dirty={dirty} />}

      {PERSONA_SECOES.map((secao) => (
        <Section key={secao.titulo} title={secao.titulo}>
          {secao.campos.map((c) => (
            <Field key={c.id} label={c.label}>
              <AutoTextarea {...fieldProps(c.id, "placeholder" in c ? c.placeholder : undefined)} />
            </Field>
          ))}
        </Section>
      ))}

      <Section title="Razões para usar o produto/serviço">
        <div className="md:col-span-2">
          <AutoTextarea {...fieldProps("razoes", "Foque em benefícios")} className={`${inputCls} min-h-[100px]`} />
        </div>
      </Section>
    </form>
  );
};

interface PersonaFormProps {
  clientId?: string;
  readOnly?: boolean;
}

export const PersonaForm = ({ clientId, readOnly = false }: PersonaFormProps) => {
  const { data, isLoading, isError, save } = useClienteSecao<PersonaDados>(clientId, SECAO);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (isError) {
    return <p className="text-sm text-destructive">Erro ao carregar a persona. Recarregue a página.</p>;
  }

  return <PersonaEditor key={clientId} initial={data ?? {}} onSave={save} readOnly={readOnly} />;
};
