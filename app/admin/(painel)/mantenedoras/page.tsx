import { Landmark } from "lucide-react";

import { PageTitle } from "@/components/layout/page-title";
import { FutureModuleCard } from "@/components/ui/future-module-card";

export default function AdminMantenedorasPage() {
  return (
    <div>
      <PageTitle value="Mantenedoras" />
      <FutureModuleCard icon={Landmark} titulo="Cadastro de mantenedoras" descricao="Criar e editar as mantenedoras que as escolas selecionam." />
    </div>
  );
}
