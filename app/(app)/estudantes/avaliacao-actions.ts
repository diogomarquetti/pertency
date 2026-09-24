"use server";

import { revalidatePath } from "next/cache";

import { requireEstudanteWriteProfile } from "@/lib/supabase/require-admin-profile";

import { avaliacaoSchema, type AvaliacaoValues } from "./avaliacao-schema";

function toAvaliacaoRow(escolaId: string, estudanteId: string, data: AvaliacaoValues) {
  return {
    estudante_id: estudanteId,
    escola_id: escolaId,
    equipe_responsavel_ids: data.equipeResponsavelIds.length > 0 ? data.equipeResponsavelIds : null,
    oferta_pretendida_id: data.ofertaPretendidaId || null,
    organizacao_pretendida_id: data.organizacaoPretendidaId || null,
    data_inicio: data.dataInicio || null,
    data_termino: data.dataTermino || null,
    status_avaliacao: data.statusAvaliacao,
    historico_escolar: data.historicoEscolar || null,
    informacoes_familia: data.informacoesFamilia || null,
    contexto_sociocultural: data.contextoSociocultural || null,
    habilidades_conceituais: data.habilidadesConceituais || null,
    habilidades_sociais: data.habilidadesSociais || null,
    habilidades_praticas: data.habilidadesPraticas || null,
    dimensao_participacao: data.dimensaoParticipacao || null,
    contexto_escolar: data.contextoEscolar || null,
    contexto_familiar: data.contextoFamiliar || null,
    contexto_comunitario: data.contextoComunitario || null,
    fatores_facilitadores: data.fatoresFacilitadores || null,
    barreiras_identificadas: data.barreirasIdentificadas || null,
    necessidades_especificas: data.necessidadesEspecificas || null,
    nivel_apoio: data.nivelApoio || null,
    areas_apoio: data.areasApoio.length > 0 ? data.areasApoio : null,
    parecer_equipe: data.parecerEquipe || null,
    recomendacao_elegibilidade: data.recomendacaoElegibilidade || null,
    justificativa_elegibilidade: data.justificativaElegibilidade || null,
    encaminhamento_recomendado: data.encaminhamentoRecomendado || null,
    orientacoes_pai: data.orientacoesPai || null,
    assinaturas: data.assinaturas || null,
  };
}

/**
 * Salva a Avaliação de Ingresso — upsert por `estudante_id` (relação 1:1,
 * sempre existe no máximo uma por estudante). Quando a avaliação é concluída
 * com recomendação "não elegível", já atualiza `estudantes.situacao` junto —
 * o trigger de auditoria de estudantes (Fase 1) registra essa mudança
 * sozinho. Reaberta, a recomendação antiga fica guardada mas não age.
 */
export async function salvarAvaliacao(estudanteId: string, values: AvaliacaoValues) {
  const parsed = avaliacaoSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireEstudanteWriteProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, userId, escolaId } = context;

  const { error } = await supabase
    .from("avaliacoes_ingresso")
    .upsert(
      { ...toAvaliacaoRow(escolaId, estudanteId, data), created_by: userId },
      { onConflict: "estudante_id" },
    );

  if (error) {
    return { error: "Não foi possível salvar a avaliação. Tente novamente." };
  }

  if (data.statusAvaliacao === "concluida" && data.recomendacaoElegibilidade === "nao_elegivel") {
    await supabase.from("estudantes").update({ situacao: "nao_elegivel" }).eq("id", estudanteId);
  }

  revalidatePath(`/estudantes/${estudanteId}/editar`);
  return { success: true } as const;
}
