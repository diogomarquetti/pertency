"use server";

import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";

import { requireRelatorioGeracaoProfile } from "@/lib/supabase/require-admin-profile";
import { AvaliacaoRelatorioPdf, type AvaliacaoRelatorioData } from "@/lib/pdf/avaliacao-relatorio";

import { funcaoExibicao } from "../usuarios/schema";
import { calcularIdade } from "./schema";

/**
 * Gera um PDF (Padrão ou Completo) da Avaliação de Ingresso — HU-EST-001
 * v2.0, seção 11.4. Cada geração cria uma nova versão (nunca sobrescreve a
 * anterior, CA16) e atualiza a linha "Avaliação de Ingresso" do checklist da
 * Aba 3 pra apontar pro PDF mais recente.
 */
export async function gerarRelatorioAvaliacao(
  estudanteId: string,
  avaliacaoId: string,
  tipo: "padrao" | "completo",
) {
  const context = await requireRelatorioGeracaoProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, userId, escolaId } = context;

  const { data: avaliacao } = await supabase
    .from("avaliacoes_ingresso")
    .select(
      `updated_at, equipe_responsavel_ids, data_inicio, data_termino,
       historico_escolar, informacoes_familia, contexto_sociocultural, habilidades_conceituais,
       habilidades_sociais, habilidades_praticas, dimensao_participacao,
       contexto_escolar, contexto_familiar, contexto_comunitario, fatores_facilitadores,
       barreiras_identificadas,
       necessidades_especificas, nivel_apoio, areas_apoio, parecer_equipe,
       recomendacao_elegibilidade, justificativa_elegibilidade, encaminhamento_recomendado,
       orientacoes_pai,
       ofertas:oferta_pretendida_id(nome),
       etapas_ciclos:organizacao_pretendida_id(nome)`,
    )
    .eq("id", avaliacaoId)
    .single();

  if (!avaliacao) {
    return { error: "Avaliação não encontrada." };
  }

  const { data: estudante } = await supabase
    .from("estudantes")
    .select("nome_completo, data_nascimento")
    .eq("id", estudanteId)
    .single();

  if (!estudante) {
    return { error: "Estudante não encontrado." };
  }

  const { data: escola } = await supabase
    .from("escolas")
    .select("nome_usual, nome_oficial, municipio")
    .eq("id", escolaId)
    .single();

  const equipeIds = (avaliacao.equipe_responsavel_ids as string[] | null) ?? [];
  const { data: equipe } = equipeIds.length
    ? await supabase
        .from("usuarios")
        .select("id, nome_completo, funcao, area_atuacao, area_atuacao_outro")
        .in("id", equipeIds)
        .order("nome_completo")
    : { data: [] };
  const equipeComFuncao = (equipe ?? []).map((usuario) => ({
    nome: usuario.nome_completo,
    funcao: funcaoExibicao(usuario),
  }));

  let contribuicoes: AvaliacaoRelatorioData["contribuicoes"] = [];
  if (tipo === "completo") {
    const { data: contribuicoesData } = await supabase
      .from("avaliacao_contribuicoes")
      .select(
        `area_contribuicao, observacoes, implicacoes_participacao, recomendacoes_escolares,
         created_at, usuarios!avaliacao_contribuicoes_profissional_id_fkey(nome_completo)`,
      )
      .eq("avaliacao_id", avaliacaoId)
      .order("created_at", { ascending: true });

    contribuicoes = (contribuicoesData ?? []).map((row) => ({
      profissionalNome:
        (row.usuarios as unknown as { nome_completo: string } | null)?.nome_completo ?? "—",
      areaContribuicao: row.area_contribuicao as string,
      observacoes: row.observacoes as string,
      implicacoesParticipacao: (row.implicacoes_participacao as string | null) ?? "",
      recomendacoesEscolares: (row.recomendacoes_escolares as string | null) ?? "",
      criadoEm: row.created_at as string,
    }));
  }

  const relatorioData: AvaliacaoRelatorioData = {
    escolaNome: escola?.nome_usual ?? escola?.nome_oficial ?? "—",
    escolaNomeOficial: escola?.nome_oficial ?? "escola",
    escolaMunicipio: escola?.municipio ?? "—",
    estudanteNome: estudante.nome_completo,
    dataNascimento: estudante.data_nascimento,
    idade: calcularIdade(estudante.data_nascimento),
    ofertaPretendidaNome: (avaliacao.ofertas as unknown as { nome: string } | null)?.nome ?? "—",
    organizacaoPretendidaNome:
      (avaliacao.etapas_ciclos as unknown as { nome: string } | null)?.nome ?? "—",
    dataInicio: avaliacao.data_inicio ?? "",
    dataTermino: avaliacao.data_termino ?? "",
    historicoEscolar: avaliacao.historico_escolar ?? "",
    informacoesFamilia: avaliacao.informacoes_familia ?? "",
    contextoSociocultural: avaliacao.contexto_sociocultural ?? "",
    habilidadesConceituais: avaliacao.habilidades_conceituais ?? "",
    habilidadesSociais: avaliacao.habilidades_sociais ?? "",
    habilidadesPraticas: avaliacao.habilidades_praticas ?? "",
    dimensaoParticipacao: avaliacao.dimensao_participacao ?? "",
    contextoEscolar: avaliacao.contexto_escolar ?? "",
    contextoFamiliar: avaliacao.contexto_familiar ?? "",
    contextoComunitario: avaliacao.contexto_comunitario ?? "",
    fatoresFacilitadores: avaliacao.fatores_facilitadores ?? "",
    barreirasIdentificadas: avaliacao.barreiras_identificadas ?? "",
    necessidadesEspecificas: avaliacao.necessidades_especificas ?? "",
    nivelApoio: avaliacao.nivel_apoio ?? "",
    areasApoio: (avaliacao.areas_apoio as string[] | null) ?? [],
    parecerEquipe: avaliacao.parecer_equipe ?? "",
    recomendacaoElegibilidade: avaliacao.recomendacao_elegibilidade ?? "",
    justificativaElegibilidade: avaliacao.justificativa_elegibilidade ?? "",
    encaminhamentoRecomendado: avaliacao.encaminhamento_recomendado ?? "",
    orientacoesPai: avaliacao.orientacoes_pai ?? "",
    participantes: equipeComFuncao,
    dataConclusao: avaliacao.data_termino ?? new Date().toISOString(),
    contribuicoes,
  };

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderToBuffer(<AvaliacaoRelatorioPdf tipo={tipo} data={relatorioData} />);
  } catch {
    return { error: "Não foi possível gerar o PDF. Tente novamente." };
  }

  const { data: ultimaVersao } = await supabase
    .from("avaliacao_relatorios")
    .select("versao")
    .eq("avaliacao_id", avaliacaoId)
    .eq("tipo", tipo)
    .order("versao", { ascending: false })
    .limit(1)
    .maybeSingle();

  const versao = (ultimaVersao?.versao ?? 0) + 1;
  const arquivoPath = `${escolaId}/${estudanteId}/avaliacao-${tipo}-v${versao}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("estudantes-documentos")
    .upload(arquivoPath, pdfBuffer, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return { error: "Não foi possível salvar o PDF gerado." };
  }

  const { error: relatorioError } = await supabase.from("avaliacao_relatorios").insert({
    avaliacao_id: avaliacaoId,
    estudante_id: estudanteId,
    escola_id: escolaId,
    tipo,
    versao,
    arquivo_path: arquivoPath,
    avaliacao_atualizada_em: avaliacao.updated_at,
    gerado_por: userId,
  });

  if (relatorioError) {
    return { error: "PDF gerado, mas não foi possível registrar a versão." };
  }

  const { data: documentoExistente } = await supabase
    .from("documentos_estudante")
    .select("id")
    .eq("estudante_id", estudanteId)
    .eq("tipo", "avaliacao_ingresso")
    .maybeSingle();

  const documentoPatch = {
    status: "gerado_pelo_sistema",
    arquivo_path: arquivoPath,
    arquivo_nome: `Avaliação de Ingresso (${tipo === "completo" ? "completa" : "padrão"}) v${versao}.pdf`,
    data_envio: new Date().toISOString().slice(0, 10),
  };

  if (documentoExistente) {
    await supabase.from("documentos_estudante").update(documentoPatch).eq("id", documentoExistente.id);
  } else {
    await supabase.from("documentos_estudante").insert({
      estudante_id: estudanteId,
      escola_id: escolaId,
      tipo: "avaliacao_ingresso",
      created_by: userId,
      ...documentoPatch,
    });
  }

  revalidatePath(`/estudantes/${estudanteId}/editar`);
  return { success: true } as const;
}
