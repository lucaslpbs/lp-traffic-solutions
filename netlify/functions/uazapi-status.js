const jsonResponse = (statusCode, data) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

const extractStatus = (data) =>
  data?.instance?.status ?? data?.status ?? (data?.connected ? 'connected' : null);

const extractQrcode = (data) => data?.instance?.qrcode ?? data?.qrcode ?? null;

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Método não permitido' });
  }

  const { UAZAPI_URL } = process.env;
  if (!UAZAPI_URL) {
    return jsonResponse(500, { error: 'UAZAPI_URL não configurada' });
  }

  const token = event.queryStringParameters?.token;
  if (!token) {
    return jsonResponse(400, { error: 'Parâmetro token é obrigatório' });
  }

  try {
    const statusRes = await fetch(`${UAZAPI_URL}/instance/status`, {
      headers: { token },
    });
    const statusData = await statusRes.json();

    return jsonResponse(200, {
      connected: extractStatus(statusData) === 'connected',
      qrcode: extractQrcode(statusData),
    });
  } catch (err) {
    return jsonResponse(500, { error: 'Falha ao consultar status da instância', details: err.message });
  }
};
