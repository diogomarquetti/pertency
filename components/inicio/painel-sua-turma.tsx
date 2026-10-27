import Link from "next/link";

import type { SuaTurma } from "@/lib/pendencias/paineis";

import { PainelCard } from "./painel-card";

// Só os alertas funcionais de Condição do estudante (mesmos do Perfil do
// Estudante) — nada clínico: sem CID nem diagnóstico.
export function PainelSuaTurma({ turmas }: { turmas: SuaTurma[] }) {
  if (turmas.length === 0) {
    return (
      <PainelCard titulo="Sua turma">
        <p className="text-[13px] text-muted">Você ainda não está vinculado(a) a nenhuma turma ativa.</p>
      </PainelCard>
    );
  }

  return turmas.map((turma) => {
    const semAlertas = turma.total - turma.comAlertas.length;
    return (
      <PainelCard
        key={turma.id}
        titulo={turmas.length === 1 ? "Sua turma" : turma.nome}
        contagem={`${turma.total} ${turma.total === 1 ? "estudante" : "estudantes"}`}
        rodape={
          turma.total === 0
            ? undefined
            : turma.comAlertas.length === 0
              ? "Nenhum estudante tem alertas registrados em Condição do estudante."
              : semAlertas > 0
                ? semAlertas === 1
                  ? "O outro estudante não tem alertas registrados em Condição do estudante."
                  : `Os outros ${semAlertas} estudantes não têm alertas registrados em Condição do estudante.`
                : undefined
        }
      >
        <p className="-mt-1 mb-1 text-[13px] text-muted">
          {[turmas.length === 1 && turma.nome, turma.organizacao].filter(Boolean).join(" · ")}
        </p>

        {turma.total === 0 ? (
          <p className="text-[13px] text-muted">Nenhum estudante ativo nesta turma.</p>
        ) : turma.comAlertas.length > 0 ? (
          <>
            <p className="mt-2 text-caption tracking-[.06em] text-muted uppercase">Alertas para a rotina</p>
            <ul>
              {turma.comAlertas.map((estudante) => (
                <li key={estudante.id} className="border-t border-line py-[12px] first:border-t-0 last:pb-0">
                  <Link
                    href={`/estudantes/${estudante.id}`}
                    className="text-[14px] font-semibold text-ink hover:text-brand"
                  >
                    {estudante.nome}
                  </Link>
                  <ul className="mt-[2px] flex flex-col gap-[2px]">
                    {estudante.alertas.map((alerta) => (
                      <li key={alerta.titulo} className="text-[13.5px] leading-normal text-ink">
                        <span className="font-medium">{alerta.titulo}:</span> {alerta.descricao}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </PainelCard>
    );
  });
}
