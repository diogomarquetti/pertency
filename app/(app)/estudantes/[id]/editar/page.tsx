import { notFound } from "next/navigation";

import { PageTitle } from "@/components/layout/page-title";
import { EstudanteForm } from "@/components/estudantes/estudante-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";
import {
  getViewerCanEditCondicao,
  getViewerCanEditContribuicaoPropria,
  getViewerCanEditEstudante,
  getViewerCanGerarRelatorio,
} from "@/lib/supabase/get-viewer-role";

import {
  getAnosLetivosReferencia,
  getAuditoriaEstudante,
  getAvaliacaoIngresso,
  getCondicoesEstudante,
  getContribuicoesAvaliacao,
  getDadosEscolares,
  getDocumentosEstudante,
  getEquipeElegivel,
  getPerfilFuncionalEstudante,
  getReferenciaOfertas,
  getRelatoriosAvaliacao,
  getTurmasReferencia,
  getTurnosAtivos,
  getVinculosEscolaresAnuais,
} from "../../queries";
import type { UpdateEstudanteValues } from "../../schema";

export default async function EditarEstudantePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: estudante } = await supabase
    .from("estudantes")
    .select(
      `escola_id, nome_completo, nome_social, situacao, data_nascimento, sexo, cor_raca,
       nacionalidade, naturalidade, cpf, tipo_documento_identificacao, numero_documento,
       orgao_emissor_uf, foto_url,
       endereco_logradouro, endereco_numero, endereco_complemento, endereco_bairro,
       endereco_cep, endereco_municipio, endereco_uf,
       responsavel_principal_nome, responsavel_principal_parentesco, responsavel_principal_telefone,
       segundo_responsavel_nome, segundo_responsavel_parentesco, segundo_responsavel_telefone,
       filiacao_mae, filiacao_pai, contato_emergencia_nome, contato_emergencia_telefone,
       responsavel_principal_pode_retirar, segundo_responsavel_pode_retirar,
       estudante_autorizados_retirada(id, nome, vinculo, telefone)`,
    )
    .eq("id", id)
    .order("created_at", { referencedTable: "estudante_autorizados_retirada" })
    .maybeSingle();

  if (!estudante) {
    notFound();
  }

  const [
    auditoria,
    avaliacao,
    equipeElegivel,
    referenciaOfertas,
    documentos,
    dadosEscolares,
    turnos,
    turmasReferencia,
    anosLetivos,
    vinculosEscolaresAnuais,
    condicoes,
    perfilFuncional,
    canEdit,
    canGerarRelatorio,
    viewerCanEditCondicaoRole,
    viewerCanEditContribuicaoPropria,
    viewer,
  ] = await Promise.all([
    getAuditoriaEstudante(id),
    getAvaliacaoIngresso(id),
    getEquipeElegivel(),
    getReferenciaOfertas(),
    getDocumentosEstudante(id),
    getDadosEscolares(id),
    getTurnosAtivos(),
    getTurmasReferencia(),
    getAnosLetivosReferencia(),
    getVinculosEscolaresAnuais(id),
    getCondicoesEstudante(id),
    getPerfilFuncionalEstudante(id),
    getViewerCanEditEstudante(),
    getViewerCanGerarRelatorio(),
    getViewerCanEditCondicao(),
    getViewerCanEditContribuicaoPropria(),
    getCurrentUser(),
  ]);

  const [contribuicoes, relatorios] = avaliacao
    ? await Promise.all([getContribuicoesAvaliacao(avaliacao.id), getRelatoriosAvaliacao(avaliacao.id)])
    : [[], []];

  const canEditCondicao = canEdit && viewerCanEditCondicaoRole;

  const defaultValues: UpdateEstudanteValues = {
    nomeCompleto: estudante.nome_completo,
    nomeSocial: estudante.nome_social ?? "",
    situacao: estudante.situacao as UpdateEstudanteValues["situacao"],
    dataNascimento: estudante.data_nascimento,
    sexo: estudante.sexo ?? "",
    corRaca: estudante.cor_raca ?? "",
    nacionalidade: estudante.nacionalidade ?? "",
    naturalidade: estudante.naturalidade ?? "",
    cpf: estudante.cpf ?? "",
    tipoDocumentoIdentificacao: estudante.tipo_documento_identificacao ?? "",
    numeroDocumento: estudante.numero_documento ?? "",
    orgaoEmissorUf: estudante.orgao_emissor_uf ?? "",
    enderecoLogradouro: estudante.endereco_logradouro ?? "",
    enderecoNumero: estudante.endereco_numero ?? "",
    enderecoComplemento: estudante.endereco_complemento ?? "",
    enderecoBairro: estudante.endereco_bairro ?? "",
    enderecoCep: estudante.endereco_cep ?? "",
    enderecoMunicipio: estudante.endereco_municipio ?? "",
    enderecoUf: estudante.endereco_uf ?? "",
    responsavelPrincipalNome: estudante.responsavel_principal_nome ?? "",
    responsavelPrincipalParentesco: estudante.responsavel_principal_parentesco ?? "",
    responsavelPrincipalTelefone: estudante.responsavel_principal_telefone ?? "",
    segundoResponsavelNome: estudante.segundo_responsavel_nome ?? "",
    segundoResponsavelParentesco: estudante.segundo_responsavel_parentesco ?? "",
    segundoResponsavelTelefone: estudante.segundo_responsavel_telefone ?? "",
    filiacaoMae: estudante.filiacao_mae ?? "",
    filiacaoPai: estudante.filiacao_pai ?? "",
    responsavelPrincipalPodeRetirar: estudante.responsavel_principal_pode_retirar,
    segundoResponsavelPodeRetirar: estudante.segundo_responsavel_pode_retirar,
    autorizadosRetirada: estudante.estudante_autorizados_retirada.map((autorizado) => ({
      registroId: autorizado.id,
      nome: autorizado.nome,
      vinculo: autorizado.vinculo,
      telefone: autorizado.telefone,
    })),
    contatoEmergenciaNome: estudante.contato_emergencia_nome ?? "",
    contatoEmergenciaTelefone: estudante.contato_emergencia_telefone ?? "",
  };

  return (
    <div>
      <PageTitle
        value={canEdit ? "Editar Estudante" : "Visualizar Estudante"}
        breadcrumb={[
          { label: "Estudantes", href: "/estudantes" },
          { label: canEdit ? "Editar estudante" : "Visualizar estudante" },
        ]}
      />
      <EstudanteForm
        mode="edit"
        estudanteId={id}
        escolaId={estudante.escola_id}
        defaultValues={defaultValues}
        fotoUrlInicial={estudante.foto_url}
        auditoria={auditoria}
        avaliacao={avaliacao}
        equipeElegivel={equipeElegivel}
        referenciaOfertas={referenciaOfertas}
        documentos={documentos}
        dadosEscolares={dadosEscolares}
        turnos={turnos}
        turmasReferencia={turmasReferencia}
        anosLetivos={anosLetivos}
        vinculosEscolaresAnuais={vinculosEscolaresAnuais}
        contribuicoes={contribuicoes}
        relatorios={relatorios}
        viewerId={viewer?.id ?? null}
        viewerCanEditQualquerContribuicao={canGerarRelatorio}
        viewerCanEditContribuicaoPropria={viewerCanEditContribuicaoPropria}
        canGerarRelatorio={canGerarRelatorio}
        condicoes={condicoes}
        perfilFuncional={perfilFuncional}
        canEditCondicao={canEditCondicao}
        canEdit={canEdit}
      />
    </div>
  );
}
