"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { escolaParaColunas } from "@/app/(app)/minha-escola/mapeamento";
import { escolaComMantenedoraSchema, type EscolaValues } from "@/app/(app)/minha-escola/schema";
import { requireOperador } from "@/lib/supabase/require-operador";
import type { SupabaseServerClient } from "@/lib/supabase/require-admin-profile";

/**
 * A mantenedora escolhida precisa existir e estar ativa — exceto quando é a
 * que a escola já tinha (manter uma mantenedora que ficou inativa não é
 * escolher uma nova).
 */
async function validarMantenedora(
  supabase: SupabaseServerClient,
  mantenedoraId: string,
  atualDaEscola: string | null,
) {
  const { data } = await supabase.from("mantenedoras").select("status").eq("id", mantenedoraId).maybeSingle();
  if (!data) return "Mantenedora não encontrada.";
  if (data.status !== "ativa" && mantenedoraId !== atualDaEscola) return "Esta mantenedora está inativa.";
  return null;
}

export async function criarEscola(values: EscolaValues) {
  const parsed = escolaComMantenedoraSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireOperador();
  if ("error" in context) return context;
  const { supabase } = context;

  const erroMantenedora = await validarMantenedora(supabase, data.mantenedoraId!, null);
  if (erroMantenedora) return { error: erroMantenedora };

  const { error } = await supabase
    .from("escolas")
    .insert({ ...escolaParaColunas(data), mantenedora_id: data.mantenedoraId });

  if (error) return { error: "Não foi possível criar a escola." };

  revalidatePath("/admin/escolas");
  redirect("/escolas?criada=1");
}

export async function atualizarEscola(id: string, values: EscolaValues) {
  const parsed = escolaComMantenedoraSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireOperador();
  if ("error" in context) return context;
  const { supabase } = context;

  const { data: atual } = await supabase.from("escolas").select("mantenedora_id").eq("id", id).maybeSingle();
  if (!atual) return { error: "Escola não encontrada." };

  const erroMantenedora = await validarMantenedora(supabase, data.mantenedoraId!, atual.mantenedora_id);
  if (erroMantenedora) return { error: erroMantenedora };

  const { data: atualizada, error } = await supabase
    .from("escolas")
    .update({ ...escolaParaColunas(data), mantenedora_id: data.mantenedoraId })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !atualizada) return { error: "Não foi possível salvar as alterações." };

  revalidatePath("/admin/escolas");
  return { success: true } as const;
}
