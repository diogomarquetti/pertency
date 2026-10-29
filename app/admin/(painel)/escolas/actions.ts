"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { escolaParaColunas } from "@/app/(app)/minha-escola/mapeamento";
import { escolaComMantenedoraSchema, type EscolaValues } from "@/app/(app)/minha-escola/schema";
import { requireOperador } from "@/lib/supabase/require-operador";
import { gerarLinkDeAcesso, provisionarUsuario } from "@/lib/usuarios/acesso";
import type { SupabaseServerClient } from "@/lib/supabase/require-admin-profile";

import { administradorEscolaSchema, type AdministradorEscolaValues } from "./administrador-schema";

/**
 * A mantenedora escolhida precisa existir e estar ativa — exceto quando é a
 * que a escola já tinha (manter uma mantenedora que ficou inativa não é
 * escolher uma nova).
 */
async function validarMantenedora(
  supabase: SupabaseServerClient,
  mantenedoraId: string,
  atualDaEscola: string | null,
) {
  const { data } = await supabase.from("mantenedoras").select("status").eq("id", mantenedoraId).maybeSingle();
  if (!data) return "Mantenedora não encontrada.";
  if (data.status !== "ativa" && mantenedoraId !== atualDaEscola) return "Esta mantenedora está inativa.";
  return null;
}

export async function criarEscola(values: EscolaValues) {
  const parsed = escolaComMantenedoraSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireOperador();
  if ("error" in context) return context;
  const { supabase } = context;

  const erroMantenedora = await validarMantenedora(supabase, data.mantenedoraId!, null);
  if (erroMantenedora) return { error: erroMantenedora };

  const { data: criada, error } = await supabase
    .from("escolas")
    .insert({ ...escolaParaColunas(data), mantenedora_id: data.mantenedoraId })
    .select("id")
    .single();

  if (error || !criada) return { error: "Não foi possível criar a escola." };

  // Próximo passo do onboarding é criar o administrador, na própria escola.
  revalidatePath("/admin/escolas");
  redirect(`/escolas/${criada.id}?criada=1`);
}

export async function atualizarEscola(id: string, values: EscolaValues) {
  const parsed = escolaComMantenedoraSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireOperador();
  if ("error" in context) return context;
  const { supabase } = context;

  const { data: atual } = await supabase.from("escolas").select("mantenedora_id").eq("id", id).maybeSingle();
  if (!atual) return { error: "Escola não encontrada." };

  const erroMantenedora = await validarMantenedora(supabase, data.mantenedoraId!, atual.mantenedora_id);
  if (erroMantenedora) return { error: erroMantenedora };

  const { data: atualizada, error } = await supabase
    .from("escolas")
    .update({ ...escolaParaColunas(data), mantenedora_id: data.mantenedoraId })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !atualizada) return { error: "Não foi possível salvar as alterações." };

  revalidatePath("/admin/escolas");
  return { success: true } as const;
}

/**
 * Onboarding: o primeiro administrador da escola. Só enquanto a escola não
 * tem nenhum — depois disso, quem cadastra a equipe é a própria escola.
 */
export async function criarAdministradorEscola(escolaId: string, values: AdministradorEscolaValues) {
  const parsed = administradorEscolaSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const { nomeCompleto, emailLogin, telefone } = parsed.data;

  const context = await requireOperador();
  if ("error" in context) return context;
  const { supabase } = context;

  const { data: escola } = await supabase.from("escolas").select("status").eq("id", escolaId).maybeSingle();
  if (!escola) return { error: "Escola não encontrada." };

  const { count } = await supabase
    .from("usuarios")
    .select("id", { count: "exact", head: true })
    .eq("escola_id", escolaId)
    .eq("funcao", "administrador");
  if (count) return { error: "Esta escola já tem administrador." };

  // created_by aponta para `usuarios`; operador não tem linha lá.
  const result = await provisionarUsuario({
    supabase,
    escolaId,
    criadoPor: null,
    data: {
      nomeCompleto,
      email: emailLogin,
      telefone,
      funcao: "administrador",
      areaAtuacao: "",
      areaAtuacaoOutro: "",
      status: "ativo",
      emailLogin,
    },
  });
  if ("error" in result) return result;

  revalidatePath(`/admin/escolas/${escolaId}`);
  return { success: true } as const;
}

/** Link de acesso do administrador da escola — aponta para o app das escolas. */
export async function gerarLinkAdministrador(usuarioId: string): Promise<{ link: string } | { error: string }> {
  const context = await requireOperador();
  if ("error" in context) return context;

  // Só administradores: o admin da plataforma não mexe no resto da equipe da escola.
  const { data } = await context.supabase
    .from("usuarios")
    .select("id")
    .eq("id", usuarioId)
    .eq("funcao", "administrador")
    .maybeSingle();
  if (!data) return { error: "Usuário não encontrado." };

  return gerarLinkDeAcesso(context.supabase, usuarioId);
}
