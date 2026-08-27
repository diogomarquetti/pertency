"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminProfile, type SupabaseServerClient } from "@/lib/supabase/require-admin-profile";

import {
  createUsuarioSchema,
  updateUsuarioSchema,
  type CreateUsuarioValues,
  type UpdateUsuarioValues,
} from "./schema";

function isEmailInUseError(message: string | undefined) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return normalized.includes("already been registered") || normalized.includes("already exists");
}

type VinculoInput = {
  turmaId: string;
  componenteIds: string[];
};

/**
 * Insere as linhas de usuario_turmas + usuario_turma_componentes para um
 * usuário. Os triggers do banco (trg_usuario_turmas_audit_insert) já cuidam
 * da auditoria — nada a mais pra fazer aqui.
 */
async function persistVinculos(
  supabase: SupabaseServerClient,
  usuarioId: string,
  adminId: string,
  vinculos: VinculoInput[],
) {
  for (const vinculo of vinculos) {
    const { data: usuarioTurma, error: turmaError } = await supabase
      .from("usuario_turmas")
      .insert({ usuario_id: usuarioId, turma_id: vinculo.turmaId, created_by: adminId })
      .select("id")
      .single();

    if (turmaError || !usuarioTurma) {
      throw new Error("Não foi possível salvar um dos vínculos de turma.");
    }

    const { error: componentesError } = await supabase.from("usuario_turma_componentes").insert(
      vinculo.componenteIds.map((componenteId) => ({
        usuario_turma_id: usuarioTurma.id,
        componente_id: componenteId,
      })),
    );

    if (componentesError) {
      throw new Error("Não foi possível salvar os componentes de um vínculo de turma.");
    }
  }
}

/**
 * Substitui por completo os vínculos de turma de um usuário (edição) —
 * apaga tudo e insere de novo, mais simples que diffing e já gera o rastro
 * de auditoria certo (remoção + adição) via triggers. usuario_turma_componentes
 * é apagado em cascata (ON DELETE CASCADE) junto com usuario_turmas.
 */
async function replaceVinculos(
  supabase: SupabaseServerClient,
  usuarioId: string,
  adminId: string,
  vinculos: VinculoInput[],
) {
  const { data: existentes } = await supabase
    .from("usuario_turmas")
    .select("id")
    .eq("usuario_id", usuarioId);

  if (existentes && existentes.length > 0) {
    await supabase
      .from("usuario_turmas")
      .delete()
      .in("id", existentes.map((e) => e.id));
  }

  await persistVinculos(supabase, usuarioId, adminId, vinculos);
}

export async function createUsuario(values: CreateUsuarioValues) {
  const parsed = createUsuarioSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireAdminProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, adminId, escolaId } = context;

  const admin = createAdminClient();

  // 'invite' é o único tipo de generateLink que cria o usuário de auth do
  // zero (e devolve o id dele) — é assim que o acesso é provisionado agora,
  // sem senha definida pelo admin. O link em si não é mostrado aqui (o
  // Server Action termina em redirect); o admin gera um novo em "Gerar link"
  // na tela de edição logo em seguida (esse já usa 'recovery').
  const { data: inviteResult, error: authError } = await admin.auth.admin.generateLink({
    type: "invite",
    email: data.emailLogin,
  });

  if (authError || !inviteResult.user) {
    if (isEmailInUseError(authError?.message)) {
      return { error: "Esse e-mail de login já está em uso." };
    }
    return { error: "Não foi possível criar o acesso do usuário." };
  }

  const novoUsuarioId = inviteResult.user.id;

  const { error: insertError } = await supabase.from("usuarios").insert({
    id: novoUsuarioId,
    escola_id: escolaId,
    nome_completo: data.nomeCompleto,
    email: data.email,
    telefone: data.telefone || null,
    funcao: data.funcao,
    status: data.status,
    created_by: adminId,
  });

  if (insertError) {
    // Compensação: desfaz o usuário de auth já criado, para não deixar login
    // órfão sem perfil correspondente em `usuarios`.
    await admin.auth.admin.deleteUser(novoUsuarioId);
    return { error: "Não foi possível salvar o usuário. Tente novamente." };
  }

  if (data.vinculos.length > 0) {
    try {
      await persistVinculos(supabase, novoUsuarioId, adminId, data.vinculos);
    } catch {
      // O usuário já foi criado com sucesso — não desfazemos por causa de um
      // vínculo de turma. O admin pode entrar em "Editar" e tentar de novo.
      return {
        error:
          "Usuário criado, mas não foi possível salvar os vínculos de turma. Edite o usuário para tentar novamente.",
      };
    }
  }

  revalidatePath("/usuarios");
  redirect(`/usuarios/${novoUsuarioId}/editar?criado=1`);
}

