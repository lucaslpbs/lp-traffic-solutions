import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "../roadmap-estruture/roadmap.css";
import { Blob } from "../roadmap-estruture/components/motion-kit";
import { custoLabel } from "../roadmap-estruture/labels";
import { ChoiceGroup, ProdutoList, TextField, YesNo } from "./components/inputs";
import { QuestionScreen } from "./components/QuestionScreen";
import { buildStepOrder, initialFormState, type FormState, type StepId } from "./state";
import { saveProgress } from "./progress";
import { hintDocumento, hintEmail, hintTelefone } from "./validation";
import { buildRoadmapPayload } from "./mockRoadmap";
import {
  canalOptions,
  controleOptions,
  faturamentoOptions,
  fonteOptions,
  funcionariosOptions,
  gestaoTrafegoOptions,
  investimentoOptions,
  operacaoOptions,
  papelOptions,
  pedidosOptions,
  segmentoOptions,
  tipoCnpjOptions,
} from "./options";

function TopoProgresso({ value }: { value: number }) {
  return (
    <div className="fixed left-0 top-0 z-50 h-[3px] w-full" style={{ background: "hsl(var(--rme-paper) / 0.08)" }}>
      <motion.div
        className="h-full"
        style={{ background: "var(--rme-grad-orange)" }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

interface StepDef {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  body?: ReactNode;
  continueLabel?: string;
}

export default function DiagnosticoEstrutureSuaEmpresa() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    document.title = "Diagnóstico | Estruture sua Empresa";
    const meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const criada = !meta;
    const robots = meta ?? document.createElement("meta");
    robots.name = "robots";
    const anterior = robots.content;
    robots.content = "noindex, nofollow";
    if (criada) document.head.appendChild(robots);
    return () => {
      if (criada) robots.remove();
      else robots.content = anterior;
    };
  }, []);

  const stepOrder = useMemo(
    () => buildStepOrder(formState),
    [formState.temCnpj, formState.sabeMargemReal, formState.fazTrafegoPago],
  );
  const clampedIndex = Math.min(stepIndex, stepOrder.length - 1);
  const stepId = stepOrder[clampedIndex];
  const isLastStep = clampedIndex === stepOrder.length - 1;

  function patch(partial: Partial<FormState>) {
    setFormState((prev) => ({ ...prev, ...partial }));
  }

  function goBack() {
    if (clampedIndex === 0) return;
    setDirection(-1);
    setStepIndex(clampedIndex - 1);
  }

  function goNext() {
    saveProgress(stepId, formState);
    if (isLastStep) {
      const payload = buildRoadmapPayload(formState);
      navigate("/roadmap-estruture-sua-empresa", { state: { roadmap: payload } });
      return;
    }
    setDirection(1);
    setStepIndex(clampedIndex + 1);
  }

  const papelAtual = formState.papel || "revendedor";

  const step: StepDef = useMemo(() => {
    switch (stepId) {
      case "nome":
        return {
          eyebrow: "Cadastro",
          title: "Qual o seu nome completo?",
          body: <TextField value={formState.nomeCompleto} onChange={(v) => patch({ nomeCompleto: v })} placeholder="Seu nome" onEnter={goNext} />,
        };
      case "documento":
        return {
          eyebrow: "Cadastro",
          title: "Qual seu CPF ou CNPJ?",
          body: (
            <TextField
              value={formState.documento}
              onChange={(v) => patch({ documento: v })}
              placeholder="000.000.000-00"
              hint={hintDocumento(formState.documento)}
              onEnter={goNext}
            />
          ),
        };
      case "empresa":
        return {
          eyebrow: "Cadastro",
          title: "Nome da sua empresa",
          subtitle: "Se você tiver uma — não é obrigatório.",
          body: (
            <TextField value={formState.nomeEmpresa} onChange={(v) => patch({ nomeEmpresa: v })} placeholder="Nome da empresa (opcional)" onEnter={goNext} />
          ),
        };
      case "email":
        return {
          eyebrow: "Cadastro",
          title: "Qual seu e-mail?",
          body: (
            <TextField
              value={formState.email}
              onChange={(v) => patch({ email: v })}
              placeholder="voce@email.com"
              type="email"
              hint={hintEmail(formState.email)}
              onEnter={goNext}
            />
          ),
        };
      case "telefone":
        return {
          eyebrow: "Cadastro",
          title: "Qual seu telefone/WhatsApp?",
          body: (
            <TextField
              value={formState.telefone}
              onChange={(v) => patch({ telefone: v })}
              placeholder="(00) 00000-0000"
              hint={hintTelefone(formState.telefone)}
              onEnter={goNext}
            />
          ),
        };
      case "segmento":
        return {
          eyebrow: "Perfil do negócio",
          title: "Qual seu segmento?",
          body: (
            <>
              <ChoiceGroup value={formState.segmento} onChange={(v) => patch({ segmento: v })} options={segmentoOptions} columns={2} />
              {formState.segmento === "outro" && (
                <TextField value={formState.segmentoOutro} onChange={(v) => patch({ segmentoOutro: v })} placeholder="Qual segmento?" autoFocus onEnter={goNext} />
              )}
            </>
          ),
        };
      case "operacao":
        return {
          eyebrow: "Perfil do negócio",
          title: "Você vende atacado, varejo, ou os dois?",
          body: <ChoiceGroup value={formState.operacao} onChange={(v) => patch({ operacao: v })} options={operacaoOptions} />,
        };
      case "cnpj":
        return {
          eyebrow: "Perfil do negócio",
          title: "Você tem CNPJ aberto?",
          body: <YesNo value={formState.temCnpj} onChange={(v) => patch({ temCnpj: v, tipoCnpj: v ? formState.tipoCnpj : "" })} />,
        };
      case "tipoCnpj":
        return {
          eyebrow: "Perfil do negócio",
          title: "Qual tipo?",
          body: <ChoiceGroup value={formState.tipoCnpj} onChange={(v) => patch({ tipoCnpj: v })} options={tipoCnpjOptions} />,
        };
      case "canal":
        return {
          eyebrow: "Perfil do negócio",
          title: "Seu canal de venda é presencial/feira, online, ou ambos?",
          body: <ChoiceGroup value={formState.canal} onChange={(v) => patch({ canal: v })} options={canalOptions} />,
        };
      case "instagram":
        return {
          eyebrow: "Perfil do negócio",
          title: "Qual seu Instagram?",
          subtitle: "@ ou link — opcional.",
          body: <TextField value={formState.instagram} onChange={(v) => patch({ instagram: v })} placeholder="@seuusuario (opcional)" onEnter={goNext} />,
        };
      case "papel":
        return {
          eyebrow: "Revendedor ou fabricante",
          title: "Você revende produto pronto ou fabrica o que vende?",
          body: <ChoiceGroup value={formState.papel} onChange={(v) => patch({ papel: v })} options={papelOptions} />,
        };
      case "faturamento":
        return {
          eyebrow: "Números do negócio",
          title: "Qual seu faturamento médio mensal?",
          body: <ChoiceGroup value={formState.faturamentoMensal} onChange={(v) => patch({ faturamentoMensal: v })} options={faturamentoOptions} />,
        };
      case "pedidos":
        return {
          eyebrow: "Números do negócio",
          title: "Quantas vendas/pedidos você faz por mês?",
          body: <ChoiceGroup value={formState.pedidosMes} onChange={(v) => patch({ pedidosMes: v })} options={pedidosOptions} />,
        };
      case "funcionarios":
        return {
          eyebrow: "Números do negócio",
          title: "Quantos funcionários você tem hoje?",
          body: <ChoiceGroup value={formState.funcionarios} onChange={(v) => patch({ funcionarios: v })} options={funcionariosOptions} />,
        };
      case "vendedores":
        return {
          eyebrow: "Números do negócio",
          title: "Você tem vendedor(es) especificamente de vendas, além de você?",
          body: (
            <>
              <YesNo
                value={formState.temVendedores}
                onChange={(v) => patch({ temVendedores: v, quantidadeVendedores: v ? formState.quantidadeVendedores : "" })}
              />
              {formState.temVendedores && (
                <TextField
                  value={formState.quantidadeVendedores}
                  onChange={(v) => patch({ quantidadeVendedores: v })}
                  placeholder="Quantos?"
                  type="number"
                  autoFocus
                  onEnter={goNext}
                />
              )}
            </>
          ),
        };
      case "controle":
        return {
          eyebrow: "Números do negócio",
          title: "Você usa CRM, planilha, caderno ou WhatsApp sem controle?",
          body: <ChoiceGroup value={formState.controle} onChange={(v) => patch({ controle: v })} options={controleOptions} />,
        };
      case "sabeMargem":
        return {
          eyebrow: "Margem",
          title: "Você sabe qual é a sua margem de lucro real hoje?",
          body: <YesNo value={formState.sabeMargemReal} onChange={(v) => patch({ sabeMargemReal: v })} />,
        };
      case "margemPercentual":
        return {
          eyebrow: "Margem",
          title: "Qual sua margem média, em %?",
          body: <TextField value={formState.margemPercentual} onChange={(v) => patch({ margemPercentual: v })} placeholder="Ex: 35" type="number" onEnter={goNext} />,
        };
      case "margemDesconta":
        return {
          eyebrow: "Margem",
          title: "Essa margem já desconta frete, embalagem e taxa de cartão?",
          subtitle: "Ou é só preço de compra/custo vs. preço de venda?",
          body: (
            <YesNo
              value={formState.descontaCustosVariaveis}
              onChange={(v) => patch({ descontaCustosVariaveis: v })}
              yesLabel="Já desconta tudo"
              noLabel="Só compra vs. venda"
            />
          ),
        };
      case "produtos":
        return {
          eyebrow: "Margem",
          title: "Vamos calcular junto. Liste seus produtos:",
          subtitle: `Para cada um: nome, ${custoLabel(papelAtual).toLowerCase()} e preço de venda.`,
          body: <ProdutoList produtos={formState.produtos} onChange={(produtos) => patch({ produtos })} custoLabel={custoLabel(papelAtual)} />,
          continueLabel: "Finalizar lista",
        };
      case "fonteCliente":
        return {
          eyebrow: "Aquisição de clientes",
          title: "Como você consegue a maioria dos seus clientes hoje?",
          body: <ChoiceGroup value={formState.fonteCliente} onChange={(v) => patch({ fonteCliente: v })} options={fonteOptions} />,
        };
      case "trafegoPago":
        return {
          eyebrow: "Aquisição de clientes",
          title: "Você já faz tráfego pago hoje?",
          body: <YesNo value={formState.fazTrafegoPago} onChange={(v) => patch({ fazTrafegoPago: v })} />,
        };
      case "gestaoTrafego":
        return {
          eyebrow: "Aquisição de clientes",
          title: "Você mesmo cuida ou contrata alguém?",
          body: <ChoiceGroup value={formState.gestaoTrafego} onChange={(v) => patch({ gestaoTrafego: v })} options={gestaoTrafegoOptions} />,
        };
      case "investimento":
        return {
          eyebrow: "Aquisição de clientes",
          title: "Quanto você investe por mês, aproximadamente?",
          body: <ChoiceGroup value={formState.investimentoMensal} onChange={(v) => patch({ investimentoMensal: v })} options={investimentoOptions} />,
        };
      default:
        return { eyebrow: "", title: "" };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId, formState, papelAtual]);

  const progresso = ((clampedIndex + 1) / stepOrder.length) * 100;

  return (
    <main className="rme-root rme-grain relative min-h-[100svh] overflow-hidden">
      <Blob color="hsl(var(--rme-orange-deep))" size={620} top={-160} right={-140} opacity={0.22} speed={110} />
      <Blob color="hsl(var(--rme-orange))" size={420} bottom={-120} left={-100} opacity={0.14} speed={-80} />
      <TopoProgresso value={progresso} />

      <div className="relative z-10 flex min-h-[100svh] items-center justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <QuestionScreen
            key={stepId}
            stepKey={stepId as StepId}
            direction={direction}
            eyebrow={step.eyebrow}
            title={step.title}
            subtitle={step.subtitle}
            onBack={clampedIndex > 0 ? goBack : undefined}
            showBack={clampedIndex > 0}
            onContinue={goNext}
            continueLabel={step.continueLabel ?? (isLastStep ? "Ver meu roadmap" : "Continuar")}
          >
            {step.body}
          </QuestionScreen>
        </AnimatePresence>
      </div>
    </main>
  );
}
