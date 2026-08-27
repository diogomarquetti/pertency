import { createClient } from "@/lib/supabase/server";

export type ReferenciaTurmas = {
  etapasCiclos: { id: string; nome: string }[];
  turnos: { id: string; nome: string }[];
  turmas: { id: string; nome: string; etapaCicloId: string; turnoId: string }[];
  componentes: { id: string; nome: string }[];
};

/**
 * Dados de referência para o painel "Adicionar turma" — etapas/turnos/turmas
 * já vêm escopados pela escola do usuário logado via RLS (get_escola_id()),
 * componentes curriculares são globais.
 */
export async function getReferenciaTurmas(): Promise<ReferenciaTurmas> {
  const supabase = await createClient();

  const [etapasResult, turnosResult, turmasResult, componentesResult] = await Promise.all([
    supabase.from("etapas_ciclos").select("id, nome").order("ordem"),
    supabase.from("turnos").select("id, nome").order("nome"),
    supabase
      .from("turmas")
      .select("id, nome, etapa_ciclo_id, turno_id")
      .eq("status", "ativa")
      .order("nome"),
    supabase.from("componentes_curriculares").select("id, nome").order("nome"),
  ]);

  return {
    etapasCiclos: etapasResult.data ?? [],
    turnos: turnosResult.data ?? [],
    turmas: (turmasResult.data ?? []).map((turma) => ({
      id: turma.id as string,
      nome: turma.nome as string,
      etapaCicloId: turma.etapa_ciclo_id as string,
      turnoId: turma.turno_id as string,
    })),
    componentes: componentesResult.data ?? [],
  };
}

/**
 * Escola do administrador logado — usada para montar o caminho no bucket de
 * fotos (`{escola_id}/{usuario_id}.ext}`), já que a RLS de storage.objects
 * exige que esse prefixo bata com get_escola_id() de quem está fazendo o
 * upload.
 */
export async function getEscolaIdAtual(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("usuarios")
    .select("escola_id")
    .eq("id", user.id)
    .maybeSingle();

  return data?.escola_id ?? null;
}

/**
 * Nome da escola do administrador logado — pro rodapé "escola ativa" da
 * sidebar. Read-only: não existe troca de escola por admin hoje.
 */
export async function getEscolaAtual(): Promise<string | null> {
  const escolaId = await getEscolaIdAtual();
  if (!escolaId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("escolas")
    .select("nome_oficial")
    .eq("id", escolaId)
    .maybeSingle();

  return data?.nome_oficial ?? null;
}

export type AuditoriaRow = {
  id: string;
  campoAlterado: string;
  valorAnterior: string | null;
  valorNovo: string | null;
  alteradoEm: string;
  alteradoPorNome: string | null;
};

/**
 * Histórico de alterações de um usuário (painel de contexto, estado
 * "Histórico") — populado automaticamente pelos triggers do banco
 * (trg_usuarios_audit, trg_auth_users_email_audit,
 * trg_usuario_turmas_audit_insert/delete), nada escrito pela aplicação.
 * `alterado_por` tem uma FK própria pra usuarios (diferente da FK de
 * usuario_id), por isso precisa nomear a constraint explicitamente no join.
 */
export async function getAuditoriaUsuario(usuarioId: string): Promise<AuditoriaRow[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("usuarios_auditoria")
    .select(
      "id, campo_alterado, valor_anterior, valor_novo, alterado_em, usuarios!usuarios_auditoria_alterado_por_fkey(nome_completo)",
    )
    .eq("usuario_id", usuarioId)
    .order("alterado_em", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id as string,
    campoAlterado: row.campo_alterado as string,
    valorAnterior: row.valor_anterior as string | null,
    valorNovo: row.valor_novo as string | null,
    alteradoEm: row.alterado_em as string,
    alteradoPorNome:
      (row.usuarios as unknown as { nome_completo: string } | null)?.nome_completo ?? null,
  }));
}

export type VinculoExistente = {
  turmaId: string;
  etapaCicloId: string;
  turnoId: string;
  componenteIds: string[];
};

/**
 * Vínculos de turma já existentes de um usuário (edição) — reconstrói o
 * estado inicial da tabela do Bloco 2 a partir de usuario_turmas +
 * usuario_turma_componentes.
 */
export async function getVinculosUsuario(usuarioId: string): Promise<VinculoExistente[]> {
  const supabase = await createClient();

  const { data: usuarioTurmas } = await supabase
    .from("usuario_turmas")
    .select("id, turma_id, turmas(etapa_ciclo_id, turno_id)")
    .eq("usuario_id", usuarioId);

  if (!usuarioTurmas || usuarioTurmas.length === 0) {
    return [];
  }

  const usuarioTurmaIds = usuarioTurmas.map((ut) => ut.id as string);

  const { data: componentesLinks } = await supabase
    .from("usuario_turma_componentes")
    .select("usuario_turma_id, componente_id")
    .in("usuario_turma_id", usuarioTurmaIds);

  return usuarioTurmas.map((ut) => {
    const turma = ut.turmas as unknown as { etapa_ciclo_id: string; turno_id: string } | null;

    return {
      turmaId: ut.turma_id as string,
      etapaCicloId: turma?.etapa_ciclo_id ?? "",
      turnoId: turma?.turno_id ?? "",
      componenteIds: (componentesLinks ?? [])
        .filter((link) => link.usuario_turma_id === ut.id)
        .map((link) => link.componente_id as string),
    };
  });
}
