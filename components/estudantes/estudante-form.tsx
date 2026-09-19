"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePageActionsSetter } from "@/components/layout/page-actions-context";
import { toast } from "@/lib/use-toast";

import { createEstudante, updateEstudante } from "@/app/(app)/estudantes/actions";
import {
  createEstudanteSchema,
  updateEstudanteSchema,
  type UpdateEstudanteValues,
} from "@/app/(app)/estudantes/schema";
import type {
  AnoLetivoOption,
  AuditoriaEstudanteRow,
  AvaliacaoIngresso,
  CondicaoEstudante,
  ContribuicaoAvaliacao,
  DadosEscolares,
  DocumentoEstudante,
  PerfilFuncionalEstudante,
  ReferenciaOfertas,
  RelatorioAvaliacao,
  TurmaOption,
  UsuarioElegivel,
  VinculoEscolarAnual,
} from "@/app/(app)/estudantes/queries";

import { AbaPlaceholder } from "./aba-placeholder";
import { AVALIACAO_FORM_ID, AvaliacaoTab } from "./avaliacao/avaliacao-tab";
import { CONDICAO_FORM_ID, CondicaoTab } from "./condicao/condicao-tab";
import { DADOS_ESCOLARES_FORM_ID, DadosEscolaresTab } from "./dados-escolares/dados-escolares-tab";
import { DocumentosTab } from "./documentos/documentos-tab";
import { EnderecoCard } from "./endereco-card";
import { EstudanteHeroCard } from "./estudante-hero-card";
import { FotoCard } from "./foto-card";
import { HistoricoCard } from "./historico-card";
import { IdentificacaoCard } from "./identificacao-card";
import { ResponsaveisCard } from "./responsaveis-card";

const FORM_ID = "estudante-edit-form";

// O botão Salvar do header submete pelo atributo HTML `form`, associando por
// id — mas cada aba tem seu próprio <form>, e o Radix Tabs desmonta o
// TabsContent inativo por padrão. Por isso o id-alvo precisa acompanhar a
// aba ativa; abas sem form próprio (Documentos, Condição) ficam de fora do
// mapa e escondem o botão (ver `readOnly` no useEffect de setPageActions).
const FORM_ID_POR_ABA: Record<string, string> = {
  "dados-pessoais": FORM_ID,
  avaliacao: AVALIACAO_FORM_ID,
  "dados-escolares": DADOS_ESCOLARES_FORM_ID,
  condicao: CONDICAO_FORM_ID,
};

const EMPTY_VALUES: UpdateEstudanteValues = {
  nomeCompleto: "",
  nomeSocial: "",
  situacao: "em_analise_de_ingresso",
  dataNascimento: "",
  sexo: "",
  corRaca: "",
  nacionalidade: "",
  naturalidade: "",
  cpf: "",
  tipoDocumentoIdentificacao: "",
  numeroDocumento: "",
  orgaoEmissorUf: "",
  enderecoLogradouro: "",
  enderecoNumero: "",
  enderecoComplemento: "",
  enderecoBairro: "",
  enderecoCep: "",
  enderecoMunicipio: "",
  enderecoUf: "",
  responsavelPrincipalNome: "",
  responsavelPrincipalParentesco: "",
  responsavelPrincipalTelefone: "",
  segundoResponsavelNome: "",
  segundoResponsavelParentesco: "",
  segundoResponsavelTelefone: "",
  filiacao: "",
  quemPodeRetirar: "",
  contatoEmergenciaNome: "",
  contatoEmergenciaTelefone: "",
};

