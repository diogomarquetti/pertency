"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { mantenedoraParaColunas } from "@/app/(app)/minha-escola/mapeamento";
import { mantenedoraSchema, type MantenedoraValues } from "@/app/(app)/minha-escola/schema";
import { requireOperador } from "@/lib/supabase/require-operador";
import type { SupabaseServerClient } from "@/lib/supabase/require-admin-profile";

// Uma mantenedora serve várias escolas — o mesmo CNPJ cadastrado duas vezes
// dividiria as escolas entre duas fichas da mesma entidade.
async function cnpjEmUso(supabase: SupabaseServerClient, cnpj: string, ignorarId: string | null) {
  let consulta = supabase.from("mantenedoras").select("razao_social").eq("cnpj", cnpj);
  if (ignorarId) consulta = consulta.neq("id", ignorarId);
  const { data } = await consulta.limit(1).maybeSingle();
  return data?.razao_social ?? null;
}

export async function criarMantenedora(values: MantenedoraValues) {
  const parsed = mantenedoraSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }

  const context = await requireOperador();
  if ("error" in context) return context;
  const { supabase } = context;

  const duplicada = await cnpjEmUso(supabase, parsed.data.cnpj, null);
  if (duplicada) return { error: `Este CNPJ já está cadastrado para ${duplicada}.` };

  const { error } = await supabase.from("mantenedoras").insert(mantenedoraParaColunas(parsed.data));
  if (error) return { error: "Não foi possível criar a mantenedora." };

  revalidatePath("/admin/mantenedoras");
  redirect("/mantenedoras?criada=1");
}

export async function atualizarMantenedora(id: string, values: MantenedoraValues) {
  const parsed = mantenedoraSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }

  const context = await requireOperador();
  if ("error" in context) return context;
  const { supabase } = context;

  const duplicada = await cnpjEmUso(supabase, parsed.data.cnpj, id);
  if (duplicada) return { error: `Este CNPJ já está cadastrado para ${duplicada}.` };

  const { data, error } = await supabase
    .from("mantenedoras")
    .update(mantenedoraParaColunas(parsed.data))
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) return { error: "Não foi possível salvar as alterações." };

  revalidatePath("/admin/mantenedoras");
  return { success: true } as const;
}
