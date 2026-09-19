import { createClient } from "@/lib/supabase/server";

import { DOCUMENTO_TIPOS_FIXOS } from "./documentos-schema";

export type AuditoriaOrigem =
  | "estudante"
  | "avaliacao"
  | "vinculo"
  | "documento"
  | "contribuicao"
  | "condicao"
  | "perfil";

export type AuditoriaEstudanteRow = {
  id: string;
  origem: AuditoriaOrigem;
  campoAlterado: string;
  valorAnterior: string | null;
  valorNovo: string | null;
  alteradoEm: string;
  alteradoPorNome: string | null;
};

type AuditoriaRowBruta = {
  id: unknown;
  campo_alterado: unknown;
  valor_anterior: unknown;
  valor_novo: unknown;
  alterado_em: unknown;
  usuarios: unknown;
};

function mapAuditoriaRow(row: AuditoriaRowBruta, origem: AuditoriaOrigem): AuditoriaEstudanteRow {
  return {
    id: row.id as string,
    origem,
    campoAlterado: row.campo_alterado as string,
    valorAnterior: row.valor_anterior as string | null,
    valorNovo: row.valor_novo as string | null,
    alteradoEm: row.alterado_em as string,
    alteradoPorNome:
      (row.usuarios as unknown as { nome_completo: string } | null)?.nome_completo ?? null,
  };
}

/**
 * Histórico de alterações de um estudante — junta as 7 tabelas de auditoria
 * do módulo (todas populadas automaticamente por trigger do banco, nada
 * escrito pela aplicação) num único array ordenado por data. As duas fontes
 * sem `estudante_id` próprio (avaliacao/contribuição, que só têm
 * `avaliacao_id`) filtram via embed do PostgREST em vez de denormalizar.
 */
export async function getAuditoriaEstudante(estudanteId: string): Promise<AuditoriaEstudanteRow[]> {
  const supabase = await createClient();

  const [estudante, avaliacao, vinculo, documento, contribuicao, condicao, perfil] = await Promise.all([
    supabase
      .from("estudantes_auditoria")
      .select(
        "id, campo_alterado, valor_anterior, valor_novo, alterado_em, usuarios!estudantes_auditoria_alterado_por_fkey(nome_completo)",
      )
      .eq("estudante_id", estudanteId),
    supabase
      .from("avaliacoes_ingresso_auditoria")
      .select(
        "id, campo_alterado, valor_anterior, valor_novo, alterado_em, usuarios!avaliacoes_ingresso_auditoria_alterado_por_fkey(nome_completo), avaliacoes_ingresso!inner(estudante_id)",
      )
      .eq("avaliacoes_ingresso.estudante_id", estudanteId),
    supabase
      .from("vinculos_escolares_anuais_auditoria")
      .select(
        "id, campo_alterado, valor_anterior, valor_novo, alterado_em, usuarios!vinculos_escolares_anuais_auditoria_alterado_por_fkey(nome_completo), vinculos_escolares_anuais!inner(estudante_id)",
      )
      .eq("vinculos_escolares_anuais.estudante_id", estudanteId),
    supabase
      .from("documentos_estudante_auditoria")
      .select(
        "id, campo_alterado, valor_anterior, valor_novo, alterado_em, usuarios!documentos_estudante_auditoria_alterado_por_fkey(nome_completo)",
      )
      .eq("estudante_id", estudanteId),
    supabase
      .from("avaliacao_contribuicoes_auditoria")
      .select(
        "id, campo_alterado, valor_anterior, valor_novo, alterado_em, usuarios!avaliacao_contribuicoes_auditoria_alterado_por_fkey(nome_completo), avaliacoes_ingresso!inner(estudante_id)",
      )
      .eq("avaliacoes_ingresso.estudante_id", estudanteId),
    supabase
      .from("condicoes_estudante_auditoria")
      .select(
        "id, campo_alterado, valor_anterior, valor_novo, alterado_em, usuarios!condicoes_estudante_auditoria_alterado_por_fkey(nome_completo)",
      )
      .eq("estudante_id", estudanteId),
    supabase
      .from("perfil_funcional_estudante_auditoria")
      .select(
        "id, campo_alterado, valor_anterior, valor_novo, alterado_em, usuarios!perfil_funcional_estudante_auditoria_alterado_por_fkey(nome_completo)",
      )
      .eq("estudante_id", estudanteId),
  ]);

  const linhas: AuditoriaEstudanteRow[] = [
    ...(estudante.data ?? []).map((row) => mapAuditoriaRow(row, "estudante")),
    ...(avaliacao.data ?? []).map((row) => mapAuditoriaRow(row, "avaliacao")),
    ...(vinculo.data ?? []).map((row) => mapAuditoriaRow(row, "vinculo")),
    ...(documento.data ?? []).map((row) => mapAuditoriaRow(row, "documento")),
    ...(contribuicao.data ?? []).map((row) => mapAuditoriaRow(row, "contribuicao")),
    ...(condicao.data ?? []).map((row) => mapAuditoriaRow(row, "condicao")),
    ...(perfil.data ?? []).map((row) => mapAuditoriaRow(row, "perfil")),
  ];

  return linhas.sort((a, b) => (a.alteradoEm < b.alteradoEm ? 1 : -1));
}

