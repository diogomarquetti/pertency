"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireAdminProfile, type SupabaseServerClient } from "@/lib/supabase/require-admin-profile";

import {
  createTurmaSchema,
  updateTurmaSchema,
  type CreateTurmaValues,
  type UpdateTurmaValues,
} from "./schema";

function isDuplicateNomeError(message: string | undefined) {
  if (!message) return false;
  return message.toLowerCase().includes("turmas_nome_unico");
}

function toTurmaRow(escolaId: string, data: CreateTurmaValues | UpdateTurmaValues) {
  const isEi = data.ofertaSlug === "ei";
  const isEf = data.ofertaSlug === "ef";
  const isEja = data.ofertaSlug === "eja";

  return {
    escola_id: escolaId,
    nome: data.nome,
    ano_letivo_id: data.anoLetivoId,
    turno_id: data.turnoId,
    capacidade: data.capacidade ? Number(data.capacidade) : null,
    oferta_id: data.ofertaId,
    etapa_ciclo_id: data.organizacaoId,
    matriz_curricular_id: data.matrizCurricularId,
    status: data.status,
    data_inicio: data.dataInicio,
    data_fim: data.dataFim || null,
    observacoes: data.observacoes || null,
    campos_experiencias: isEi ? data.camposExperiencias : null,
    direitos_aprendizagem: isEi ? data.direitosAprendizagem : null,
    objetivo_geral: isEi ? data.objetivoGeral || null : null,
    etapa_do_ciclo: isEf ? data.etapaDoCiclo || null : null,
    areas_conhecimento: isEf || isEja ? data.areasConhecimento : null,
    unidades_ocupacionais: isEja ? data.unidadesOcupacionais : null,
    eixos_funcionais: isEja ? data.eixosFuncionais : null,
  };
}

/**
 * Substitui por completo os componentes curriculares vinculados a uma turma
 * — mais simples que diffing, mesmo padrão de replaceVinculos em
 * usuarios/actions.ts.
 */
async function replaceComponentes(
  supabase: SupabaseServerClient,
  turmaId: string,
  componenteIds: string[],
) {
  await supabase.from("turma_componentes").delete().eq("turma_id", turmaId);

  if (componenteIds.length > 0) {
    await supabase
      .from("turma_componentes")
      .insert(componenteIds.map((componenteId) => ({ turma_id: turmaId, componente_id: componenteId })));
  }
}

function componentesDe(data: CreateTurmaValues | UpdateTurmaValues): string[] {
  return data.ofertaSlug === "ef" || data.ofertaSlug === "eja" ? data.componenteIds : [];
}

export async function createTurma(values: CreateTurmaValues) {
  const parsed = createTurmaSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireAdminProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, escolaId } = context;

  const { data: inserted, error } = await supabase
    .from("turmas")
    .insert(toTurmaRow(escolaId, data))
    .select("id")
    .single();

  if (error || !inserted) {
    if (isDuplicateNomeError(error?.message)) {
      return { error: "Já existe uma turma com esse nome no mesmo ano letivo, oferta e turno." };
    }
    return { error: "Não foi possível salvar a turma. Tente novamente." };
  }

  const componenteIds = componentesDe(data);
  if (componenteIds.length > 0) {
    await replaceComponentes(supabase, inserted.id, componenteIds);
  }

  revalidatePath("/turmas");
  redirect(`/turmas/${inserted.id}/editar?criado=1`);
}

export async function updateTurma(id: string, values: UpdateTurmaValues) {
  const parsed = updateTurmaSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireAdminProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase } = context;

  const { data: updated, error } = await supabase
    .from("turmas")
    .update(toTurmaRow(context.escolaId, data))
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !updated) {
    if (isDuplicateNomeError(error?.message)) {
      return { error: "Já existe uma turma com esse nome no mesmo ano letivo, oferta e turno." };
    }
    return { error: "Não foi possível salvar as alterações." };
  }

  await replaceComponentes(supabase, id, componentesDe(data));

  revalidatePath("/turmas");
  redirect("/turmas?salvo=1");
}
