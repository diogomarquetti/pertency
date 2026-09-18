import { notFound } from "next/navigation";

import { PageTitle } from "@/components/layout/page-title";
import { PerfilEstudante } from "@/components/estudantes/perfil/perfil-estudante";
import { getViewerCanEditEstudante } from "@/lib/supabase/get-viewer-role";

import {
  getDadosEscolares,
  getPerfilEstudante,
  getPerfilFuncionalEstudante,
  getReferenciaOfertas,
  getVinculosEscolaresAnuais,
} from "../queries";
import { calcularIdade } from "../schema";

export default async function PerfilEstudantePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [estudante, vinculos, dadosEscolares, perfilFuncional, referenciaOfertas, canEdit] =
    await Promise.all([
      getPerfilEstudante(id),
      getVinculosEscolaresAnuais(id),
      getDadosEscolares(id),
      getPerfilFuncionalEstudante(id),
      getReferenciaOfertas(),
      getViewerCanEditEstudante(),
    ]);

  if (!estudante) {
    notFound();
  }

  // Vínculos já vêm ordenados por ano letivo desc — o primeiro é o atual.
  const vinculoAtual = vinculos[0] ?? null;
  const ofertaAtualNome = vinculoAtual
    ? (referenciaOfertas.ofertas.find((oferta) => oferta.id === vinculoAtual.ofertaAtualId)?.nome ?? null)
    : null;
  const turmaAtualLabel =
    vinculoAtual?.turmaNome && ofertaAtualNome
      ? `${ofertaAtualNome} — ${vinculoAtual.turmaNome}`
      : (vinculoAtual?.turmaNome ?? null);

  return (
    <div>
      <PageTitle
        value={estudante.nomeCompleto}
        breadcrumb={[{ label: "Estudantes", href: "/estudantes" }, { label: estudante.nomeCompleto }]}
      />
      <PerfilEstudante
        estudante={estudante}
        idade={calcularIdade(estudante.dataNascimento)}
        turmaAtualLabel={turmaAtualLabel}
        matriculaInterna={vinculoAtual?.matriculaInterna || null}
        dataIngresso={dadosEscolares?.dataIngresso || null}
        perfilFuncional={perfilFuncional}
        canEdit={canEdit}
      />
    </div>
  );
}
