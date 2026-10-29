import type { SupabaseServerClient } from "@/lib/supabase/require-admin-profile";

/** Turma encerrada é só leitura — vale para os dados e para os vínculos de professor. */
export async function turmaEncerrada(supabase: SupabaseServerClient, turmaId: string) {
  const { data } = await supabase.from("turmas").select("status").eq("id", turmaId).maybeSingle();
  return data?.status === "encerrada";
}
