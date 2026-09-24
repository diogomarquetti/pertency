"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { usePageActionsSetter } from "@/components/layout/page-actions-context";
import { toast } from "@/lib/use-toast";

import { createTurma, updateTurma } from "@/app/(app)/turmas/actions";
import {
  createTurmaSchema,
  updateTurmaSchema,
  type UpdateTurmaValues,
} from "@/app/(app)/turmas/schema";
import type {
  AuditoriaTurmaRow,
  EstudanteVinculado,
  ProfessorElegivel,
  ProfessorVinculado,
  ReferenciaTurmaForm,
} from "@/app/(app)/turmas/queries";

import { EstruturaCurricularCard } from "./estrutura-curricular-card";
import { EstudantesVinculadosCard } from "./estudantes-vinculados-card";
import { HistoricoTurmaDrawer } from "./historico-drawer";
import { IdentificacaoCard } from "./identificacao-card";
import { ObservacoesStatusCard } from "./observacoes-status-card";
import { OfertaCard } from "./oferta-card";
import { ProfessorVinculoDrawer, type ScopePool } from "./professor-vinculo-drawer";
import { ProfessoresVinculadosCard } from "./professores-vinculados-card";
import { TurmaHeroCard } from "./turma-hero-card";

const FORM_ID = "turma-edit-form";

const EMPTY_VALUES: UpdateTurmaValues = {
  nome: "",
  anoLetivoId: "",
  turnoId: "",
  capacidade: "",
  ofertaSlug: "" as never,
  ofertaId: "",
  organizacaoId: "",
  matrizCurricularId: "",
  status: "ativa",
  dataInicio: "",
  dataFim: "",
  observacoes: "",
  camposExperiencias: [],
  direitosAprendizagem: [],
  objetivoGeral: "",
  etapaDoCiclo: "",
  areasConhecimento: [],
  componenteIds: [],
  unidadesOcupacionais: [],
  eixosFuncionais: [],
};

type DrawerState = { open: boolean; editing: ProfessorVinculado | null };

type TurmaFormProps = {
  referencia: ReferenciaTurmaForm;
  canEdit: boolean;
} & (
  | { mode: "create" }
  | {
      mode: "edit";
      turmaId: string;
      defaultValues: UpdateTurmaValues;
      auditoria: AuditoriaTurmaRow[];
      professoresVinculados: ProfessorVinculado[];
      professoresElegiveis: ProfessorElegivel[];
      estudantesVinculados: EstudanteVinculado[];
      scopePool: ScopePool;
    }
);

