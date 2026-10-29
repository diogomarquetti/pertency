import { notFound } from "next/navigation";

import { PageTitle } from "@/components/layout/page-title";
import { MantenedoraForm } from "@/components/minha-escola/mantenedora-form";

import { atualizarMantenedora } from "../actions";
import { getMantenedora } from "../queries";

export default async function EditarMantenedoraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mantenedora = await getMantenedora(id);

  if (!mantenedora) notFound();

  return (
    <div>
      <PageTitle
        value={mantenedora.razaoSocial}
        breadcrumb={[{ label: "Mantenedoras", href: "/mantenedoras" }, { label: mantenedora.razaoSocial }]}
      />
      <MantenedoraForm
        mantenedora={mantenedora}
        salvar={atualizarMantenedora.bind(null, id)}
        cancelHref="/mantenedoras"
      />
    </div>
  );
}
