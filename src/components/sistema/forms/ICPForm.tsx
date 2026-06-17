import { useState } from "react";
import { BulletList, FormShell, SaveButton, SectionTitle, useSaved } from "./shared";

const SECOES = [
  "Com quem estamos empatizando?",
  "O que queremos que eles façam?",
  "O que eles veem",
  "O que eles falam?",
  "O que eles fazem?",
  "O que eles escutam?",
  "Dores",
  "Ganhos",
  "Outros pensamentos e sentimentos que motivam o comportamento",
];

export const ICPForm = () => {
  const { saved, onSubmit } = useSaved();
  const [data, setData] = useState<Record<string, string[]>>(
    Object.fromEntries(SECOES.map((s) => [s, ["", "", ""]]))
  );

  return (
    <FormShell onSubmit={onSubmit}>
      {SECOES.map((s) => (
        <section key={s} className="space-y-3">
          <SectionTitle>{s}</SectionTitle>
          <BulletList
            items={data[s]}
            setItems={(v) => setData({ ...data, [s]: v })}
            minItems={3}
          />
        </section>
      ))}
      <SaveButton saved={saved} />
    </FormShell>
  );
};
