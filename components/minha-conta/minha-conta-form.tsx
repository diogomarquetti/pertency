"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { usePageActionsSetter } from "@/components/layout/page-actions-context";
import { toast } from "@/lib/use-toast";

import { updateMinhaConta } from "@/app/(app)/minha-conta/actions";
import { minhaContaSchema, type MinhaContaValues } from "@/app/(app)/minha-conta/schema";
import type { MeuPerfil } from "@/app/(app)/minha-conta/queries";

import { DadosPessoaisCard } from "./dados-pessoais-card";
import { FotoCard } from "./foto-card";
import { SenhaCard } from "./senha-card";

const FORM_ID = "minha-conta-form";

export function MinhaContaForm({ perfil }: { perfil: MeuPerfil }) {
  const [isPending, startTransition] = useTransition();
  const setPageActions = usePageActionsSetter();

  const defaultValues: MinhaContaValues = {
    nomeCompleto: perfil.nomeCompleto,
    email: perfil.email,
    telefone: perfil.telefone,
  };

  const form = useForm<MinhaContaValues>({
    resolver: zodResolver(minhaContaSchema),
    defaultValues,
  });

  useEffect(() => {
    setPageActions({
      formId: FORM_ID,
      pending: isPending,
      onCancel: () => form.reset(defaultValues),
    });
    return () => setPageActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  function onSubmit(values: MinhaContaValues) {
    startTransition(async () => {
      const result = await updateMinhaConta(values);
      if ("error" in result) {
        toast.error("Não foi possível salvar", result.error);
        return;
      }
      toast.success("Alterações salvas com sucesso.");
      form.reset(values);
    });
  }

  return (
    <div className="flex flex-col gap-[24px]">
      <Form {...form}>
        <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-[24px]">
            <DadosPessoaisCard control={form.control} />
            <FotoCard
              usuarioId={perfil.id}
              escolaId={perfil.escolaId}
              nomeCompleto={perfil.nomeCompleto}
              fotoUrlInicial={perfil.fotoUrl}
            />
          </div>
        </form>
      </Form>

      <SenhaCard />
    </div>
  );
}
