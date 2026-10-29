import { redirect } from "next/navigation";

import { PageTitle } from "@/components/layout/page-title";
import { MantenedoraForm } from "@/components/minha-escola/mantenedora-form";

import { getMantenedoraAtual } from "../queries";

export default async function MantenedoraPage() {
  const mantenedora = await getMantenedoraAtual();

  // Sem mantenedora vinculada não há o que mostrar — quem cadastra e vincula
  // é o operador da plataforma. O card em Configurações já explica isso.
  if (!mantenedora) {
    redirect("/minha-escola");
  }

  return (
    <div>
      <PageTitle
        value="Mantenedora"
        breadcrumb={[{ label: "Configurações", href: "/minha-escola" }, { label: "Mantenedora" }]}
      />
      {/* Só leitura: quem mantém os dados é a equipe Pertency, no admin da plataforma. */}
      <MantenedoraForm mantenedora={mantenedora} cancelHref="/minha-escola" />
    </div>
  );
}
