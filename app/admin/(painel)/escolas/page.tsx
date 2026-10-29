import { PageTitle } from "@/components/layout/page-title";
import { EscolasLista } from "@/components/admin/escolas-lista";

import { listarEscolas } from "./queries";

export default async function AdminEscolasPage() {
  const escolas = await listarEscolas();

  return (
    <div>
      <PageTitle value="Escolas" />
      <EscolasLista escolas={escolas} />
    </div>
  );
}
