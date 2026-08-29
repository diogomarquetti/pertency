import { Building2, Landmark } from "lucide-react";

import { STATUS_OPTIONS } from "@/app/(app)/minha-escola/schema";
import type { EscolaAtual, MantenedoraAtual } from "@/app/(app)/minha-escola/queries";

import { ConfiguracaoCard } from "./configuracao-card";

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.label]),
);

function statusBadge(status: "ativa" | "inativa") {
  return {
    label: STATUS_LABEL[status] ?? status,
    variant: status === "ativa" ? ("success" as const) : ("neutral" as const),
  };
}

export function ConfiguracoesLista({
  escola,
  mantenedora,
  canEdit,
}: {
  escola: EscolaAtual;
  mantenedora: MantenedoraAtual | null;
  canEdit: boolean;
}) {
  return (
    <div className="flex flex-col gap-[16px]">
      <ConfiguracaoCard
        icon={Building2}
        tipo="Escola"
        titulo={escola.nomeOficial}
        descricao={`${escola.municipio}/${escola.uf}`}
        status={statusBadge(escola.status)}
        href="/minha-escola/escola"
        preenchido
        canEdit={canEdit}
      />

      <ConfiguracaoCard
        icon={Landmark}
        tipo="Mantenedora"
        titulo={mantenedora?.razaoSocial ?? "Mantenedora"}
        descricao={mantenedora ? mantenedora.cnpj : "Nenhum dado cadastrado ainda."}
        status={mantenedora ? statusBadge(mantenedora.status) : undefined}
        href="/minha-escola/mantenedora"
        preenchido={mantenedora !== null}
        canEdit={canEdit}
      />
    </div>
  );
}