type EstudanteFormProps = {
  canEdit: boolean;
} & (
  | { mode: "create" }
  | {
      mode: "edit";
      estudanteId: string;
      escolaId: string;
      defaultValues: UpdateEstudanteValues;
      fotoUrlInicial: string | null;
      auditoria: AuditoriaEstudanteRow[];
      avaliacao: AvaliacaoIngresso | null;
      equipeElegivel: UsuarioElegivel[];
      referenciaOfertas: ReferenciaOfertas;
      documentos: DocumentoEstudante[];
      dadosEscolares: DadosEscolares | null;
      turnos: { id: string; nome: string }[];
      turmasReferencia: TurmaOption[];
      anosLetivos: AnoLetivoOption[];
      vinculosEscolaresAnuais: VinculoEscolarAnual[];
      contribuicoes: ContribuicaoAvaliacao[];
      relatorios: RelatorioAvaliacao[];
      viewerId: string | null;
      viewerCanEditQualquerContribuicao: boolean;
      viewerCanEditContribuicaoPropria: boolean;
      canGerarRelatorio: boolean;
      condicoes: CondicaoEstudante[];
      perfilFuncional: PerfilFuncionalEstudante | null;
      canEditCondicao: boolean;
    }
);

const ABAS_VALIDAS = new Set([
  "dados-pessoais",
  "avaliacao",
  "documentos",
  "dados-escolares",
  "condicao",
]);

