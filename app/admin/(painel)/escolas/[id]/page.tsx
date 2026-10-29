import { notFound } from "next/navigation";

import { PageTitle } from "@/components/layout/page-title";
import { EscolaForm } from "@/components/minha-escola/escola-form";

import { atualizarEscola } from "../actions";
import { getEscola, listarOpcoesMantenedora } from "../queries";

export default async function EditarEscolaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [escola, mantenedoras] = await Promise.all([getEscola(id), listarOpcoesMantenedora()]);

  if (!escola) notFound();

  return (
    <div>
      <PageTitle
        value={escola.nomeOficial}
        breadcrumb={[{ label: "Escolas", href: "/escolas" }, { label: escola.nomeOficial }]}
      />
      <EscolaForm
        escola={escola}
        salvar={atualizarEscola.bind(null, id)}
        cancelHref="/escolas"
        mantenedoras={mantenedoras}
      />
    </div>
  );
}
