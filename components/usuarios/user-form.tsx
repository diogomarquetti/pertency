"use client";

import { useEffect, useRef, useState } from "react";
import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

  // A regra "professor precisa de vínculo" já é imposta pelo próprio schema
  // zod (superRefine no path "vinculos", ver schema.ts) — como não existe
  // FormField ligado a esse path (vinculos vive em estado local, não em
  // input controlado), o erro nunca aparece inline sozinho. Sem esse
  // segundo argumento de handleSubmit, a validação falha silenciosamente:
  // `onSubmit` nunca é chamado e o Salvar simplesmente não faz nada.
  function onInvalid(errors: FieldErrors<UpdateUsuarioValues>) {
    if (errors.vinculos) {
      toast.error(
        errors.vinculos.message ?? "Professores precisam de pelo menos uma turma vinculada.",
      );
    }
  }

  function onSubmit(values: UpdateUsuarioValues) {
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
      <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit, onInvalid)} noValidate>
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
