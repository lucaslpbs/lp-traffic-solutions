const jsonResponse = (statusCode, data) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

const extractToken = (data) => data?.token ?? data?.instance?.token ?? null;

const extractStatus = (data) =>
  data?.instance?.status ?? data?.status ?? (data?.connected ? 'connected' : null);

const extractQrcode = (data) => data?.instance?.qrcode ?? data?.qrcode ?? null;

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido' });
  }

  const { UAZAPI_URL, UAZAPI_ADMINTOKEN } = process.env;
  if (!UAZAPI_URL || !UAZAPI_ADMINTOKEN) {
    return jsonResponse(500, { error: 'UAZAPI_URL ou UAZAPI_ADMINTOKEN não configurados' });
  }

  let instanceName;
  try {
    ({ instanceName } = JSON.parse(event.body || '{}'));
  } catch {
    return jsonResponse(400, { error: 'Corpo da requisição inválido' });
  }

  if (!instanceName) {
    return jsonResponse(400, { error: 'instanceName é obrigatório' });
  }

  try {
    const allRes = await fetch(`${UAZAPI_URL}/instance/all`, {
      headers: { admintoken: UAZAPI_ADMINTOKEN },
    });
    const allData = await allRes.json();
    const instances = Array.isArray(allData) ? allData : allData?.instances ?? [];
    let instance = instances.find((i) => i?.name === instanceName);

    if (!instance) {
      const createRes = await fetch(`${UAZAPI_URL}/instance/create`, {
        method: 'POST',
        headers: {
          admintoken: UAZAPI_ADMINTOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: instanceName }),
      });
      const createData = await createRes.json();
      instance = createData?.instance ?? createData;
    }

    const instanceToken = extractToken(instance);
    if (!instanceToken) {
      return jsonResponse(502, { error: 'Não foi possível obter o token da instância' });
    }

    if (extractStatus(instance) === 'connected') {
      return jsonResponse(200, { instanceToken, qrcode: null, alreadyConnected: true });
    }

    await fetch(`${UAZAPI_URL}/instance/connect`, {
      method: 'POST',
      headers: { token: instanceToken },
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const statusRes = await fetch(`${UAZAPI_URL}/instance/status`, {
      headers: { token: instanceToken },
    });
    const statusData = await statusRes.json();

    if (extractStatus(statusData) === 'connected') {
      return jsonResponse(200, { instanceToken, qrcode: null, alreadyConnected: true });
    }

    return jsonResponse(200, {
      instanceToken,
      qrcode: extractQrcode(statusData),
      alreadyConnected: false,
    });
  } catch (err) {
    return jsonResponse(500, { error: 'Falha ao comunicar com a UazAPI', details: err.message });
  }
};
