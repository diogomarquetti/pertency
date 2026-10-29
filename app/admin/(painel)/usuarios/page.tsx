import { PageTitle } from "@/components/layout/page-title";
import { OperadoresLista } from "@/components/admin/operadores-lista";
import { getOperadorAtual } from "@/lib/supabase/get-operador";

import { listarOperadores } from "./queries";

export default async function AdminUsuariosPage() {
  const [operadores, eu] = await Promise.all([listarOperadores(), getOperadorAtual()]);

  return (
    <div>
      <PageTitle value="Usuários" />
      <OperadoresLista operadores={operadores} eu={eu?.id ?? ""} />
    </div>
  );
}
