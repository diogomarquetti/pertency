"use server";

import { revalidatePath } from "next/cache";

import { requireEstudanteWriteProfile } from "@/lib/supabase/require-admin-profile";

import {
  camposMatriculaFaltantes,
  dadosEscolaresSchema,
  formaOrigemTemDetalhes,
  type DadosEscolaresValues,
} from "./dados-escolares-schema";

// `situacao` não vira coluna aqui nem é editada nesta aba: é única, na Aba 1
// (aqui só é lida, e vira "Ativo" sozinha quando a matrícula fica completa).
// Só os fatos "de uma vez" da trajetória —
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

// Oferta e organização atuais do vínculo não são mais digitadas: vêm da
// turma escolhida (a pretendida fica na Avaliação de Ingresso). Sem turma,
// os valores já gravados não são tocados.
function toVinculoAnualRow(
  escolaId: string,
  estudanteId: string,
  anoLetivoId: string,
  data: DadosEscolaresValues,
  turma: { oferta_id: string; etapa_ciclo_id: string | null } | null,
) {
  return {
    estudante_id: estudanteId,
    ano_letivo_id: anoLetivoId,
    escola_id: escolaId,
    ...(turma ? { oferta_atual_id: turma.oferta_id, organizacao_atual_id: turma.etapa_ciclo_id } : {}),
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
 * sobrescreve o vínculo de um ano diferente). Não edita a situação, mas é
 * aqui que "A matricular" vira "Ativo": quando turma, turno, matrícula, data
 * e forma de origem estão preenchidos, a ativação é automática (o trigger de
 * auditoria de estudantes registra a mudança). PROVISÓRIO: validar com P.O.
 */
export async function salvarDadosEscolares(estudanteId: string, values: DadosEscolaresValues) {
  const context = await requireEstudanteWriteProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, userId, escolaId } = context;

  // A situação vem do banco, não do formulário (que só a carrega oculta).
  const { data: estudante } = await supabase
    .from("estudantes")
    .select("situacao")
    .eq("id", estudanteId)
    .maybeSingle();
  if (!estudante) {
    return { error: "Estudante não encontrado." };
  }

  const parsed = dadosEscolaresSchema.safeParse({ ...values, situacao: estudante.situacao });
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

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

    const { data: turma } = data.turmaId
      ? await supabase.from("turmas").select("oferta_id, etapa_ciclo_id").eq("id", data.turmaId).maybeSingle()
      : { data: null };
    const vinculoRow = toVinculoAnualRow(escolaId, estudanteId, data.anoLetivoId, data, turma);

    const { error: vinculoError } = vinculoExistente
      ? await supabase.from("vinculos_escolares_anuais").update(vinculoRow).eq("id", vinculoExistente.id)
      : await supabase
          .from("vinculos_escolares_anuais")
          .insert({ ...vinculoRow, created_by: userId });

    if (vinculoError) {
      return { error: "Não foi possível salvar o vínculo do ano letivo. Tente novamente." };
    }
  }

  let ativado = false;
  if (data.situacao === "a_matricular" && camposMatriculaFaltantes(data).length === 0) {
    const { data: atualizado } = await supabase
      .from("estudantes")
      .update({ situacao: "ativo" })
      .eq("id", estudanteId)
      .eq("situacao", "a_matricular")
      .select("id")
      .maybeSingle();
    ativado = !!atualizado;
  }

  revalidatePath(`/estudantes/${estudanteId}/editar`);
  return { success: true, ativado } as const;
}
