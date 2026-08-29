import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/**
 * `supabase.auth.getUser()` faz uma chamada de rede pro servidor de Auth
 * (valida o JWT contra a Supabase, não é só ler o cookie) — cada função que
 * precisa saber quem está logado costumava chamar isso por conta própria, e
 * várias delas rodam na mesma renderização (layout + página + queries), o
 * que virou N requisições redundantes por carregamento de página. `cache()`
 * do React garante que, dentro de uma mesma renderização de Server
 * Component, só a primeira chamada bate na rede — as demais reaproveitam o
 * resultado.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
