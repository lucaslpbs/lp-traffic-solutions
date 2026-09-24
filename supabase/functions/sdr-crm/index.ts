// CRM do SDR — visao das conversas + 3 acoes (pausar bot, reativar bot, forcar nova
// resposta). Serve dois tipos de usuario:
//   - admin lucaspaulinobs@gmail.com: sem cliente_id no corpo, o SDR da Traffic
//     (+55 85 9608-7727) — tudo que NAO pertence a um cliente cadastrado em crm_clientes.
//     Com cliente_id, o CRM daquele cliente (mesmo escopo que o cliente teria); a acao
//     "clientes" devolve a lista de quem tem CRM. So o admin pode usar essas duas coisas;
//   - cliente com "CRM do SDR" ligado em Gestao de Clientes (gestao_clientes.crm_ativo)
//     e cadastrado em crm_clientes: so as linhas com o token da UAZAPI dele. Qualquer
//     cliente_id/"clientes" vindo dele e recusado (403).
//
// As tabelas do SDR sao unicas e compartilhadas; o que separa os clientes e a coluna
// cliente_traffic_solutions (= token da instancia UAZAPI) em contatos_agente e em
// n8n_chat_histories. Nesta ultima ela e GERADA a partir do session_id, que o n8n grava
// como "<token>:<numero>" (linhas antigas, sem prefixo, ficam com a coluna nula).
// O cliente e SEMPRE derivado do login — nunca de algo enviado no corpo da requisicao.
//
// Roda no Supabase do SDR (xhrcrusqzfckrjghjmgb), onde estao as tabelas. Deploy
// com --no-verify-jwt: o login e do projeto PRINCIPAL do app, entao o token e
// validado aqui consultando o auth do projeto principal.
//
// Secrets (supabase secrets set ... --project-ref xhrcrusqzfckrjghjmgb):
//   SDR_RETRY_WEBHOOK_URL   webhook do N8N que refaz a resposta do SDR da Traffic (admin).
//                           O de cada cliente fica em crm_clientes.retry_webhook_url.
// O SDR pausa/reativa pela coluna contatos_agente.agente ("off" = pausado,
// "recepcionista" = ativo), igual aos nos OFF_AGENT/ON_AGENT do N8N.
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY ja vem injetadas pelo Supabase.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Projeto principal do app (chave anon e publica, a mesma de src/integrations/supabase/client.ts).
const MAIN_URL = "https://twclltazkfvtufbsehsv.supabase.co";
const MAIN_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Y2xsdGF6a2Z2dHVmYnNlaHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDAzNDEsImV4cCI6MjA5NDg3NjM0MX0.9tlBCuOcBNYYR0GZYztMRMLQH0uZdbuKhUX4s6mQHO0";
const ALLOWED_EMAIL = "lucaspaulinobs@gmail.com";
// Ultima mensagem e do lead e esta parada ha mais que isso = "no vacuo".
const VACUO_MINUTOS = 5;
// client_id (gestao_clientes.id) — validado antes de entrar em qualquer consulta.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Quem esta chamando e o que ele pode ver.
type Escopo =
  | { tipo: "admin"; tokensDeClientes: string[] }
  | { tipo: "cliente"; token: string; retryUrl: string | null };

// session_id do n8n vem como "<token>:<numero>" (SDRs por cliente) ou so o numero (legado),
// e o numero pode ser "5585...", "5585...@s.whatsapp.net" etc. O token e um UUID cheio de
// digitos, entao o prefixo TEM que sair antes de extrair os digitos.
const semPrefixo = (s: string) => {
  const i = (s ?? "").indexOf(":");
  return i >= 0 ? s.slice(i + 1) : (s ?? "");
};
const soDigitos = (s: string) => semPrefixo(s).split("@")[0].replace(/\D/g, "");

const textoDaMensagem = (m: any): string => {
  const c = m?.content ?? m?.data?.content ?? "";
  return typeof c === "string" ? c : JSON.stringify(c);
};

const tipoDaMensagem = (m: any): "lead" | "bot" => (m?.type === "human" ? "lead" : "bot");

// created_at das tabelas do n8n e "timestamp without time zone" (UTC).
const paraMs = (ts: string) => new Date(/Z|[+-]\d\d:?\d\d$/.test(ts) ? ts : ts + "Z").getTime();

