// CRM do SDR (+55 85 9608-7727) — visao somente leitura + 2 acoes (pausar bot,
// forcar nova resposta). Exclusivo do admin lucaspaulinobs@gmail.com.
//
// Roda no Supabase do SDR (xhrcrusqzfckrjghjmgb), onde estao as tabelas. Deploy
// com --no-verify-jwt: o login do Lucas e do projeto PRINCIPAL do app, entao o
// token e validado aqui consultando o auth do projeto principal.
//
// Secrets (supabase secrets set ... --project-ref xhrcrusqzfckrjghjmgb):
//   SDR_RETRY_WEBHOOK_URL   webhook do N8N que refaz a resposta do SDR
//   SDR_PAUSED_STATUS       (opcional) valor de contatos_agente.status que o
//                           N8N reconhece como bot pausado. Padrao: "bot pausado"
//   SDR_ACTIVE_STATUS       (opcional) valor gravado ao reativar o bot.
//                           Padrao: null (status vazio = bot ativo)
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY ja vem injetadas pelo Supabase.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Projeto principal do app (chave anon e publica, a mesma de src/integrations/supabase/client.ts).
const MAIN_URL = "https://twclltazkfvtufbsehsv.supabase.co";
const MAIN_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Y2xsdGF6a2Z2dHVmYnNlaHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDAzNDEsImV4cCI6MjA5NDg3NjM0MX0.9tlBCuOcBNYYR0GZYztMRMLQH0uZdbuKhUX4s6mQHO0";
const ALLOWED_EMAIL = "lucaspaulinobs@gmail.com";
// Ultima mensagem e do lead e esta parada ha mais que isso = "no vacuo".
const VACUO_MINUTOS = 5;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// session_id do n8n pode vir como "5585...", "5585...@s.whatsapp.net" etc.
const soDigitos = (s: string) => (s ?? "").split("@")[0].replace(/\D/g, "");

const textoDaMensagem = (m: any): string => {
  const c = m?.content ?? m?.data?.content ?? "";
  return typeof c === "string" ? c : JSON.stringify(c);
};

const tipoDaMensagem = (m: any): "lead" | "bot" => (m?.type === "human" ? "lead" : "bot");

// created_at das tabelas do n8n e "timestamp without time zone" (UTC).
const paraMs = (ts: string) => new Date(/Z|[+-]\d\d:?\d\d$/.test(ts) ? ts : ts + "Z").getTime();

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
  if (String(user?.email ?? "").toLowerCase() !== ALLOWED_EMAIL) {
    return jsonResponse(403, { success: false, error: "Sem permissão" });
  }

  let body: { action?: string; telefone?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { success: false, error: "Corpo inválido" });
  }

  const sdr = createClient(sdrUrl, sdrKey);

  // Historico de um contato: cobre as variacoes de session_id.
  const buscarHistorico = async (telefone: string, limite: number) => {
    const d = soDigitos(telefone);
    const { data, error } = await sdr
      .from("n8n_chat_histories")
      .select("id, session_id, message, created_at")
      .in("session_id", [d, `${d}@s.whatsapp.net`, telefone])
      .order("id", { ascending: false })
      .limit(limite);
    if (error) throw error;
    return (data ?? []).reverse();
  };

  try {
    switch (body.action) {
      case "list": {
        const [c, h] = await Promise.all([
          sdr
            .from("contatos_agente")
            .select("user_number, user_name, status, interesse_duvida, created_at")
            .order("created_at", { ascending: false })
            .limit(500),
          sdr
            .from("n8n_chat_histories")
            .select("id, session_id, message, created_at")
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
        const montar = (numero: string, nome: string | null, status: string | null, interesse: string | null, criado: string | null) => {
          const ult = ultimaPorNumero.get(soDigitos(numero));
          const quem = ult ? tipoDaMensagem(ult.message) : null;
          const quando: string | null = ult?.created_at ?? null;
          const paradoMin = quando ? (agora - paraMs(quando)) / 60000 : 0;
          conversas.push({
            telefone: numero,
            nome,
            status,
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
          montar(ct.user_number, ct.user_name, ct.status, ct.interesse_duvida, ct.created_at);
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
        const status = Deno.env.get("SDR_PAUSED_STATUS") ?? "bot pausado";
        const { data, error } = await sdr
          .from("contatos_agente")
          .update({ status })
          .eq("user_number", body.telefone)
          .select("user_number");
        if (error) throw error;
        if (!data?.length) {
          return jsonResponse(404, { success: false, error: "Contato não encontrado em contatos_agente" });
        }
        return jsonResponse(200, { success: true, status });
      }

      case "resume": {
        if (!body.telefone) return jsonResponse(400, { success: false, error: "telefone obrigatório" });
        const status = Deno.env.get("SDR_ACTIVE_STATUS") ?? null;
        const { data, error } = await sdr
          .from("contatos_agente")
          .update({ status })
          .eq("user_number", body.telefone)
          .select("user_number");
        if (error) throw error;
        if (!data?.length) {
          return jsonResponse(404, { success: false, error: "Contato não encontrado em contatos_agente" });
        }
        return jsonResponse(200, { success: true, status });
      }

      case "retry": {
        if (!body.telefone) return jsonResponse(400, { success: false, error: "telefone obrigatório" });
        const webhook = Deno.env.get("SDR_RETRY_WEBHOOK_URL");
        if (!webhook) return jsonResponse(500, { success: false, error: "SDR_RETRY_WEBHOOK_URL não configurada" });

        const hist = await buscarHistorico(body.telefone, 50);
        const ultima = hist[hist.length - 1];
        if (!ultima || tipoDaMensagem(ultima.message) !== "lead") {
          return jsonResponse(409, { success: false, error: "A última mensagem já é do bot — nada a reenviar" });
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
