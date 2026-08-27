import { MinhaEscolaTabs } from "@/components/minha-escola/minha-escola-tabs";

import { getEscolaAtualCompleta, getMantenedoraAtual } from "./queries";

export default async function MinhaEscolaPage() {
  const [escola, mantenedora] = await Promise.all([
    getEscolaAtualCompleta(),
    getMantenedoraAtual(),
  ]);

  // A linha de escolas sempre existe (criada no bootstrap) — se não veio,
  // é falha de bootstrap/RLS, não um estado de UI a tratar como "vazio".
  // `mantenedora`, ao contrário, pode legitimamente ser null (ainda não
  // cadastrada) — MantenedoraTab trata isso como get-or-create.
  if (!escola) {
    throw new Error("Escola não encontrada para o usuário logado.");
  }

  return (
    <div>
      <MinhaEscolaTabs escola={escola} mantenedora={mantenedora} />
    </div>
  );
}