export type UsuarioElegivel = { id: string; nome: string };

/** Usuários ativos da escola — pool da "Equipe responsável" da Avaliação de Ingresso. */
export async function getEquipeElegivel(): Promise<UsuarioElegivel[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("usuarios")
    .select("id, nome_completo")
    .eq("status", "ativo")
    .order("nome_completo");

  return (data ?? []).map((usuario) => ({ id: usuario.id, nome: usuario.nome_completo }));
}

export type ReferenciaOfertas = {
  ofertas: { id: string; slug: string; nome: string }[];
  organizacoes: { id: string; ofertaId: string; nome: string }[];
};

/**
 * Catálogo de Ofertas/Organização já criado pro Cadastro de Turma
 * (public.ofertas, public.etapas_ciclos) — reaproveitado aqui pra "Oferta
 * pretendida"/"Organização pretendida" da Avaliação de Ingresso.
 */
export async function getReferenciaOfertas(): Promise<ReferenciaOfertas> {
  const supabase = await createClient();

  const [ofertasResult, organizacoesResult] = await Promise.all([
    supabase.from("ofertas").select("id, slug, nome").order("nome"),
    supabase.from("etapas_ciclos").select("id, oferta_id, nome").order("ordem"),
  ]);

  return {
    ofertas: ofertasResult.data ?? [],
    organizacoes: (organizacoesResult.data ?? []).map((organizacao) => ({
      id: organizacao.id as string,
      ofertaId: organizacao.oferta_id as string,
      nome: organizacao.nome as string,
    })),
  };
}

export type AvaliacaoIngresso = {
  id: string;
  updatedAt: string;
  equipeResponsavelIds: string[];
  ofertaPretendidaId: string;
  organizacaoPretendidaId: string;
  dataInicio: string;
  dataTermino: string;
  statusAvaliacao: string;
  historicoEscolar: string;
  informacoesFamilia: string;
  contextoSociocultural: string;
  habilidadesConceituais: string;
  habilidadesSociais: string;
  habilidadesPraticas: string;
  dimensaoParticipacao: string;
  contextoEscolar: string;
  contextoFamiliar: string;
  contextoComunitario: string;
  fatoresFacilitadores: string;
  barreirasIdentificadas: string;
  necessidadesEspecificas: string;
  nivelApoio: string;
  areasApoio: string[];
  parecerEquipe: string;
  recomendacaoElegibilidade: string;
  justificativaElegibilidade: string;
  encaminhamentoRecomendado: string;
  orientacoesPai: string;
  assinaturas: string;
};

