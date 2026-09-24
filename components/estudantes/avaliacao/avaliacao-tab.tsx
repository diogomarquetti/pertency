"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { refreshAndBlur } from "@/lib/utils";
import { toast } from "@/lib/use-toast";

import { salvarAvaliacao } from "@/app/(app)/estudantes/avaliacao-actions";
import {
  AVALIACAO_EMPTY_VALUES,
  avaliacaoSchema,
  type AvaliacaoValues,
} from "@/app/(app)/estudantes/avaliacao-schema";
import type {
  AvaliacaoIngresso,
  ContribuicaoAvaliacao,
  ReferenciaOfertas,
  RelatorioAvaliacao,
  UsuarioElegivel,
} from "@/app/(app)/estudantes/queries";

import { AvaliacaoContextoCard } from "./avaliacao-contexto-card";
import { AvaliacaoDimensoesCard } from "./avaliacao-dimensoes-card";
import { AvaliacaoHistoricoCard } from "./avaliacao-historico-card";
import { AvaliacaoIdentificacaoCard } from "./avaliacao-identificacao-card";
import { AvaliacaoParecerCard } from "./avaliacao-parecer-card";
import { ContribuicoesCard } from "./contribuicoes-card";
import { RelatoriosCard } from "./relatorios-card";

export const AVALIACAO_FORM_ID = "avaliacao-ingresso-form";

/**
 * Formulário próprio, independente do Salvar global da página (que continua
 * exclusivo da Aba 1) — mesmo racional do Bloco 4 em Turmas: uma sub-entidade
 * preenchida em outro momento, por outra pessoa, não devia compartilhar o
 * mesmo submit da entidade principal. O botão Salvar do header consegue
 * mesmo assim disparar este form quando esta aba está ativa — ver
 * `onPendingChange` e `AVALIACAO_FORM_ID` usados por `estudante-form.tsx`.
 */
export function AvaliacaoTab({
  estudanteId,
  avaliacao,
  equipeElegivel,
  referenciaOfertas,
  contribuicoes,
  relatorios,
  viewerId,
  viewerCanEditQualquerContribuicao,
  viewerCanEditContribuicaoPropria,
  canGerarRelatorio,
  canEdit,
  onPendingChange,
}: {
  estudanteId: string;
  avaliacao: AvaliacaoIngresso | null;
  equipeElegivel: UsuarioElegivel[];
  referenciaOfertas: ReferenciaOfertas;
  contribuicoes: ContribuicaoAvaliacao[];
  relatorios: RelatorioAvaliacao[];
  viewerId: string | null;
  viewerCanEditQualquerContribuicao: boolean;
  viewerCanEditContribuicaoPropria: boolean;
  canGerarRelatorio: boolean;
  canEdit: boolean;
  onPendingChange?: (pending: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    onPendingChange?.(isPending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  const form = useForm<AvaliacaoValues>({
    resolver: zodResolver(avaliacaoSchema),
    defaultValues: (avaliacao as AvaliacaoValues | null) ?? AVALIACAO_EMPTY_VALUES,
  });

  // Os erros de "concluir exige elegibilidade" ficam no bloco 5, longe do
  // botão — o toast avisa mesmo com o campo fora da tela.
  function onInvalid(errors: FieldErrors<AvaliacaoValues>) {
    const firstMessage = Object.values(errors).find(
      (error) => typeof error?.message === "string",
    )?.message as string | undefined;
    if (firstMessage) {
      toast.error(firstMessage);
    }
  }

  function onSubmit(values: AvaliacaoValues) {
    startTransition(async () => {
      const result = await salvarAvaliacao(estudanteId, values);
      if (result && "error" in result) {
        toast.error("Não foi possível salvar", result.error);
        return;
      }
      toast.success("Avaliação salva com sucesso.");
      refreshAndBlur(router);
    });
  }

  return (
    <div className="flex flex-col gap-[24px]">
      <Form {...form}>
        <form id={AVALIACAO_FORM_ID} onSubmit={form.handleSubmit(onSubmit, onInvalid)} noValidate>
          <fieldset disabled={!canEdit} className="contents">
            <div className="flex flex-col gap-[24px]">
              <AvaliacaoIdentificacaoCard
                form={form}
                equipeElegivel={equipeElegivel}
                referenciaOfertas={referenciaOfertas}
              />
              <AvaliacaoHistoricoCard control={form.control} />
              <AvaliacaoDimensoesCard control={form.control} />
              <AvaliacaoContextoCard control={form.control} />
              <AvaliacaoParecerCard control={form.control} />

              {canEdit && (
                <div className="flex justify-end">
                  <Button type="submit" disabled={isPending}>
                    {isPending && (
                      <Loader2 className="animate-spin" size={15} strokeWidth={2} aria-hidden="true" />
                    )}
                    Salvar avaliação
                  </Button>
                </div>
              )}
            </div>
          </fieldset>
        </form>
      </Form>

      {/* Contribuições e relatórios são sub-entidades com ciclo de vida
          próprio (mesmo racional de Documentos/Dados escolares) — só fazem
          sentido depois que a avaliação em si já existe. */}
      {avaliacao && (
        <>
          <ContribuicoesCard
            estudanteId={estudanteId}
            avaliacaoId={avaliacao.id}
            contribuicoes={contribuicoes}
            equipeElegivel={equipeElegivel}
            viewerId={viewerId}
            viewerCanEditQualquer={viewerCanEditQualquerContribuicao}
            viewerCanEditContribuicaoPropria={viewerCanEditContribuicaoPropria}
            canEdit={canEdit}
          />
          <RelatoriosCard
            estudanteId={estudanteId}
            avaliacaoId={avaliacao.id}
            relatorios={relatorios}
            avaliacaoAtualizadaEm={avaliacao.updatedAt}
            avaliacaoConcluida={avaliacao.statusAvaliacao === "concluida"}
            canGerar={canGerarRelatorio}
          />
        </>
      )}
    </div>
  );
}
