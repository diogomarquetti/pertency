import { PageTitle } from "@/components/layout/page-title";
import { createClient } from "@/lib/supabase/server";
import { getViewerCanEditEstudante } from "@/lib/supabase/get-viewer-role";
import { getEstudantesComDocumentosPendentes } from "@/lib/pendencias/fontes/documentos";

import { EstudantesLista, type EstudanteListItem, type FiltroPendencia } from "./estudantes-lista";

export default async function EstudantesPage({
  searchParams,
}: {
  searchParams: Promise<{ pendencia?: string }>;
}) {
  const supabase = await createClient();
  const { pendencia } = await searchParams;
  const [{ data: estudantes }, canEdit] = await Promise.all([
    supabase
      .from("estudantes")
      .select("id, nome_completo, data_nascimento, situacao, foto_url")
      .order("nome_completo"),
    getViewerCanEditEstudante(),
  ]);

  const items: EstudanteListItem[] = (estudantes ?? []).map((estudante) => ({
    id: estudante.id,
    nomeCompleto: estudante.nome_completo,
    dataNascimento: estudante.data_nascimento,
    situacao: estudante.situacao,
    fotoUrl: estudante.foto_url,
  }));

  // Filtro vindo da homepage ("Documentos pendentes"). Só para quem lê
  // documentos pela RLS (os mesmos perfis que editam o estudante) — para os
  // demais o checklist viria vazio e todo mundo pareceria pendente.
  let filtroPendencia: FiltroPendencia | null = null;
  if (pendencia === "documentos" && canEdit) {
    const comPendencia = await getEstudantesComDocumentosPendentes();
    filtroPendencia = {
      label: "Com documentos pendentes",
      contagemPorEstudante: Object.fromEntries(
        comPendencia.map((estudante) => [
          estudante.id,
          `${estudante.pendentes.length} ${estudante.pendentes.length === 1 ? "documento pendente" : "documentos pendentes"}`,
        ]),
      ),
    };
  }

  return (
    <div>
      <PageTitle value="Estudantes" />
      <EstudantesLista estudantes={items} canEdit={canEdit} filtroPendencia={filtroPendencia} />
    </div>
  );
}
