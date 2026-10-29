import { PageTitle } from "@/components/layout/page-title";
import { UsuarioPlataformaForm } from "@/components/admin/usuario-plataforma-form";

import { listarOpcoesEscola } from "../queries";

export default async function NovoUsuarioPage() {
  const escolas = await listarOpcoesEscola();

  return (
    <div>
      <PageTitle value="Novo usuário" breadcrumb={[{ label: "Usuários", href: "/usuarios" }, { label: "Novo usuário" }]} />
      <UsuarioPlataformaForm mode="create" escolas={escolas} />
    </div>
  );
}
