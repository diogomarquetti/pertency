"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { usePageActionsSetter } from "@/components/layout/page-actions-context";
import { toast } from "@/lib/use-toast";

import { updateEscola } from "@/app/(app)/minha-escola/actions";
import { escolaSchema, type EscolaValues } from "@/app/(app)/minha-escola/schema";
import type { EscolaAtual } from "@/app/(app)/minha-escola/queries";

import { EscolaEnderecoContatoCard } from "./escola-endereco-contato-card";
import { EscolaIdentificacaoCard } from "./escola-identificacao-card";
import { EscolaResponsaveisCard } from "./escola-responsaveis-card";

const FORM_ID = "escola-form";

export function EscolaForm({ escola }: { escola: EscolaAtual }) {
  const [isPending, startTransition] = useTransition();
  const setPageActions = usePageActionsSetter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- só descarta o id
  const { id: _id, ...defaultValues } = escola;

  const form = useForm<EscolaValues>({
    resolver: zodResolver(escolaSchema),
    defaultValues,
  });

  const statusAtual = form.watch("status");

  useEffect(() => {
    setPageActions({
      formId: FORM_ID,
      pending: isPending,
      saveLabel: "Salvar escola",
      cancelHref: "/minha-escola",
    });
    return () => setPageActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  function onSubmit(values: EscolaValues) {
    startTransition(async () => {
      const result = await updateEscola(values);
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
        <div className="flex flex-col gap-[24px]">
          <EscolaIdentificacaoCard control={form.control} statusAtual={statusAtual} />
          <EscolaEnderecoContatoCard control={form.control} />
          <EscolaResponsaveisCard control={form.control} />

          <div className="rounded-md bg-brand-tint px-[14px] py-[12px] text-[13px] leading-relaxed text-brand-ink">
            <span className="font-semibold">Importante:</span> As informações cadastradas serão
            utilizadas em documentos, relatórios e comunicações do sistema.
          </div>
        </div>
      </form>
    </Form>
  );
}
