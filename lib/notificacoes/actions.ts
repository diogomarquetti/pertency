"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";

import { getNotificacoes, type NotificacoesDoUsuario } from "./index";

/** Recarrega o sino a cada navegação/abertura — o layout não re-renderiza ao trocar de página. */
export async function carregarNotificacoes(): Promise<NotificacoesDoUsuario> {
  return getNotificacoes();
}

export async function marcarComoLida(id: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase
    .from("notificacoes")
    .update({ lida_em: new Date().toISOString() })
    .eq("id", id)
    .eq("destinatario_id", user.id)
    .is("lida_em", null);
}

export async function marcarTodasComoLidas() {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase
    .from("notificacoes")
    .update({ lida_em: new Date().toISOString() })
    .eq("destinatario_id", user.id)
    .is("lida_em", null);
}
