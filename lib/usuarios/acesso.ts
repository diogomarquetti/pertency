import "server-only";

import { headers } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseServerClient } from "@/lib/supabase/require-admin-profile";
import { funcaoTemAreaAtuacao, type CreateUsuarioValues, type UpdateUsuarioValues } from "@/app/(app)/usuarios/schema";
import { telefoneMudou, usuarioComTelefone } from "@/app/(app)/usuarios/telefone-duplicado";

// Criação, edição e link de acesso de um usuário de escola — compartilhado
// pelo Cadastro de Usuários (admin da escola) e pelo admin da plataforma
// (operador). Quem chama já conferiu a permissão e passa o client
// autenticado: a escrita em `usuarios` continua passando pela RLS; só o
// login (auth.users) usa a service role.

type ErroUsuario = { error: string; campo?: "telefone" };

function erroTelefoneDuplicado(nome: string): ErroUsuario {
  return { error: `Este telefone já está cadastrado para ${nome}.`, campo: "telefone" };
}

/**
 * Área de atuação só vale pros perfis que a têm (ver funcaoTemAreaAtuacao) —
 * trocar o perfil de Profissional Complementar pra Professor, por exemplo,
 * limpa a área em vez de deixar um valor órfão. O texto de "Outro" só é
 * guardado quando a área é "outro".
 */
function areaAtuacaoColunas(data: { funcao: string; areaAtuacao?: string; areaAtuacaoOutro?: string }) {
  const area = funcaoTemAreaAtuacao(data.funcao) && data.areaAtuacao ? data.areaAtuacao : null;
  return {
    area_atuacao: area,
    area_atuacao_outro: area === "outro" ? data.areaAtuacaoOutro?.trim() || null : null,
  };
}

function isEmailInUseError(message: string | undefined) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return normalized.includes("already been registered") || normalized.includes("already exists");
}

async function usuarioVisivel(supabase: SupabaseServerClient, id: string) {
  const { data } = await supabase.from("usuarios").select("id").eq("id", id).maybeSingle();
  return !!data;
}

/** Checagem ao sair do campo Telefone. Na edição, telefone igual ao já gravado não é checado. */
export async function telefoneDuplicadoCom(
  supabase: SupabaseServerClient,
  telefone: string,
  usuarioId: string | null,
  escolaId: string,
) {
  if (usuarioId && !(await telefoneMudou(supabase, usuarioId, telefone))) return null;
  const outro = await usuarioComTelefone(supabase, telefone, usuarioId, escolaId);
  return outro?.nome ?? null;
}

export async function provisionarUsuario({
  supabase,
  escolaId,
  criadoPor,
  data,
}: {
  supabase: SupabaseServerClient;
  escolaId: string;
  /** Id em `usuarios` de quem criou — `null` quando é o operador da plataforma. */
  criadoPor: string | null;
  data: CreateUsuarioValues;
}): Promise<{ id: string } | ErroUsuario> {
  // Antes de criar o acesso, pra não deixar login órfão.
  const duplicado = await usuarioComTelefone(supabase, data.telefone, null, escolaId);
  if (duplicado) return erroTelefoneDuplicado(duplicado.nome);

  const admin = createAdminClient();

  // 'invite' é o único tipo de generateLink que cria o usuário de auth do
  // zero (e devolve o id dele) — é assim que o acesso é provisionado, sem
  // senha definida por quem cadastra. O link em si não é mostrado aqui; ele
  // é gerado depois em "Gerar link" (esse já usa 'recovery').
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
    ...areaAtuacaoColunas(data),
    status: data.status,
    created_by: criadoPor,
  });

  if (insertError) {
    // Compensação: desfaz o usuário de auth já criado, para não deixar login
    // órfão sem perfil correspondente em `usuarios`.
    await admin.auth.admin.deleteUser(novoUsuarioId);
    return { error: "Não foi possível salvar o usuário. Tente novamente." };
  }

  return { id: novoUsuarioId };
}

export async function atualizarUsuario({
  supabase,
  id,
  escolaId,
  data,
}: {
  supabase: SupabaseServerClient;
  id: string;
  escolaId: string;
  data: UpdateUsuarioValues;
}): Promise<{ success: true } | ErroUsuario> {
  // A troca do login usa a service role — antes, confere pela RLS que quem
  // chama enxerga este usuário (senão daria pra mexer em conta de outra escola).
  if (!(await usuarioVisivel(supabase, id))) return { error: "Usuário não encontrado." };

  if (await telefoneMudou(supabase, id, data.telefone)) {
    const duplicado = await usuarioComTelefone(supabase, data.telefone, id, escolaId);
    if (duplicado) return erroTelefoneDuplicado(duplicado.nome);
  }

  const admin = createAdminClient();

  const { data: authUser, error: getAuthError } = await admin.auth.admin.getUserById(id);
  if (getAuthError || !authUser.user) {
    return { error: "Usuário não encontrado." };
  }

  if (data.emailLogin !== authUser.user.email) {
    const { error: authUpdateError } = await admin.auth.admin.updateUserById(id, {
      email: data.emailLogin,
      email_confirm: true,
    });
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
      ...areaAtuacaoColunas(data),
      status: data.status,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    return { error: "Não foi possível salvar as alterações." };
  }

  return { success: true };
}

/**
 * Origem do app das escolas, para onde o link de acesso de um usuário de
 * escola tem que apontar — mesmo quando é gerado no admin da plataforma
 * (senão, depois de definir a senha, ele cairia no admin). Em produção vem
 * de PERTENCY_ESCOLAS_URL no deploy do admin; sem ela, é o host da própria
 * requisição sem o prefixo `admin.` (localmente: admin.localhost:3000 →
 * localhost:3000).
 */
async function origemAppEscolas() {
  const configurada = process.env.PERTENCY_ESCOLAS_URL;
  if (configurada) return configurada.replace(/\/$/, "");

  const headersList = await headers();
  const host = (headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "").replace(/^admin\./, "");
  const proto = headersList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return host ? `${proto}://${host}` : "";
}

/**
 * Gera um link de acesso pro usuário já existente — 'recovery', não
 * 'invite', porque nesse ponto o usuário de auth já existe (FK
 * usuarios.id -> auth.users.id garante isso). Não persiste nada.
 */
export async function gerarLinkDeAcesso(
  supabase: SupabaseServerClient,
  usuarioId: string,
): Promise<{ link: string } | { error: string }> {
  // Mesmo cuidado de atualizarUsuario: só gera link de quem a RLS deixa ver —
  // nunca de conta de outra escola nem de operador da plataforma.
  if (!(await usuarioVisivel(supabase, usuarioId))) return { error: "Usuário não encontrado." };

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
  // (app/auth/confirm), que troca o hashed_token por uma sessão via cookie
  // no servidor — funciona com qualquer flowType.
  const origem = await origemAppEscolas();
  return { link: `${origem}/auth/confirm?token_hash=${data.properties.hashed_token}&type=recovery` };
}
