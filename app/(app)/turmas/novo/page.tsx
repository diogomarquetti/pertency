import { PageTitle } from "@/components/layout/page-title";
import { TurmaForm } from "@/components/turmas/turma-form";
import { getViewerPodeGerirEscola } from "@/lib/supabase/get-viewer-role";

import { getReferenciaTurmaForm } from "../queries";

export default async function NovaTurmaPage() {
  const [referencia, canEdit] = await Promise.all([getReferenciaTurmaForm(), getViewerPodeGerirEscola()]);

  return (
    <div>
      <PageTitle
        value="Cadastrar Turma"
        breadcrumb={[{ label: "Turmas", href: "/turmas" }, { label: "Cadastrar turma" }]}
      />
      <TurmaForm mode="create" referencia={referencia} canEdit={canEdit} />
    </div>
  );
}
