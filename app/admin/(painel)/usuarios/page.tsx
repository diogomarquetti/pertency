import { UserCog } from "lucide-react";

import { PageTitle } from "@/components/layout/page-title";
import { FutureModuleCard } from "@/components/ui/future-module-card";

export default function AdminUsuariosPage() {
  return (
    <div>
      <PageTitle value="Usuários" />
      <FutureModuleCard icon={UserCog} titulo="Usuários das escolas" descricao="Criar o administrador de cada escola e gerar o link de acesso." />
    </div>
  );
}
