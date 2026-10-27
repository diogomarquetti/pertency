import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { SeloAlerta, SuaTurma } from "@/lib/pendencias/paineis";

import { PainelCard } from "./painel-card";

// Quantos estudantes com alerta cabem por turma antes do "Ver todos".
const LIMITE_ESTUDANTES = 6;

const VARIANTE_SELO: Record<SeloAlerta["risco"], "danger" | "warning" | "neutral"> = {
  alto: "danger",
  medio: "warning",
  baixo: "neutral",
};

// Só o tipo de cada alerta funcional de Condição do estudante — nada
// clínico (sem CID nem diagnóstico). O texto completo fica no Perfil do
// Estudante, a um clique no nome.
export function PainelSuaTurma({ turmas }: { turmas: SuaTurma[] }) {
  const comEstudantes = turmas.filter((turma) => turma.total > 0);

  if (comEstudantes.length === 0) {
    return (
      <PainelCard titulo="Sua turma">
        <p className="text-[13px] text-muted">
          {turmas.length === 0
            ? "Você ainda não está vinculado(a) a nenhuma turma ativa."
            : "Nenhum estudante ativo nas suas turmas."}
        </p>
      </PainelCard>
    );
  }

  return comEstudantes.map((turma) => {
    const semAlertas = turma.total - turma.comAlertas.length;
    const visiveis = turma.comAlertas.slice(0, LIMITE_ESTUDANTES);
    const ocultos = turma.comAlertas.length - visiveis.length;

    return (
      <PainelCard
        key={turma.id}
        titulo={comEstudantes.length === 1 ? "Sua turma" : turma.nome}
        contagem={`${turma.total} ${turma.total === 1 ? "estudante" : "estudantes"}`}
        rodape={
          turma.comAlertas.length === 0
            ? "Nenhum estudante tem alertas registrados em Condição do estudante."
            : semAlertas === 1
              ? "O outro estudante não tem alertas registrados em Condição do estudante."
              : semAlertas > 1
                ? `Os outros ${semAlertas} estudantes não têm alertas registrados em Condição do estudante.`
                : undefined
        }
      >
        <p className="-mt-1 mb-1 text-[13px] text-muted">
          {[comEstudantes.length === 1 && turma.nome, turma.organizacao].filter(Boolean).join(" · ")}
        </p>

        {visiveis.length > 0 && (
          <>
            <p className="mt-2 text-caption tracking-[.06em] text-muted uppercase">Alertas para a rotina</p>
            <ul>
              {visiveis.map((estudante) => (
                <li
                  key={estudante.id}
                  className="flex flex-col gap-[6px] border-t border-line py-[10px] first:border-t-0 last:pb-0"
                >
                  <Link
                    href={`/estudantes/${estudante.id}`}
                    className="text-[14px] font-semibold text-ink hover:text-brand"
                  >
                    {estudante.nome}
                  </Link>
                  <div className="flex flex-wrap gap-[6px]">
                    {estudante.selos.map((selo) => (
                      <Badge key={selo.rotulo} variant={VARIANTE_SELO[selo.risco]} dot={false} title={selo.descricao}>
                        {selo.rotulo}
                      </Badge>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            {ocultos > 0 && (
              <Link href="/estudantes" className="mt-2 inline-block text-[13px] font-semibold text-brand hover:underline">
                Ver todos ({ocultos === 1 ? "mais 1 estudante" : `mais ${ocultos} estudantes`} com alertas)
              </Link>
            )}
          </>
        )}
      </PainelCard>
    );
  });
}
