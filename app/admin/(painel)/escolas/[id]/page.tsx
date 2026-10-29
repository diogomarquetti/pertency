import { notFound } from "next/navigation";

import { PageTitle } from "@/components/layout/page-title";
import { AdministradorEscolaCard } from "@/components/admin/administrador-escola-card";
import { EscolaForm } from "@/components/minha-escola/escola-form";

import { atualizarEscola } from "../actions";
import { getEscola, listarAdministradores, listarOpcoesMantenedora } from "../queries";

export default async function EditarEscolaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [escola, mantenedoras, administradores] = await Promise.all([
    getEscola(id),
    listarOpcoesMantenedora(),
    listarAdministradores(id),
  ]);

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
      <div className="mt-[24px]">
        <AdministradorEscolaCard escolaId={id} administradores={administradores} />
      </div>
    </div>
  );
}
