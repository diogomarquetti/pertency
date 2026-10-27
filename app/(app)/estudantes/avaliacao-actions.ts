"use server";

import { revalidatePath } from "next/cache";

import {
  requireEstudanteWriteProfile,
  requireRelatorioGeracaoProfile,
} from "@/lib/supabase/require-admin-profile";

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

/** Erros levantados pelo trigger trg_avaliacoes_ingresso_imutavel. */
function mensagemErroAvaliacao(error: { code?: string; message?: string }) {
  if (error.code === "42501") return "Seu perfil não pode concluir a Avaliação de Ingresso.";
  if (error.code === "23514") {
    return "Esta versão da avaliação está fechada e não pode ser alterada. Use \"Retificar avaliação\".";
  }
  if (error.code === "23505") {
    return "Já existe uma versão desta avaliação em edição. Atualize a página.";
  }
  return "Não foi possível salvar a avaliação. Tente novamente.";
}

/**
 * Salva a versão em edição (Rascunho/Em andamento) da Avaliação de Ingresso
 * — por `id`, já que um estudante pode ter várias versões. Sem `avaliacaoId`
 * cria a primeira versão (ou uma nova, depois de uma cancelada). Concluída,
 * Retificada e Cancelada são imutáveis: o banco recusa o UPDATE.
 *
 * Quando a avaliação é concluída com recomendação "não elegível", já
 * atualiza `estudantes.situacao` junto — o trigger de auditoria de
 * estudantes registra essa mudança sozinho.
 */
export async function salvarAvaliacao(estudanteId: string, avaliacaoId: string | null, values: AvaliacaoValues) {
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

  const row = toAvaliacaoRow(escolaId, estudanteId, data);

  if (avaliacaoId) {
    const { data: updated, error } = await supabase
      .from("avaliacoes_ingresso")
      .update(row)
      .eq("id", avaliacaoId)
      .eq("estudante_id", estudanteId)
      .select("id")
      .maybeSingle();

    if (error || !updated) {
      return { error: error ? mensagemErroAvaliacao(error) : "Avaliação não encontrada." };
    }
  } else {
    // Nova avaliação: versão 1, a não ser que já exista uma vigente (aí o
    // caminho é retificar, não criar outra).
    const { data: abertas } = await supabase
      .from("avaliacoes_ingresso")
      .select("id")
      .eq("estudante_id", estudanteId)
      .in("status_avaliacao", ["rascunho", "em_andamento", "concluida"])
      .limit(1);
    if (abertas && abertas.length > 0) {
      return { error: "Este estudante já tem uma Avaliação de Ingresso. Atualize a página." };
    }

    const { error } = await supabase
      .from("avaliacoes_ingresso")
      .insert({ ...row, versao: 1, created_by: userId });

    if (error) {
      return { error: mensagemErroAvaliacao(error) };
    }
  }

  if (data.statusAvaliacao === "concluida" && data.recomendacaoElegibilidade === "nao_elegivel") {
    await supabase.from("estudantes").update({ situacao: "nao_elegivel" }).eq("id", estudanteId);
  }

  revalidatePath(`/estudantes/${estudanteId}/editar`);
  return { success: true } as const;
}

/**
 * "Retificar avaliação": cria a versão N+1 como cópia da vigente, em edição
 * (função retificar_avaliacao_ingresso, que checa perfil e status). A versão
 * anterior continua Concluída até a nova ser concluída.
 */
export async function retificarAvaliacao(estudanteId: string, avaliacaoId: string, justificativa: string) {
  if (!justificativa.trim()) {
    return { error: "Informe a justificativa da retificação." };
  }

  const context = await requireRelatorioGeracaoProfile();
  if ("error" in context) {
    return { error: "Seu perfil não pode retificar a Avaliação de Ingresso." };
  }

  const { error } = await context.supabase.rpc("retificar_avaliacao_ingresso", {
    p_avaliacao_id: avaliacaoId,
    p_justificativa: justificativa,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe uma retificação em andamento para esta avaliação." };
    }
    return { error: error.code === "23514" ? error.message : "Não foi possível iniciar a retificação." };
  }

  revalidatePath(`/estudantes/${estudanteId}/editar`);
  return { success: true } as const;
}

/** Cancela uma versão em Rascunho/Em andamento (criada por engano). */
export async function cancelarAvaliacao(estudanteId: string, avaliacaoId: string, justificativa: string) {
  if (!justificativa.trim()) {
    return { error: "Informe a justificativa do cancelamento." };
  }

  const context = await requireRelatorioGeracaoProfile();
  if ("error" in context) {
    return { error: "Seu perfil não pode cancelar a Avaliação de Ingresso." };
  }

  const { error } = await context.supabase.rpc("cancelar_avaliacao_ingresso", {
    p_avaliacao_id: avaliacaoId,
    p_justificativa: justificativa,
  });

  if (error) {
    return { error: error.code === "23514" ? error.message : "Não foi possível cancelar a avaliação." };
  }

  revalidatePath(`/estudantes/${estudanteId}/editar`);
  return { success: true } as const;
}
