"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireAdminProfile } from "@/lib/supabase/require-admin-profile";
import { apenasDigitos } from "@/lib/telefone";
import {
  atualizarUsuario,
  gerarLinkDeAcesso,
  provisionarUsuario,
  telefoneDuplicadoCom,
} from "@/lib/usuarios/acesso";

import {
  createUsuarioSchema,
  updateUsuarioSchema,
  type CreateUsuarioValues,
  type UpdateUsuarioValues,
} from "./schema";

/**
 * Checagem ao sair do campo Telefone, antes de salvar. Na edição, telefone
 * igual ao já gravado não é checado (ver telefoneMudou).
 */
export async function verificarTelefoneUsuario(telefone: string, usuarioId: string | null) {
  const context = await requireAdminProfile();
  if ("error" in context || ![10, 11].includes(apenasDigitos(telefone).length)) {
    return { duplicadoCom: null };
  }
  return { duplicadoCom: await telefoneDuplicadoCom(context.supabase, telefone, usuarioId, context.escolaId) };
}

export async function createUsuario(values: CreateUsuarioValues) {
  const parsed = createUsuarioSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }

  const context = await requireAdminProfile();
  if ("error" in context) {
    return context;
  }

  const result = await provisionarUsuario({
    supabase: context.supabase,
    escolaId: context.escolaId,
    criadoPor: context.adminId,
    data: parsed.data,
  });
  if ("error" in result) return result;

  // O link de acesso não é mostrado aqui; o admin gera em "Gerar link" na
  // tela de edição logo em seguida.
  revalidatePath("/usuarios");
  redirect(`/usuarios/${result.id}/editar?criado=1`);
}

export async function updateUsuario(id: string, values: UpdateUsuarioValues) {
  const parsed = updateUsuarioSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }

  const context = await requireAdminProfile();
  if ("error" in context) {
    return context;
  }

  const result = await atualizarUsuario({
    supabase: context.supabase,
    id,
    escolaId: context.escolaId,
    data: parsed.data,
  });
  if ("error" in result) return result;

  revalidatePath("/usuarios");
  redirect("/usuarios?salvo=1");
}

/** Bloco Acesso da tela de edição — só devolve o link pro admin copiar/enviar. */
export async function gerarLinkAcesso(usuarioId: string): Promise<{ link: string } | { error: string }> {
  const context = await requireAdminProfile();
  if ("error" in context) {
    return context;
  }
  return gerarLinkDeAcesso(context.supabase, usuarioId);
}
