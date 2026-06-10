const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// deno-lint-ignore no-explicit-any
const extractToken = (data: any): string | null => data?.token ?? data?.instance?.token ?? null;

// deno-lint-ignore no-explicit-any
const extractStatus = (data: any): string | null =>
  data?.instance?.status ?? data?.status ?? (data?.connected ? "connected" : null);

// deno-lint-ignore no-explicit-any
const extractQrcode = (data: any): string | null => data?.instance?.qrcode ?? data?.qrcode ?? null;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Método não permitido" });
  }

  const UAZAPI_URL = Deno.env.get("UAZAPI_URL");
  const UAZAPI_ADMINTOKEN = Deno.env.get("UAZAPI_ADMINTOKEN");
  if (!UAZAPI_URL || !UAZAPI_ADMINTOKEN) {
    return jsonResponse(500, { error: "UAZAPI_URL ou UAZAPI_ADMINTOKEN não configurados" });
  }

  let instanceName: string | undefined;
  try {
    ({ instanceName } = await req.json());
  } catch {
    return jsonResponse(400, { error: "Corpo da requisição inválido" });
  }

  if (!instanceName) {
    return jsonResponse(400, { error: "instanceName é obrigatório" });
  }

  try {
    const allRes = await fetch(`${UAZAPI_URL}/instance/all`, {
      headers: { admintoken: UAZAPI_ADMINTOKEN },
    });
    const allData = await allRes.json();
    const instances = Array.isArray(allData) ? allData : allData?.instances ?? [];
    // deno-lint-ignore no-explicit-any
    let instance = instances.find((i: any) => i?.name === instanceName);

    if (!instance) {
      const createRes = await fetch(`${UAZAPI_URL}/instance/create`, {
        method: "POST",
        headers: {
          admintoken: UAZAPI_ADMINTOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: instanceName }),
      });
      const createData = await createRes.json();
      instance = createData?.instance ?? createData;
    }

    const instanceToken = extractToken(instance);
    if (!instanceToken) {
      return jsonResponse(502, { error: "Não foi possível obter o token da instância" });
    }

    if (extractStatus(instance) === "connected") {
      return jsonResponse(200, { instanceToken, qrcode: null, alreadyConnected: true });
    }

    await fetch(`${UAZAPI_URL}/instance/connect`, {
      method: "POST",
      headers: { token: instanceToken },
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const statusRes = await fetch(`${UAZAPI_URL}/instance/status`, {
      headers: { token: instanceToken },
    });
    const statusData = await statusRes.json();

    if (extractStatus(statusData) === "connected") {
      return jsonResponse(200, { instanceToken, qrcode: null, alreadyConnected: true });
    }

    return jsonResponse(200, {
      instanceToken,
      qrcode: extractQrcode(statusData),
      alreadyConnected: false,
    });
  } catch (err) {
    return jsonResponse(500, {
      error: "Falha ao comunicar com a UazAPI",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});
