import { redirect } from "next/navigation";

import { PageTitle } from "@/components/layout/page-title";
import { MantenedoraForm } from "@/components/minha-escola/mantenedora-form";
import { getViewerIsAdmin } from "@/lib/supabase/get-viewer-role";

import { getMantenedoraAtual } from "../queries";

export default async function MantenedoraPage() {
  const [mantenedora, canEdit] = await Promise.all([getMantenedoraAtual(), getViewerIsAdmin()]);

  // Sem mantenedora vinculada não há o que mostrar — quem cadastra e vincula
  // é o operador da plataforma. O card em Configurações já explica isso.
  if (!mantenedora) {
    redirect("/minha-escola");
  }

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