// Consulta o projeto PRINCIPAL com o login do proprio usuario, entao a RLS de la e quem decide o que ele enxerga.
const consultaPrincipal = async (authHeader: string, caminho: string) => {
  const res = await fetch(`${MAIN_URL}/rest/v1/${caminho}`, {
    headers: { Authorization: authHeader, apikey: MAIN_ANON_KEY },
  });
  if (!res.ok) throw new Error(`Falha ao consultar o projeto principal (${res.status})`);
  return await res.json();
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse(405, { success: false, error: "Método não permitido" });

  const sdrUrl = Deno.env.get("SUPABASE_URL");
  const sdrKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!sdrUrl || !sdrKey) {
    return jsonResponse(500, { success: false, error: "Variáveis de ambiente não configuradas" });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse(401, { success: false, error: "Não autenticado" });

  const userRes = await fetch(`${MAIN_URL}/auth/v1/user`, {
    headers: { Authorization: authHeader, apikey: MAIN_ANON_KEY },
  });
  if (!userRes.ok) return jsonResponse(401, { success: false, error: "Token inválido ou expirado" });
  const user = await userRes.json();

  let body: { action?: string; telefone?: string; cliente_id?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { success: false, error: "Corpo inválido" });
  }

  const sdr = createClient(sdrUrl, sdrKey);
  const ehAdmin = String(user?.email ?? "").toLowerCase() === ALLOWED_EMAIL;

  // Cliente comum nunca escolhe de quem e o CRM: o alvo vem so do login dele. Mandar cliente_id
  // (ou pedir a lista de clientes) so pode ser tentativa de espiar outro CRM — recusa, sem consultar nada.
  if (!ehAdmin && (body.cliente_id !== undefined || body.action === "clientes")) {
    return jsonResponse(403, { success: false, error: "Sem permissão" });
  }

  // ---- Escopo: descobre quem e o usuario e de qual SDR ele pode ver os dados ----
  let escopo: Escopo;
  try {
    if (ehAdmin) {
      // Lista dos clientes que tem CRM, para o Lucas escolher qual abrir.
      if (body.action === "clientes") {
        const { data: vinculos, error } = await sdr
          .from("crm_clientes")
          .select("client_id, nome")
          .order("nome", { ascending: true });
        if (error) throw error;

        // Nome atual e se o CRM segue ligado vem do projeto principal (o admin le todos os clientes).
        // Se essa consulta falhar, cai para o que esta em crm_clientes em vez de esconder a lista.
        const info = new Map<string, { nome: string | null; ativo: boolean | null }>();
        const ids = (vinculos ?? []).map((v: any) => String(v.client_id)).filter((id: string) => UUID_RE.test(id));
        if (ids.length > 0) {
          try {
            const linhas = await consultaPrincipal(
              authHeader,
              `gestao_clientes?select=id,nome_cliente,crm_ativo&id=in.(${ids.join(",")})`
            );
            for (const l of linhas ?? []) info.set(l.id, { nome: l.nome_cliente ?? null, ativo: l.crm_ativo ?? null });
          } catch (e: any) {
            console.error("gestao_clientes indisponivel:", e?.message);
          }
        }

        const clientes = (vinculos ?? [])
          .map((v: any) => {
            const i = info.get(v.client_id);
            return { client_id: v.client_id as string, nome: (i?.nome ?? v.nome ?? v.client_id) as string, ativo: i?.ativo ?? null };
          })
          // So os que estao com o CRM ligado; desconhecido (nao veio do principal) continua aparecendo.
          .filter((c: { ativo: boolean | null }) => c.ativo !== false)
          .map(({ client_id, nome }: { client_id: string; nome: string }) => ({ client_id, nome }));
        return jsonResponse(200, { success: true, clientes });
      }

      if (body.cliente_id !== undefined) {
        // Lucas abrindo o CRM de um cliente: mesmo escopo que o proprio cliente teria.
        if (!UUID_RE.test(String(body.cliente_id))) {
          return jsonResponse(400, { success: false, error: "cliente_id inválido" });
        }
        const { data: vinculo, error } = await sdr
          .from("crm_clientes")
          .select("cliente_traffic_solutions, retry_webhook_url")
          .eq("client_id", body.cliente_id)
          .maybeSingle();
        if (error) throw error;
        if (!vinculo?.cliente_traffic_solutions) {
          return jsonResponse(404, { success: false, error: "Cliente sem CRM configurado" });
        }
        escopo = {
          tipo: "cliente",
          token: vinculo.cliente_traffic_solutions,
          retryUrl: vinculo.retry_webhook_url ?? null,
        };
      } else {
        // Sem cliente_id: o CRM do proprio SDR da Traffic = o que nao pertence a nenhum cliente
        // cadastrado. Se a tabela ainda nao existir, nao trava o CRM dele — so nao ha cliente para excluir.
        const { data, error } = await sdr.from("crm_clientes").select("cliente_traffic_solutions");
        if (error) console.error("crm_clientes indisponivel:", error.message);
        escopo = {
          tipo: "admin",
          // Vai dentro de um filtro .or() do PostgREST: so aceita token "limpo".
          tokensDeClientes: (data ?? [])
            .map((r: any) => String(r.cliente_traffic_solutions))
            .filter((t: string) => /^[A-Za-z0-9._-]+$/.test(t)),
        };
      }
    } else {
      const vinculos = await consultaPrincipal(
        authHeader,
        `users_clients?select=client_id&role=eq.cliente&user_id=eq.${user.id}&limit=1`
      );
      const clientId: string | undefined = vinculos?.[0]?.client_id;
      if (!clientId) return jsonResponse(403, { success: false, error: "Sem permissão" });

      const flags = await consultaPrincipal(authHeader, `gestao_clientes?select=crm_ativo&id=eq.${clientId}&limit=1`);
      if (flags?.[0]?.crm_ativo !== true) {
        return jsonResponse(403, { success: false, error: "CRM não liberado para este cliente" });
      }

      const { data: vinculo, error } = await sdr
        .from("crm_clientes")
        .select("cliente_traffic_solutions, retry_webhook_url")
        .eq("client_id", clientId)
        .maybeSingle();
      if (error) throw error;
      if (!vinculo?.cliente_traffic_solutions) {
        return jsonResponse(403, { success: false, error: "CRM ainda não configurado para este cliente" });
      }
      escopo = {
        tipo: "cliente",
        token: vinculo.cliente_traffic_solutions,
        retryUrl: vinculo.retry_webhook_url ?? null,
      };
    }
  } catch (err: any) {
    return jsonResponse(500, { success: false, error: err?.message ?? "Erro ao validar permissão" });
  }

  // Restringe uma query em contatos_agente / n8n_chat_histories (as duas tem cliente_traffic_solutions)
  // aos dados do SDR do usuario.
  const comEscopo = (q: any) => {
    if (escopo.tipo === "cliente") return q.eq("cliente_traffic_solutions", escopo.token);
    if (escopo.tokensDeClientes.length === 0) return q;
    // "not in" sozinho descartaria as linhas legadas (coluna nula), que sao justamente as da Traffic.
    const lista = escopo.tokensDeClientes.map((t) => `"${t}"`).join(",");
    return q.or(`cliente_traffic_solutions.is.null,cliente_traffic_solutions.not.in.(${lista})`);
  };

  // Historico de um contato: cobre as variacoes de session_id.
  const buscarHistorico = async (telefone: string, limite: number) => {
    const d = soDigitos(telefone);
    // Cliente: so sessoes "<token>:<numero>" dele. Admin: as sem prefixo (SDR da Traffic).
    const prefixo = escopo.tipo === "cliente" ? `${escopo.token}:` : "";
    const sessoes = [d, `${d}@s.whatsapp.net`, telefone].map((v) => `${prefixo}${v}`);
    let q = sdr
      .from("n8n_chat_histories")
      .select("id, session_id, message, created_at")
      .in("session_id", sessoes);
    q = comEscopo(q);
    const { data, error } = await q.order("id", { ascending: false }).limit(limite);
    if (error) throw error;
    return (data ?? []).reverse();
  };

  try {
    switch (body.action) {
      case "list": {
        const [c, h] = await Promise.all([
          comEscopo(sdr.from("contatos_agente").select("user_number, user_name, agente, interesse_duvida, created_at"))
            .order("created_at", { ascending: false })
            .limit(500),
          comEscopo(sdr.from("n8n_chat_histories").select("id, session_id, message, created_at"))
            .order("id", { ascending: false })
            .limit(3000),
        ]);
        if (c.error) throw c.error;
        if (h.error) throw h.error;

        const ultimaPorNumero = new Map<string, any>();
        for (const row of h.data ?? []) {
          const d = soDigitos(row.session_id);
          if (!ultimaPorNumero.has(d)) ultimaPorNumero.set(d, row);
        }

        const agora = Date.now();
        const vistos = new Set<string>();
        const conversas: any[] = [];
        const montar = (numero: string, nome: string | null, agente: string | null, interesse: string | null, criado: string | null) => {
          const ult = ultimaPorNumero.get(soDigitos(numero));
          const quem = ult ? tipoDaMensagem(ult.message) : null;
          const quando: string | null = ult?.created_at ?? null;
          const paradoMin = quando ? (agora - paraMs(quando)) / 60000 : 0;
          conversas.push({
            telefone: numero,
            nome,
            agente,
            interesse,
            criado_em: criado,
            ultima_mensagem: ult ? textoDaMensagem(ult.message).slice(0, 140) : null,
            ultima_de: quem,
            ultima_em: quando,
            no_vacuo: quem === "lead" && paradoMin >= VACUO_MINUTOS,
          });
        };
        for (const ct of c.data ?? []) {
          vistos.add(soDigitos(ct.user_number));
          montar(ct.user_number, ct.user_name, ct.agente, ct.interesse_duvida, ct.created_at);
        }
        for (const [d, row] of ultimaPorNumero) {
          if (!vistos.has(d)) montar(d, null, null, null, row.created_at);
        }
        conversas.sort((a, b) =>
          String(b.ultima_em ?? b.criado_em ?? "").localeCompare(String(a.ultima_em ?? a.criado_em ?? ""))
        );
        return jsonResponse(200, { success: true, conversas });
      }

      case "messages": {
        if (!body.telefone) return jsonResponse(400, { success: false, error: "telefone obrigatório" });
        const hist = await buscarHistorico(body.telefone, 300);
        const mensagens = hist.map((row: any) => ({
          id: row.id,
          de: tipoDaMensagem(row.message),
          texto: textoDaMensagem(row.message),
          em: row.created_at,
        }));
        return jsonResponse(200, { success: true, mensagens });
      }

      case "pause": {
        if (!body.telefone) return jsonResponse(400, { success: false, error: "telefone obrigatório" });
        const agente = "off";
        // Sem o filtro de cliente, o mesmo numero em outro SDR seria pausado junto.
        const { data, error } = await comEscopo(
          sdr.from("contatos_agente").update({ agente }).eq("user_number", body.telefone)
        ).select("user_number");
        if (error) throw error;
        if (!data?.length) {
          return jsonResponse(404, { success: false, error: "Contato não encontrado em contatos_agente" });
        }
        return jsonResponse(200, { success: true, agente });
      }

      case "resume": {
        if (!body.telefone) return jsonResponse(400, { success: false, error: "telefone obrigatório" });
        const agente = "recepcionista";
        const { data, error } = await comEscopo(
          sdr.from("contatos_agente").update({ agente }).eq("user_number", body.telefone)
        ).select("user_number");
        if (error) throw error;
        if (!data?.length) {
          return jsonResponse(404, { success: false, error: "Contato não encontrado em contatos_agente" });
        }
        return jsonResponse(200, { success: true, agente });
      }

      case "retry": {
        if (!body.telefone) return jsonResponse(400, { success: false, error: "telefone obrigatório" });
        const webhook = escopo.tipo === "cliente" ? escopo.retryUrl : Deno.env.get("SDR_RETRY_WEBHOOK_URL");
        if (!webhook) {
          return jsonResponse(500, {
            success: false,
            error:
              escopo.tipo === "cliente"
                ? "Webhook de resposta não configurado para este cliente (crm_clientes.retry_webhook_url)"
                : "SDR_RETRY_WEBHOOK_URL não configurada",
          });
        }

        // O historico ja e restrito ao SDR do usuario: ele so consegue reenviar uma mensagem que
        // um lead do SDR dele realmente mandou, nunca um numero/texto arbitrario.
        const hist = await buscarHistorico(body.telefone, 50);
        // Reenvia a ultima mensagem DO LEAD, mesmo que o historico ja tenha uma resposta
        // do bot depois dela (ex.: a resposta foi gravada mas nao chegou ao WhatsApp).
        const ultima = [...hist].reverse().find((row: any) => tipoDaMensagem(row.message) === "lead");
        if (!ultima) {
          return jsonResponse(409, { success: false, error: "Este contato ainda não tem mensagem do lead no histórico" });
        }
        const res = await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telefone: soDigitos(body.telefone),
            ultima_mensagem: textoDaMensagem(ultima.message),
          }),
        });
        if (!res.ok) return jsonResponse(502, { success: false, error: `N8N respondeu ${res.status}` });
        return jsonResponse(200, { success: true });
      }

      default:
        return jsonResponse(400, { success: false, error: "Ação inválida" });
    }
  } catch (err: any) {
    return jsonResponse(500, { success: false, error: err?.message ?? "Erro inesperado" });
  }
});
