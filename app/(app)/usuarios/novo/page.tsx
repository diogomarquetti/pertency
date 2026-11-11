import { notFound } from "next/navigation";

import { PageTitle } from "@/components/layout/page-title";
import { UserForm } from "@/components/usuarios/user-form";
import { getViewerIsAdmin, getViewerPodeGerirEscola, getViewerPodeAbrirCadastroUsuario } from "@/lib/supabase/get-viewer-role";

import { getReferenciaTurmas } from "../queries";

export default async function NovoUsuarioPage() {
  if (!(await getViewerPodeAbrirCadastroUsuario())) {
    notFound();
  }

  const [referencia, canEdit, viewerEhAdmin] = await Promise.all([
    getReferenciaTurmas(),
    getViewerPodeGerirEscola(),
    getViewerIsAdmin(),
  ]);

  return (
    <div>
      <PageTitle
        value="Cadastrar Usuário"
        breadcrumb={[{ label: "Usuários", href: "/usuarios" }, { label: "Cadastrar usuário" }]}
      />
      <UserForm mode="create" referencia={referencia} canEdit={canEdit} podeAtribuirAdministrador={viewerEhAdmin} />
    </div>
  );
}
