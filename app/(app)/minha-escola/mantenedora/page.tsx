import { PageTitle } from "@/components/layout/page-title";
import { MantenedoraForm } from "@/components/minha-escola/mantenedora-form";
import { getViewerIsAdmin } from "@/lib/supabase/get-viewer-role";

import { getMantenedoraAtual } from "../queries";

export default async function MantenedoraPage() {
  const [mantenedora, canEdit] = await Promise.all([getMantenedoraAtual(), getViewerIsAdmin()]);

  return (
    <div>
      <PageTitle
        value="Mantenedora"
        breadcrumb={[{ label: "Configurações", href: "/minha-escola" }, { label: "Mantenedora" }]}
      />
      <MantenedoraForm mantenedora={mantenedora} canEdit={canEdit} />
    </div>
  );
}
