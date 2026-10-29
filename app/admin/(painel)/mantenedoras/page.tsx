import { PageTitle } from "@/components/layout/page-title";
import { MantenedorasLista } from "@/components/admin/mantenedoras-lista";

import { listarMantenedoras } from "./queries";

export default async function AdminMantenedorasPage() {
  const mantenedoras = await listarMantenedoras();

  return (
    <div>
      <PageTitle value="Mantenedoras" />
      <MantenedorasLista mantenedoras={mantenedoras} />
    </div>
  );
}
