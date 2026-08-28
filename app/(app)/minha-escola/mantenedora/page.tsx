import { PageTitle } from "@/components/layout/page-title";
import { MantenedoraForm } from "@/components/minha-escola/mantenedora-form";

import { getMantenedoraAtual } from "../queries";

export default async function MantenedoraPage() {
  const mantenedora = await getMantenedoraAtual();

  return (
    <div>
      <PageTitle
        value="Mantenedora"
        breadcrumb={[{ label: "Configurações", href: "/minha-escola" }, { label: "Mantenedora" }]}
      />
      <MantenedoraForm mantenedora={mantenedora} />
    </div>
  );
}