/** Avaliação de Ingresso de um estudante — no máximo uma (relação 1:1). */
export async function getAvaliacaoIngresso(estudanteId: string): Promise<AvaliacaoIngresso | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("avaliacoes_ingresso")
    .select(
      `id, updated_at, equipe_responsavel_ids, oferta_pretendida_id, organizacao_pretendida_id,
       data_inicio, data_termino, status_avaliacao, historico_escolar, informacoes_familia,
       contexto_sociocultural, habilidades_conceituais, habilidades_sociais,
       habilidades_praticas, dimensao_participacao, contexto_escolar, contexto_familiar,
       contexto_comunitario, fatores_facilitadores, barreiras_identificadas,
       necessidades_especificas, nivel_apoio, areas_apoio, parecer_equipe,
       recomendacao_elegibilidade, justificativa_elegibilidade, encaminhamento_recomendado,
       orientacoes_pai, assinaturas`,
    )
    .eq("estudante_id", estudanteId)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    updatedAt: data.updated_at,
    equipeResponsavelIds: data.equipe_responsavel_ids ?? [],
    ofertaPretendidaId: data.oferta_pretendida_id ?? "",
    organizacaoPretendidaId: data.organizacao_pretendida_id ?? "",
    dataInicio: data.data_inicio ?? "",
    dataTermino: data.data_termino ?? "",
    statusAvaliacao: data.status_avaliacao,
    historicoEscolar: data.historico_escolar ?? "",
    informacoesFamilia: data.informacoes_familia ?? "",
    contextoSociocultural: data.contexto_sociocultural ?? "",
    habilidadesConceituais: data.habilidades_conceituais ?? "",
    habilidadesSociais: data.habilidades_sociais ?? "",
    habilidadesPraticas: data.habilidades_praticas ?? "",
    dimensaoParticipacao: data.dimensao_participacao ?? "",
    contextoEscolar: data.contexto_escolar ?? "",
    contextoFamiliar: data.contexto_familiar ?? "",
    contextoComunitario: data.contexto_comunitario ?? "",
    fatoresFacilitadores: data.fatores_facilitadores ?? "",
    barreirasIdentificadas: data.barreiras_identificadas ?? "",
    necessidadesEspecificas: data.necessidades_especificas ?? "",
    nivelApoio: data.nivel_apoio ?? "",
    areasApoio: data.areas_apoio ?? [],
    parecerEquipe: data.parecer_equipe ?? "",
    recomendacaoElegibilidade: data.recomendacao_elegibilidade ?? "",
    justificativaElegibilidade: data.justificativa_elegibilidade ?? "",
    encaminhamentoRecomendado: data.encaminhamento_recomendado ?? "",
    orientacoesPai: data.orientacoes_pai ?? "",
    assinaturas: data.assinaturas ?? "",
  };
}

export type DocumentoVersaoEstudante = {
  id: string;
  versao: number;
  arquivoPath: string;
  arquivoNome: string;
  enviadoEm: string;
  enviadoPorNome: string | null;
};

export type DocumentoEstudante = {
  id: string;
  tipo: string;
  nomeDocumento: string | null;
  status: string;
  arquivoPath: string | null;
  arquivoNome: string | null;
  dataEnvio: string | null;
  conferidoPorNome: string | null;
  versoesAnteriores: DocumentoVersaoEstudante[];
};

