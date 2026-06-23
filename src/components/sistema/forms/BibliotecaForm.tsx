import { Textarea } from "@/components/ui/textarea";
import { FormShell, SaveButton, SectionTitle, inputCls, useSaved } from "./shared";

export const BibliotecaForm = () => {
  const { saved, onSubmit } = useSaved();
  return (
    <FormShell onSubmit={onSubmit}>
      <SaveButton saved={saved} />
      <section className="space-y-3">
        <SectionTitle>Referências e materiais de estudo do cliente</SectionTitle>
        <Textarea
          className={`${inputCls} min-h-[400px]`}
          placeholder="Cole links, anote insights, livros, podcasts, vídeos..."
        />
      </section>
    </FormShell>
  );
};
