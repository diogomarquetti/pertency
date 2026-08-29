import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";
import type { SupabaseServerClient } from "@/lib/supabase/require-admin-profile";

/**
 * Confere só que existe uma sessão válida — sem checar `funcao`, ao
 * contrário de `requireAdminProfile()`. Uso: Server Actions de
 * autoatendimento (ex: Minha Conta) onde a própria RLS + o trigger
 * `trg_usuarios_prevent_self_escalation` já são a autoridade sobre o que
 * o usuário pode alterar na própria linha.
 */
export async function requireUser(): Promise<
  { error: string } | { supabase: SupabaseServerClient; userId: string }
> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." } as const;
  }

  return { supabase, userId: user.id } as const;
}
