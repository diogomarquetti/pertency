"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { usePageActionsSetter } from "@/components/layout/page-actions-context";
import { LinkDeAcesso } from "@/components/usuarios/link-de-acesso";
import { toast } from "@/lib/use-toast";

import { atualizarOperador, convidarOperador, gerarLinkOperador } from "@/app/admin/(painel)/usuarios/actions";
import type { Operador } from "@/app/admin/(painel)/usuarios/queries";
import {
  atualizarOperadorSchema,
  convidarOperadorSchema,
  type AtualizarOperadorValues,
  type ConvidarOperadorValues,
} from "@/app/admin/(painel)/usuarios/schema";

import { useToastDeParametro } from "./use-toast-de-parametro";

const FORM_ID = "operador-form";

/** Convite: nome e e-mail. Termina na edição, onde se gera o link de acesso. */
export function ConvidarOperadorForm() {
  const [isPending, startTransition] = useTransition();
  const setPageActions = usePageActionsSetter();

  const form = useForm<ConvidarOperadorValues>({
    resolver: zodResolver(convidarOperadorSchema),
    defaultValues: { nomeCompleto: "", email: "" },
  });
  const { isDirty } = form.formState;

  useEffect(() => {
    setPageActions({ formId: FORM_ID, pending: isPending, saveLabel: "Convidar", cancelHref: "/usuarios", isDirty });
    return () => setPageActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, isDirty]);

  function onSubmit(values: ConvidarOperadorValues) {
    startTransition(async () => {
      // Sucesso termina em redirect para a edição (`?convidado=1`).
      const result = await convidarOperador(values);
      if (result?.error) toast.error("Não foi possível convidar", result.error);
    });
  }

  return (
    <Form {...form}>
      <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <Card className="gap-4 p-[24px]">
          <h2 className="flex items-baseline gap-2 text-highlight text-ink">
            <span className="text-brand">1.</span> Dados
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="nomeCompleto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da pessoa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail de login</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="voce@pertency.com.br" {...field} />
                  </FormControl>
                  <FormDescription>Não pode ser o login de um usuário de escola.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>
      </form>
    </Form>
  );
}

export function OperadorForm({ operador, ehVoce }: { operador: Operador; ehVoce: boolean }) {
  const [isPending, startTransition] = useTransition();
  const setPageActions = usePageActionsSetter();
  useToastDeParametro("convidado", "Convite criado.", "Gere o link de acesso e envie para a pessoa.");

  const form = useForm<AtualizarOperadorValues>({
    resolver: zodResolver(atualizarOperadorSchema),
    defaultValues: { nomeCompleto: operador.nomeCompleto, ativo: operador.ativo },
  });
  const { isDirty } = form.formState;

  useEffect(() => {
    setPageActions({ formId: FORM_ID, pending: isPending, cancelHref: "/usuarios", isDirty });
    return () => setPageActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, isDirty]);

  function onSubmit(values: AtualizarOperadorValues) {
    startTransition(async () => {
      const result = await atualizarOperador(operador.id, values);
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
          <Card className="gap-4 p-[24px]">
            <div className="flex items-center justify-between">
              <h2 className="flex items-baseline gap-2 text-highlight text-ink">
                <span className="text-brand">1.</span> Dados
              </h2>
              {/* Ninguém desativa o próprio acesso — o admin nunca fica sem ninguém. */}
              {!ehVoce && (
                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-[8px] space-y-0">
                      <FormLabel className="text-[13px] font-medium text-muted">
                        {field.value ? "Ativo" : "Inativo"}
                      </FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="nomeCompleto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-[6px]">
                <label htmlFor="operador-email" className="text-label text-ink">
                  E-mail de login
                </label>
                <Input id="operador-email" value={operador.email} readOnly disabled />
              </div>
            </div>
          </Card>

          <Card className="gap-4 p-[24px]">
            <h2 className="flex items-baseline gap-2 text-highlight text-ink">
              <span className="text-brand">2.</span> Acesso
            </h2>
            <div className="flex flex-col gap-[6px]">
              <label className="text-label text-ink">Link de acesso</label>
              <LinkDeAcesso gerar={() => gerarLinkOperador(operador.id)} />
            </div>
          </Card>
        </div>
      </form>
    </Form>
  );
}
