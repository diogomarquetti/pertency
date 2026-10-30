import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type UsuarioDaSessao = { id: string; email: string | undefined };

/**
 * Quem está logado, a partir do JWT da sessão. `getClaims()` valida a
 * assinatura localmente (o projeto usa JWT Signing Keys assimétricas, com as
 * chaves públicas em cache) e renova a sessão se o token expirou — sem a ida
 * ao servidor de Auth que `getUser()` faz a cada chamada (~250 ms daqui até
 * o Supabase, e era o primeiro passo em série de toda página e action).
 *
 * O que muda em relação a `getUser()`: uma sessão revogada no servidor (ex:
 * logout em outro aparelho) continua valendo até o token expirar. É o mesmo
 * critério que o PostgREST já usa para aplicar a RLS — quem decide o acesso
 * aos dados continua sendo o banco.
 *
 * `cache()` do React: dentro de uma mesma renderização, só a primeira
 * chamada valida o token — as demais reaproveitam o resultado.
 */
export const getCurrentUser = cache(async (): Promise<UsuarioDaSessao | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data) return null;
  return { id: data.claims.sub, email: data.claims.email };
});
