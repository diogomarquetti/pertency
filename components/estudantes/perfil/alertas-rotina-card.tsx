import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { MEIO_COMUNICACAO_OPTIONS } from "@/app/(app)/estudantes/perfil-funcional-schema";
import type { PerfilFuncionalEstudante } from "@/app/(app)/estudantes/queries";

const MEIO_COMUNICACAO_LABEL: Record<string, string> = Object.fromEntries(
  MEIO_COMUNICACAO_OPTIONS.map((option) => [option.value, option.label]),
);

type Alerta = { titulo: string; descricao: string };

/**
 * perfil_funcional_estudante guarda campos soltos, não uma lista — monta a
 * lista de alerta a partir dos campos não vazios, cada um com rótulo fixo
 * (mesmo espírito do CAMPO_META do Histórico, Onda 4).
 */
function montarAlertas(perfil: PerfilFuncionalEstudante | null): Alerta[] {
  if (!perfil) return [];

  const alertas: Alerta[] = [];

  if (perfil.alergiasRestricoes) {
    alertas.push({ titulo: "Alergia/restrição", descricao: perfil.alergiasRestricoes });
  }
  if (perfil.necessitaMedicacao) {
    alertas.push({
      titulo: "Necessita medicação",
      descricao: perfil.medicacaoDetalhes || "Sem detalhes registrados.",
    });
  }
  if (perfil.situacoesAtencao) {
    alertas.push({ titulo: "Situação que exige atenção", descricao: perfil.situacoesAtencao });
  }
  if (perfil.segurancaCuidados) {
    alertas.push({ titulo: "Segurança e cuidados", descricao: perfil.segurancaCuidados });
  }
  if (perfil.oQueAjuda) {
    alertas.push({ titulo: "O que ajuda", descricao: perfil.oQueAjuda });
  }
  if (
    perfil.recursosCaa.length > 0 ||
    ["caa", "gestual", "multimodal"].includes(perfil.meioComunicacao)
  ) {
    alertas.push({
      titulo: "Comunicação alternativa",
      descricao:
        perfil.recursosCaa.length > 0
          ? perfil.recursosCaa.join(", ")
          : (MEIO_COMUNICACAO_LABEL[perfil.meioComunicacao] ?? perfil.meioComunicacao),
    });
  }

  return alertas;
}

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
