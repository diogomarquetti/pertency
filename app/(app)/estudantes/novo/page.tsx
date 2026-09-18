import { PageTitle } from "@/components/layout/page-title";
import { EstudanteForm } from "@/components/estudantes/estudante-form";
import { getViewerCanEditEstudante } from "@/lib/supabase/get-viewer-role";

export default async function NovoEstudantePage() {
  const canEdit = await getViewerCanEditEstudante();

  return (
    <div>
      <PageTitle
        value="Cadastrar Estudante"
        breadcrumb={[{ label: "Estudantes", href: "/estudantes" }, { label: "Cadastrar estudante" }]}
      />
      <EstudanteForm mode="create" canEdit={canEdit} />
    </div>
  );
}
