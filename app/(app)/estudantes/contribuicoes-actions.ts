"use server";

import { revalidatePath } from "next/cache";

import {
  requireContribuicaoWriteProfile,
  requireEstudanteWriteProfile,
} from "@/lib/supabase/require-admin-profile";

import { contribuicaoSchema, type ContribuicaoValues } from "./contribuicoes-schema";

/**
 * Salva uma contribuição complementar — cria se `contribuicaoId` não for
 * informado, atualiza caso contrário. Administrador/secretaria/coordenação
 * lançam em nome de qualquer profissional; um profissional complementar
 * logado só pode criar/editar a própria (RLS por baixo garante o mesmo,
 * isso só dá uma mensagem de erro clara em vez de a policy barrar
 * silenciosamente).
 */
export async function salvarContribuicao(
  estudanteId: string,
  avaliacaoId: string,
  values: ContribuicaoValues,
  contribuicaoId?: string,
) {
  const parsed = contribuicaoSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireContribuicaoWriteProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, userId, escolaId, podeEditarQualquer } = context;

  if (!podeEditarQualquer) {
    if (data.profissionalId !== userId) {
      return { error: "Você só pode registrar sua própria contribuição." };
    }
    if (contribuicaoId) {
      const { data: existente } = await supabase
        .from("avaliacao_contribuicoes")
        .select("profissional_id")
        .eq("id", contribuicaoId)
        .maybeSingle();
      if (existente?.profissional_id !== userId) {
        return { error: "Você só pode editar sua própria contribuição." };
      }
    }
  }

  const row = {
    avaliacao_id: avaliacaoId,
    escola_id: escolaId,
    profissional_id: data.profissionalId,
    area_contribuicao: data.areaContribuicao,
    observacoes: data.observacoes,
    implicacoes_participacao: data.implicacoesParticipacao || null,
    recomendacoes_escolares: data.recomendacoesEscolares || null,
  };

  const { error } = contribuicaoId
    ? await supabase.from("avaliacao_contribuicoes").update(row).eq("id", contribuicaoId)
    : await supabase.from("avaliacao_contribuicoes").insert({ ...row, created_by: userId });

  if (error) {
    return { error: "Não foi possível salvar a contribuição. Tente novamente." };
  }

  revalidatePath(`/estudantes/${estudanteId}/editar`);
  return { success: true } as const;
}

export async function removerContribuicao(estudanteId: string, contribuicaoId: string) {
  const context = await requireEstudanteWriteProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase } = context;

  const { error } = await supabase.from("avaliacao_contribuicoes").delete().eq("id", contribuicaoId);

  if (error) {
    return { error: "Não foi possível remover a contribuição." };
  }

  revalidatePath(`/estudantes/${estudanteId}/editar`);
  return { success: true } as const;
}
