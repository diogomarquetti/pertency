import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SuaTurma } from "@/lib/pendencias/paineis";

import { PainelCard } from "./painel-card";

// Quantos estudantes com alerta cabem por turma antes do "Ver todos".
const LIMITE_ESTUDANTES = 6;

// Uma linha por estudante: nome e, abaixo, só os tipos de alerta funcional
// de Condição do estudante (alergia e medicação em destaque) — nada clínico,
// sem CID nem diagnóstico. O texto completo fica no Perfil do Estudante, a
// um clique na linha.
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
        <p className="-mt-1 text-[13px] text-muted">
          {[comEstudantes.length === 1 && turma.nome, turma.organizacao].filter(Boolean).join(" · ")}
        </p>

        {visiveis.length > 0 && (
          <ul className="mt-2 -mx-1 flex flex-col">
            {visiveis.map((estudante) => {
              return (
                <li key={estudante.id}>
                  <Link
                    href={`/estudantes/${estudante.id}`}
                    title={estudante.selos.map((selo) => `${selo.rotulo}: ${selo.descricao}`).join("\n")}
                    className="group flex items-start gap-[10px] rounded-sm px-1 py-[8px] transition-colors hover:bg-bg"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-ink group-hover:text-brand">
                        {estudante.nome}
                      </span>
                      <span className="block text-[13px] text-muted">
                        {estudante.selos.map((selo, index) => (
                          <span key={selo.rotulo}>
                            {index > 0 && " · "}
                            <span className={cn(selo.risco === "alto" && "font-medium text-danger")}>{selo.rotulo}</span>
                          </span>
                        ))}
                      </span>
                    </span>
                    <ChevronRight
                      size={14}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="mt-[4px] shrink-0 text-muted group-hover:text-brand"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {ocultos > 0 && (
          <Link href="/estudantes" className="mt-1 inline-block text-[13px] font-semibold text-brand hover:underline">
            Ver todos ({ocultos === 1 ? "mais 1 estudante" : `mais ${ocultos} estudantes`} com alertas)
          </Link>
        )}
      </PainelCard>
    );
  });
}
