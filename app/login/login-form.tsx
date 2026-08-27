"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { login } from "./actions";
import { loginSchema, type LoginValues } from "./schema";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginValues) {
    form.clearErrors("root");
    startTransition(async () => {
      const result = await login(values);
      if (result?.error) {
        form.setError("root", { message: result.error });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="voce@instituicao.org.br"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
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

        {form.formState.errors.root && (
          <p className="flex items-center gap-[5px] text-[12.5px] text-danger" role="alert">
            <AlertCircle size={14} strokeWidth={2} className="shrink-0" aria-hidden="true" />
            {form.formState.errors.root.message}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          Entrar
        </Button>
      </form>
    </Form>
  );
}
