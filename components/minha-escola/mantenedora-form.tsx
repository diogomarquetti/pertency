"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { usePageActionsSetter } from "@/components/layout/page-actions-context";
import { toast } from "@/lib/use-toast";

import { createMantenedora, updateMantenedora } from "@/app/(app)/minha-escola/actions";
import { mantenedoraSchema, type MantenedoraValues } from "@/app/(app)/minha-escola/schema";
import type { MantenedoraAtual } from "@/app/(app)/minha-escola/queries";

import { MantenedoraEnderecoContatoCard } from "./mantenedora-endereco-contato-card";
import { MantenedoraIdentificacaoCard } from "./mantenedora-identificacao-card";
import { MantenedoraRepresentacaoLegalCard } from "./mantenedora-representacao-legal-card";

const FORM_ID = "mantenedora-form";

const VALORES_VAZIOS: MantenedoraValues = {
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

export function MantenedoraForm({
  mantenedora,
  canEdit,
}: {
  mantenedora: MantenedoraAtual | null;
  canEdit: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [existe, setExiste] = useState(mantenedora !== null);
  const setPageActions = usePageActionsSetter();

  const defaultValues: MantenedoraValues = mantenedora
    ? {
        razaoSocial: mantenedora.razaoSocial,
        nomeFantasia: mantenedora.nomeFantasia,
        cnpj: mantenedora.cnpj,
        logradouro: mantenedora.logradouro,
        numero: mantenedora.numero,
        complemento: mantenedora.complemento,
        bairro: mantenedora.bairro,
        cep: mantenedora.cep,
        municipio: mantenedora.municipio,
        uf: mantenedora.uf,
        foneInstitucional: mantenedora.foneInstitucional,
        whatsappInstitucional: mantenedora.whatsappInstitucional,
        emailInstitucional: mantenedora.emailInstitucional,
        site: mantenedora.site,
        presidenteNome: mantenedora.presidenteNome,
        presidenteCpf: mantenedora.presidenteCpf,
        presidenteFone: mantenedora.presidenteFone,
        presidenteEmail: mantenedora.presidenteEmail,
        status: mantenedora.status,
      }
    : VALORES_VAZIOS;

  const form = useForm<MantenedoraValues>({
    resolver: zodResolver(mantenedoraSchema),
    defaultValues,
  });

  const statusAtual = form.watch("status");

  useEffect(() => {
    setPageActions({
      formId: FORM_ID,
      pending: isPending,
      saveLabel: existe ? "Salvar" : "Criar mantenedora",
      cancelHref: "/minha-escola",
      cancelLabel: canEdit ? undefined : "Voltar",
      readOnly: !canEdit,
    });
    return () => setPageActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, existe, canEdit]);

  function onSubmit(values: MantenedoraValues) {
    const eraCriacao = !existe;

    startTransition(async () => {
      const result = eraCriacao ? await createMantenedora(values) : await updateMantenedora(values);

      if ("error" in result) {
        toast.error("Não foi possível salvar", result.error);
        return;
      }

      setExiste(true);
      toast.success(eraCriacao ? "Mantenedora criada com sucesso." : "Alterações salvas com sucesso.");
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
