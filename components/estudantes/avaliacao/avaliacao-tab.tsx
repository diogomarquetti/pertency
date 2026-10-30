"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { refreshAndBlur } from "@/lib/utils";
import { toast } from "@/lib/use-toast";

import { salvarAvaliacao } from "@/app/(app)/estudantes/avaliacao-actions";
import {
  AVALIACAO_EMPTY_VALUES,
  STATUS_AVALIACAO_LABEL,
  avaliacaoEditavel,
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
import { VersaoAvaliacaoCard } from "./versao-avaliacao-card";

export const AVALIACAO_FORM_ID = "avaliacao-ingresso-form";

/**
 * Formulário próprio, independente do Salvar global da página (que continua
 * exclusivo da Aba 1) — mesmo racional do Bloco 4 em Turmas: uma sub-entidade
 * preenchida em outro momento, por outra pessoa, não devia compartilhar o
 * mesmo submit da entidade principal. O botão Salvar do header consegue
 * mesmo assim disparar este form quando esta aba está ativa — ver
 * `onPendingChange` e `AVALIACAO_FORM_ID` usados por `estudante-form.tsx`.
 */
/** Versão aberta ao entrar na aba: a em edição, senão a vigente; nenhuma se só houver canceladas. */
function versaoInicial(versoes: AvaliacaoIngresso[]) {
  return (
    versoes.find((v) => avaliacaoEditavel(v.statusAvaliacao)) ??
    versoes.find((v) => v.statusAvaliacao === "concluida") ??
    null
  );
}

export function AvaliacaoTab({
  estudanteId,
  versoes,
  equipeElegivel,
  referenciaOfertas,
  contribuicoes,
  relatorios,
  viewerId,
  viewerCanEditQualquerContribuicao,
  viewerCanEditContribuicaoPropria,
  canGerarRelatorio,
  canConcluirAvaliacao,
  canEdit,
  onPendingChange,
  onSomenteLeituraChange,
}: {
  estudanteId: string;
  versoes: AvaliacaoIngresso[];
  equipeElegivel: UsuarioElegivel[];
  referenciaOfertas: ReferenciaOfertas;
  contribuicoes: ContribuicaoAvaliacao[];
  relatorios: RelatorioAvaliacao[];
  viewerId: string | null;
  viewerCanEditQualquerContribuicao: boolean;
  viewerCanEditContribuicaoPropria: boolean;
  canGerarRelatorio: boolean;
  canConcluirAvaliacao: boolean;
  canEdit: boolean;
  onPendingChange?: (pending: boolean) => void;
  onSomenteLeituraChange?: (somenteLeitura: boolean) => void;
}) {
  // Versão escolhida em "Ver versão N"; sem escolha, segue a versão inicial
  // (que muda depois de retificar/cancelar, quando a página recarrega).
  const [versaoEscolhidaId, setVersaoEscolhidaId] = useState<string | null>(null);
  const avaliacao =
    versoes.find((v) => v.id === versaoEscolhidaId) ?? versaoInicial(versoes);
  const canceladas = versoes.filter((v) => v.statusAvaliacao === "cancelada");
  const versaoEditavel = canEdit && (!avaliacao || avaliacaoEditavel(avaliacao.statusAvaliacao));

  useEffect(() => {
    onSomenteLeituraChange?.(!versaoEditavel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versaoEditavel]);

  return (
    <div className="flex flex-col gap-[24px]">
      {avaliacao ? (
        <VersaoAvaliacaoCard
          estudanteId={estudanteId}
          versao={avaliacao}
          versoes={versoes}
          podeFechar={canGerarRelatorio}
          onSelecionarVersao={setVersaoEscolhidaId}
        />
      ) : (
        canceladas.length > 0 && (
          <Card className="gap-2 p-[24px]">
            <h2 className="text-highlight text-ink">Nova avaliação</h2>
            <p className="text-[13px] text-muted">
              As avaliações anteriores foram canceladas e ficam no histórico, só leitura.
            </p>
            <div className="flex flex-wrap gap-2">
              {canceladas.map((cancelada) => (
                <Button
                  key={cancelada.id}
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setVersaoEscolhidaId(cancelada.id)}
                >
                  Ver versão {cancelada.versao} ({STATUS_AVALIACAO_LABEL[cancelada.statusAvaliacao]})
                </Button>
              ))}
            </div>
          </Card>
        )
      )}

      <AvaliacaoVersaoForm
        // Remonta o formulário ao trocar de versão (defaultValues novos).
        key={avaliacao?.id ?? "nova"}
        estudanteId={estudanteId}
        avaliacao={avaliacao}
        equipeElegivel={equipeElegivel}
        referenciaOfertas={referenciaOfertas}
        podeConcluir={canConcluirAvaliacao}
        canEdit={versaoEditavel}
        onPendingChange={onPendingChange}
      />

      {/* Contribuições e relatórios são sub-entidades com ciclo de vida
          próprio (mesmo racional de Documentos/Dados escolares) — só fazem
          sentido depois que a avaliação em si já existe. */}
      {avaliacao && (
        <>
          <ContribuicoesCard
            estudanteId={estudanteId}
            avaliacaoId={avaliacao.id}
            contribuicoes={contribuicoes.filter((c) => c.avaliacaoId === avaliacao.id)}
            equipeElegivel={equipeElegivel}
            viewerId={viewerId}
            viewerCanEditQualquer={viewerCanEditQualquerContribuicao}
            viewerCanEditContribuicaoPropria={viewerCanEditContribuicaoPropria}
            canEdit={canEdit}
            travada={!avaliacaoEditavel(avaliacao.statusAvaliacao)}
          />
          <RelatoriosCard
            estudanteId={estudanteId}
            versao={avaliacao}
            versoes={versoes}
            relatorios={relatorios}
            canGerar={canGerarRelatorio}
          />
        </>
      )}
    </div>
  );
}

function AvaliacaoVersaoForm({
  estudanteId,
  avaliacao,
  equipeElegivel,
  referenciaOfertas,
  podeConcluir,
  canEdit,
  onPendingChange,
}: {
  estudanteId: string;
  avaliacao: AvaliacaoIngresso | null;
  equipeElegivel: UsuarioElegivel[];
  referenciaOfertas: ReferenciaOfertas;
  podeConcluir: boolean;
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
    if (!canEdit) return;
    startTransition(async () => {
      const result = await salvarAvaliacao(estudanteId, avaliacao?.id ?? null, values);
      if (result && "error" in result) {
        toast.error("Não foi possível salvar", result.error);
        return;
      }
      toast.success(
        values.statusAvaliacao === "concluida" ? "Avaliação concluída." : "Avaliação salva com sucesso.",
      );
      refreshAndBlur(router);
    });
  }

  return (
    <Form {...form}>
      <form id={AVALIACAO_FORM_ID} onSubmit={form.handleSubmit(onSubmit, onInvalid)} noValidate>
        <fieldset disabled={!canEdit} className="contents">
          <div className="flex flex-col gap-[24px]">
            <AvaliacaoIdentificacaoCard
              form={form}
              equipeElegivel={equipeElegivel}
              referenciaOfertas={referenciaOfertas}
              podeConcluir={podeConcluir}
              canEdit={canEdit}
            />
            <AvaliacaoHistoricoCard control={form.control} />
            <AvaliacaoDimensoesCard control={form.control} />
            <AvaliacaoContextoCard control={form.control} />
            <AvaliacaoParecerCard control={form.control} />

            {canEdit && (
              <div className="flex justify-end">
                <Button type="submit" loading={isPending}>
                  Salvar avaliação
                </Button>
              </div>
            )}
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
