import { Card } from "@/components/ui/card";

import type { VinculoEscolarAnual } from "@/app/(app)/estudantes/queries";
import { OFERTA_OPTIONS } from "@/app/(app)/turmas/schema";

function nomeOferta(slug: string) {
  return OFERTA_OPTIONS.find((oferta) => oferta.slug === slug)?.nome ?? "—";
}

/**
 * Histórico de vínculos anuais — cada ano letivo tem o seu, nunca
 * sobrescrito por uma troca de oferta/turma em outro ano (regra 18.1 da
 * HU-EST-001 v2.0). Somente leitura: a edição acontece via o seletor "Ano
 * letivo" do bloco Vínculo escolar, acima.
 */
export function HistoricoVinculosCard({
  vinculosEscolaresAnuais,
}: {
  vinculosEscolaresAnuais: VinculoEscolarAnual[];
}) {
  if (vinculosEscolaresAnuais.length === 0) {
    return null;
  }

  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="text-highlight text-ink">Histórico de vínculos anuais</h2>

      <div className="flex flex-col divide-y divide-line">
        {vinculosEscolaresAnuais.map((vinculo) => (
          <div key={vinculo.id} className="grid gap-1 py-[10px] text-[14px] sm:grid-cols-[80px_1fr]">
            <span className="font-semibold text-ink">{vinculo.ano}</span>
            <span className="text-muted">
              {nomeOferta(vinculo.ofertaAtualSlug)}
              {vinculo.etapaDoCiclo ? ` — ${vinculo.etapaDoCiclo}` : ""}
              {vinculo.turmaNome ? ` · Turma ${vinculo.turmaNome}` : ""}
              {vinculo.turnoNome ? ` · ${vinculo.turnoNome}` : ""}
              {vinculo.matriculaInterna ? ` · Matrícula ${vinculo.matriculaInterna}` : ""}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
