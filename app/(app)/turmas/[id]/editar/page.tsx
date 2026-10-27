import { notFound } from "next/navigation";

import { PageTitle } from "@/components/layout/page-title";
import { TurmaForm } from "@/components/turmas/turma-form";
import type { ScopePool } from "@/components/turmas/professor-vinculo-drawer";
import { createClient } from "@/lib/supabase/server";
import { getViewerIsAdmin } from "@/lib/supabase/get-viewer-role";

import {
  getAuditoriaTurma,
  getComponentesTurma,
  getCronogramaTurma,
  getEstudantesVinculados,
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
       objetivo_geral, areas_conhecimento, unidades_ocupacionais, eixos_funcionais, oferta_id,
       etapa_ciclo_id, ciclo, etapas, matriz_curricular_id, forma_funcionamento, ofertas(slug)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (!turma) {
    notFound();
  }

  const [
    referencia,
    componenteIds,
    cronograma,
    auditoria,
    professoresVinculados,
    professoresElegiveis,
    estudantesVinculados,
    canEdit,
  ] = await Promise.all([
    getReferenciaTurmaForm(),
    getComponentesTurma(id),
    getCronogramaTurma(id),
    getAuditoriaTurma(id),
    getProfessoresVinculados(id),
    getProfessoresElegiveis(),
    getEstudantesVinculados(id),
    getViewerIsAdmin(),
  ]);

  const ofertaSlug = (turma.ofertas as unknown as { slug: string } | null)?.slug ?? "";

  const isEja = ofertaSlug === "eja";
  // EF: componentes do vínculo do professor vêm da matriz da turma. EJA
  // continua usando os componentes escolhidos na própria turma.
  const matriz = referencia.matrizes.find((m) => m.id === turma.matriz_curricular_id);
  const scopePool: ScopePool = {
    ofertaSlug: ofertaSlug as ScopePool["ofertaSlug"],
    componentes:
      ofertaSlug === "ef"
        ? (matriz?.componentes ?? []).map(({ id: componenteId, nome }) => ({ id: componenteId, nome }))
        : referencia.componentes.filter((componente) => componenteIds.includes(componente.id)),
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
    ciclo: turma.ciclo ? String(turma.ciclo) : "",
    etapas: (turma.etapas as number[] | null) ?? [],
    matrizCurricularId: turma.matriz_curricular_id,
    formaFuncionamento: (turma.forma_funcionamento ?? "diaria") as UpdateTurmaValues["formaFuncionamento"],
    status: turma.status as UpdateTurmaValues["status"],
    dataInicio: turma.data_inicio,
    dataFim: turma.data_fim ?? "",
    observacoes: turma.observacoes ?? "",
    objetivoGeral: turma.objetivo_geral ?? "",
    areasConhecimento: isEja ? (turma.areas_conhecimento ?? []) : [],
    componenteIds: isEja ? componenteIds : [],
    unidadesOcupacionais: turma.unidades_ocupacionais ?? [],
    eixosFuncionais: turma.eixos_funcionais ?? [],
    cronogramaDias: cronograma?.diasSemana ?? [],
    cronogramaHoraInicio: cronograma?.horaInicio ?? "",
    cronogramaHoraFim: cronograma?.horaFim ?? "",
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
        estudantesVinculados={estudantesVinculados}
        scopePool={scopePool}
        canEdit={canEdit}
      />
    </div>
  );
}
