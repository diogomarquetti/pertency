import { PageTitle } from "@/components/layout/page-title";
import { ConfiguracoesLista } from "@/components/minha-escola/configuracoes-lista";

import { getEscolaAtualCompleta, getMantenedoraAtual } from "./queries";

export default async function MinhaEscolaPage() {
  const [escola, mantenedora] = await Promise.all([
    getEscolaAtualCompleta(),
    getMantenedoraAtual(),
  ]);

  // A linha de escolas sempre existe (criada no bootstrap) — se não veio,
  // é falha de bootstrap/RLS, não um estado de UI a tratar como "vazio".
  // `mantenedora`, ao contrário, pode legitimamente ser null (ainda não
  // cadastrada) — ConfiguracoesLista trata isso como get-or-create.
  if (!escola) {
    throw new Error("Escola não encontrada para o usuário logado.");
  }

  return (
    <div>
      <PageTitle value="Configurações" />
      <ConfiguracoesLista escola={escola} mantenedora={mantenedora} />
    </div>
  );
}