/** Checklist de documentos de um estudante (Aba 3) — fixos + "outros". */
export async function getDocumentosEstudante(estudanteId: string): Promise<DocumentoEstudante[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("documentos_estudante")
    .select(
      "id, tipo, nome_documento, status, arquivo_path, arquivo_nome, data_envio, usuarios!documentos_estudante_conferido_por_fkey(nome_completo)",
    )
    .eq("estudante_id", estudanteId)
    .order("created_at");

  const documentos = data ?? [];
  const documentoIds = documentos.map((row) => row.id as string);

  const { data: versoesData } = documentoIds.length
    ? await supabase
        .from("documentos_estudante_versoes")
        .select(
          "id, documento_id, versao, arquivo_path, arquivo_nome, enviado_em, usuarios!documentos_estudante_versoes_enviado_por_fkey(nome_completo)",
        )
        .in("documento_id", documentoIds)
        .order("versao", { ascending: false })
    : { data: [] };

  const versoesPorDocumento = new Map<string, DocumentoVersaoEstudante[]>();
  for (const row of versoesData ?? []) {
    const documentoId = row.documento_id as string;
    const lista = versoesPorDocumento.get(documentoId) ?? [];
    lista.push({
      id: row.id as string,
      versao: row.versao as number,
      arquivoPath: row.arquivo_path as string,
      arquivoNome: row.arquivo_nome as string,
      enviadoEm: row.enviado_em as string,
      enviadoPorNome: (row.usuarios as unknown as { nome_completo: string } | null)?.nome_completo ?? null,
    });
    versoesPorDocumento.set(documentoId, lista);
  }

  return documentos.map((row) => {
    const arquivoPath = row.arquivo_path as string | null;
    // Filtra por caminho (não por posição): se o ponteiro em
    // documentos_estudante ficou desatualizado por causa de uma falha
    // parcial em salvarArquivoDocumento, o upload mais recente ainda
    // aparece aqui, só não é rotulado como "atual" — nunca some.
    const versoesAnteriores = (versoesPorDocumento.get(row.id as string) ?? []).filter(
      (versao) => versao.arquivoPath !== arquivoPath,
    );

    return {
      id: row.id as string,
      tipo: row.tipo as string,
      nomeDocumento: row.nome_documento as string | null,
      status: row.status as string,
      arquivoPath,
      arquivoNome: row.arquivo_nome as string | null,
      dataEnvio: row.data_envio as string | null,
      conferidoPorNome:
        (row.usuarios as unknown as { nome_completo: string } | null)?.nome_completo ?? null,
      versoesAnteriores,
    };
  });
}

export type DadosEscolares = {
  dataIngresso: string;
  formaIngresso: string;
  redeOrigem: string;
  escolaOrigem: string;
  historicoTransferencia: string;
  dataEncerramento: string;
  motivoEncerramento: string;
  observacoes: string;
};

/**
 * Dados escolares "de trajetória" de um estudante (Aba 4) — fatos que não
 * repetem por ano letivo (ingresso, origem, encerramento). O vínculo
 * propriamente dito (oferta/turma/matrícula do ano) vive em
 * `getVinculosEscolaresAnuais`, 1:N.
 */
export async function getDadosEscolares(estudanteId: string): Promise<DadosEscolares | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("dados_escolares")
    .select(
      `data_ingresso, forma_ingresso, rede_origem, escola_origem, historico_transferencia,
       data_encerramento, motivo_encerramento, observacoes`,
    )
    .eq("estudante_id", estudanteId)
    .maybeSingle();

  if (!data) return null;

  return {
    dataIngresso: data.data_ingresso ?? "",
    formaIngresso: data.forma_ingresso ?? "",
    redeOrigem: data.rede_origem ?? "",
    escolaOrigem: data.escola_origem ?? "",
    historicoTransferencia: data.historico_transferencia ?? "",
    dataEncerramento: data.data_encerramento ?? "",
    motivoEncerramento: data.motivo_encerramento ?? "",
    observacoes: data.observacoes ?? "",
  };
}

/** Turnos ativos da escola — mesmo catálogo usado pelo Cadastro de Turma. */
export async function getTurnosAtivos(): Promise<{ id: string; nome: string }[]> {
  const supabase = await createClient();

  const { data } = await supabase.from("turnos").select("id, nome").eq("ativo", true).order("nome");

  return data ?? [];
}

export type AnoLetivoOption = { id: string; ano: number; status: string };

/**
 * Todos os anos letivos da escola (inclusive encerrados) — diferente de
 * `getReferenciaTurmaForm`, que só traz ativo/planejado: aqui também
 * precisamos exibir o histórico de vínculos de anos já encerrados.
 */
