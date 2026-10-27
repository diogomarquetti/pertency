"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getOrganizacaoConfig } from "@/lib/ofertas-config";
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

/**
 * Linha de `turmas` a partir do formulário. Colunas que deixaram de ser
 * usadas (campos_experiencias, direitos_aprendizagem, etapa_do_ciclo; e
 * areas_conhecimento no Ensino Fundamental) não entram aqui: o valor antigo
 * fica guardado, só não é mais lido nem gravado.
 */
function toTurmaRow(
  escolaId: string,
  data: CreateTurmaValues | UpdateTurmaValues,
  formaFuncionamento: "diaria" | "cronograma",
  { incluirEstrutura }: { incluirEstrutura: boolean },
) {
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
    ciclo: isEf ? Number(data.ciclo) : null,
    etapas: isEf ? [...data.etapas].sort((a, b) => a - b) : null,
    matriz_curricular_id: data.matrizCurricularId,
    forma_funcionamento: formaFuncionamento,
    status: data.status,
    data_inicio: data.dataInicio,
    data_fim: data.dataFim || null,
    observacoes: data.observacoes || null,
    ...(incluirEstrutura
      ? {
          objetivo_geral: isEi ? data.objetivoGeral || null : null,
          ...(isEja
            ? {
                areas_conhecimento: data.areasConhecimento,
                unidades_ocupacionais: data.unidadesOcupacionais,
                eixos_funcionais: data.eixosFuncionais,
              }
            : {}),
        }
      : {}),
  };
}

/**
 * Confere a organização escolhida contra a configuração central: precisa
 * estar ativa (organização descontinuada só aparece em registro antigo) e
 * define a forma de funcionamento quando a regra não é "livre".
 */
async function resolverOrganizacao(
  supabase: SupabaseServerClient,
  data: CreateTurmaValues | UpdateTurmaValues,
): Promise<{ error: string } | { formaFuncionamento: "diaria" | "cronograma" }> {
  const { data: organizacao } = await supabase
    .from("etapas_ciclos")
    .select("codigo, oferta_id")
    .eq("id", data.organizacaoId)
    .maybeSingle();

  const config = getOrganizacaoConfig(organizacao?.codigo as string | null | undefined);
  if (!organizacao || organizacao.oferta_id !== data.ofertaId || !config) {
    return { error: "A organização da oferta foi descontinuada. Escolha uma nova organização." };
  }

  const formaFuncionamento =
    config.formaFuncionamentoRegra === "livre" ? data.formaFuncionamento : config.formaFuncionamentoRegra;
  return { formaFuncionamento };
}

/**
 * Substitui por completo os componentes curriculares escolhidos numa turma
 * de EJA — mais simples que diffing, mesmo padrão de replaceVinculos em
 * usuarios/actions.ts. No Ensino Fundamental os componentes vêm da matriz.
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

async function salvarCronograma(
  supabase: SupabaseServerClient,
  turmaId: string,
  formaFuncionamento: "diaria" | "cronograma",
  data: UpdateTurmaValues,
) {
  if (formaFuncionamento !== "cronograma") {
    return supabase.from("turma_cronograma").delete().eq("turma_id", turmaId);
  }
  return supabase.from("turma_cronograma").upsert(
    {
      turma_id: turmaId,
      dias_semana: [...data.cronogramaDias].sort((a, b) => a - b),
      hora_inicio: data.cronogramaHoraInicio,
      hora_fim: data.cronogramaHoraFim,
    },
    { onConflict: "turma_id" },
  );
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

  const organizacao = await resolverOrganizacao(supabase, data);
  if ("error" in organizacao) {
    return organizacao;
  }

  const { data: inserted, error } = await supabase
    .from("turmas")
    .insert(toTurmaRow(escolaId, data, organizacao.formaFuncionamento, { incluirEstrutura: false }))
    .select("id")
    .single();

  if (error || !inserted) {
    if (isDuplicateNomeError(error?.message)) {
      return { error: "Já existe uma turma com esse nome no mesmo ano letivo, oferta e turno." };
    }
    return { error: "Não foi possível salvar a turma. Tente novamente." };
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

  const organizacao = await resolverOrganizacao(supabase, data);
  if ("error" in organizacao) {
    return organizacao;
  }

  const { data: updated, error } = await supabase
    .from("turmas")
    .update(toTurmaRow(context.escolaId, data, organizacao.formaFuncionamento, { incluirEstrutura: true }))
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !updated) {
    if (isDuplicateNomeError(error?.message)) {
      return { error: "Já existe uma turma com esse nome no mesmo ano letivo, oferta e turno." };
    }
    return { error: "Não foi possível salvar as alterações." };
  }

  if (data.ofertaSlug === "eja") {
    await replaceComponentes(supabase, id, data.componenteIds);
  }

  const { error: cronogramaError } = await salvarCronograma(supabase, id, organizacao.formaFuncionamento, data);
  if (cronogramaError) {
    return { error: "A turma foi salva, mas não foi possível salvar o cronograma de atendimento." };
  }

  revalidatePath("/turmas");
  redirect("/turmas?salvo=1");
}
