"use server";

import { revalidatePath } from "next/cache";

import { requireCondicaoWriteProfile } from "@/lib/supabase/require-admin-profile";

import { perfilFuncionalSchema, type PerfilFuncionalValues } from "./perfil-funcional-schema";

function toPerfilFuncionalRow(escolaId: string, estudanteId: string, data: PerfilFuncionalValues) {
  return {
    estudante_id: estudanteId,
    escola_id: escolaId,
    meio_comunicacao: data.meioComunicacao || null,
    recursos_caa: data.recursosCaa.length > 0 ? data.recursosCaa : null,
    apoio_alimentacao: data.apoioAlimentacao,
    apoio_higiene: data.apoioHigiene,
    apoio_locomocao: data.apoioLocomocao,
    apoio_avd: data.apoioAvd,
    apoio_avd_checklist: data.apoioAvd && data.apoioAvdChecklist.length > 0 ? data.apoioAvdChecklist : null,
    alergias_restricoes: data.alergiasRestricoes || null,
    necessita_medicacao: data.necessitaMedicacao,
    medicacao_detalhes: data.necessitaMedicacao ? data.medicacaoDetalhes || null : null,
    recursos_acessibilidade: data.recursosAcessibilidade.length > 0 ? data.recursosAcessibilidade : null,
    outras_informacoes: data.outrasInformacoes || null,
    situacoes_atencao: data.situacoesAtencao || null,
    o_que_ajuda: data.oQueAjuda || null,
    seguranca_cuidados: data.segurancaCuidados || null,
  };
}

/**
 * Salva o perfil funcional (Blocos 2/3 da Aba 5) — select+insert/update por
 * `estudante_id` (1:1 de verdade, mesmo padrão defensivo de
 * dados-escolares-actions.ts).
 */
export async function salvarPerfilFuncional(estudanteId: string, values: PerfilFuncionalValues) {
  const parsed = perfilFuncionalSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireCondicaoWriteProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, userId, escolaId } = context;

  const { data: existente } = await supabase
    .from("perfil_funcional_estudante")
    .select("id")
    .eq("estudante_id", estudanteId)
    .maybeSingle();

  const row = toPerfilFuncionalRow(escolaId, estudanteId, data);

  const { error } = existente
    ? await supabase.from("perfil_funcional_estudante").update(row).eq("id", existente.id)
    : await supabase.from("perfil_funcional_estudante").insert({ ...row, created_by: userId });

  if (error) {
    return { error: "Não foi possível salvar as informações. Tente novamente." };
  }

  revalidatePath(`/estudantes/${estudanteId}/editar`);
  return { success: true } as const;
}
