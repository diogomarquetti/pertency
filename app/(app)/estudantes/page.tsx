import { PageTitle } from "@/components/layout/page-title";
import { createClient } from "@/lib/supabase/server";
import { getViewerCanEditEstudante } from "@/lib/supabase/get-viewer-role";

import { EstudantesLista, type EstudanteListItem } from "./estudantes-lista";

export default async function EstudantesPage() {
  const supabase = await createClient();
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

  return (
    <div>
      <PageTitle value="Estudantes" />
      <EstudantesLista estudantes={items} canEdit={canEdit} />
    </div>
  );
}
