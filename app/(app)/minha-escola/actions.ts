"use server";

import { revalidatePath } from "next/cache";

import { requireAdminProfile } from "@/lib/supabase/require-admin-profile";

import { escolaParaColunas, mantenedoraParaColunas } from "./mapeamento";
import { escolaSchema, mantenedoraSchema, type EscolaValues, type MantenedoraValues } from "./schema";

export async function updateEscola(values: EscolaValues) {
  const parsed = escolaSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireAdminProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, escolaId } = context;

  const { error: updateError } = await supabase
    .from("escolas")
    .update(escolaParaColunas(data))
    .eq("id", escolaId);

  if (updateError) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath("/minha-escola/escola");
  revalidatePath("/minha-escola");
  return { success: true } as const;
}

export async function updateMantenedora(values: MantenedoraValues) {
  const parsed = mantenedoraSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }

  const context = await requireAdminProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, escolaId } = context;

  // Só a mantenedora vinculada à escola (a RLS também confere). Cadastrar e
  // vincular uma mantenedora é com o operador da plataforma.
  const { data: escola } = await supabase
    .from("escolas")
    .select("mantenedora_id")
    .eq("id", escolaId)
    .maybeSingle();

  if (!escola?.mantenedora_id) {
    return { error: "Nenhuma mantenedora vinculada a esta escola." };
  }

  const { data: atualizada, error: updateError } = await supabase
    .from("mantenedoras")
    .update(mantenedoraParaColunas(parsed.data))
    .eq("id", escola.mantenedora_id)
    .select("id")
    .maybeSingle();

  if (updateError || !atualizada) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath("/minha-escola/mantenedora");
  revalidatePath("/minha-escola");
  return { success: true } as const;
}
