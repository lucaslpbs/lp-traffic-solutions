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
      error: "Apenas administradores podem gerenciar acessos de influenciadores",
    });
  }

  let body: {
    action: string;
    influenciador_id?: string;
    nome: string;
    email: string;
    telefone: string;
    password?: string;
    valor_stories?: number | null;
    valor_feed?: number | null;
    valor_presencial?: number | null;
    valor_online?: number | null;
    client_ids: string[];
  };
  try {
    body = await req.json();
  } catch {
    return jsonResponse(200, {
      success: false,
      error: "Corpo da requisição inválido",
    });
  }

  const {
    action,
    influenciador_id,
    nome,
    email,
    telefone,
    password,
    valor_stories,
    valor_feed,
    valor_presencial,
    valor_online,
    client_ids,
  } = body;

  if (!action || !nome || !email || !telefone) {
    return jsonResponse(200, {
      success: false,
      error: "action, nome, email e telefone são obrigatórios",
    });
  }

  if (action !== "create" && action !== "update") {
    return jsonResponse(200, {
      success: false,
      error: "action deve ser 'create' ou 'update'",
    });
  }

  if (action === "update" && !influenciador_id) {
    return jsonResponse(200, {
      success: false,
      error: "influenciador_id é obrigatório para atualizar um influenciador",
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

  const valores = {
    valor_stories: valor_stories ?? null,
    valor_feed: valor_feed ?? null,
    valor_presencial: valor_presencial ?? null,
    valor_online: valor_online ?? null,
  };

  async function replaceClientLinks(influenciadorId: string) {
    await supabaseAdmin.from("influenciador_clientes").delete().eq("influenciador_id", influenciadorId);

    if (client_ids?.length) {
      const { error } = await supabaseAdmin
        .from("influenciador_clientes")
        .insert(client_ids.map((client_id) => ({ influenciador_id: influenciadorId, client_id })));
      if (error) return { success: false, error: "Erro ao vincular clientes: " + error.message };
    }

    return { success: true };
  }

  try {
    if (action === "create") {
      if (!password) {
        return jsonResponse(200, {
          success: false,
          error: "Senha é obrigatória ao criar um novo influenciador",
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

      const { data: newInfluenciador, error: profileError } = await supabaseAdmin
        .from("influenciadores")
        .insert({
          user_id: newUser.user.id,
          nome,
          email,
          telefone,
          ...valores,
        })
        .select("id")
        .single();

      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        return jsonResponse(200, {
          success: false,
          error: "Erro ao criar perfil de influenciador: " + profileError.message,
        });
      }

      const linkResult = await replaceClientLinks(newInfluenciador.id);
      if (!linkResult.success) {
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        return jsonResponse(200, linkResult);
      }

      return jsonResponse(200, { success: true, influenciador_id: newInfluenciador.id, user_id: newUser.user.id, email });
    }

    // action === "update"
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("influenciadores")
      .select("user_id")
      .eq("id", influenciador_id!)
      .single();
    if (existingError || !existing) {
      return jsonResponse(200, { success: false, error: "Influenciador não encontrado" });
    }

    // deno-lint-ignore no-explicit-any
    const updatePayload: Record<string, any> = {};
    if (email) updatePayload.email = email;
    if (password) updatePayload.password = password;

    if (Object.keys(updatePayload).length > 0) {
      const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
        existing.user_id,
        updatePayload,
      );
      if (updateAuthError) {
        return jsonResponse(200, { success: false, error: extractErrorMsg(updateAuthError) });
      }
    }

    const { error: profileUpdateError } = await supabaseAdmin
      .from("influenciadores")
      .update({ nome, email, telefone, ...valores })
      .eq("id", influenciador_id!);

    if (profileUpdateError) {
      return jsonResponse(200, {
        success: false,
        error: "Erro ao atualizar perfil de influenciador: " + profileUpdateError.message,
      });
    }

    const linkResult = await replaceClientLinks(influenciador_id!);
    if (!linkResult.success) {
      return jsonResponse(200, linkResult);
    }

    return jsonResponse(200, { success: true, influenciador_id, user_id: existing.user_id, email });
  } catch (err) {
    return jsonResponse(200, {
      success: false,
      error:
        "Erro interno: " +
        (err instanceof Error ? err.message : String(err)),
    });
  }
});
