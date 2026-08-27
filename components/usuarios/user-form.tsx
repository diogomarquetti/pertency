"use client";

import { useEffect, useState } from "react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";

import { Form } from "@/components/ui/form";
import { usePageActionsSetter } from "@/components/layout/page-actions-context";

import { createUsuario, updateUsuario } from "@/app/(app)/usuarios/actions";
import {
  isFuncaoProfessor,
  createUsuarioSchema,
  updateUsuarioSchema,
  type UpdateUsuarioValues,
} from "@/app/(app)/usuarios/schema";
import type { AuditoriaRow, ReferenciaTurmas } from "@/app/(app)/usuarios/queries";

import { AcessoCard } from "./acesso-card";
import { ContextPanel, type PanelState } from "./context-panel";
import { DadosGeraisCard } from "./dados-gerais-card";
import { FotoCard } from "./foto-card";
import { TurmasVinculadasCard } from "./turmas-vinculadas-card";
import type { VinculoLocal } from "./vinculo-types";

const FORM_ID = "user-edit-form";

type UserFormProps = {
  referencia: ReferenciaTurmas;
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
        status: "ativo" | "inativo";
        emailLogin: string;
      };
      vinculosIniciais: VinculoLocal[];
      fotoUrlInicial: string | null;
      auditoria: AuditoriaRow[];
    }
);

export function UserForm(props: UserFormProps) {
  const [isPending, startTransition] = useTransition();
  const [vinculos, setVinculos] = useState<VinculoLocal[]>(
    props.mode === "edit" ? props.vinculosIniciais : [],
  );
  const [panelState, setPanelState] = useState<PanelState>({ mode: "historico" });
  const setPageActions = usePageActionsSetter();

  const schema = props.mode === "create" ? createUsuarioSchema : updateUsuarioSchema;

  const form = useForm<UpdateUsuarioValues>({
    resolver: zodResolver(schema as typeof updateUsuarioSchema),
    defaultValues:
      props.mode === "edit"
        ? { ...props.defaultValues, vinculos: [] }
        : {
            nomeCompleto: "",
            email: "",
            telefone: "",
            funcao: "" as never,
            status: "ativo",
            emailLogin: "",
            vinculos: [],
          },
  });

  const funcaoSelecionada = form.watch("funcao");
  const statusSelecionado = form.watch("status");
  const isProfessor = isFuncaoProfessor(funcaoSelecionada);

  // O react-hook-form só sabe validar o schema (incluindo a regra de
  // "professor precisa de vínculo") pelo valor que ele mesmo controla — como
  // `vinculos` é mantido como estado local (ver comentário em onSubmit sobre
  // por quê), precisa ser espelhado de volta pro form a cada mudança, senão
  // a validação do zod roda contra um array sempre vazio e bloqueia o
  // envio sem mostrar erro nenhum (não há FormField ligado a `vinculos`).
  useEffect(() => {
    form.setValue(
      "vinculos",
      vinculos.map(({ etapaCicloId, turnoId, turmaId, componenteIds }) => ({
        etapaCicloId,
        turnoId,
        turmaId,
        componenteIds,
      })),
      { shouldValidate: form.formState.isSubmitted },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vinculos]);

  // Trocar de função sempre volta o painel de contexto pro estado de
  // repouso (histórico) — evita ficar com o formulário de turma aberto
  // quando a função virou algo que não é mais professor, por exemplo.
  useEffect(() => {
    setPanelState({ mode: "historico" });
  }, [funcaoSelecionada]);

  useEffect(() => {
    setPageActions({
      formId: FORM_ID,
      pending: isPending,
      cancelHref: "/usuarios",
    });
    return () => setPageActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  function handleAddVinculo(vinculo: VinculoLocal) {
    setVinculos((current) => [...current, vinculo]);
  }

  function handleReplaceVinculo(index: number, vinculo: VinculoLocal) {
    setVinculos((current) => current.map((item, i) => (i === index ? vinculo : item)));
  }

  function handleRemoveVinculo(turmaId: string) {
    setVinculos((current) => current.filter((v) => v.turmaId !== turmaId));
  }

  function onSubmit(values: UpdateUsuarioValues) {
    form.clearErrors("root");

    if (isProfessor && vinculos.length === 0) {
      form.setError("root", {
        message: "Professores precisam de pelo menos uma turma vinculada.",
      });
      return;
    }

    const payload: UpdateUsuarioValues = {
      ...values,
      vinculos: isProfessor
        ? vinculos.map(({ etapaCicloId, turnoId, turmaId, componenteIds }) => ({
            etapaCicloId,
            turnoId,
            turmaId,
            componenteIds,
          }))
        : [],
    };

    startTransition(async () => {
      const result =
        props.mode === "create"
          ? await createUsuario(payload)
          : await updateUsuario(props.usuarioId, payload);

      if (result?.error) {
        form.setError("root", { message: result.error });
      }
    });
  }

  return (
    <Form {...form}>
      <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="grid items-start gap-[24px] xl:grid-cols-[1fr_var(--panel-w)]">
          <div className="flex min-w-0 flex-col gap-[24px]">
            <DadosGeraisCard control={form.control} statusAtual={statusSelecionado} />

            {isProfessor && (
              <TurmasVinculadasCard
                vinculos={vinculos}
                onRequestAdd={() => setPanelState({ mode: "form", editingIndex: null })}
                onRequestEdit={(index) => setPanelState({ mode: "form", editingIndex: index })}
                onRemove={handleRemoveVinculo}
              />
            )}

            <div className="grid gap-[24px] sm:grid-cols-2">
              {props.mode === "create" ? (
                <>
                  <AcessoCard control={form.control} mode="create" />
                  <FotoCard mode="create" />
                </>
              ) : (
                <>
                  <AcessoCard control={form.control} mode="edit" usuarioId={props.usuarioId} />
                  <FotoCard
                    mode="edit"
                    usuarioId={props.usuarioId}
                    escolaId={props.escolaId}
                    nomeCompleto={props.defaultValues.nomeCompleto}
                    fotoUrlInicial={props.fotoUrlInicial}
                  />
                </>
              )}
            </div>

            {form.formState.errors.root && (
              <p
                className="flex items-center gap-[5px] text-[12.5px] text-danger"
                role="alert"
              >
                <AlertCircle size={14} strokeWidth={2} className="shrink-0" aria-hidden="true" />
                {form.formState.errors.root.message}
              </p>
            )}
          </div>

          <ContextPanel
            panelState={panelState}
            onClose={() => setPanelState({ mode: "historico" })}
            referencia={props.referencia}
            vinculos={vinculos}
            onAddVinculo={handleAddVinculo}
            onReplaceVinculo={handleReplaceVinculo}
            auditoria={props.mode === "edit" ? props.auditoria : undefined}
          />
        </div>
      </form>
    </Form>
  );
}
