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

const extractStatus = (data: any): string | null =>
  data?.instance?.status ?? data?.status ?? (data?.connected ? "connected" : null);

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

  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const instanceName = url.searchParams.get("instanceName");

  if (!token) {
    return jsonResponse(400, { error: "Parâmetro token é obrigatório" });
  }

  try {
    const statusRes = await fetch(`${UAZAPI_URL}/instance/status`, {
      headers: { token },
    });
    const statusData = await statusRes.json();

    const connected = extractStatus(statusData) === "connected";
    const qrcode = extractQrcode(statusData);

    if (connected && instanceName) {
      try {
        await fetch("https://n8n.trafficsolutions.cloud/webhook/instancia-conectada", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instanceName,
            connected: true,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (e) {
        console.error("Erro ao notificar n8n:", e);
      }
    }

    return jsonResponse(200, { connected, qrcode });

  } catch (err) {
    return jsonResponse(500, {
      error: "Falha ao consultar status da instância",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});
