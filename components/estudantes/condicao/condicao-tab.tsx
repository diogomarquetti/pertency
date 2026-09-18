"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { refreshAndBlur } from "@/lib/utils";
import { toast } from "@/lib/use-toast";

import { salvarPerfilFuncional } from "@/app/(app)/estudantes/perfil-funcional-actions";
import {
  PERFIL_FUNCIONAL_EMPTY_VALUES,
  perfilFuncionalSchema,
  type PerfilFuncionalValues,
} from "@/app/(app)/estudantes/perfil-funcional-schema";
import type { CondicaoEstudante, DocumentoEstudante, PerfilFuncionalEstudante } from "@/app/(app)/estudantes/queries";

import { AlertasCard } from "./alertas-card";
import { CondicoesCard } from "./condicoes-card";
import { InformacoesRotinaCard } from "./informacoes-rotina-card";

export const CONDICAO_FORM_ID = "condicao-estudante-form";

/**
 * Formulário próprio (Blocos 2/3), independente do Salvar global da página —
 * mesmo racional de avaliacao-tab.tsx/dados-escolares-tab.tsx. Condições
 * (Bloco 1) são uma sub-lista à parte, com seu próprio drawer de adicionar/
 * editar, igual Contribuições complementares.
 */
export function CondicaoTab({
  estudanteId,
  condicoes,
  perfilFuncional,
  documentosDisponiveis,
  canEdit,
  onPendingChange,
}: {
  estudanteId: string;
  condicoes: CondicaoEstudante[];
  perfilFuncional: PerfilFuncionalEstudante | null;
  documentosDisponiveis: DocumentoEstudante[];
  canEdit: boolean;
  onPendingChange?: (pending: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    onPendingChange?.(isPending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  const form = useForm<PerfilFuncionalValues>({
    resolver: zodResolver(perfilFuncionalSchema),
    defaultValues: perfilFuncional ?? PERFIL_FUNCIONAL_EMPTY_VALUES,
  });

  function onSubmit(values: PerfilFuncionalValues) {
    startTransition(async () => {
      const result = await salvarPerfilFuncional(estudanteId, values);
      if (result && "error" in result) {
        toast.error("Não foi possível salvar", result.error);
        return;
      }
      toast.success("Condição do estudante salva com sucesso.");
      refreshAndBlur(router);
    });
  }

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex items-start gap-[10px] rounded-md bg-info-tint px-[16px] py-[12px] text-info-ink">
        <Info size={16} strokeWidth={2} className="mt-[1px] shrink-0" aria-hidden="true" />
        <p className="text-[13.5px]">
          Informações funcionais para a rotina escolar. Este cadastro não substitui prontuário
          clínico.
        </p>
      </div>

      <CondicoesCard
        estudanteId={estudanteId}
        condicoes={condicoes}
        documentosDisponiveis={documentosDisponiveis}
        canEdit={canEdit}
      />

      <Form {...form}>
        <form id={CONDICAO_FORM_ID} onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <fieldset disabled={!canEdit} className="contents">
            <div className="flex flex-col gap-[24px]">
              <InformacoesRotinaCard form={form} />
              <AlertasCard control={form.control} />

              {canEdit && (
                <div className="flex justify-end">
                  <Button type="submit" disabled={isPending}>
                    {isPending && (
                      <Loader2 className="animate-spin" size={15} strokeWidth={2} aria-hidden="true" />
                    )}
                    Salvar condição do estudante
                  </Button>
                </div>
              )}
            </div>
          </fieldset>
        </form>
      </Form>
    </div>
  );
}
