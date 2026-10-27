import { PageTitle } from "@/components/layout/page-title";
import { createClient } from "@/lib/supabase/server";
import { getViewerIsAdmin } from "@/lib/supabase/get-viewer-role";
import { getTurmasAtivas } from "@/lib/pendencias/fontes/turmas";

import { TurmasLista, type FiltroPendencia, type TurmaListItem } from "./turmas-lista";

export default async function TurmasPage({
  searchParams,
}: {
  searchParams: Promise<{ pendencia?: string }>;
}) {
  const supabase = await createClient();
  const { pendencia } = await searchParams;
  const [{ data: turmas }, canEdit] = await Promise.all([
    supabase
      .from("turmas")
      .select(
        "id, nome, status, ofertas(slug, nome), turnos(nome), anos_letivos(ano)",
      )
      .order("nome"),
    getViewerIsAdmin(),
  ]);

  const items: TurmaListItem[] = (turmas ?? []).map((turma) => {
    const oferta = turma.ofertas as unknown as { slug: string; nome: string } | null;
    const turno = turma.turnos as unknown as { nome: string } | null;
    const anoLetivo = turma.anos_letivos as unknown as { ano: number } | null;

    return {
      id: turma.id,
      nome: turma.nome,
      status: turma.status as TurmaListItem["status"],
      ofertaSlug: oferta?.slug ?? "",
      ofertaNome: oferta?.nome ?? "",
      turnoNome: turno?.nome ?? "",
      anoLetivo: anoLetivo?.ano ?? 0,
    };
  });

  // Filtro vindo da homepage ("Revisar organização da oferta").
  let filtroPendencia: FiltroPendencia | null = null;
  if (pendencia === "organizacao") {
    const turmasAtivas = await getTurmasAtivas();
    filtroPendencia = {
      label: "Organização a revisar",
      motivoPorTurma: Object.fromEntries(
        turmasAtivas
          .filter((turma) => turma.organizacaoDescontinuada)
          .map((turma) => [turma.id, `Organização descontinuada: ${turma.organizacaoNome}`]),
      ),
    };
  }

  return (
    <div>
      <PageTitle value="Turmas" />
      <TurmasLista turmas={items} canEdit={canEdit} filtroPendencia={filtroPendencia} />
    </div>
  );
}
