import { PageTitle } from "@/components/layout/page-title";
import { UsuariosPlataformaLista } from "@/components/admin/usuarios-plataforma-lista";

import { listarOpcoesEscola, listarUsuarios } from "./queries";

export default async function AdminUsuariosPage() {
  const [usuarios, escolas] = await Promise.all([listarUsuarios(), listarOpcoesEscola()]);

  return (
    <div>
      <PageTitle value="Usuários" />
      <UsuariosPlataformaLista usuarios={usuarios} escolas={escolas} />
    </div>
  );
}