export async function getAnosLetivosReferencia(): Promise<AnoLetivoOption[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("anos_letivos")
    .select("id, ano, status")
    .order("ano", { ascending: false });

  return data ?? [];
}

export type TurmaOption = { id: string; nome: string; ofertaId: string; anoLetivoId: string };

/**
 * Turmas ativas da escola — trazidas todas de uma vez (mesmo padrão de
 * `organizacoes`/`matrizes` em getReferenciaTurmaForm) e filtradas no client
 * por oferta atual + ano letivo do vínculo sendo editado (CA22/CA23 da
 * HU-EST-001 v2.0: turma compatível com oferta, organização, turno **e ano
 * letivo**).
 */
export async function getTurmasReferencia(): Promise<TurmaOption[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("turmas")
    .select("id, nome, oferta_id, ano_letivo_id")
    .eq("status", "ativa")
    .order("nome");

  return (data ?? []).map((turma) => ({
    id: turma.id as string,
    nome: turma.nome as string,
    ofertaId: turma.oferta_id as string,
    anoLetivoId: turma.ano_letivo_id as string,
  }));
}

export type VinculoEscolarAnual = {
  id: string;
  anoLetivoId: string;
  ano: number;
  ofertaAtualId: string;
  ofertaAtualSlug: string;
  organizacaoAtualId: string;
  etapaDoCiclo: string;
  turnoId: string;
  turmaId: string;
  turmaNome: string | null;
  turnoNome: string | null;
  matriculaInterna: string;
  utilizaTransporte: boolean;
  dataMatriculaEfetiva: string;
};

/**
 * Todos os vínculos escolares anuais de um estudante, um por ano letivo —
 * histórico completo (regra 18.1: trocar de ano não sobrescreve o anterior).
 */
export async function getVinculosEscolaresAnuais(estudanteId: string): Promise<VinculoEscolarAnual[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("vinculos_escolares_anuais")
    .select(
      `id, oferta_atual_id, organizacao_atual_id, etapa_do_ciclo, turno_id, matricula_interna,
       utiliza_transporte, data_matricula_efetiva,
       anos_letivos!inner(id, ano),
       ofertas(slug),
       turmas(id, nome),
       turnos(nome)`,
    )
    .eq("estudante_id", estudanteId)
    .order("ano", { referencedTable: "anos_letivos", ascending: false });

  return (data ?? []).map((row) => {
    const anoLetivo = row.anos_letivos as unknown as { id: string; ano: number };
    const turma = row.turmas as unknown as { id: string; nome: string } | null;
    return {
      id: row.id as string,
      anoLetivoId: anoLetivo.id,
      ano: anoLetivo.ano,
      ofertaAtualId: row.oferta_atual_id ?? "",
      ofertaAtualSlug: (row.ofertas as unknown as { slug: string } | null)?.slug ?? "",
      organizacaoAtualId: row.organizacao_atual_id ?? "",
      etapaDoCiclo: row.etapa_do_ciclo ?? "",
      turnoId: row.turno_id ?? "",
      turmaId: turma?.id ?? "",
      turmaNome: turma?.nome ?? null,
      turnoNome: (row.turnos as unknown as { nome: string } | null)?.nome ?? null,
      matriculaInterna: row.matricula_interna ?? "",
      utilizaTransporte: row.utiliza_transporte ?? false,
      dataMatriculaEfetiva: row.data_matricula_efetiva ?? "",
    };
  });
}

export type ContribuicaoAvaliacao = {
  id: string;
  profissionalId: string;
  profissionalNome: string;
  areaContribuicao: string;
  observacoes: string;
  implicacoesParticipacao: string;
  recomendacoesEscolares: string;
  criadoPor: string | null;
  criadoEm: string;
};

