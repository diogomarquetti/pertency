import { notFound } from "next/navigation";

import { PageTitle } from "@/components/layout/page-title";
import { UsuarioPlataformaForm } from "@/components/admin/usuario-plataforma-form";

import { getUsuario } from "../queries";

export default async function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await getUsuario(id);

  if (!usuario) notFound();

  return (
    <div>
      <PageTitle
        value={usuario.valores.nomeCompleto}
        breadcrumb={[{ label: "Usuários", href: "/usuarios" }, { label: usuario.valores.nomeCompleto }]}
      />
      <UsuarioPlataformaForm mode="edit" usuarioId={id} escola={usuario.escola} defaultValues={usuario.valores} />
    </div>
  );
}
