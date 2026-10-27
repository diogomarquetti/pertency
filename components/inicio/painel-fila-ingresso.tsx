import Link from "next/link";

import { cn } from "@/lib/utils";
import type { FilaIngresso } from "@/lib/pendencias/paineis";

import { PainelCard } from "./painel-card";

export function PainelFilaIngresso({ fila }: { fila: FilaIngresso }) {
  const { naoElegiveisNoMes } = fila;

  return (
    <PainelCard
      titulo="Fila de ingresso"
      contagem={`${fila.total} ${fila.total === 1 ? "estudante" : "estudantes"}`}
      rodape={
        naoElegiveisNoMes.length === 0 ? (
          "Nenhum estudante não elegível neste mês."
        ) : (
          <>
            Não {naoElegiveisNoMes.length === 1 ? "elegível" : "elegíveis"} neste mês:{" "}
            {naoElegiveisNoMes.map((estudante, index) => (
              <span key={estudante.id}>
                {index > 0 && "; "}
                <b className="font-semibold text-ink">{estudante.nome}</b>
                {estudante.encaminhamento && ` (${estudante.encaminhamento.toLowerCase()})`}
              </span>
            ))}
            .
          </>
        )
      }
    >
      <ol className="flex flex-col">
        {fila.etapas.map((etapa, index) => (
          <li key={etapa.etapa} className="relative grid grid-cols-[22px_minmax(0,1fr)] gap-[12px] pb-2 last:pb-0">
            {index < fila.etapas.length - 1 && (
              <span aria-hidden="true" className="absolute top-[24px] bottom-[2px] left-[10px] w-[2px] bg-line" />
            )}
            <span className="flex size-[22px] items-center justify-center rounded-full border-2 border-blue-100 bg-surface text-caption font-bold text-blue-700">
              {index + 1}
            </span>
            <div className="min-w-0">
              <h3 className="mt-[1px] mb-1 flex items-baseline gap-1 text-[14px] font-semibold text-ink">
                {etapa.etapa}
                <span className="text-caption font-normal text-muted">{etapa.estudantes.length}</span>
              </h3>
              {etapa.estudantes.length === 0 ? (
                <p className="text-[13px] text-muted">Ninguém nesta etapa</p>
              ) : (
                <div className="flex flex-wrap gap-[6px]">
                  {etapa.estudantes.map((estudante) => (
                    <Link
                      key={estudante.id}
                      href={`/estudantes/${estudante.id}`}
                      className={cn(
                        "inline-flex items-center gap-[6px] rounded-full border px-[10px] py-[3px] text-[13px] text-ink transition-colors hover:border-blue-100",
                        estudante.atrasado ? "border-danger-tint bg-danger-tint" : "border-line bg-surface",
                      )}
                    >
                      {estudante.nome}
                      <small className={cn("text-caption", estudante.atrasado ? "text-danger" : "text-muted")}>
                        {estudante.tempo}
                        {estudante.atrasado && <span className="sr-only"> (atrasado)</span>}
                      </small>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </PainelCard>
  );
}
