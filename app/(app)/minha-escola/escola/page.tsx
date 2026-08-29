import { PageTitle } from "@/components/layout/page-title";
import { EscolaForm } from "@/components/minha-escola/escola-form";
import { getViewerIsAdmin } from "@/lib/supabase/get-viewer-role";

import { getEscolaAtualCompleta } from "../queries";

export default async function EscolaPage() {
  const [escola, canEdit] = await Promise.all([getEscolaAtualCompleta(), getViewerIsAdmin()]);

  // A linha de escolas sempre existe (criada no bootstrap) — se não veio,
  // é falha de bootstrap/RLS, não um estado de UI a tratar como "vazio".
  if (!escola) {
    throw new Error("Escola não encontrada para o usuário logado.");
  }

  return (
    <div>
      <PageTitle
        value="Escola"
        breadcrumb={[{ label: "Configurações", href: "/minha-escola" }, { label: "Escola" }]}
      />
      <EscolaForm escola={escola} canEdit={canEdit} />
    </div>
  );
}
