import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";

export type OperadorAtual = { id: string; nome: string; email: string };

/**
 * O operador da plataforma logado (admin.pertency.com.br), ou `null` se a
 * sessão não é de um operador ativo. A RLS de `operadores_plataforma` só
 * deixa operador ler, então a própria consulta já é a checagem. Guard de
 * escrita continua sendo a RLS (`is_operador()`) por baixo de tudo.
 */
export const getOperadorAtual = cache(async (): Promise<OperadorAtual | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("operadores_plataforma")
    .select("id, nome_completo")
    .eq("id", user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (!data) return null;
  return { id: data.id, nome: data.nome_completo, email: user.email ?? "" };
});
