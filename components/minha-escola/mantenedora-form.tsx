"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { usePageActionsSetter } from "@/components/layout/page-actions-context";
import { toast } from "@/lib/use-toast";

import { mantenedoraSchema, type MantenedoraValues } from "@/app/(app)/minha-escola/schema";

import { MantenedoraEnderecoContatoCard } from "./mantenedora-endereco-contato-card";
import { MantenedoraIdentificacaoCard } from "./mantenedora-identificacao-card";
import { MantenedoraRepresentacaoLegalCard } from "./mantenedora-representacao-legal-card";

const FORM_ID = "mantenedora-form";

export const MANTENEDORA_VAZIA: MantenedoraValues = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cep: "",
  municipio: "",
  uf: "",
  foneInstitucional: "",
  whatsappInstitucional: "",
  emailInstitucional: "",
  site: "",
  presidenteNome: "",
  presidenteCpf: "",
  presidenteFone: "",
  presidenteEmail: "",
  status: "ativa",
};

export type SalvarMantenedora = (
  values: MantenedoraValues,
) => Promise<{ error: string } | { success: true } | undefined>;

/**
 * Formulário da Mantenedora — usado em Configurações (app das escolas, só
 * edição) e no admin da plataforma (criação e edição). Cada um passa a
 * própria Server Action em `salvar`; quando ela redireciona (criação), não há
 * retorno a tratar.
 */
export function MantenedoraForm({
  mantenedora,
  canEdit,
  salvar,
  cancelHref,
  saveLabel = "Salvar",
}: {
  mantenedora: MantenedoraValues & { id?: string };
  canEdit: boolean;
  salvar: SalvarMantenedora;
  cancelHref: string;
  saveLabel?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const setPageActions = usePageActionsSetter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- só descarta o id
  const { id: _id, ...defaultValues } = mantenedora;

  const form = useForm<MantenedoraValues>({
    resolver: zodResolver(mantenedoraSchema),
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

  function onSubmit(values: MantenedoraValues) {
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
            <MantenedoraIdentificacaoCard control={form.control} statusAtual={statusAtual} />
            <MantenedoraEnderecoContatoCard control={form.control} />
            <MantenedoraRepresentacaoLegalCard control={form.control} />
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
