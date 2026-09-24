"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { usePageActionsSetter } from "@/components/layout/page-actions-context";
import { toast } from "@/lib/use-toast";

import { createUsuario, updateUsuario } from "@/app/(app)/usuarios/actions";
import {
  isFuncaoProfessor,
  createUsuarioSchema,
  updateUsuarioSchema,
  type UpdateUsuarioValues,
} from "@/app/(app)/usuarios/schema";
import type { AuditoriaRow, ReferenciaTurmas } from "@/app/(app)/usuarios/queries";

import { AcessoCard } from "./acesso-card";
import { DadosGeraisCard } from "./dados-gerais-card";
import { HistoricoUsuarioDrawer } from "./historico-drawer";
import { TurmasVinculadasCard } from "./turmas-vinculadas-card";
import { UsuarioHeroCard } from "./usuario-hero-card";
import type { VinculoLocal } from "./vinculo-types";

const FORM_ID = "user-edit-form";

type UserFormProps = {
  referencia: ReferenciaTurmas;
  canEdit: boolean;
} & (
  | { mode: "create" }
  | {
      mode: "edit";
      usuarioId: string;
      escolaId: string;
      defaultValues: {
        nomeCompleto: string;
        email: string;
        telefone: string;
        funcao: string;
        areaAtuacao: string;
        areaAtuacaoOutro: string;
        status: "ativo" | "inativo";
        emailLogin: string;
        criadoEm: string;
        atualizadoEm: string;
      };
      vinculos: VinculoLocal[];
      fotoUrlInicial: string | null;
      auditoria: AuditoriaRow[];
    }
);

export function UserForm(props: UserFormProps) {
  const [isPending, startTransition] = useTransition();
  const setPageActions = usePageActionsSetter();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Criação redireciona pra cá com `?criado=1` (o Server Action não tem
  // como devolver dado pro client depois de um redirect) — o toast de
  // sucesso é disparado aqui, uma vez, e o parâmetro é removido da URL
  // pra não repetir o toast num refresh manual da página. O ref evita
  // disparar duas vezes sob o StrictMode do dev (que roda efeitos de
  // montagem duas vezes de propósito).
  const criadoToastDisparado = useRef(false);
  useEffect(() => {
    if (
      props.mode === "edit" &&
      searchParams.get("criado") === "1" &&
      !criadoToastDisparado.current
    ) {
      criadoToastDisparado.current = true;
      toast.success(
        "Usuário criado com sucesso.",
        "Gere o link de acesso no bloco Acesso para enviar ao usuário.",
      );
      router.replace(`/usuarios/${props.usuarioId}/editar`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const schema = props.mode === "create" ? createUsuarioSchema : updateUsuarioSchema;

  const form = useForm<UpdateUsuarioValues>({
    resolver: zodResolver(schema as typeof updateUsuarioSchema),
    defaultValues:
      props.mode === "edit"
        ? {
            nomeCompleto: props.defaultValues.nomeCompleto,
            email: props.defaultValues.email,
            telefone: props.defaultValues.telefone,
            funcao: props.defaultValues.funcao,
            areaAtuacao: props.defaultValues.areaAtuacao,
            areaAtuacaoOutro: props.defaultValues.areaAtuacaoOutro,
            status: props.defaultValues.status,
            emailLogin: props.defaultValues.emailLogin,
          }
        : {
            nomeCompleto: "",
            email: "",
            telefone: "",
            funcao: "" as never,
            areaAtuacao: "",
            areaAtuacaoOutro: "",
            status: "ativo",
            emailLogin: "",
          },
  });

  const { isDirty } = form.formState;

  // Card de topo acompanha o que está sendo digitado, não só o valor salvo.
  const [
    nomeExibicao,
    emailExibicao,
    funcaoSelecionada,
    statusExibicao,
    areaAtuacaoExibicao,
    areaAtuacaoOutroExibicao,
  ] = useWatch({
    control: form.control,
    name: ["nomeCompleto", "email", "funcao", "status", "areaAtuacao", "areaAtuacaoOutro"],
  });
  const isProfessor = isFuncaoProfessor(funcaoSelecionada);

  useEffect(() => {
    setPageActions({
      formId: FORM_ID,
      pending: isPending,
      cancelHref: "/usuarios",
      cancelLabel: props.canEdit ? undefined : "Voltar",
      readOnly: !props.canEdit,
      isDirty,
    });
    return () => setPageActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, props.canEdit, isDirty]);

  function onSubmit(values: UpdateUsuarioValues) {
    startTransition(async () => {
      const result =
        props.mode === "create"
          ? await createUsuario(values)
          : await updateUsuario(props.usuarioId, values);

      // Sucesso não chega a devolver aqui — `createUsuario`/`updateUsuario`
      // terminam em `redirect()` (lança internamente, não retorna). O toast
      // de sucesso é disparado depois da navegação, lendo `?criado=1`/
      // `?salvo=1` na página de destino (ver useEffect acima e
      // usuarios-lista.tsx).
      if (result?.error) {
        toast.error("Não foi possível salvar", result.error);
      }
    });
  }

  return (
    <Form {...form}>
      <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-[24px]">
          <Card className="gap-0 overflow-hidden p-0">
            <UsuarioHeroCard
              mode={props.mode}
              nomeCompleto={nomeExibicao}
              email={emailExibicao}
              funcao={funcaoSelecionada}
              areaAtuacao={areaAtuacaoExibicao}
              areaAtuacaoOutro={areaAtuacaoOutroExibicao}
              status={statusExibicao}
              foto={
                props.mode === "edit"
                  ? {
                      usuarioId: props.usuarioId,
                      escolaId: props.escolaId,
                      fotoUrlInicial: props.fotoUrlInicial,
                      canEdit: props.canEdit,
                    }
                  : undefined
              }
              acoes={
                props.mode === "edit" ? (
                  <HistoricoUsuarioDrawer
                    auditoria={props.auditoria}
                    referencia={props.referencia}
                    cadastro={
                      !props.canEdit
                        ? {
                            criadoEm: props.defaultValues.criadoEm,
                            atualizadoEm: props.defaultValues.atualizadoEm,
                          }
                        : undefined
                    }
                  />
                ) : undefined
              }
            />
          </Card>

          <fieldset disabled={!props.canEdit} className="contents">
            <DadosGeraisCard control={form.control} />

            {/* Só consulta — o vínculo é feito no Cadastro de Turma. */}
            {isProfessor && (
              <TurmasVinculadasCard
                mode={props.mode}
                vinculos={props.mode === "edit" ? props.vinculos : []}
              />
            )}

            {props.mode === "create" ? (
              <AcessoCard control={form.control} mode="create" numero={isProfessor ? 3 : 2} />
            ) : (
              <AcessoCard
                control={form.control}
                mode="edit"
                usuarioId={props.usuarioId}
                numero={isProfessor ? 3 : 2}
              />
            )}
          </fieldset>
        </div>
      </form>
    </Form>
  );
}
