"use server";

import { revalidatePath } from "next/cache";

import { requireEstudanteWriteProfile } from "@/lib/supabase/require-admin-profile";

import {
  dadosEscolaresSchema,
  formaOrigemTemDetalhes,
  type DadosEscolaresValues,
} from "./dados-escolares-schema";

// `situacao` não vira coluna aqui: continua vivendo em `estudantes`
// (regravada à parte, abaixo). Só os fatos "de uma vez" da trajetória —
// nada que dependa do ano letivo. Detalhes da origem (rede, escola,
// informações) são limpos quando não houve escola anterior — trocar pra
// "Primeira matrícula" não deixa dado órfão escondido na tela.
function toDadosEscolaresRow(escolaId: string, estudanteId: string, data: DadosEscolaresValues) {
  const temDetalhesOrigem = formaOrigemTemDetalhes(data.formaOrigem);
  return {
    estudante_id: estudanteId,
    escola_id: escolaId,
    data_ingresso: data.dataIngresso || null,
    forma_ingresso: data.formaIngresso || null,
    forma_origem: data.formaOrigem || null,
    rede_origem: temDetalhesOrigem ? data.redeOrigem || null : null,
    escola_origem: temDetalhesOrigem ? data.escolaOrigem || null : null,
    historico_transferencia: temDetalhesOrigem ? data.historicoTransferencia || null : null,
    data_encerramento: data.dataEncerramento || null,
    motivo_encerramento: data.motivoEncerramento || null,
    observacoes: data.observacoes || null,
  };
}

// `ofertaAtualSlug` não vira coluna — só existe pra acionar a validação
// condicional no client/server (mesmo padrão de `ofertaSlug` em
// turmas/actions.ts).
function toVinculoAnualRow(
  escolaId: string,
  estudanteId: string,
  anoLetivoId: string,
  data: DadosEscolaresValues,
) {
  return {
    estudante_id: estudanteId,
    ano_letivo_id: anoLetivoId,
    escola_id: escolaId,
    oferta_atual_id: data.ofertaAtualId || null,
    organizacao_atual_id: data.organizacaoAtualId || null,
    etapa_do_ciclo: data.ofertaAtualSlug === "ef" ? data.etapaDoCiclo || null : null,
    turno_id: data.turnoId || null,
    turma_id: data.turmaId || null,
    matricula_interna: data.matriculaInterna || null,
    utiliza_transporte: data.utilizaTransporte,
    data_matricula_efetiva: data.dataMatriculaEfetiva || null,
  };
}

/**
 * Salva os Dados escolares — dois destinos (ver HU-EST-001 v2.0, seção
 * 18.1): fatos de trajetória em `dados_escolares` (1:1, select+insert/update
 * defensivo, mesmo padrão de documentos-actions.ts) e o vínculo do ano
 * letivo selecionado em `vinculos_escolares_anuais` (1:N por ano — nunca
 * sobrescreve o vínculo de um ano diferente). Também regrava
 * `estudantes.situacao`: é aqui que o estudante normalmente vira "Ativo"; o
 * trigger de auditoria de estudantes já existente registra a mudança
 * sozinho.
 */
export async function salvarDadosEscolares(estudanteId: string, values: DadosEscolaresValues) {
  const parsed = dadosEscolaresSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireEstudanteWriteProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, userId, escolaId } = context;

  const { data: existente } = await supabase
    .from("dados_escolares")
    .select("id")
    .eq("estudante_id", estudanteId)
    .maybeSingle();

  const row = toDadosEscolaresRow(escolaId, estudanteId, data);

  const { error } = existente
    ? await supabase.from("dados_escolares").update(row).eq("id", existente.id)
    : await supabase.from("dados_escolares").insert({ ...row, created_by: userId });

  if (error) {
    return { error: "Não foi possível salvar os dados escolares. Tente novamente." };
  }

  // Sem ano letivo selecionado não há vínculo anual pra gravar — só os
  // fatos de trajetória acima.
  if (data.anoLetivoId) {
    const { data: vinculoExistente } = await supabase
      .from("vinculos_escolares_anuais")
      .select("id")
      .eq("estudante_id", estudanteId)
      .eq("ano_letivo_id", data.anoLetivoId)
      .maybeSingle();

    const vinculoRow = toVinculoAnualRow(escolaId, estudanteId, data.anoLetivoId, data);

    const { error: vinculoError } = vinculoExistente
      ? await supabase.from("vinculos_escolares_anuais").update(vinculoRow).eq("id", vinculoExistente.id)
      : await supabase
          .from("vinculos_escolares_anuais")
          .insert({ ...vinculoRow, created_by: userId });

    if (vinculoError) {
      return { error: "Não foi possível salvar o vínculo do ano letivo. Tente novamente." };
    }
  }

  await supabase.from("estudantes").update({ situacao: data.situacao }).eq("id", estudanteId);

  revalidatePath(`/estudantes/${estudanteId}/editar`);
  return { success: true } as const;
}
