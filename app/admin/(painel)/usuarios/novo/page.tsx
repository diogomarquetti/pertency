import { PageTitle } from "@/components/layout/page-title";
import { ConvidarOperadorForm } from "@/components/admin/operador-form";

export default function ConvidarOperadorPage() {
  return (
    <div>
      <PageTitle value="Convidar" breadcrumb={[{ label: "Usuários", href: "/usuarios" }, { label: "Convidar" }]} />
      <ConvidarOperadorForm />
    </div>
  );
}
