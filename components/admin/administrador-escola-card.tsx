"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { LinkDeAcesso } from "@/components/usuarios/link-de-acesso";
import { toast } from "@/lib/use-toast";

import { criarAdministradorEscola, gerarLinkAdministrador } from "@/app/admin/(painel)/escolas/actions";
import {
  administradorEscolaSchema,
  type AdministradorEscolaValues,
} from "@/app/admin/(painel)/escolas/administrador-schema";
import type { AdministradorEscola } from "@/app/admin/(painel)/escolas/queries";

import { useToastDeParametro } from "./use-toast-de-parametro";

/**
 * Onboarding do cliente: o primeiro administrador da escola e o link de
 * acesso dele. Fica fora do formulário da escola (salva sozinho). Depois de
 * criado, não é editável aqui — a equipe da escola é da própria escola.
 */
export function AdministradorEscolaCard({
  escolaId,
  administradores,
}: {
  escolaId: string;
  administradores: AdministradorEscola[];
}) {
  useToastDeParametro("criada", "Escola criada com sucesso.", "Agora crie o administrador da escola.");

  return (
    <Card className="gap-4 p-[24px]">
      <div className="flex flex-col gap-[4px]">
        <h2 className="text-highlight text-ink">Administrador da escola</h2>
        <p className="text-[13px] text-muted">
          Primeiro acesso do cliente. Depois dele, a própria escola cadastra o restante da equipe.
        </p>
      </div>

      {administradores.length === 0 ? (
        <NovoAdministrador escolaId={escolaId} />
      ) : (
        <div className="flex flex-col gap-[16px]">
          {administradores.map((administrador) => (
            <div key={administrador.id} className="flex flex-col gap-[8px] rounded-md border border-line p-[16px]">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold text-ink">{administrador.nomeCompleto}</span>
                <span className="text-[13px] text-muted">{administrador.email}</span>
                {administrador.status === "inativo" ? (
                  <Badge variant="neutral">Inativo</Badge>
                ) : administrador.senhaDefinida ? (
                  <Badge variant="success">Acesso feito</Badge>
                ) : (
                  <Badge variant="warning">Sem primeiro acesso</Badge>
                )}
              </div>
              <LinkDeAcesso gerar={() => gerarLinkAdministrador(administrador.id)} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function NovoAdministrador({ escolaId }: { escolaId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<AdministradorEscolaValues>({
    resolver: zodResolver(administradorEscolaSchema),
    defaultValues: { nomeCompleto: "", emailLogin: "", telefone: "" },
  });

  function onSubmit(values: AdministradorEscolaValues) {
    startTransition(async () => {
      const result = await criarAdministradorEscola(escolaId, values);
      if ("error" in result) {
        if ("campo" in result && result.campo === "telefone") {
          form.setError("telefone", { message: result.error }, { shouldFocus: true });
        }
        toast.error("Não foi possível criar", result.error);
        return;
      }
      toast.success("Administrador criado.", "Gere o link de acesso e envie para o cliente.");
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      {/* Form próprio, separado do formulário da escola (e do botão Salvar do topo). */}
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="nomeCompleto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do administrador" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emailLogin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail de login</FormLabel>
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
                  <PhoneInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <Button type="submit" loading={isPending}>
            <UserPlus size={16} strokeWidth={2} aria-hidden="true" />
            Criar administrador
          </Button>
        </div>
      </form>
    </Form>
  );
}
