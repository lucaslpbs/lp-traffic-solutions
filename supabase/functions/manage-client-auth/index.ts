import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

const jsonResponse = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

  const { data: isAdmin } = await supabaseAuth.rpc("user_is_admin", {
    user_id: caller.id,
  });
  if (!isAdmin) {
    return jsonResponse(403, {
      success: false,
      error: "Apenas administradores podem gerenciar acessos de clientes",
    });
  }

  let body: {
    action: string;
    client_id: string;
    email: string;
    password?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonResponse(200, {
      success: false,
      error: "Corpo da requisição inválido",
    });
  }

  const { action, client_id, email, password } = body;

  if (!action || !client_id || !email) {
    return jsonResponse(200, {
      success: false,
      error: "action, client_id e email são obrigatórios",
    });
  }

  if (action !== "create" && action !== "update") {
    return jsonResponse(200, {
      success: false,
      error: "action deve ser 'create' ou 'update'",
    });
  }

  if (password !== undefined && password !== "" && password.length < 6) {
    return jsonResponse(200, {
      success: false,
      error: "A senha deve ter no mínimo 6 caracteres",
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // deno-lint-ignore no-explicit-any
  function extractErrorMsg(err: any): string {
    const msg = err?.message || String(err);
    if (
      msg.includes("already") ||
      msg.includes("duplicate") ||
      msg.includes("unique")
    ) {
      return "Este email já está cadastrado no sistema";
    }
    return msg || "Erro desconhecido";
  }

  async function createAuthUser(
    userEmail: string,
    userPassword: string,
    clientId: string,
  ) {
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        password: userPassword,
        email_confirm: true,
      });

    if (createError) {
      return { success: false, error: extractErrorMsg(createError) };
    }

    const { error: linkError } = await supabaseAdmin
      .from("users_clients")
      .insert({
        user_id: newUser.user.id,
        client_id: clientId,
        role: "cliente",
      });

    if (linkError) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return {
        success: false,
        error: "Erro ao vincular usuário ao cliente: " + linkError.message,
      };
    }

    return { success: true, user_id: newUser.user.id, email: userEmail };
  }

  try {
    if (action === "create") {
      if (!password) {
        return jsonResponse(200, {
          success: false,
          error: "Senha é obrigatória ao criar um novo acesso",
        });
      }

      const result = await createAuthUser(email, password, client_id);
      return jsonResponse(200, result);
    }

    // action === "update"
    const { data: existingLink } = await supabaseAdmin
      .from("users_clients")
      .select("user_id")
      .eq("client_id", client_id)
      .eq("role", "cliente")
      .maybeSingle();

    if (existingLink) {
      // deno-lint-ignore no-explicit-any
      const updatePayload: Record<string, any> = { email };
      if (password) updatePayload.password = password;

      const { error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(
          existingLink.user_id,
          updatePayload,
        );

      if (updateError) {
        return jsonResponse(200, {
          success: false,
          error: extractErrorMsg(updateError),
        });
      }

      return jsonResponse(200, {
        success: true,
        user_id: existingLink.user_id,
        email,
      });
    }

    // No existing link — treat as first-time creation
    if (!password) {
      return jsonResponse(200, {
        success: false,
        error: "Senha é obrigatória para criar um novo acesso",
      });
    }

    const result = await createAuthUser(email, password, client_id);
    return jsonResponse(200, result);
  } catch (err) {
    return jsonResponse(200, {
      success: false,
      error:
        "Erro interno: " +
        (err instanceof Error ? err.message : String(err)),
    });
  }
});
