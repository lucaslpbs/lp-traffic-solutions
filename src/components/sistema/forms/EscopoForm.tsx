import { useState } from "react";
import { BulletList, FormShell, SaveButton, SectionTitle, useSaved } from "./shared";

export const EscopoForm = () => {
  const { saved, onSubmit } = useSaved();
  const [links, setLinks] = useState<string[]>(["", "", ""]);
  const [combinados, setCombinados] = useState<string[]>([""]);
  const [rotinas, setRotinas] = useState<string[]>([""]);

  return (
    <FormShell onSubmit={onSubmit}>
      <section className="space-y-3">
        <SectionTitle>Links importantes</SectionTitle>
        <BulletList
          items={links}
          setItems={setLinks}
          asLink
          placeholders={[
            "Link do contrato",
            "Plano de trabalho ou outros links relacionados ao escopo",
            "Manual de marca",
          ]}
        />
      </section>

      <section className="space-y-3">
        <SectionTitle>Combinados com o cliente</SectionTitle>
        <BulletList items={combinados} setItems={setCombinados} />
      </section>

      <section className="space-y-3">
        <SectionTitle>Rotinas definidas</SectionTitle>
        <BulletList items={rotinas} setItems={setRotinas} />
      </section>

      <SaveButton saved={saved} />
    </FormShell>
  );
};
