import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Confere que quem está chamando a Server Action é um administrador com
 * perfil em `usuarios` — a RLS já bloqueia a escrita de qualquer outro
 * jeito, isso só dá uma mensagem de erro clara em vez de um insert/update
 * silenciosamente ignorado pela política. Compartilhado entre features
 * (usuarios, minha-escola, ...) que escrevem em tabelas escopadas por
 * escola_id + funcao=administrador.
 */
export async function requireAdminProfile(): Promise<
  { error: string } | { supabase: SupabaseServerClient; adminId: string; escolaId: string }
> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." } as const;
  }

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("escola_id, funcao")
    .eq("id", user.id)
    .single();

  if (!perfil || perfil.funcao !== "administrador") {
    return { error: "Você não tem permissão para realizar esta ação." } as const;
  }

  return { supabase, adminId: user.id, escolaId: perfil.escola_id as string } as const;
}