export function TurmaForm(props: TurmaFormProps) {
  const [isPending, startTransition] = useTransition();
  const [drawerState, setDrawerState] = useState<DrawerState>({ open: false, editing: null });
  const setPageActions = usePageActionsSetter();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mesmo padrão de components/usuarios/user-form.tsx: createTurma termina
  // em redirect() (não devolve dado pro client), então o toast de sucesso é
  // disparado aqui lendo `?criado=1` na página de destino.
  const criadoToastDisparado = useRef(false);
  useEffect(() => {
    if (
      props.mode === "edit" &&
      searchParams.get("criado") === "1" &&
      !criadoToastDisparado.current
    ) {
      criadoToastDisparado.current = true;
      toast.success("Turma criada com sucesso.");
      router.replace(`/turmas/${props.turmaId}/editar`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const schema = props.mode === "create" ? createTurmaSchema : updateTurmaSchema;

  const form = useForm<UpdateTurmaValues>({
    resolver: zodResolver(schema as typeof updateTurmaSchema),
    defaultValues: props.mode === "edit" ? props.defaultValues : EMPTY_VALUES,
  });

  const { isDirty } = form.formState;

  // Card de topo acompanha o que está sendo digitado, não só o valor salvo.
  const [nome, status, ofertaId, organizacaoId, anoLetivoId, turnoId] = useWatch({
    control: form.control,
    name: ["nome", "status", "ofertaId", "organizacaoId", "anoLetivoId", "turnoId"],
  });
  const ofertaNome = props.referencia.ofertas.find((oferta) => oferta.id === ofertaId)?.nome;
  const organizacaoNome = props.referencia.organizacoes.find((org) => org.id === organizacaoId)?.nome;
  const ano = props.referencia.anosLetivos.find((item) => item.id === anoLetivoId)?.ano;
  const turnoNome = props.referencia.turnos.find((turno) => turno.id === turnoId)?.nome;
  const plural = (n: number, singular: string, pluralForm: string) =>
    `${n} ${n === 1 ? singular : pluralForm}`;
  const detalhesTopo = [
    [ofertaNome, organizacaoNome].filter(Boolean).join(" — "),
    ano ? `Ano letivo ${ano}` : null,
    turnoNome,
    props.mode === "edit"
      ? plural(props.professoresVinculados.length, "professor", "professores")
      : null,
    props.mode === "edit"
      ? plural(props.estudantesVinculados.length, "estudante", "estudantes")
      : null,
  ];

  useEffect(() => {
    setPageActions({
      formId: FORM_ID,
      pending: isPending,
      cancelHref: "/turmas",
      cancelLabel: props.canEdit ? undefined : "Voltar",
      readOnly: !props.canEdit,
      isDirty,
    });
    return () => setPageActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, props.canEdit, isDirty]);

  function onInvalid(errors: FieldErrors<UpdateTurmaValues>) {
    const firstMessage = Object.values(errors).find(
      (error) => typeof error?.message === "string",
    )?.message as string | undefined;
    if (firstMessage) {
      toast.error(firstMessage);
    }
  }

  function onSubmit(values: UpdateTurmaValues) {
    startTransition(async () => {
      const result =
        props.mode === "create"
          ? await createTurma(values)
          : await updateTurma(props.turmaId, values);

      if (result?.error) {
        toast.error("Não foi possível salvar", result.error);
      }
    });
  }

  return (
    <Form {...form}>
      <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit, onInvalid)} noValidate>
        <div className="flex flex-col gap-[24px]">
          <Card className="gap-0 overflow-hidden p-0">
            <TurmaHeroCard
              mode={props.mode}
              nome={nome}
              status={status}
              detalhes={detalhesTopo}
              acoes={
                props.mode === "edit" ? (
                  <HistoricoTurmaDrawer referencia={props.referencia} auditoria={props.auditoria} />
                ) : undefined
              }
            />
          </Card>

          <fieldset disabled={!props.canEdit} className="contents">
            <div className="flex min-w-0 flex-col gap-[24px]">
              <IdentificacaoCard control={form.control} referencia={props.referencia} />
              <OfertaCard form={form} referencia={props.referencia} />
              <EstruturaCurricularCard form={form} referencia={props.referencia} />

              {props.mode === "edit" && (
                <>
                  <ProfessoresVinculadosCard
                    turmaId={props.turmaId}
                    professores={props.professoresVinculados}
                    ofertaSlug={props.scopePool.ofertaSlug}
                    onRequestAdd={() => setDrawerState({ open: true, editing: null })}
                    onRequestEdit={(professor) => setDrawerState({ open: true, editing: professor })}
                  />
                  <EstudantesVinculadosCard estudantes={props.estudantesVinculados} />
                </>
              )}

              <ObservacoesStatusCard control={form.control} />
            </div>
          </fieldset>
        </div>
      </form>

      {props.mode === "edit" && (
        <ProfessorVinculoDrawer
          open={drawerState.open}
          onOpenChange={(open) => setDrawerState((current) => ({ ...current, open }))}
          turmaId={props.turmaId}
          editing={drawerState.editing}
          professoresElegiveis={props.professoresElegiveis}
          professoresVinculados={props.professoresVinculados}
          pool={props.scopePool}
        />
      )}
    </Form>
  );
}
