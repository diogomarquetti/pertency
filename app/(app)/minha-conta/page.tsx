import { notFound } from "next/navigation";

import { PageTitle } from "@/components/layout/page-title";
import { MinhaContaView } from "@/components/minha-conta/minha-conta-view";

import { getMeuPerfil } from "./queries";

export default async function MinhaContaPage() {
  const perfil = await getMeuPerfil();

  if (!perfil) {
    notFound();
  }

  return (
    <div>
      <PageTitle value="Minha conta" />
      <MinhaContaView perfil={perfil} />
    </div>
  );
}
