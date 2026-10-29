"use server";

import { revalidatePath } from "next/cache";

import { requireAdminProfile, type SupabaseServerClient } from "@/lib/supabase/require-admin-profile";

import { componentesPermitidos } from "./professor-componentes";
import { turmaEncerrada } from "./turma-encerrada";

const ERRO_ENCERRADA = { error: "Turma encerrada não pode ser editada." };

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

/**
 * Ensino Fundamental: aplica a regra de componentes por função (ver
 * professor-componentes.ts) sobre os componentes da matriz da turma. Nas
 * outras ofertas os componentes escolhidos passam como vieram.
 */
async function ajustarComponentes(
  supabase: SupabaseServerClient,
  turmaId: string,
  usuarioId: string,
  componenteIds: string[],
): Promise<{ error: string } | { componenteIds: string[] }> {
  const [{ data: turma }, { data: usuario }] = await Promise.all([
    supabase.from("turmas").select("matriz_curricular_id, ofertas(slug)").eq("id", turmaId).maybeSingle(),
    supabase.from("usuarios").select("funcao").eq("id", usuarioId).maybeSingle(),
  ]);
  const slug = (turma?.ofertas as unknown as { slug: string } | null)?.slug;
  if (slug !== "ef") return { componenteIds };

  const { data: links } = await supabase
    .from("matriz_componentes")
    .select("componentes_curriculares(id, nome)")
    .eq("matriz_id", turma?.matriz_curricular_id ?? "");
  const componentes = (links ?? []).flatMap((link) => {
    const componente = link.componentes_curriculares as unknown as { id: string; nome: string } | null;
    return componente ? [componente] : [];
  });

  const permitidos = componentesPermitidos(usuario?.funcao, componentes, componenteIds);
  if (permitidos.length === 0) {
    return { error: "Selecione ao menos um componente curricular que o professor leciona." };
  }
  return { componenteIds: permitidos };
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
  if (await turmaEncerrada(supabase, turmaId)) return ERRO_ENCERRADA;

  const componentes = await ajustarComponentes(supabase, turmaId, usuarioId, escopo.componenteIds);
  if ("error" in componentes) return componentes;

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

  if (componentes.componenteIds.length > 0) {
    const compError = await replaceComponentesVinculo(supabase, vinculo.id, componentes.componenteIds);
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
  if (await turmaEncerrada(supabase, turmaId)) return ERRO_ENCERRADA;

  const { data: vinculoAtual } = await supabase
    .from("usuario_turmas")
    .select("usuario_id")
    .eq("id", vinculoId)
    .maybeSingle();
  if (!vinculoAtual) {
    return { error: "Não foi possível atualizar o vínculo." };
  }
  const componentes = await ajustarComponentes(supabase, turmaId, vinculoAtual.usuario_id, escopo.componenteIds);
  if ("error" in componentes) return componentes;

  const { error } = await supabase
    .from("usuario_turmas")
    .update({ status, escopo_eja: escopo.escopoEja.length > 0 ? escopo.escopoEja : null })
    .eq("id", vinculoId);

  if (error) {
    return { error: "Não foi possível atualizar o vínculo." };
  }

  const compError = await replaceComponentesVinculo(supabase, vinculoId, componentes.componenteIds);
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
  if (await turmaEncerrada(supabase, turmaId)) return ERRO_ENCERRADA;

  const { error } = await supabase.from("usuario_turmas").delete().eq("id", vinculoId);
  if (error) {
    return { error: "Não foi possível remover o vínculo." };
  }

  revalidatePath(`/turmas/${turmaId}/editar`);
  return { success: true } as const;
}