export function EstudanteForm(props: EstudanteFormProps) {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  // Permite deep-link direto pra uma aba (ex: Perfil do Estudante → "Ver
  // condição do estudante" → ?aba=condicao) — sem isso, sempre cairia em
  // Dados pessoais. Ignora valor desconhecido/ausente e usa o padrão.
  const abaInicial = searchParams.get("aba");
  const [activeTab, setActiveTab] = useState(
    abaInicial && ABAS_VALIDAS.has(abaInicial) ? abaInicial : "dados-pessoais",
  );
  const [avaliacaoPending, setAvaliacaoPending] = useState(false);
  const [dadosEscolaresPending, setDadosEscolaresPending] = useState(false);
  const [condicaoPending, setCondicaoPending] = useState(false);
  const setPageActions = usePageActionsSetter();
  const router = useRouter();

  // Mesmo padrão de components/turmas/turma-form.tsx: createEstudante termina
  // em redirect(), o toast de sucesso é disparado aqui lendo `?criado=1`.
  const criadoToastDisparado = useRef(false);
  useEffect(() => {
    if (
      props.mode === "edit" &&
      searchParams.get("criado") === "1" &&
      !criadoToastDisparado.current
    ) {
      criadoToastDisparado.current = true;
      toast.success("Estudante criado com sucesso.");
      router.replace(`/estudantes/${props.estudanteId}/editar`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const schema = props.mode === "create" ? createEstudanteSchema : updateEstudanteSchema;

  const form = useForm<UpdateEstudanteValues>({
    resolver: zodResolver(schema as typeof updateEstudanteSchema),
    defaultValues: props.mode === "edit" ? props.defaultValues : EMPTY_VALUES,
  });

  const { isDirty } = form.formState;

  const PENDING_POR_ABA: Record<string, boolean> = {
    "dados-pessoais": isPending,
    avaliacao: avaliacaoPending,
    "dados-escolares": dadosEscolaresPending,
    condicao: condicaoPending,
  };

  useEffect(() => {
    const formIdDaAba = FORM_ID_POR_ABA[activeTab];
    setPageActions({
      formId: formIdDaAba ?? "",
      pending: formIdDaAba ? (PENDING_POR_ABA[activeTab] ?? false) : false,
      cancelHref: "/estudantes",
      cancelLabel: props.canEdit ? undefined : "Voltar",
      readOnly: !props.canEdit || !formIdDaAba,
      isDirty,
    });
    return () => setPageActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    isPending,
    avaliacaoPending,
    dadosEscolaresPending,
    condicaoPending,
    props.canEdit,
    isDirty,
  ]);

  function onInvalid(errors: FieldErrors<UpdateEstudanteValues>) {
    const firstMessage = Object.values(errors).find(
      (error) => typeof error?.message === "string",
    )?.message as string | undefined;
    if (firstMessage) {
      toast.error(firstMessage);
    }
  }

  function onSubmit(values: UpdateEstudanteValues) {
    startTransition(async () => {
      const result =
        props.mode === "create"
          ? await createEstudante(values)
          : await updateEstudante(props.estudanteId, values);

      if (result?.error) {
        toast.error("Não foi possível salvar", result.error);
      }
    });
  }

  // Avaliação de Ingresso só faz sentido depois que os Dados pessoais foram
  // salvos ao menos uma vez (regra da história). Documentos e Dados
  // escolares liberam quando a avaliação estiver Concluída com recomendação
  // Elegível. Condição do estudante libera junto com a Avaliação — a HU
  // v2.0 permite a Coordenação registrar informação funcional "durante o
  // processo", não só depois do vínculo escolar efetivado.
  const avaliacaoLiberada = props.mode === "edit";
  const documentosLiberado =
    props.mode === "edit" &&
    props.avaliacao?.statusAvaliacao === "concluida" &&
    props.avaliacao?.recomendacaoElegibilidade === "elegivel";
  const condicaoLiberada = avaliacaoLiberada;

  // Hero no topo do cadastro: nome/situação reagem ao que está sendo
  // digitado no formulário (não só ao valor salvo); turma atual/matrícula
  // não fazem parte do formulário — vêm do vínculo escolar anual já
  // carregado (mesmo dado usado no Perfil do Estudante), o mais recente é
  // sempre o primeiro (getVinculosEscolaresAnuais já ordena por ano desc).
  const nomeExibicao = useWatch({ control: form.control, name: "nomeCompleto" });
  const situacaoExibicao = useWatch({ control: form.control, name: "situacao" });
  const vinculoAtual = props.mode === "edit" ? (props.vinculosEscolaresAnuais[0] ?? null) : null;
  const turmaAtualLabel =
    props.mode === "edit" && vinculoAtual
      ? (() => {
          const ofertaNome = props.referenciaOfertas.ofertas.find(
            (oferta) => oferta.id === vinculoAtual.ofertaAtualId,
          )?.nome;
          return ofertaNome && vinculoAtual.turmaNome
            ? `${ofertaNome} — ${vinculoAtual.turmaNome}`
            : (vinculoAtual.turmaNome ?? null);
        })()
      : null;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <Card className="mb-[24px] gap-0 overflow-hidden p-0">
        <EstudanteHeroCard
          mode={props.mode}
          nomeCompleto={nomeExibicao}
          fotoUrl={props.mode === "edit" ? props.fotoUrlInicial : null}
          situacao={situacaoExibicao}
          turmaAtualLabel={turmaAtualLabel}
          matriculaInterna={vinculoAtual?.matriculaInterna}
        />
        <TabsList className="border-t border-line px-[24px]">
          <TabsTrigger value="dados-pessoais">Dados pessoais</TabsTrigger>
          <TabsTrigger value="avaliacao" disabled={!avaliacaoLiberada}>
            <span className="inline-flex items-center gap-1">
              {!avaliacaoLiberada && <Lock size={12} strokeWidth={2} aria-hidden="true" />}
              Avaliação de Ingresso
            </span>
          </TabsTrigger>
          <TabsTrigger value="documentos" disabled={!documentosLiberado}>
            <span className="inline-flex items-center gap-1">
              {!documentosLiberado && <Lock size={12} strokeWidth={2} aria-hidden="true" />}
              Documentos
            </span>
          </TabsTrigger>
          <TabsTrigger value="dados-escolares" disabled={!documentosLiberado}>
            <span className="inline-flex items-center gap-1">
              {!documentosLiberado && <Lock size={12} strokeWidth={2} aria-hidden="true" />}
              Dados escolares
            </span>
          </TabsTrigger>
          <TabsTrigger value="condicao" disabled={!condicaoLiberada}>
            <span className="inline-flex items-center gap-1">
              {!condicaoLiberada && <Lock size={12} strokeWidth={2} aria-hidden="true" />}
              Condição do estudante
            </span>
          </TabsTrigger>
        </TabsList>
      </Card>

      <TabsContent value="dados-pessoais">
        <Form {...form}>
          <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit, onInvalid)} noValidate>
            <div className="grid items-start gap-[24px] xl:grid-cols-[1fr_var(--panel-w)]">
              <fieldset disabled={!props.canEdit} className="contents">
                <div className="flex min-w-0 flex-col gap-[24px]">
                  <IdentificacaoCard form={form} />
                  <EnderecoCard control={form.control} />
                  <ResponsaveisCard control={form.control} />
                  {props.mode === "create" ? (
                    <FotoCard mode="create" canEdit={props.canEdit} />
                  ) : (
                    <FotoCard
                      mode="edit"
                      estudanteId={props.estudanteId}
                      escolaId={props.escolaId}
                      nomeCompleto={props.defaultValues.nomeCompleto}
                      fotoUrlInicial={props.fotoUrlInicial}
                      canEdit={props.canEdit}
                    />
                  )}
                </div>
              </fieldset>

              <HistoricoCard
                auditoria={props.mode === "edit" ? props.auditoria : undefined}
                referencia={
                  props.mode === "edit"
                    ? {
                        ofertas: props.referenciaOfertas.ofertas,
                        organizacoes: props.referenciaOfertas.organizacoes,
                        turmas: props.turmasReferencia,
                        turnos: props.turnos,
                      }
                    : { ofertas: [], organizacoes: [], turmas: [], turnos: [] }
                }
              />
            </div>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="avaliacao">
        {props.mode === "edit" ? (
          <AvaliacaoTab
            estudanteId={props.estudanteId}
            avaliacao={props.avaliacao}
            equipeElegivel={props.equipeElegivel}
            referenciaOfertas={props.referenciaOfertas}
            contribuicoes={props.contribuicoes}
            relatorios={props.relatorios}
            viewerId={props.viewerId}
            viewerCanEditQualquerContribuicao={props.viewerCanEditQualquerContribuicao}
            viewerCanEditContribuicaoPropria={props.viewerCanEditContribuicaoPropria}
            canGerarRelatorio={props.canGerarRelatorio}
            canEdit={props.canEdit}
            onPendingChange={setAvaliacaoPending}
          />
        ) : (
          <AbaPlaceholder titulo="Avaliação de Ingresso" />
        )}
      </TabsContent>
      <TabsContent value="documentos">
        {props.mode === "edit" ? (
          <DocumentosTab
            estudanteId={props.estudanteId}
            escolaId={props.escolaId}
            documentos={props.documentos}
            canEdit={props.canEdit}
          />
        ) : (
          <AbaPlaceholder titulo="Documentos" />
        )}
      </TabsContent>
      <TabsContent value="dados-escolares">
        {props.mode === "edit" ? (
          <DadosEscolaresTab
            estudanteId={props.estudanteId}
            situacaoAtual={props.defaultValues.situacao}
            dadosEscolares={props.dadosEscolares}
            avaliacao={props.avaliacao}
            referenciaOfertas={props.referenciaOfertas}
            turnos={props.turnos}
            turmasReferencia={props.turmasReferencia}
            anosLetivos={props.anosLetivos}
            vinculosEscolaresAnuais={props.vinculosEscolaresAnuais}
            canEdit={props.canEdit}
            onPendingChange={setDadosEscolaresPending}
          />
        ) : (
          <AbaPlaceholder titulo="Dados escolares" />
        )}
      </TabsContent>
      <TabsContent value="condicao">
        {props.mode === "edit" ? (
          <CondicaoTab
            estudanteId={props.estudanteId}
            condicoes={props.condicoes}
            perfilFuncional={props.perfilFuncional}
            documentosDisponiveis={props.documentos.filter((doc) => doc.arquivoPath)}
            canEdit={props.canEditCondicao}
            onPendingChange={setCondicaoPending}
          />
        ) : (
          <AbaPlaceholder titulo="Condição do estudante" />
        )}
      </TabsContent>
    </Tabs>
  );
}
