import { notFound } from "next/navigation";

import { PageTitle } from "@/components/layout/page-title";
import { OperadorForm } from "@/components/admin/operador-form";
import { getOperadorAtual } from "@/lib/supabase/get-operador";

import { getOperador } from "../queries";

export default async function EditarOperadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [operador, eu] = await Promise.all([getOperador(id), getOperadorAtual()]);

  if (!operador) notFound();

  return (
    <div>
      <PageTitle
        value={operador.nomeCompleto}
        breadcrumb={[{ label: "Usuários", href: "/usuarios" }, { label: operador.nomeCompleto }]}
      />
      <OperadorForm operador={operador} ehVoce={operador.id === eu?.id} />
    </div>
  );
}