/** Contribuições complementares de uma Avaliação de Ingresso (Aba 2, seção 11.3). */
export async function getContribuicoesAvaliacao(avaliacaoId: string): Promise<ContribuicaoAvaliacao[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("avaliacao_contribuicoes")
    .select(
      `id, profissional_id, area_contribuicao, observacoes, implicacoes_participacao,
       recomendacoes_escolares, created_by, created_at,
       usuarios!avaliacao_contribuicoes_profissional_id_fkey(nome_completo)`,
    )
    .eq("avaliacao_id", avaliacaoId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id as string,
    profissionalId: row.profissional_id as string,
    profissionalNome:
      (row.usuarios as unknown as { nome_completo: string } | null)?.nome_completo ?? "—",
    areaContribuicao: row.area_contribuicao as string,
    observacoes: row.observacoes as string,
    implicacoesParticipacao: (row.implicacoes_participacao as string | null) ?? "",
    recomendacoesEscolares: (row.recomendacoes_escolares as string | null) ?? "",
    criadoPor: row.created_by as string | null,
    criadoEm: row.created_at as string,
  }));
}

export type RelatorioAvaliacao = {
  id: string;
  tipo: "padrao" | "completo";
  versao: number;
  arquivoPath: string;
  avaliacaoAtualizadaEm: string;
  geradoPorNome: string | null;
  geradoEm: string;
};

/** Versões de PDF já geradas de uma Avaliação de Ingresso, mais recentes primeiro. */
export async function getRelatoriosAvaliacao(avaliacaoId: string): Promise<RelatorioAvaliacao[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("avaliacao_relatorios")
    .select(
      `id, tipo, versao, arquivo_path, avaliacao_atualizada_em, gerado_em,
       usuarios!avaliacao_relatorios_gerado_por_fkey(nome_completo)`,
    )
    .eq("avaliacao_id", avaliacaoId)
    .order("gerado_em", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id as string,
    tipo: row.tipo as "padrao" | "completo",
    versao: row.versao as number,
    arquivoPath: row.arquivo_path as string,
    avaliacaoAtualizadaEm: row.avaliacao_atualizada_em as string,
    geradoPorNome: (row.usuarios as unknown as { nome_completo: string } | null)?.nome_completo ?? null,
    geradoEm: row.gerado_em as string,
  }));
}

export type CondicaoEstudante = {
  id: string;
  tipoCondicao: string;
  documentoId: string;
  documentoLabel: string | null;
  observacoes: string;
  cid: string;
  criadoEm: string;
};

/** Condições registradas de um estudante (Aba 5, Bloco 1) — pode ter mais de uma. */
export async function getCondicoesEstudante(estudanteId: string): Promise<CondicaoEstudante[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("condicoes_estudante")
    .select(
      `id, tipo_condicao, documento_id, observacoes, cid, created_at,
       documentos_estudante(nome_documento, tipo)`,
    )
    .eq("estudante_id", estudanteId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const documento = row.documentos_estudante as unknown as {
      nome_documento: string | null;
      tipo: string;
    } | null;
    return {
      id: row.id as string,
      tipoCondicao: row.tipo_condicao as string,
      documentoId: (row.documento_id as string | null) ?? "",
      documentoLabel: documento ? labelDoDocumentoVinculado(documento) : null,
      observacoes: (row.observacoes as string | null) ?? "",
      cid: (row.cid as string | null) ?? "",
      criadoEm: row.created_at as string,
    };
  });
}

// Mesma resolução de nome usada em condicao-drawer.tsx ao popular o select
// de "Documento vinculado" — mantém o rótulo consistente entre adicionar e
// visualizar.
function labelDoDocumentoVinculado(documento: { nome_documento: string | null; tipo: string }) {
  if (documento.tipo === "outro") return documento.nome_documento ?? "Documento";
  if (documento.tipo === "avaliacao_ingresso") return "Avaliação de Ingresso";
  return DOCUMENTO_TIPOS_FIXOS.find((item) => item.tipo === documento.tipo)?.label ?? documento.tipo;
}

