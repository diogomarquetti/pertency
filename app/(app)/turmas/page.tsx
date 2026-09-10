import { PageTitle } from "@/components/layout/page-title";
import { createClient } from "@/lib/supabase/server";
import { getViewerIsAdmin } from "@/lib/supabase/get-viewer-role";

import { TurmasLista, type TurmaListItem } from "./turmas-lista";

export default async function TurmasPage() {
  const supabase = await createClient();
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

  return (
    <div>
      <PageTitle value="Turmas" />
      <TurmasLista turmas={items} canEdit={canEdit} />
    </div>
  );
}
