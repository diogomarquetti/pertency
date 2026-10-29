import { PageTitle } from "@/components/layout/page-title";
import { MANTENEDORA_VAZIA, MantenedoraForm } from "@/components/minha-escola/mantenedora-form";

import { criarMantenedora } from "../actions";

export default function NovaMantenedoraPage() {
  return (
    <div>
      <PageTitle
        value="Nova mantenedora"
        breadcrumb={[{ label: "Mantenedoras", href: "/mantenedoras" }, { label: "Nova mantenedora" }]}
      />
      <MantenedoraForm
        mantenedora={MANTENEDORA_VAZIA}
        canEdit
        salvar={criarMantenedora}
        cancelHref="/mantenedoras"
        saveLabel="Criar mantenedora"
      />
    </div>
  );
}
