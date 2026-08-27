import { PageTitle } from "@/components/layout/page-title";
import { UserForm } from "@/components/usuarios/user-form";

import { getReferenciaTurmas } from "../queries";

export default async function NovoUsuarioPage() {
  const referencia = await getReferenciaTurmas();

  return (
    <div>
      <PageTitle
        value="Cadastrar Usuário"
        breadcrumb={[{ label: "Usuários", href: "/usuarios" }, { label: "Cadastrar usuário" }]}
      />
      <UserForm mode="create" referencia={referencia} />
    </div>
  );
}
