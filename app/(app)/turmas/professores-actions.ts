"use server";

import { revalidatePath } from "next/cache";

import { requireAdminProfile, type SupabaseServerClient } from "@/lib/supabase/require-admin-profile";

export type EscopoProfessorInput = {
  componenteIds: string[];
  escopoEja: string[];
};

function isDuplicateVinculoError(message: string | undefined) {
  if (!message) return false;
  return message.toLowerCase().includes("usuario_turmas_usuario_turma_unico");
}

/**
 * Substitui os componentes curriculares de um vínculo (Bloco 4, escopo EF) —
 * mesmo padrão delete-all-then-insert de replaceVinculos em
 * app/(app)/usuarios/actions.ts.
 */
async function replaceComponentesVinculo(
  supabase: SupabaseServerClient,
  vinculoId: string,
  componenteIds: string[],
) {
  await supabase.from("usuario_turma_componentes").delete().eq("usuario_turma_id", vinculoId);

  if (componenteIds.length > 0) {
    const { error } = await supabase
      .from("usuario_turma_componentes")
      .insert(componenteIds.map((componenteId) => ({ usuario_turma_id: vinculoId, componente_id: componenteId })));
    if (error) {
      return { error: "Não foi possível salvar os componentes do vínculo." };
    }
  }

  return null;
}

export async function vincularProfessor(
  turmaId: string,
  usuarioId: string,
  escopo: EscopoProfessorInput,
) {
  const context = await requireAdminProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, adminId } = context;

  const { data: vinculo, error } = await supabase
    .from("usuario_turmas")
    .insert({
      usuario_id: usuarioId,
      turma_id: turmaId,
      created_by: adminId,
      escopo_eja: escopo.escopoEja.length > 0 ? escopo.escopoEja : null,
    })
    .select("id")
    .single();

  if (error || !vinculo) {
    if (isDuplicateVinculoError(error?.message)) {
      return { error: "Este professor já está vinculado a esta turma." };
    }
    return { error: "Não foi possível vincular o professor." };
  }

  if (escopo.componenteIds.length > 0) {
    const compError = await replaceComponentesVinculo(supabase, vinculo.id, escopo.componenteIds);
    if (compError) return compError;
  }

  revalidatePath(`/turmas/${turmaId}/editar`);
  return { success: true } as const;
}

export async function atualizarVinculoProfessor(
  turmaId: string,
  vinculoId: string,
  escopo: EscopoProfessorInput,
  status: "ativo" | "inativo",
) {
  const context = await requireAdminProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase } = context;

  const { error } = await supabase
    .from("usuario_turmas")
    .update({ status, escopo_eja: escopo.escopoEja.length > 0 ? escopo.escopoEja : null })
    .eq("id", vinculoId);

  if (error) {
    return { error: "Não foi possível atualizar o vínculo." };
  }

  const compError = await replaceComponentesVinculo(supabase, vinculoId, escopo.componenteIds);
  if (compError) return compError;

  revalidatePath(`/turmas/${turmaId}/editar`);
  return { success: true } as const;
}

export async function removerVinculoProfessor(turmaId: string, vinculoId: string) {
  const context = await requireAdminProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase } = context;

  const { error } = await supabase.from("usuario_turmas").delete().eq("id", vinculoId);
  if (error) {
    return { error: "Não foi possível remover o vínculo." };
  }

  revalidatePath(`/turmas/${turmaId}/editar`);
  return { success: true } as const;
}
