"use server";

import { revalidatePath } from "next/cache";

import { requireCondicaoWriteProfile } from "@/lib/supabase/require-admin-profile";

import { condicaoSchema, type CondicaoValues } from "./condicoes-schema";

/**
 * Salva uma condição (Bloco 1 da Aba 5) — cria se `condicaoId` não for
 * informado, atualiza caso contrário. Sem "só o autor edita" aqui: quem
 * chega até esta ação já passou pelo guard restrito
 * (administrador/coordenação pedagógica), não existe um "dono" individual
 * do registro como em Contribuições complementares.
 */
export async function salvarCondicao(
  estudanteId: string,
  values: CondicaoValues,
  condicaoId?: string,
) {
  const parsed = condicaoSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireCondicaoWriteProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, userId, escolaId } = context;

  const row = {
    estudante_id: estudanteId,
    escola_id: escolaId,
    tipo_condicao: data.tipoCondicao,
    documento_id: data.documentoId || null,
    observacoes: data.observacoes || null,
    cid: data.cid || null,
  };

  const { error } = condicaoId
    ? await supabase.from("condicoes_estudante").update(row).eq("id", condicaoId)
    : await supabase.from("condicoes_estudante").insert({ ...row, created_by: userId });

  if (error) {
    return { error: "Não foi possível salvar a condição. Tente novamente." };
  }

  revalidatePath(`/estudantes/${estudanteId}/editar`);
  return { success: true } as const;
}

export async function removerCondicao(estudanteId: string, condicaoId: string) {
  const context = await requireCondicaoWriteProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase } = context;

  const { error } = await supabase.from("condicoes_estudante").delete().eq("id", condicaoId);

  if (error) {
    return { error: "Não foi possível remover a condição." };
  }

  revalidatePath(`/estudantes/${estudanteId}/editar`);
  return { success: true } as const;
}
