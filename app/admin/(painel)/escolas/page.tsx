import { Building2 } from "lucide-react";

import { PageTitle } from "@/components/layout/page-title";
import { FutureModuleCard } from "@/components/ui/future-module-card";

export default function AdminEscolasPage() {
  return (
    <div>
      <PageTitle value="Escolas" />
      <FutureModuleCard icon={Building2} titulo="Cadastro de escolas" descricao="Criar e editar escolas e selecionar a mantenedora de cada uma." />
    </div>
  );
}
