import type { StepId } from "./state";

/**
 * PONTO DE INTEGRAÇÃO FUTURA
 * Aqui entra a chamada ao webhook/API que vai persistir cada resposta do
 * diagnóstico conforme a pessoa preenche o formulário (não só ao final).
 * Hoje esta função só loga no console — nenhuma requisição de rede é feita
 * e o estado já é atualizado localmente pelo próprio formulário.
 */
export function saveProgress(stepId: StepId, data: unknown) {
  console.info(`[diagnostico-estruture] progresso · ${stepId}`, data);
}
