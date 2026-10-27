import { cache } from "react";

import { isOrganizacaoAtiva } from "@/lib/ofertas-config";
import { createClient } from "@/lib/supabase/server";

/**
 * Turmas ativas da escola com a organização da oferta, os componentes
 * esperados e os cobertos por professor — fonte dos tipos
 * turma_organizacao_legada e componente_sem_professor, e do filtro
 * /turmas?pendencia=organizacao. Duas consultas por requisição.
 */

export type ComponenteTurma = { id: string; nome: string };

export type TurmaAtiva = {
  id: string;
  nome: string;
  createdAt: string;
  organizacaoNome: string;
  /** Organização fora da configuração central (lib/ofertas-config.ts). */
  organizacaoDescontinuada: boolean;
  /** Componentes esperados sem nenhum professor ativo vinculado. */
  componentesSemProfessor: ComponenteTurma[];
};

type UsuarioTurmaRow = {
  status: string;
  usuarios: { status: string } | null;
  usuario_turma_componentes: { componente_id: string }[] | null;
};

export const getTurmasAtivas = cache(async (): Promise<TurmaAtiva[]> => {
  const supabase = await createClient();

  const [turmasResult, matrizResult] = await Promise.all([
    supabase
      .from("turmas")
      .select(
        `id, nome, created_at, matriz_curricular_id,
         ofertas(slug),
         etapas_ciclos(nome, codigo),
         turma_componentes(componente_id, componentes_curriculares(nome)),
         usuario_turmas(status,
           usuarios!usuario_turmas_usuario_id_fkey(status),
           usuario_turma_componentes(componente_id))`,
      )
      .eq("status", "ativa")
      .order("nome"),
    supabase.from("matriz_componentes").select("matriz_id, componente_id, ordem, componentes_curriculares(nome)"),
  ]);

  if (turmasResult.error) throw turmasResult.error;
  if (matrizResult.error) throw matrizResult.error;

  const componentesPorMatriz = new Map<string, (ComponenteTurma & { ordem: number })[]>();
  for (const row of matrizResult.data ?? []) {
    const lista = componentesPorMatriz.get(row.matriz_id) ?? [];
    lista.push({
      id: row.componente_id,
      nome: (row.componentes_curriculares as unknown as { nome: string } | null)?.nome ?? "",
      ordem: row.ordem,
    });
    componentesPorMatriz.set(row.matriz_id, lista);
  }

  return (turmasResult.data ?? []).map((turma) => {
    const oferta = turma.ofertas as unknown as { slug: string } | null;
    const organizacao = turma.etapas_ciclos as unknown as { nome: string; codigo: string | null } | null;

    // EF: componentes da matriz. EJA: os escolhidos na turma. EI: não
    // trabalha com componentes curriculares.
    let esperados: ComponenteTurma[] = [];
    if (oferta?.slug === "ef") {
      esperados = [...(componentesPorMatriz.get(turma.matriz_curricular_id) ?? [])].sort((a, b) => a.ordem - b.ordem);
    } else if (oferta?.slug === "eja") {
      esperados = ((turma.turma_componentes ?? []) as unknown as {
        componente_id: string;
        componentes_curriculares: { nome: string } | null;
      }[]).map((row) => ({ id: row.componente_id, nome: row.componentes_curriculares?.nome ?? "" }));
    }

    const cobertos = new Set(
      ((turma.usuario_turmas ?? []) as unknown as UsuarioTurmaRow[])
        .filter((vinculo) => vinculo.status === "ativo" && vinculo.usuarios?.status === "ativo")
        .flatMap((vinculo) => (vinculo.usuario_turma_componentes ?? []).map((c) => c.componente_id)),
    );

    return {
      id: turma.id as string,
      nome: turma.nome as string,
      createdAt: turma.created_at as string,
      organizacaoNome: organizacao?.nome ?? "",
      organizacaoDescontinuada: !isOrganizacaoAtiva(organizacao?.codigo),
      componentesSemProfessor: esperados.filter((componente) => !cobertos.has(componente.id)),
    };
  });
});

export function listarNomes(nomes: string[]) {
  if (nomes.length <= 1) return nomes.join("");
  return `${nomes.slice(0, -1).join(", ")} e ${nomes.at(-1)}`;
}
