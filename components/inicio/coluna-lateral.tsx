import {
  getConfiguracaoEscola,
  getFilaIngresso,
  getOcupacaoTurmas,
  getSuasTurmas,
  PAINEIS_POR_PERFIL,
  type PainelTipo,
} from "@/lib/pendencias/paineis";
import type { Perfil } from "@/lib/pendencias/perfis";

import { PainelConfiguracao } from "./painel-configuracao";
import { PainelFilaIngresso } from "./painel-fila-ingresso";
import { PainelOcupacao } from "./painel-ocupacao";
import { PainelSuaTurma } from "./painel-sua-turma";

async function renderizarPainel(tipo: PainelTipo, usuarioId: string) {
  switch (tipo) {
    case "fila":
      return <PainelFilaIngresso key={tipo} fila={await getFilaIngresso()} />;
    case "ocupacao":
      return <PainelOcupacao key={tipo} turmas={await getOcupacaoTurmas()} />;
    case "sua_turma":
      return <PainelSuaTurma key={tipo} turmas={await getSuasTurmas(usuarioId)} />;
    case "configuracao":
      return <PainelConfiguracao key={tipo} itens={await getConfiguracaoEscola()} />;
  }
}

/**
 * Coluna lateral da homepage, por perfil. Mesmo princípio dos tipos de
 * pendência: um painel que falha some sozinho, sem derrubar a página.
 */
export async function ColunaLateral({ perfil, usuarioId }: { perfil: Perfil; usuarioId: string }) {
  const tipos = PAINEIS_POR_PERFIL[perfil];
  if (tipos.length === 0) return null;

  const paineis = await Promise.allSettled(tipos.map((tipo) => renderizarPainel(tipo, usuarioId)));

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {paineis.map((resultado, index) => {
        if (resultado.status === "fulfilled") return resultado.value;
        console.error(`[inicio] falha ao carregar o painel "${tipos[index]}"`, resultado.reason);
        return null;
      })}
    </div>
  );
}
