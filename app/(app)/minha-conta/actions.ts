"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/supabase/require-user";

import { minhaContaSchema, type MinhaContaValues } from "./schema";

export async function updateMinhaConta(values: MinhaContaValues) {
  const parsed = minhaContaSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireUser();
  if ("error" in context) {
    return context;
  }
  const { supabase, userId } = context;

  const { data: updated, error: updateError } = await supabase
    .from("usuarios")
    .update({
      nome_completo: data.nomeCompleto,
      email: data.email,
      telefone: data.telefone || null,
    })
    .eq("id", userId)
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath("/minha-conta");
  return { success: true } as const;
}
