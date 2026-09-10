import { notFound } from "next/navigation";

import { PageTitle } from "@/components/layout/page-title";
import { TurmaForm } from "@/components/turmas/turma-form";
import type { ScopePool } from "@/components/turmas/professor-vinculo-drawer";
import { createClient } from "@/lib/supabase/server";
import { getViewerIsAdmin } from "@/lib/supabase/get-viewer-role";

import {
  getAuditoriaTurma,
  getComponentesTurma,
  getProfessoresElegiveis,
  getProfessoresVinculados,
  getReferenciaTurmaForm,
} from "../../queries";
import type { UpdateTurmaValues } from "../../schema";

export default async function EditarTurmaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: turma } = await supabase
    .from("turmas")
    .select(
      `nome, ano_letivo_id, turno_id, capacidade, status, data_inicio, data_fim, observacoes,
       campos_experiencias, direitos_aprendizagem, objetivo_geral, etapa_do_ciclo, areas_conhecimento,
       unidades_ocupacionais, eixos_funcionais, oferta_id, etapa_ciclo_id, matriz_curricular_id,
       ofertas(slug)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (!turma) {
    notFound();
  }

  const [referencia, componenteIds, auditoria, professoresVinculados, professoresElegiveis, canEdit] =
    await Promise.all([
      getReferenciaTurmaForm(),
      getComponentesTurma(id),
      getAuditoriaTurma(id),
      getProfessoresVinculados(id),
      getProfessoresElegiveis(),
      getViewerIsAdmin(),
    ]);

  const ofertaSlug = (turma.ofertas as unknown as { slug: string } | null)?.slug ?? "";

  const scopePool: ScopePool = {
    ofertaSlug: ofertaSlug as ScopePool["ofertaSlug"],
    componentes: referencia.componentes.filter((componente) => componenteIds.includes(componente.id)),
    areasConhecimento: turma.areas_conhecimento ?? [],
    unidadesOcupacionais: turma.unidades_ocupacionais ?? [],
    eixosFuncionais: turma.eixos_funcionais ?? [],
  };

  const defaultValues: UpdateTurmaValues = {
    nome: turma.nome,
    anoLetivoId: turma.ano_letivo_id,
    turnoId: turma.turno_id,
    capacidade: turma.capacidade ? String(turma.capacidade) : "",
    ofertaSlug: ofertaSlug as UpdateTurmaValues["ofertaSlug"],
    ofertaId: turma.oferta_id,
    organizacaoId: turma.etapa_ciclo_id,
    matrizCurricularId: turma.matriz_curricular_id,
    status: turma.status as UpdateTurmaValues["status"],
    dataInicio: turma.data_inicio,
    dataFim: turma.data_fim ?? "",
    observacoes: turma.observacoes ?? "",
    camposExperiencias: turma.campos_experiencias ?? [],
    direitosAprendizagem: turma.direitos_aprendizagem ?? [],
    objetivoGeral: turma.objetivo_geral ?? "",
    etapaDoCiclo: turma.etapa_do_ciclo ?? "",
    areasConhecimento: turma.areas_conhecimento ?? [],
    componenteIds,
    unidadesOcupacionais: turma.unidades_ocupacionais ?? [],
    eixosFuncionais: turma.eixos_funcionais ?? [],
  };

  return (
    <div>
      <PageTitle
        value={canEdit ? "Editar Turma" : "Visualizar Turma"}
        breadcrumb={[
          { label: "Turmas", href: "/turmas" },
          { label: canEdit ? "Editar turma" : "Visualizar turma" },
        ]}
      />
      <TurmaForm
        mode="edit"
        turmaId={id}
        referencia={referencia}
        defaultValues={defaultValues}
        auditoria={auditoria}
        professoresVinculados={professoresVinculados}
        professoresElegiveis={professoresElegiveis}
        scopePool={scopePool}
        canEdit={canEdit}
      />
    </div>
  );
}
