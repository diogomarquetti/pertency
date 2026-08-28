"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { redefinirSenhaSchema, type RedefinirSenhaValues } from "@/app/redefinir-senha/schema";

const FORM_ID = "minha-conta-senha-form";

/**
 * Mesmo schema/lógica de app/redefinir-senha/redefinir-senha-form.tsx
 * (supabase.auth.updateUser({password}), já self-escopado pela sessão —
 * sem precisar de RLS/migration nenhuma pra isso). Botão de submit próprio
 * — de propósito não usa usePageActionsSetter/formId do topbar, porque o
 * Salvar do topbar já está ligado ao form de Dados pessoais/Foto nesta
 * mesma página, e não faz sentido um botão só submeter dois forms
 * independentes com sucesso/erro diferentes.
 */
export function SenhaCard() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RedefinirSenhaValues>({
    resolver: zodResolver(redefinirSenhaSchema),
    defaultValues: { senha: "", confirmarSenha: "" },
  });

  function onSubmit(values: RedefinirSenhaValues) {
    form.clearErrors("root");

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: values.senha });

      if (error) {
        form.setError("root", { message: "Não foi possível atualizar a senha. Tente novamente." });
        return;
      }

      toast.success("Senha atualizada com sucesso.");
      form.reset({ senha: "", confirmarSenha: "" });
    });
  }

  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">3.</span> Senha
      </h2>

      <Form {...form}>
        <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted transition-colors duration-fast ease-standard hover:text-ink"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? (
                          <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
                        ) : (
                          <Eye size={16} strokeWidth={2} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmarSenha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar nova senha</FormLabel>
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {form.formState.errors.root && (
            <p className="flex items-center gap-[5px] text-[12.5px] text-danger" role="alert">
              <AlertCircle size={14} strokeWidth={2} className="shrink-0" aria-hidden="true" />
              {form.formState.errors.root.message}
            </p>
          )}

          <div>
            <Button type="submit" variant="secondary" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" size={15} strokeWidth={2} aria-hidden="true" />}
              Salvar nova senha
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
