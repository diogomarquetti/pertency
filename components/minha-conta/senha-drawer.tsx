"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check, Circle, Eye, EyeOff, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
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
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { redefinirSenhaSchema, type RedefinirSenhaValues } from "@/app/redefinir-senha/schema";

const FORM_ID = "senha-drawer-form";
const VALORES_VAZIOS: RedefinirSenhaValues = { senha: "", confirmarSenha: "" };

function ChecklistItem({ satisfeito, children }: { satisfeito: boolean; children: React.ReactNode }) {
  return (
    <li className={cn("flex items-center gap-[8px] text-[13px]", satisfeito ? "text-success-ink" : "text-muted")}>
      {satisfeito ? (
        <Check size={14} strokeWidth={2.5} className="shrink-0 text-success" aria-hidden="true" />
      ) : (
        <Circle size={14} strokeWidth={2} className="shrink-0" aria-hidden="true" />
      )}
      {children}
    </li>
  );
}

export function SenhaDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RedefinirSenhaValues>({
    resolver: zodResolver(redefinirSenhaSchema),
    defaultValues: VALORES_VAZIOS,
  });

  useEffect(() => {
    if (open) {
      form.reset(VALORES_VAZIOS);
      setShowPassword(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const senha = form.watch("senha");
  const confirmarSenha = form.watch("confirmarSenha");
  const temOitoCaracteres = senha.length >= 8;
  const temNumero = /\d/.test(senha);
  const senhasIguais = senha.length > 0 && senha === confirmarSenha;

  function handleCancel() {
    form.reset(VALORES_VAZIOS);
    onOpenChange(false);
  }

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
      form.reset(VALORES_VAZIOS);
      onOpenChange(false);
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Redefinir senha</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <SheetBody className="flex flex-col gap-5">
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

              <ul className="flex flex-col gap-[6px] rounded-md bg-bg px-[14px] py-[12px]">
                <ChecklistItem satisfeito={temOitoCaracteres}>Mínimo de 8 caracteres</ChecklistItem>
                <ChecklistItem satisfeito={temNumero}>Ao menos 1 número</ChecklistItem>
                <ChecklistItem satisfeito={senhasIguais}>As duas senhas devem ser iguais</ChecklistItem>
              </ul>

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
            Salvar nova senha
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
