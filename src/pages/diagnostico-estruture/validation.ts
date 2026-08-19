// Dicas de formato — nunca bloqueiam o avanço, só orientam visualmente.

export function hintDocumento(v: string): string | null {
  if (!v.trim()) return null;
  const digits = v.replace(/\D/g, "");
  return digits.length === 11 || digits.length === 14 ? null : "CPF tem 11 dígitos, CNPJ tem 14.";
}

export function hintEmail(v: string): string | null {
  if (!v.trim()) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Esse e-mail parece incompleto.";
}

export function hintTelefone(v: string): string | null {
  if (!v.trim()) return null;
  const digits = v.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11 ? null : "Confira o DDD e o número.";
}
