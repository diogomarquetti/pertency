import { createClient } from "@/lib/supabase/server";
import { getOperadorAtual } from "@/lib/supabase/get-operador";

import type { SupabaseServerClient } from "./require-admin-profile";

/**
 * Mesma ideia de requireAdminProfile(), para as Server Actions do admin da
 * plataforma: só dá uma mensagem de erro clara — quem barra de verdade é a
 * RLS (`is_operador()`).
 */
export async function requireOperador(): Promise<
  { error: string } | { supabase: SupabaseServerClient; operadorId: string }
> {
  const operador = await getOperadorAtual();

  if (!operador) {
    return { error: "Você não tem permissão para realizar esta ação." } as const;
  }

  return { supabase: await createClient(), operadorId: operador.id } as const;
}