export async function updateUsuario(id: string, values: UpdateUsuarioValues) {
  const parsed = updateUsuarioSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireAdminProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase } = context;

  const admin = createAdminClient();

  const { data: authUser, error: getAuthError } = await admin.auth.admin.getUserById(id);
  if (getAuthError || !authUser.user) {
    return { error: "Usuário não encontrado." };
  }

  const authUpdate: { email?: string; email_confirm?: boolean } = {};
  if (data.emailLogin !== authUser.user.email) {
    authUpdate.email = data.emailLogin;
    authUpdate.email_confirm = true;
  }

  if (Object.keys(authUpdate).length > 0) {
    const { error: authUpdateError } = await admin.auth.admin.updateUserById(id, authUpdate);
    if (authUpdateError) {
      if (isEmailInUseError(authUpdateError.message)) {
        return { error: "Esse e-mail de login já está em uso." };
      }
      return { error: "Não foi possível atualizar o acesso do usuário." };
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("usuarios")
    .update({
      nome_completo: data.nomeCompleto,
      email: data.email,
      telefone: data.telefone || null,
      funcao: data.funcao,
      status: data.status,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    return { error: "Não foi possível salvar as alterações." };
  }

  try {
    await replaceVinculos(supabase, id, context.adminId, data.vinculos);
  } catch {
    return {
      error: "Dados salvos, mas não foi possível atualizar os vínculos de turma.",
    };
  }

  revalidatePath("/usuarios");
  redirect("/usuarios?salvo=1");
}

/**
 * Gera um link de acesso pro usuário já existente (bloco Acesso, tela de
 * edição) — 'recovery', não 'invite', porque nesse ponto o usuário de auth
 * já existe (FK usuarios.id -> auth.users.id garante isso). Não persiste
 * nada, só devolve o link pro admin copiar/enviar.
 */
export async function gerarLinkAcesso(
  usuarioId: string,
): Promise<{ link: string } | { error: string }> {
  const context = await requireAdminProfile();
  if ("error" in context) {
    return context;
  }

  const admin = createAdminClient();

  const { data: authUser, error: getAuthError } = await admin.auth.admin.getUserById(usuarioId);
  if (getAuthError || !authUser.user?.email) {
    return { error: "Usuário não encontrado." };
  }

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: authUser.user.email,
  });

  if (error || !data?.properties?.hashed_token) {
    return { error: "Não foi possível gerar o link de acesso." };
  }

  // Não usamos `action_link` (aponta pro endpoint hospedado do Supabase,
  // que devolve a sessão via #access_token= — formato "implicit" que o
  // client do navegador não processa, já que roda em flowType "pkce", padrão
  // do @supabase/ssr). Em vez disso, montamos um link pra nossa própria rota
  // (app/auth/confirm/route.ts), que troca o hashed_token por uma sessão via
  // cookie no servidor — funciona com qualquer flowType.
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const origin = host ? `${proto}://${host}` : "";

  const link = `${origin}/auth/confirm?token_hash=${data.properties.hashed_token}&type=recovery`;

  return { link };
}
