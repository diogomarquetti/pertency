"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { refreshAndBlur } from "@/lib/utils";
import { toast } from "@/lib/use-toast";

import { salvarDadosEscolares } from "@/app/(app)/estudantes/dados-escolares-actions";
import {
  DADOS_ESCOLARES_EMPTY_VALUES,
  dadosEscolaresSchema,
  type DadosEscolaresValues,
} from "@/app/(app)/estudantes/dados-escolares-schema";
import type {
  AnoLetivoOption,
  AvaliacaoIngresso,
  DadosEscolares,
  ReferenciaOfertas,
  TurmaOption,
  VinculoEscolarAnual,
} from "@/app/(app)/estudantes/queries";
import { HistoricoVinculosCard } from "./historico-vinculos-card";
import { ObservacoesCard } from "./observacoes-card";
import { OrigemEncerramentoCard } from "./origem-encerramento-card";
import { VinculoEscolarCard } from "./vinculo-escolar-card";

export const DADOS_ESCOLARES_FORM_ID = "dados-escolares-form";

type CamposVinculo = Pick<
  DadosEscolaresValues,
  | "anoLetivoId"
  | "ofertaAtualId"
  | "ofertaAtualSlug"
  | "organizacaoAtualId"
  | "etapaDoCiclo"
  | "turnoId"
  | "turmaId"
  | "matriculaInterna"
  | "utilizaTransporte"
  | "dataMatriculaEfetiva"
>;

const CAMPOS_VINCULO_VAZIOS: CamposVinculo = {
  anoLetivoId: "",
  ofertaAtualId: "",
  ofertaAtualSlug: "",
  organizacaoAtualId: "",
  etapaDoCiclo: "",
  turnoId: "",
  turmaId: "",
  matriculaInterna: "",
  utilizaTransporte: false,
  dataMatriculaEfetiva: "",
};

// Por padrão abre o vínculo mais recente já registrado; sem nenhum ainda,
// abre em branco no ano letivo ativo da escola (primeiro cadastro).
function vinculoInicial(
  anosLetivos: AnoLetivoOption[],
  vinculosEscolaresAnuais: VinculoEscolarAnual[],
): CamposVinculo {
  const maisRecente = vinculosEscolaresAnuais[0];
  if (maisRecente) {
    return {
      anoLetivoId: maisRecente.anoLetivoId,
      ofertaAtualId: maisRecente.ofertaAtualId,
      ofertaAtualSlug: maisRecente.ofertaAtualSlug,
      organizacaoAtualId: maisRecente.organizacaoAtualId,
      etapaDoCiclo: maisRecente.etapaDoCiclo,
      turnoId: maisRecente.turnoId,
      turmaId: maisRecente.turmaId,
      matriculaInterna: maisRecente.matriculaInterna,
      utilizaTransporte: maisRecente.utilizaTransporte,
      dataMatriculaEfetiva: maisRecente.dataMatriculaEfetiva,
    };
  }

  const anoAtivo = anosLetivos.find((ano) => ano.status === "ativo");
  return { ...CAMPOS_VINCULO_VAZIOS, anoLetivoId: anoAtivo?.id ?? "" };
}

export function DadosEscolaresTab({
  estudanteId,
  situacaoAtual,
  dadosEscolares,
  avaliacao,
  referenciaOfertas,
  turnos,
  turmasReferencia,
  anosLetivos,
  vinculosEscolaresAnuais,
  canEdit,
  onPendingChange,
}: {
  estudanteId: string;
  situacaoAtual: string;
  dadosEscolares: DadosEscolares | null;
  avaliacao: AvaliacaoIngresso | null;
  referenciaOfertas: ReferenciaOfertas;
  turnos: { id: string; nome: string }[];
  turmasReferencia: TurmaOption[];
  anosLetivos: AnoLetivoOption[];
  vinculosEscolaresAnuais: VinculoEscolarAnual[];
  canEdit: boolean;
  onPendingChange?: (pending: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    onPendingChange?.(isPending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  const form = useForm<DadosEscolaresValues>({
    resolver: zodResolver(dadosEscolaresSchema),
    defaultValues: {
      ...(dadosEscolares ?? DADOS_ESCOLARES_EMPTY_VALUES),
      situacao: situacaoAtual,
      ...vinculoInicial(anosLetivos, vinculosEscolaresAnuais),
    },
  });

  function onSubmit(values: DadosEscolaresValues) {
    startTransition(async () => {
      const result = await salvarDadosEscolares(estudanteId, values);
      if (result && "error" in result) {
        toast.error("Não foi possível salvar", result.error);
        return;
      }
      toast.success("Dados escolares salvos com sucesso.");
      refreshAndBlur(router);
    });
  }

  return (
    <Form {...form}>
      <form id={DADOS_ESCOLARES_FORM_ID} onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={!canEdit} className="contents">
          <div className="flex flex-col gap-[24px]">
            <VinculoEscolarCard
              form={form}
              avaliacao={avaliacao}
              referenciaOfertas={referenciaOfertas}
              turnos={turnos}
              turmasReferencia={turmasReferencia}
              anosLetivos={anosLetivos}
              vinculosEscolaresAnuais={vinculosEscolaresAnuais}
            />
            <OrigemEncerramentoCard form={form} />
            <ObservacoesCard form={form} />
            <HistoricoVinculosCard vinculosEscolaresAnuais={vinculosEscolaresAnuais} />

            {canEdit && (
              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="animate-spin" size={15} strokeWidth={2} aria-hidden="true" />
                  )}
                  Salvar dados escolares
                </Button>
              </div>
            )}
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
