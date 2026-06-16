import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-zinc-400">{label}</Label>
    {children}
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
    <h4 className="text-sm font-semibold text-zinc-200">{title}</h4>
    <div className="grid gap-3 md:grid-cols-2">{children}</div>
  </div>
);

export const PersonaForm = () => {
  const [saved, setSaved] = useState(false);
  const inputCls = "bg-zinc-950 border-zinc-800 text-zinc-100";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }}
      className="space-y-4"
    >
      <Section title="Identificação">
        <Field label="Nome"><Input className={inputCls} /></Field>
        <Field label="Idade"><Input className={inputCls} /></Field>
        <Field label="Gênero"><Input className={inputCls} /></Field>
        <Field label="Onde mora"><Input className={inputCls} /></Field>
        <Field label="Status de relacionamento"><Input className={inputCls} /></Field>
        <Field label="Interesses"><Textarea className={inputCls} /></Field>
      </Section>

      <Section title="Objetivos e motivações">
        <Field label="Desejos"><Textarea className={inputCls} placeholder="• item" /></Field>
        <Field label="O que querem"><Textarea className={inputCls} /></Field>
        <Field label="O que fazem"><Textarea className={inputCls} /></Field>
        <Field label="O que falam"><Textarea className={inputCls} /></Field>
        <Field label="O que pensam"><Textarea className={inputCls} /></Field>
      </Section>

      <Section title="Desafios">
        <Field label="Maiores frustrações"><Textarea className={inputCls} /></Field>
        <Field label="Maiores necessidades"><Textarea className={inputCls} /></Field>
        <Field label="Maiores dores"><Textarea className={inputCls} /></Field>
      </Section>

      <Section title="Trabalho">
        <Field label="Grau de escolaridade"><Input className={inputCls} /></Field>
        <Field label="Onde trabalha"><Input className={inputCls} /></Field>
        <Field label="Setor que atua"><Input className={inputCls} /></Field>
        <Field label="Tamanho da empresa"><Input className={inputCls} /></Field>
        <Field label="Cargo / Profissão"><Input className={inputCls} /></Field>
        <Field label="Habilidades boas e ruins"><Textarea className={inputCls} /></Field>
        <Field label="Como o trabalho é medido"><Textarea className={inputCls} /></Field>
        <Field label="A quem se reporta"><Input className={inputCls} /></Field>
        <Field label="Responsabilidades"><Textarea className={inputCls} /></Field>
        <Field label="Ferramentas que usa"><Textarea className={inputCls} /></Field>
        <Field label="Mídias sociais que usa"><Textarea className={inputCls} /></Field>
      </Section>

      <Section title="Razões para usar o produto/serviço">
        <div className="md:col-span-2">
          <Textarea className={inputCls} rows={4} placeholder="Foque em benefícios" />
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-xs text-emerald-400">Salvo</span>}
        <Button type="submit" className="bg-[#3b82f6] hover:bg-[#3b82f6]/90">Salvar</Button>
      </div>
    </form>
  );
};
