"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { usePageActionsSetter } from "@/components/layout/page-actions-context";
import { toast } from "@/lib/use-toast";

import {
  escolaComMantenedoraSchema,
  escolaSchema,
  type EscolaValues,
} from "@/app/(app)/minha-escola/schema";

import { EscolaEnderecoContatoCard } from "./escola-endereco-contato-card";
import { EscolaIdentificacaoCard } from "./escola-identificacao-card";
import { EscolaMantenedoraCard, type MantenedoraOpcao } from "./escola-mantenedora-card";
import { EscolaResponsaveisCard } from "./escola-responsaveis-card";

const FORM_ID = "escola-form";

export type SalvarEscola = (values: EscolaValues) => Promise<{ error: string } | { success: true } | undefined>;

/**
 * Formulário da Escola — usado em Configurações (app das escolas, só
 * leitura) e no admin da plataforma. O admin passa a própria Server Action
 * em `salvar`; quando ela redireciona (criação), não há retorno a tratar.
 * Sem `salvar`, o formulário é só leitura. Com `mantenedoras`, aparece o
 * bloco de seleção da mantenedora (só no admin).
 */
export function EscolaForm({
  escola,
  salvar,
  cancelHref,
  saveLabel = "Salvar escola",
  mantenedoras,
}: {
  escola: EscolaValues & { id?: string };
  salvar?: SalvarEscola;
  cancelHref: string;
  saveLabel?: string;
  mantenedoras?: MantenedoraOpcao[];
}) {
  const [isPending, startTransition] = useTransition();
  const canEdit = !!salvar;
  const setPageActions = usePageActionsSetter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- só descarta o id
  const { id: _id, ...defaultValues } = escola;

  const form = useForm<EscolaValues>({
    resolver: zodResolver(mantenedoras ? escolaComMantenedoraSchema : escolaSchema),
    defaultValues,
  });

  const statusAtual = form.watch("status");
  const { isDirty } = form.formState;

  useEffect(() => {
    setPageActions({
      formId: FORM_ID,
      pending: isPending,
      saveLabel,
      cancelHref,
      cancelLabel: canEdit ? undefined : "Voltar",
      readOnly: !canEdit,
      isDirty,
    });
    return () => setPageActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, canEdit, isDirty]);

  function onSubmit(values: EscolaValues) {
    if (!salvar) return;
    startTransition(async () => {
      const result = await salvar(values);
      if (!result) return;
      if ("error" in result) {
        toast.error("Não foi possível salvar", result.error);
        return;
      }
      toast.success("Alterações salvas com sucesso.");
      form.reset(values);
    });
  }

  return (
    <Form {...form}>
      <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={!canEdit} className="contents">
          <div className="flex flex-col gap-[24px]">
            <EscolaIdentificacaoCard control={form.control} statusAtual={statusAtual} />
            <EscolaEnderecoContatoCard control={form.control} />
            <EscolaResponsaveisCard control={form.control} />
            {mantenedoras && <EscolaMantenedoraCard control={form.control} mantenedoras={mantenedoras} />}

            <div className="rounded-md bg-brand-tint px-[14px] py-[12px] text-[13px] leading-relaxed text-brand-ink">
              <span className="font-semibold">Importante:</span> As informações cadastradas serão
              utilizadas em documentos, relatórios e comunicações do sistema.
            </div>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
