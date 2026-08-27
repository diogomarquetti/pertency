import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Troca o token de um link de e-mail (recovery/invite/magiclink) por uma
 * sessão de verdade, via cookies — precisa rodar no servidor porque o
 * client do navegador (`lib/supabase/client.ts`) usa `flowType: "pkce"`
 * (padrão do @supabase/ssr) e não processa os tokens no formato antigo
 * (#access_token=...) que `admin.generateLink` devolve. `gerarLinkAcesso`
 * (app/(app)/usuarios/actions.ts) já aponta o link pra cá, com
 * `token_hash`/`type` na query, em vez de usar o `action_link` bruto.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type) {
    const supabase = await createClient();
    await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  }

  // Sucesso ou falha, o destino é sempre o mesmo — a página confere se a
  // sessão foi mesmo criada (`supabase.auth.getUser()`) e decide sozinha
  // entre mostrar o formulário ou o aviso de link inválido/expirado.
  redirect("/redefinir-senha");
}
