import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { success: false, error: "Método não permitido" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse(500, {
      success: false,
      error: "Variáveis de ambiente do Supabase não configuradas",
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse(401, { success: false, error: "Não autenticado" });
  }

  const supabaseAuth = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user: caller },
    error: authError,
  } = await supabaseAuth.auth.getUser();
  if (authError || !caller) {
    return jsonResponse(401, {
      success: false,
      error: "Token inválido ou expirado",
    });
  }

  const { data: isMaster } = await supabaseAuth.rpc("user_is_master", {
    p_user_id: caller.id,
  });
  if (!isMaster) {
    return jsonResponse(403, {
      success: false,
      error: "Apenas o administrador master pode trocar a senha de outro administrador",
    });
  }

  let body: { user_id?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse(200, {
      success: false,
      error: "Corpo da requisição inválido",
    });
  }

  const { user_id, password } = body;

  if (!user_id || !password) {
    return jsonResponse(200, {
      success: false,
      error: "user_id e password são obrigatórios",
    });
  }
  if (password.length < 6) {
    return jsonResponse(200, {
      success: false,
      error: "A senha deve ter no mínimo 6 caracteres",
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: alvo, error: alvoError } = await supabaseAdmin
    .from("admin_users")
    .select("master")
    .eq("user_id", user_id)
    .maybeSingle();

  if (alvoError) {
    return jsonResponse(200, {
      success: false,
      error: "Erro ao verificar administrador: " + alvoError.message,
    });
  }
  if (!alvo) {
    return jsonResponse(200, { success: false, error: "Administrador não encontrado" });
  }
  if (alvo.master) {
    return jsonResponse(200, {
      success: false,
      error: "A senha do administrador master não pode ser alterada por aqui",
    });
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
    password,
  });
  if (updateError) {
    return jsonResponse(200, { success: false, error: updateError.message });
  }

  return jsonResponse(200, { success: true });
});
