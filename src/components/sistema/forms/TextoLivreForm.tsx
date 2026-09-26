import { Textarea } from "@/components/ui/textarea";
import { FormShell, SaveButton, SectionTitle, inputCls } from "./shared";
import { SecaoLoader } from "./SecaoLoader";
import { useSecaoEditor } from "./useClienteSecao";

interface TextoDados {
  texto: string;
}

interface EditorProps {
  initial: Partial<TextoDados>;
  onSave: (dados: TextoDados) => Promise<void>;
  readOnly: boolean;
  titulo?: string;
  placeholder?: string;
}

const TextoEditor = ({ initial, onSave, readOnly, titulo, placeholder }: EditorProps) => {
  const { values, setValues, dirty, saving, saved, onSubmit } = useSecaoEditor<TextoDados>(
    { texto: initial.texto ?? "" },
    onSave
  );

  return (
    <FormShell onSubmit={onSubmit}>
      {!readOnly && <SaveButton saved={saved} saving={saving} dirty={dirty} />}
      <section className="space-y-3">
        {titulo && <SectionTitle>{titulo}</SectionTitle>}
        <Textarea
          className={`${inputCls} min-h-[400px]`}
          value={values.texto}
          onChange={(e) => setValues({ texto: e.target.value })}
          readOnly={readOnly}
          placeholder={readOnly ? "—" : placeholder}
        />
      </section>
    </FormShell>
  );
};

interface TextoLivreFormProps {
  clientId?: string;
  /** Chave da secao em sistema_cliente_secoes (ex.: "biblioteca"). */
  secao: string;
  rotulo: string;
  titulo?: string;
  placeholder?: string;
  readOnly?: boolean;
}

/** Aba de texto livre: um unico campo grande, salvo por cliente. */
export const TextoLivreForm = ({
  clientId,
  secao,
  rotulo,
  titulo,
  placeholder,
  readOnly = false,
}: TextoLivreFormProps) => (
  <SecaoLoader<TextoDados> clientId={clientId} secao={secao} rotulo={rotulo}>
    {({ initial, save }) => (
      <TextoEditor
        initial={initial}
        onSave={save}
        readOnly={readOnly}
        titulo={titulo}
        placeholder={placeholder}
      />
    )}
  </SecaoLoader>
);
