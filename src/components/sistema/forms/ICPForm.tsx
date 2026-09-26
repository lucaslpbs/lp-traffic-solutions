import { BulletList, FormShell, SaveButton, SectionTitle, completar } from "./shared";
import { SecaoLoader } from "./SecaoLoader";
import { useSecaoEditor } from "./useClienteSecao";

const SECAO = "icp";
const MIN_ITENS = 3;

const SECOES = [
  { id: "empatizando", titulo: "Com quem estamos empatizando?" },
  { id: "fazer", titulo: "O que queremos que eles façam?" },
  { id: "veem", titulo: "O que eles veem" },
  { id: "falam", titulo: "O que eles falam?" },
  { id: "fazem", titulo: "O que eles fazem?" },
  { id: "escutam", titulo: "O que eles escutam?" },
  { id: "dores", titulo: "Dores" },
  { id: "ganhos", titulo: "Ganhos" },
  { id: "outros", titulo: "Outros pensamentos e sentimentos que motivam o comportamento" },
];

type ICPDados = Record<string, string[]>;

/** Garante todas as secoes, cada uma com ao menos MIN_ITENS linhas para preencher. */
const normalizar = (salvo: Partial<ICPDados>): ICPDados =>
  Object.fromEntries(SECOES.map(({ id }) => [id, completar(salvo[id], MIN_ITENS)]));

interface EditorProps {
  initial: Partial<ICPDados>;
  onSave: (dados: ICPDados) => Promise<void>;
  readOnly: boolean;
}

const ICPEditor = ({ initial, onSave, readOnly }: EditorProps) => {
  const { values, setValues, dirty, saving, saved, onSubmit } = useSecaoEditor<ICPDados>(
    normalizar(initial),
    onSave
  );

  return (
    <FormShell onSubmit={onSubmit}>
      {!readOnly && <SaveButton saved={saved} saving={saving} dirty={dirty} />}
      {SECOES.map(({ id, titulo }) => (
        <section key={id} className="space-y-3">
          <SectionTitle>{titulo}</SectionTitle>
          <BulletList
            items={values[id]}
            setItems={(v) => setValues((prev) => ({ ...prev, [id]: v }))}
            minItems={MIN_ITENS}
            readOnly={readOnly}
          />
        </section>
      ))}
    </FormShell>
  );
};

interface ICPFormProps {
  clientId?: string;
  readOnly?: boolean;
}

export const ICPForm = ({ clientId, readOnly = false }: ICPFormProps) => (
  <SecaoLoader<ICPDados> clientId={clientId} secao={SECAO} rotulo="o ICP">
    {({ initial, save }) => <ICPEditor initial={initial} onSave={save} readOnly={readOnly} />}
  </SecaoLoader>
);
