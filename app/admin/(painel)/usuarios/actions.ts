"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { apenasDigitos } from "@/lib/telefone";
import { requireOperador } from "@/lib/supabase/require-operador";
import {
  atualizarUsuario as atualizarUsuarioDaEscola,
  gerarLinkDeAcesso,
  provisionarUsuario,
  telefoneDuplicadoCom,
} from "@/lib/usuarios/acesso";

import { usuarioPlataformaSchema, type UsuarioPlataformaValues } from "./schema";

export async function verificarTelefone(telefone: string, usuarioId: string | null, escolaId: string) {
  const context = await requireOperador();
  if ("error" in context || !escolaId || ![10, 11].includes(apenasDigitos(telefone).length)) {
    return { duplicadoCom: null };
  }
  return { duplicadoCom: await telefoneDuplicadoCom(context.supabase, telefone, usuarioId, escolaId) };
}

export async function criarUsuario(values: UsuarioPlataformaValues) {
  const parsed = usuarioPlataformaSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const { escolaId, ...data } = parsed.data;

  const context = await requireOperador();
  if ("error" in context) return context;
  const { supabase } = context;

  const { data: escola } = await supabase.from("escolas").select("status").eq("id", escolaId).maybeSingle();
  if (!escola) return { error: "Escola não encontrada." };
  if (escola.status !== "ativa") return { error: "Esta escola está inativa." };

  // created_by aponta para `usuarios`; operador não tem linha lá.
  const result = await provisionarUsuario({ supabase, escolaId, criadoPor: null, data });
  if ("error" in result) return result;

  revalidatePath("/admin/usuarios");
  redirect(`/usuarios/${result.id}?criado=1`);
}

export async function atualizarUsuario(id: string, values: UsuarioPlataformaValues) {
  const parsed = usuarioPlataformaSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  // A escola do usuário não muda depois de criado — vale a gravada, não a do formulário.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { escolaId: _escolaId, ...data } = parsed.data;

  const context = await requireOperador();
  if ("error" in context) return context;
  const { supabase } = context;

  const { data: atual } = await supabase.from("usuarios").select("escola_id").eq("id", id).maybeSingle();
  if (!atual) return { error: "Usuário não encontrado." };

  const result = await atualizarUsuarioDaEscola({ supabase, id, escolaId: atual.escola_id, data });
  if ("error" in result) return result;

  revalidatePath("/admin/usuarios");
  return { success: true } as const;
}

export async function gerarLink(usuarioId: string): Promise<{ link: string } | { error: string }> {
  const context = await requireOperador();
  if ("error" in context) return context;
  return gerarLinkDeAcesso(context.supabase, usuarioId);
}
