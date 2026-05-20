import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const inviteWorkshopUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    email: z.string().email(),
    nome: z.string().min(2),
    cargo: z.string()
  }))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;

    // 1. Verify caller permissions (must be DONO or GERENTE)
    const { data: caller, error: callerError } = await supabase
      .from("usuarios")
      .select("cargo, oficina_id")
      .eq("id", userId)
      .single();

    if (callerError || !caller) throw new Error("Usuário não encontrado");
    if (caller.cargo !== "DONO" && caller.cargo !== "GERENTE") {
      throw new Error("Permissão negada: apenas DONO ou GERENTE podem convidar usuários");
    }

    // 2. Invite user via Supabase Admin
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      data.email,
      { 
        data: { full_name: data.nome },
        redirectTo: process.env.SITE_URL || "https://crmofic.lovable.app"
      }
    );

    if (inviteError) throw inviteError;
    if (!inviteData.user) throw new Error("Erro ao criar convite");

    // 3. Create entry in public.usuarios
    const { error: dbError } = await supabaseAdmin
      .from("usuarios")
      .insert([{
        id: inviteData.user.id,
        oficina_id: caller.oficina_id,
        nome: data.nome,
        email: data.email,
        cargo: data.cargo,
        ativo: true
      }]);

    if (dbError) throw dbError;

    return { success: true, userId: inviteData.user.id };
  });
