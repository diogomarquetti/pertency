import type { SupabaseServerClient } from "@/lib/supabase/require-admin-profile";

/**
 * Matrícula "completa" = o que "Ativo" exige: forma de origem nos Dados
 * escolares e, em algum ano letivo, turno, turma, número de matrícula e data
 * de matrícula efetiva. Oferta e organização vêm da turma. Usada para
 * reativar manualmente (Aba 1) — a ativação automática dos Dados escolares
 * confere os mesmos campos no formulário (`camposMatriculaFaltantes`).
 */
export async function matriculaCompleta(supabase: SupabaseServerClient, estudanteId: string) {
  const [origem, vinculos] = await Promise.all([
    supabase.from("dados_escolares").select("forma_origem").eq("estudante_id", estudanteId).maybeSingle(),
    supabase
      .from("vinculos_escolares_anuais")
      .select("turno_id, turma_id, matricula_interna, data_matricula_efetiva")
      .eq("estudante_id", estudanteId),
  ]);

  if (!origem.data?.forma_origem) return false;
  return (vinculos.data ?? []).some(
    (v) => v.turno_id && v.turma_id && v.matricula_interna && v.data_matricula_efetiva,
  );
}
