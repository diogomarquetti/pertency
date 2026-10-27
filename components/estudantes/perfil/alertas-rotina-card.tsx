import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { montarAlertas } from "@/app/(app)/estudantes/perfil-funcional-alertas";
import type { PerfilFuncionalEstudante } from "@/app/(app)/estudantes/queries";

export function AlertasRotinaCard({
  estudanteId,
  perfilFuncional,
}: {
  estudanteId: string;
  perfilFuncional: PerfilFuncionalEstudante | null;
}) {
  const alertas = montarAlertas(perfilFuncional);

  return (
    <Card className="gap-3 p-[24px]">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <h2 className="flex items-center gap-2 text-highlight text-ink">
          <AlertTriangle size={16} strokeWidth={2} className="text-warning" aria-hidden="true" />
          Alertas para a rotina
        </h2>
        <Link
          href={`/estudantes/${estudanteId}/editar?aba=condicao`}
          className="flex items-center gap-1 text-[13px] font-semibold text-brand hover:underline"
        >
          Ver condição do estudante
          <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>

      {alertas.length === 0 ? (
        <p className="text-[13px] text-muted">Nenhum alerta registrado.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {alertas.map((alerta) => (
            <div
              key={alerta.titulo}
              className="rounded-md bg-warning-tint px-[14px] py-[10px] text-warning-ink"
            >
              <div className="text-[13.5px] font-semibold">{alerta.titulo}</div>
              <div className="mt-[2px] text-[13px] leading-relaxed">{alerta.descricao}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
