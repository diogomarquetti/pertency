import { notFound } from "next/navigation";

import { PageTitle } from "@/components/layout/page-title";
import { MinhaContaForm } from "@/components/minha-conta/minha-conta-form";

import { getMeuPerfil } from "./queries";

export default async function MinhaContaPage() {
  const perfil = await getMeuPerfil();

  if (!perfil) {
    notFound();
  }

  return (
    <div>
      <PageTitle value="Minha conta" />
      <MinhaContaForm perfil={perfil} />
    </div>
  );
}
