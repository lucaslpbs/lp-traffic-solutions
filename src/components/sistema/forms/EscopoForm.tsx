import { BulletList, FormShell, SaveButton, SectionTitle, completar } from "./shared";
import { SecaoLoader } from "./SecaoLoader";
import { useSecaoEditor } from "./useClienteSecao";

interface EscopoDados {
  links: string[];
  combinados: string[];
  rotinas: string[];
}

const normalizar = (salvo: Partial<EscopoDados>): EscopoDados => ({
  links: completar(salvo.links, 3),
  combinados: completar(salvo.combinados, 1),
  rotinas: completar(salvo.rotinas, 1),
});

interface EditorProps {
  initial: Partial<EscopoDados>;
  onSave: (dados: EscopoDados) => Promise<void>;
  readOnly: boolean;
}

const EscopoEditor = ({ initial, onSave, readOnly }: EditorProps) => {
  const { values, setValues, dirty, saving, saved, onSubmit } = useSecaoEditor<EscopoDados>(
    normalizar(initial),
    onSave
  );
  const setCampo = (campo: keyof EscopoDados) => (v: string[]) =>
    setValues((prev) => ({ ...prev, [campo]: v }));

  return (
    <FormShell onSubmit={onSubmit}>
      {!readOnly && <SaveButton saved={saved} saving={saving} dirty={dirty} />}

      <section className="space-y-3">
        <SectionTitle>Links importantes</SectionTitle>
        <BulletList
          items={values.links}
          setItems={setCampo("links")}
          asLink
          readOnly={readOnly}
          placeholders={[
            "Link do contrato",
            "Plano de trabalho ou outros links relacionados ao escopo",
            "Manual de marca",
          ]}
        />
      </section>

      <section className="space-y-3">
        <SectionTitle>Combinados com o cliente</SectionTitle>
        <BulletList items={values.combinados} setItems={setCampo("combinados")} readOnly={readOnly} />
      </section>

      <section className="space-y-3">
        <SectionTitle>Rotinas definidas</SectionTitle>
        <BulletList items={values.rotinas} setItems={setCampo("rotinas")} readOnly={readOnly} />
      </section>
    </FormShell>
  );
};

interface EscopoFormProps {
  clientId?: string;
  readOnly?: boolean;
}

export const EscopoForm = ({ clientId, readOnly = false }: EscopoFormProps) => (
  <SecaoLoader<EscopoDados> clientId={clientId} secao="escopo" rotulo="o escopo do trabalho">
    {({ initial, save }) => <EscopoEditor initial={initial} onSave={save} readOnly={readOnly} />}
  </SecaoLoader>
);
