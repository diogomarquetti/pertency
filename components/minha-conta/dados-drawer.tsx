"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";

import { toast } from "@/lib/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { updateMinhaConta } from "@/app/(app)/minha-conta/actions";
import { minhaContaSchema, type MinhaContaValues } from "@/app/(app)/minha-conta/schema";

const FORM_ID = "dados-drawer-form";

export function DadosDrawer({
  open,
  onOpenChange,
  defaultValues,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: MinhaContaValues;
  onSaved: (values: MinhaContaValues) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<MinhaContaValues>({
    resolver: zodResolver(minhaContaSchema),
    defaultValues,
  });

  // Reseta pros valores atuais toda vez que o drawer abre — evita mostrar
  // dado velho se o usuário editar, cancelar sem salvar, e abrir de novo.
  useEffect(() => {
    if (open) form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleCancel() {
    form.reset(defaultValues);
    onOpenChange(false);
  }

  function onSubmit(values: MinhaContaValues) {
    form.clearErrors("root");

    startTransition(async () => {
      const result = await updateMinhaConta(values);
      if ("error" in result) {
        form.setError("root", { message: result.error });
        return;
      }

      toast.success("Alterações salvas com sucesso.");
      onSaved(values);
      onOpenChange(false);
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar dados pessoais</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <SheetBody className="flex flex-col gap-5">
              <FormField
                control={form.control}
                name="nomeCompleto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
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
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="voce@instituicao.org.br" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Telefone <span className="font-normal text-muted">(opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <PhoneInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <p className="flex items-center gap-[5px] text-[12.5px] text-danger" role="alert">
                  <AlertCircle size={14} strokeWidth={2} className="shrink-0" aria-hidden="true" />
                  {form.formState.errors.root.message}
                </p>
              )}
            </SheetBody>
          </form>
        </Form>

        <SheetFooter>
          <Button type="button" variant="secondary" onClick={handleCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" size={15} strokeWidth={2} aria-hidden="true" />}
            Salvar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
