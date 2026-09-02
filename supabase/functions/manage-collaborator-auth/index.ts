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

  const { data: isAdmin } = await supabaseAuth.rpc("user_is_admin", {
    user_id: caller.id,
  });
  if (!isAdmin) {
    return jsonResponse(403, {
      success: false,
      error: "Apenas administradores podem gerenciar acessos de colaboradores",
    });
  }

  let body: {
    action: string;
    user_id?: string;
    nome: string;
    email: string;
    cargo?: string;
    password?: string;
    client_ids: string[];
    sessoes: string[];
  };
  try {
    body = await req.json();
  } catch {
    return jsonResponse(200, {
      success: false,
      error: "Corpo da requisição inválido",
    });
  }

  const { action, user_id, nome, email, cargo, password, client_ids, sessoes } = body;

  if (!action || !nome || !email) {
    return jsonResponse(200, {
      success: false,
      error: "action, nome e email são obrigatórios",
    });
  }

  if (action !== "create" && action !== "update") {
    return jsonResponse(200, {
      success: false,
      error: "action deve ser 'create' ou 'update'",
    });
  }

  if (action === "update" && !user_id) {
    return jsonResponse(200, {
      success: false,
      error: "user_id é obrigatório para atualizar um colaborador",
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

  async function replacePermissions(collaboratorId: string) {
    await supabaseAdmin.from("colaborador_clientes").delete().eq("user_id", collaboratorId);
    await supabaseAdmin.from("colaborador_sessoes").delete().eq("user_id", collaboratorId);

    if (client_ids?.length) {
      const { error } = await supabaseAdmin
        .from("colaborador_clientes")
        .insert(client_ids.map((client_id) => ({ user_id: collaboratorId, client_id })));
      if (error) return { success: false, error: "Erro ao vincular clientes: " + error.message };
    }

    if (sessoes?.length) {
      const { error } = await supabaseAdmin
        .from("colaborador_sessoes")
        .insert(sessoes.map((sessao) => ({ user_id: collaboratorId, sessao })));
      if (error) return { success: false, error: "Erro ao vincular sessões: " + error.message };
    }

    return { success: true };
  }

  try {
    if (action === "create") {
      if (!password) {
        return jsonResponse(200, {
          success: false,
          error: "Senha é obrigatória ao criar um novo colaborador",
        });
      }

      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

      if (createError) {
        return jsonResponse(200, { success: false, error: extractErrorMsg(createError) });
      }

      const { error: profileError } = await supabaseAdmin.from("colaboradores").insert({
        user_id: newUser.user.id,
        nome,
        email,
        cargo: cargo || null,
      });

      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        return jsonResponse(200, {
          success: false,
          error: "Erro ao criar perfil de colaborador: " + profileError.message,
        });
      }

      const permResult = await replacePermissions(newUser.user.id);
      if (!permResult.success) {
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        return jsonResponse(200, permResult);
      }

      return jsonResponse(200, { success: true, user_id: newUser.user.id, email });
    }

    // action === "update"
    const collaboratorId = user_id!;

    // deno-lint-ignore no-explicit-any
    const updatePayload: Record<string, any> = {};
    if (email) updatePayload.email = email;
    if (password) updatePayload.password = password;

    if (Object.keys(updatePayload).length > 0) {
      const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
        collaboratorId,
        updatePayload,
      );
      if (updateAuthError) {
        return jsonResponse(200, { success: false, error: extractErrorMsg(updateAuthError) });
      }
    }

    // upsert (nao update) porque essa acao tambem e usada pra criar o
    // perfil de colaborador na hora de rebaixar um admin existente pra
    // colaborador — nesse caso ainda nao existe linha em colaboradores.
    const { error: profileUpdateError } = await supabaseAdmin
      .from("colaboradores")
      .upsert({ user_id: collaboratorId, nome, email, cargo: cargo || null });

    if (profileUpdateError) {
      return jsonResponse(200, {
        success: false,
        error: "Erro ao atualizar perfil de colaborador: " + profileUpdateError.message,
      });
    }

    const permResult = await replacePermissions(collaboratorId);
    if (!permResult.success) {
      return jsonResponse(200, permResult);
    }

    return jsonResponse(200, { success: true, user_id: collaboratorId, email });
  } catch (err) {
    return jsonResponse(200, {
      success: false,
      error:
        "Erro interno: " +
        (err instanceof Error ? err.message : String(err)),
    });
  }
});
