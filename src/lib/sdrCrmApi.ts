import { supabase } from '@/integrations/supabase/client';

// A funcao roda no Supabase do SDR (onde estao as tabelas), mas autentica com o
// login do projeto principal.
const SDR_CRM_URL = 'https://xhrcrusqzfckrjghjmgb.supabase.co/functions/v1/sdr-crm';

/**
 * `clienteId` (gestao_clientes.id) so tem efeito para o admin Lucas abrindo o CRM de um cliente. Para
 * qualquer outro usuario a funcao ignora o pedido e recusa (403): o cliente e sempre o do proprio login.
 */
export async function sdrCrm<T>(action: string, telefone?: string, clienteId?: string): Promise<T> {
  const { data: sessao } = await supabase.auth.getSession();
  const token = sessao.session?.access_token;
  if (!token) throw new Error('Sessão expirada, faça login novamente');

  const res = await fetch(SDR_CRM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    // undefined some do JSON, entao cliente_id so vai quando o admin escolheu um cliente.
    body: JSON.stringify({ action, telefone, cliente_id: clienteId }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) throw new Error(data?.error || `Erro ${res.status}`);
  return data as T;
}

export interface CrmClienteResumo {
  client_id: string;
  nome: string;
}
