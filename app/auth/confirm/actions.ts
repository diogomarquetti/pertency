"use server";

import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/**
 * Só deve rodar quando a pessoa clica em "Confirmar acesso" — nunca sozinho
 * numa requisição GET. WhatsApp, clientes de e-mail e antivírus corporativos
 * costumam pré-buscar a URL de um link pra gerar prévia ou verificar
 * segurança; como o token é de uso único, essa pré-busca consumiria o link
 * antes da pessoa de fato clicar nele.
 */
export async function confirmarAcesso(
  tokenHash: string,
  type: EmailOtpType,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    return { error: "Link inválido ou expirado." };
  }

  return { success: true } as const;
}
