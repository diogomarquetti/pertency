import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";

/**
 * Só pra UI decidir o que renderizar (esconder Salvar, travar campos, etc) —
 * não é um guard de escrita. Isso continua sendo `requireAdminProfile()` nas
 * Server Actions, e a RLS por baixo de tudo.
 */
export async function getViewerIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return false;

  const { data } = await supabase
    .from("usuarios")
    .select("funcao")
    .eq("id", user.id)
    .maybeSingle();

  return data?.funcao === "administrador";
}
