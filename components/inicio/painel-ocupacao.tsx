import { cn } from "@/lib/utils";
import type { OcupacaoTurma } from "@/lib/pendencias/paineis";

import { PainelCard } from "./painel-card";

export function PainelOcupacao({ turmas }: { turmas: OcupacaoTurma[] }) {
  const ocupados = turmas.reduce((total, turma) => total + turma.ocupados, 0);
  const capacidade = turmas.reduce((total, turma) => total + (turma.capacidade ?? 0), 0);

  return (
    <PainelCard titulo="Ocupação das turmas" contagem={capacidade ? `${ocupados} de ${capacidade} vagas` : undefined}>
      {turmas.length === 0 ? (
        <p className="text-[13px] text-muted">Nenhuma turma ativa.</p>
      ) : (
        <ul className="flex flex-col gap-[12px]">
          {turmas.map((turma) => {
            const percentual = turma.capacidade ? Math.min(100, Math.round((turma.ocupados / turma.capacidade) * 100)) : 0;
            return (
              <li key={turma.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-[10px] gap-y-[4px] text-[13.5px]">
                <span className="truncate font-medium text-ink">{turma.nome}</span>
                <span className={cn("tabular-nums", turma.cheia ? "font-semibold text-warning" : "text-muted")}>
                  {turma.capacidade ? `${turma.ocupados}/${turma.capacidade}` : `${turma.ocupados} · sem capacidade`}
                </span>
                {turma.capacidade ? (
                  <div
                    role="img"
                    aria-label={`${turma.ocupados} de ${turma.capacidade} vagas ocupadas`}
                    className="col-span-2 h-[6px] overflow-hidden rounded-full border border-line bg-bg"
                  >
                    <div
                      className={cn("h-full rounded-full", turma.cheia ? "bg-warning" : "bg-brand")}
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </PainelCard>
  );
}
