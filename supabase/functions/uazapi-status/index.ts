const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

const jsonResponse = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// deno-lint-ignore no-explicit-any
const extractStatus = (data: any): string | null =>
  data?.instance?.status ?? data?.status ?? (data?.connected ? "connected" : null);

// deno-lint-ignore no-explicit-any
const extractQrcode = (data: any): string | null => data?.instance?.qrcode ?? data?.qrcode ?? null;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse(405, { error: "Método não permitido" });
  }

  const UAZAPI_URL = Deno.env.get("UAZAPI_URL");
  if (!UAZAPI_URL) {
    return jsonResponse(500, { error: "UAZAPI_URL não configurada" });
  }

  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return jsonResponse(400, { error: "Parâmetro token é obrigatório" });
  }

  try {
    const statusRes = await fetch(`${UAZAPI_URL}/instance/status`, {
      headers: { token },
    });
    const statusData = await statusRes.json();

    return jsonResponse(200, {
      connected: extractStatus(statusData) === "connected",
      qrcode: extractQrcode(statusData),
    });
  } catch (err) {
    return jsonResponse(500, {
      error: "Falha ao consultar status da instância",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});
