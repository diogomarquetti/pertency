"use client";

import { useEffect, useTransition } from "react";
import { useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePageActionsSetter } from "@/components/layout/page-actions-context";
import { AcessoCard } from "@/components/usuarios/acesso-card";
import { DadosGeraisCard } from "@/components/usuarios/dados-gerais-card";
import { UsuarioHeroCard } from "@/components/usuarios/usuario-hero-card";
import { toast } from "@/lib/use-toast";

import { atualizarUsuario, criarUsuario, gerarLink, verificarTelefone } from "@/app/admin/(painel)/usuarios/actions";
import type { EscolaOpcao } from "@/app/admin/(painel)/usuarios/queries";
import { usuarioPlataformaSchema, type UsuarioPlataformaValues } from "@/app/admin/(painel)/usuarios/schema";
import type { UpdateUsuarioValues } from "@/app/(app)/usuarios/schema";

import { useToastDeParametro } from "./use-toast-de-parametro";

const FORM_ID = "usuario-plataforma-form";

const USUARIO_VAZIO: UsuarioPlataformaValues = {
  nomeCompleto: "",
  email: "",
  telefone: "",
  // Quase sempre o operador cria o primeiro administrador da escola.
  funcao: "administrador",
  areaAtuacao: "",
  areaAtuacaoOutro: "",
  status: "ativo",
  emailLogin: "",
  escolaId: "",
};

type Props =
  | { mode: "create"; escolas: EscolaOpcao[] }
  | { mode: "edit"; usuarioId: string; escola: string; defaultValues: UsuarioPlataformaValues };

/**
 * Cadastro de usuário de escola no admin da plataforma — os mesmos blocos do
 * Cadastro de Usuários das escolas (Dados gerais e Acesso), mais a escola.
 * Sem foto (o upload é do admin da própria escola) nem turmas vinculadas
 * (feitas no Cadastro de Turma).
 */
export function UsuarioPlataformaForm(props: Props) {
  const [isPending, startTransition] = useTransition();
  const setPageActions = usePageActionsSetter();
  useToastDeParametro("criado", "Usuário criado com sucesso.", "Gere o link de acesso no bloco Acesso para enviar ao usuário.");

  const form = useForm<UsuarioPlataformaValues>({
    resolver: zodResolver(usuarioPlataformaSchema),
    defaultValues: props.mode === "edit" ? props.defaultValues : USUARIO_VAZIO,
  });
  // Os cards compartilhados com o app das escolas não conhecem o campo escolaId.
  const controlUsuario = form.control as unknown as Control<UpdateUsuarioValues>;

  const { isDirty } = form.formState;
  const [nome, email, funcao, status, areaAtuacao, areaAtuacaoOutro] = useWatch({
    control: form.control,
    name: ["nomeCompleto", "email", "funcao", "status", "areaAtuacao", "areaAtuacaoOutro"],
  });

  useEffect(() => {
    setPageActions({
      formId: FORM_ID,
      pending: isPending,
      saveLabel: props.mode === "create" ? "Criar usuário" : undefined,
      cancelHref: "/usuarios",
      isDirty,
    });
    return () => setPageActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, isDirty]);

  function onSubmit(values: UsuarioPlataformaValues) {
    startTransition(async () => {
      // Criação termina em redirect para a edição (`?criado=1`); não volta aqui.
      const result =
        props.mode === "create" ? await criarUsuario(values) : await atualizarUsuario(props.usuarioId, values);
      if (!result) return;
      if ("error" in result) {
        if ("campo" in result && result.campo === "telefone") {
          form.setError("telefone", { message: result.error }, { shouldFocus: true });
        }
        toast.error("Não foi possível salvar", result.error);
        return;
      }
      toast.success("Alterações salvas com sucesso.");
      form.reset(values);
    });
  }

  // Avisa telefone duplicado na escola já ao sair do campo; o Salvar checa de novo.
  async function checarTelefone() {
    const telefone = form.getValues("telefone");
    if (!telefone || !(await form.trigger("telefone"))) return;
    const { duplicadoCom } = await verificarTelefone(
      telefone,
      props.mode === "edit" ? props.usuarioId : null,
      form.getValues("escolaId"),
    );
    if (duplicadoCom && form.getValues("telefone") === telefone) {
      form.setError("telefone", { message: `Este telefone já está cadastrado para ${duplicadoCom}.` });
    }
  }

  return (
    <Form {...form}>
      <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-[24px]">
          <Card className="gap-0 overflow-hidden p-0">
            <UsuarioHeroCard
              mode={props.mode}
              nomeCompleto={nome}
              email={email}
              funcao={funcao}
              areaAtuacao={areaAtuacao}
              areaAtuacaoOutro={areaAtuacaoOutro}
              status={status}
            />
          </Card>

          <DadosGeraisCard control={controlUsuario} onTelefoneBlur={checarTelefone} />

          <Card className="gap-4 p-[24px]">
            <h2 className="flex items-baseline gap-2 text-highlight text-ink">
              <span className="text-brand">2.</span> Escola
            </h2>
            {props.mode === "create" ? (
              <FormField
                control={form.control}
                name="escolaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escola</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a escola" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {props.escolas.map((escola) => (
                          <SelectItem key={escola.id} value={escola.id} disabled={escola.status === "inativa"}>
                            {escola.nome}
                            {escola.status === "inativa" && " (inativa)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {props.escolas.length === 0
                        ? "Nenhuma escola cadastrada. Cadastre em Escolas primeiro."
                        : "Não pode ser trocada depois."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="flex flex-col gap-[6px]">
                <label htmlFor="escola-do-usuario" className="text-label text-ink">
                  Escola
                </label>
                <Input id="escola-do-usuario" value={props.escola} readOnly disabled />
              </div>
            )}
          </Card>

          {props.mode === "create" ? (
            <AcessoCard control={controlUsuario} mode="create" numero={3} />
          ) : (
            <AcessoCard
              control={controlUsuario}
              mode="edit"
              usuarioId={props.usuarioId}
              numero={3}
              gerarLink={gerarLink}
            />
          )}
        </div>
      </form>
    </Form>
  );
}
