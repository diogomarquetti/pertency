"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireOperador } from "@/lib/supabase/require-operador";
import { linkDeRecuperacao, origemDaRequisicao } from "@/lib/usuarios/acesso";

import {
  atualizarOperadorSchema,
  convidarOperadorSchema,
  type AtualizarOperadorValues,
  type ConvidarOperadorValues,
} from "./schema";

// `operadores_plataforma` não tem escrita para o client (só a service role):
// quem barra é requireOperador(), antes de qualquer escrita.

async function buscarLoginPorEmail(email: string) {
  const admin = createAdminClient();
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const encontrado = data.users.find((user) => user.email?.toLowerCase() === email);
    if (encontrado) return encontrado;
    if (data.users.length < 200) return null;
  }
}

export async function convidarOperador(values: ConvidarOperadorValues) {
  const parsed = convidarOperadorSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const email = parsed.data.email.trim().toLowerCase();

  const context = await requireOperador();
  if ("error" in context) return context;

  const admin = createAdminClient();
  const existente = await buscarLoginPorEmail(email);
  let id: string;

  if (existente) {
    // Conta de escola e conta de operador nunca se misturam (o banco também
    // barra): senão o admin da escola poderia trocar o login do operador.
    const { data: usuarioEscola } = await admin.from("usuarios").select("id").eq("id", existente.id).maybeSingle();
    if (usuarioEscola) {
      return { error: "Este e-mail já é login de um usuário de escola. Use outro e-mail." };
    }
    const { data: jaOperador } = await admin
      .from("operadores_plataforma")
      .select("id")
      .eq("id", existente.id)
      .maybeSingle();
    if (jaOperador) return { error: "Este e-mail já é da equipe." };
    id = existente.id;
  } else {
    const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (error || !data.user) return { error: "Não foi possível criar o acesso." };
    id = data.user.id;
  }

  const { error } = await admin
    .from("operadores_plataforma")
    .insert({ id, nome_completo: parsed.data.nomeCompleto, ativo: true });

  if (error) {
    if (!existente) await admin.auth.admin.deleteUser(id);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/admin/usuarios");
  redirect(`/usuarios/${id}?convidado=1`);
}

export async function atualizarOperador(id: string, values: AtualizarOperadorValues) {
  const parsed = atualizarOperadorSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }

  const context = await requireOperador();
  if ("error" in context) return context;

  // Desativar a si mesmo poderia deixar o admin sem ninguém para entrar.
  if (id === context.operadorId && !parsed.data.ativo) {
    return { error: "Você não pode desativar o seu próprio acesso." };
  }

  const { data, error } = await createAdminClient()
    .from("operadores_plataforma")
    .update({ nome_completo: parsed.data.nomeCompleto, ativo: parsed.data.ativo })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) return { error: "Não foi possível salvar as alterações." };

  revalidatePath("/admin/usuarios");
  return { success: true } as const;
}

/** Link de acesso de um operador — aponta para o próprio admin. */
export async function gerarLinkOperador(id: string): Promise<{ link: string } | { error: string }> {
  const context = await requireOperador();
  if ("error" in context) return context;

  const { data } = await context.supabase.from("operadores_plataforma").select("id").eq("id", id).maybeSingle();
  if (!data) return { error: "Usuário não encontrado." };

  return linkDeRecuperacao(id, await origemDaRequisicao());
}
