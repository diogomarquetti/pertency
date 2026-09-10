import { createClient } from "@/lib/supabase/server";
import { isFuncaoProfessor } from "@/app/(app)/usuarios/schema";

export type ReferenciaTurmaForm = {
  anosLetivos: { id: string; ano: number; status: string }[];
  turnos: { id: string; nome: string }[];
  ofertas: { id: string; slug: string; nome: string }[];
  organizacoes: { id: string; ofertaId: string; nome: string; ordem: number | null }[];
  matrizes: { id: string; ofertaId: string; nome: string }[];
  componentes: { id: string; nome: string }[];
};

/**
 * Dados de referência pro formulário de Turma — ano letivo e turno já vêm
 * filtrados pro que pode ser escolhido numa turma nova (ativos/planejados),
 * oferta/organização/matriz são o catálogo fixo semeado pela migration.
 */
export async function getReferenciaTurmaForm(): Promise<ReferenciaTurmaForm> {
  const supabase = await createClient();

  const [anosResult, turnosResult, ofertasResult, organizacoesResult, matrizesResult, componentesResult] =
    await Promise.all([
      supabase
        .from("anos_letivos")
        .select("id, ano, status")
        .in("status", ["ativo", "planejado"])
        .order("ano"),
      supabase.from("turnos").select("id, nome").eq("ativo", true).order("nome"),
      supabase.from("ofertas").select("id, slug, nome").order("nome"),
      supabase.from("etapas_ciclos").select("id, oferta_id, nome, ordem").order("ordem"),
      supabase.from("matrizes_curriculares").select("id, oferta_id, nome").order("nome"),
      supabase.from("componentes_curriculares").select("id, nome").order("nome"),
    ]);

  return {
    anosLetivos: (anosResult.data ?? []).map((a) => ({
      id: a.id as string,
      ano: a.ano as number,
      status: a.status as string,
    })),
    turnos: turnosResult.data ?? [],
    ofertas: ofertasResult.data ?? [],
    organizacoes: (organizacoesResult.data ?? []).map((e) => ({
      id: e.id as string,
      ofertaId: e.oferta_id as string,
      nome: e.nome as string,
      ordem: e.ordem as number | null,
    })),
    matrizes: (matrizesResult.data ?? []).map((m) => ({
      id: m.id as string,
      ofertaId: m.oferta_id as string,
      nome: m.nome as string,
    })),
    componentes: componentesResult.data ?? [],
  };
}

export type AuditoriaTurmaRow = {
  id: string;
  campoAlterado: string;
  valorAnterior: string | null;
  valorNovo: string | null;
  alteradoEm: string;
  alteradoPorNome: string | null;
};

/**
 * Histórico de alterações de uma turma — populado automaticamente pelo
 * trigger do banco (trg_turmas_audit), nada escrito pela aplicação.
 */
export async function getAuditoriaTurma(turmaId: string): Promise<AuditoriaTurmaRow[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("turmas_auditoria")
    .select(
      "id, campo_alterado, valor_anterior, valor_novo, alterado_em, usuarios!turmas_auditoria_alterado_por_fkey(nome_completo)",
    )
    .eq("turma_id", turmaId)
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

/** Componentes curriculares já vinculados a uma turma (edição). */
export async function getComponentesTurma(turmaId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("turma_componentes")
    .select("componente_id")
    .eq("turma_id", turmaId);

  return (data ?? []).map((row) => row.componente_id as string);
}

export type ProfessorVinculado = {
  id: string;
  usuarioId: string;
  nome: string;
  funcao: string;
  status: "ativo" | "inativo";
  componenteIds: string[];
  componentesNomes: string[];
  escopoEja: string[];
};

/**
 * Professores vinculados a uma turma (Bloco 4) — join usuario_turmas +
 * usuarios + usuario_turma_componentes, mesmas tabelas que já alimentam o
 * vínculo do lado do Cadastro de Usuário.
 */
export async function getProfessoresVinculados(turmaId: string): Promise<ProfessorVinculado[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("usuario_turmas")
    .select(
      `id, usuario_id, status, escopo_eja,
       usuarios!usuario_turmas_usuario_id_fkey(nome_completo, funcao),
       usuario_turma_componentes(componente_id, componentes_curriculares(nome))`,
    )
    .eq("turma_id", turmaId);

  return (data ?? []).map((row) => {
    const usuario = row.usuarios as unknown as { nome_completo: string; funcao: string } | null;
    const componentesLinks = (row.usuario_turma_componentes ?? []) as unknown as {
      componente_id: string;
      componentes_curriculares: { nome: string } | null;
    }[];

    return {
      id: row.id,
      usuarioId: row.usuario_id,
      nome: usuario?.nome_completo ?? "",
      funcao: usuario?.funcao ?? "",
      status: row.status as "ativo" | "inativo",
      componenteIds: componentesLinks.map((c) => c.componente_id),
      componentesNomes: componentesLinks.map((c) => c.componentes_curriculares?.nome ?? ""),
      escopoEja: row.escopo_eja ?? [],
    };
  });
}

export type ProfessorElegivel = { id: string; nome: string; funcao: string };

/** Usuários ativos com função docente — candidatos a vínculo (Bloco 4). */
export async function getProfessoresElegiveis(): Promise<ProfessorElegivel[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("usuarios")
    .select("id, nome_completo, funcao")
    .eq("status", "ativo")
    .order("nome_completo");

  return (data ?? [])
    .filter((usuario) => isFuncaoProfessor(usuario.funcao))
    .map((usuario) => ({ id: usuario.id, nome: usuario.nome_completo, funcao: usuario.funcao }));
}
