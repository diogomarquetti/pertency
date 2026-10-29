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
}: {
  escola: EscolaAtual;
  mantenedora: MantenedoraAtual | null;
}) {
  // Só consulta: escola e mantenedora são mantidas pela equipe Pertency.
  return (
    <div className="flex flex-col gap-[16px]">
      <div className="rounded-md bg-brand-tint px-[14px] py-[12px] text-[13px] leading-relaxed text-brand-ink">
        Os dados da escola e da mantenedora são mantidos pela equipe Pertency. Se alguma
        informação estiver errada ou desatualizada, fale com a gente.
      </div>

      <ConfiguracaoCard
        icon={Building2}
        tipo="Escola"
        titulo={escola.nomeOficial}
        descricao={`${escola.municipio}/${escola.uf}`}
        status={statusBadge(escola.status)}
        href="/minha-escola/escola"
        preenchido
      />

      <ConfiguracaoCard
        icon={Landmark}
        tipo="Mantenedora"
        titulo={mantenedora?.razaoSocial ?? "Mantenedora"}
        descricao={mantenedora ? mantenedora.cnpj : "Ainda não vinculada. A equipe Pertency faz esse cadastro."}
        status={mantenedora ? statusBadge(mantenedora.status) : undefined}
        href="/minha-escola/mantenedora"
        preenchido={mantenedora !== null}
      />
    </div>
  );
}