export type PerfilFuncionalEstudante = {
  meioComunicacao: string;
  recursosCaa: string[];
  apoioAlimentacao: boolean;
  apoioHigiene: boolean;
  apoioLocomocao: boolean;
  apoioAvd: boolean;
  apoioAvdChecklist: string[];
  alergiasRestricoes: string;
  necessitaMedicacao: boolean;
  medicacaoDetalhes: string;
  recursosAcessibilidade: string[];
  outrasInformacoes: string;
  situacoesAtencao: string;
  oQueAjuda: string;
  segurancaCuidados: string;
};

/** Perfil funcional de um estudante (Aba 5, Blocos 2/3) — no máximo um (relação 1:1). */
export async function getPerfilFuncionalEstudante(
  estudanteId: string,
): Promise<PerfilFuncionalEstudante | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("perfil_funcional_estudante")
    .select(
      `meio_comunicacao, recursos_caa, apoio_alimentacao, apoio_higiene, apoio_locomocao,
       apoio_avd, apoio_avd_checklist, alergias_restricoes, necessita_medicacao,
       medicacao_detalhes, recursos_acessibilidade, outras_informacoes, situacoes_atencao,
       o_que_ajuda, seguranca_cuidados`,
    )
    .eq("estudante_id", estudanteId)
    .maybeSingle();

  if (!data) return null;

  return {
    meioComunicacao: data.meio_comunicacao ?? "",
    recursosCaa: data.recursos_caa ?? [],
    apoioAlimentacao: data.apoio_alimentacao ?? false,
    apoioHigiene: data.apoio_higiene ?? false,
    apoioLocomocao: data.apoio_locomocao ?? false,
    apoioAvd: data.apoio_avd ?? false,
    apoioAvdChecklist: data.apoio_avd_checklist ?? [],
    alergiasRestricoes: data.alergias_restricoes ?? "",
    necessitaMedicacao: data.necessita_medicacao ?? false,
    medicacaoDetalhes: data.medicacao_detalhes ?? "",
    recursosAcessibilidade: data.recursos_acessibilidade ?? [],
    outrasInformacoes: data.outras_informacoes ?? "",
    situacoesAtencao: data.situacoes_atencao ?? "",
    oQueAjuda: data.o_que_ajuda ?? "",
    segurancaCuidados: data.seguranca_cuidados ?? "",
  };
}

export type PerfilEstudanteResumo = {
  id: string;
  nomeCompleto: string;
  fotoUrl: string | null;
  situacao: string;
  dataNascimento: string;
  responsavelPrincipalNome: string;
  responsavelPrincipalParentesco: string;
  responsavelPrincipalTelefone: string;
  contatoEmergenciaNome: string;
  contatoEmergenciaTelefone: string;
  enderecoMunicipio: string;
  enderecoUf: string;
};

/** Campos essenciais pro header + card "Dados e contato" do Perfil do Estudante (read-only). */
export async function getPerfilEstudante(estudanteId: string): Promise<PerfilEstudanteResumo | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("estudantes")
    .select(
      `id, nome_completo, foto_url, situacao, data_nascimento,
       responsavel_principal_nome, responsavel_principal_parentesco, responsavel_principal_telefone,
       contato_emergencia_nome, contato_emergencia_telefone, endereco_municipio, endereco_uf`,
    )
    .eq("id", estudanteId)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    nomeCompleto: data.nome_completo,
    fotoUrl: data.foto_url,
    situacao: data.situacao,
    dataNascimento: data.data_nascimento,
    responsavelPrincipalNome: data.responsavel_principal_nome ?? "",
    responsavelPrincipalParentesco: data.responsavel_principal_parentesco ?? "",
    responsavelPrincipalTelefone: data.responsavel_principal_telefone ?? "",
    contatoEmergenciaNome: data.contato_emergencia_nome ?? "",
    contatoEmergenciaTelefone: data.contato_emergencia_telefone ?? "",
    enderecoMunicipio: data.endereco_municipio ?? "",
    enderecoUf: data.endereco_uf ?? "",
  };
}
