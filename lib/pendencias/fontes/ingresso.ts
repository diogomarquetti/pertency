import { cache } from "react";

import { funcaoExibicao } from "@/app/(app)/usuarios/schema";
import { createClient } from "@/lib/supabase/server";

/**
 * Fonte compartilhada do processo de ingresso: estudantes "Em análise de
 * ingresso" com a versão em edição e a vigente da Avaliação de Ingresso,
 * equipe e contribuições. Alimenta os tipos avaliacao_nao_iniciada,
 * avaliacao_parada, contribuicao_pendente, parecer_pendente e
 * matricula_pendente (e a Fila de ingresso), com duas consultas por
 * requisição no total.
 *
 * Retificação de estudante já Ativo fica de fora: não é ingresso.
 */

export type MembroEquipe = { id: string; nome: string; area: string };

export type AvaliacaoIngresso = {
  id: string;
  status: "rascunho" | "em_andamento" | "concluida";
  dataInicio: string | null;
  createdAt: string;
  concluidaEm: string | null;
  recomendacaoElegibilidade: string | null;
  parecerEquipe: string | null;
  /** Profissionais complementares da equipe — os únicos que registram contribuição (RLS). */
  complementares: MembroEquipe[];
  /** Entre os complementares, quem ainda não registrou contribuição. */
  semContribuicao: MembroEquipe[];
  ultimaContribuicaoEm: string | null;
};

export type EstudanteEmIngresso = {
  id: string;
  nome: string;
  createdAt: string;
  /** Versão em Rascunho ou Em andamento. */
  emEdicao: AvaliacaoIngresso | null;
  /** Versão Concluída (vigente). */
  vigente: AvaliacaoIngresso | null;
};

type AvaliacaoRow = {
  id: string;
  status_avaliacao: string;
  data_inicio: string | null;
  created_at: string;
  concluida_em: string | null;
  recomendacao_elegibilidade: string | null;
  parecer_equipe: string | null;
  equipe_responsavel_ids: string[] | null;
  avaliacao_contribuicoes: { profissional_id: string; created_at: string }[] | null;
};

export const getEstudantesEmIngresso = cache(async (): Promise<EstudanteEmIngresso[]> => {
  const supabase = await createClient();

  const [estudantesResult, usuariosResult] = await Promise.all([
    supabase
      .from("estudantes")
      .select(
        `id, nome_completo, created_at,
         avaliacoes_ingresso(id, status_avaliacao, data_inicio, created_at, concluida_em,
           recomendacao_elegibilidade, parecer_equipe, equipe_responsavel_ids,
           avaliacao_contribuicoes(profissional_id, created_at))`,
      )
      .eq("situacao", "em_analise_de_ingresso")
      .in("avaliacoes_ingresso.status_avaliacao", ["rascunho", "em_andamento", "concluida"]),
    supabase
      .from("usuarios")
      .select("id, nome_completo, funcao, area_atuacao, area_atuacao_outro")
      .eq("funcao", "profissional_complementar")
      .eq("status", "ativo"),
  ]);

  if (estudantesResult.error) throw estudantesResult.error;
  if (usuariosResult.error) throw usuariosResult.error;

  const complementares = new Map<string, MembroEquipe>(
    (usuariosResult.data ?? []).map((usuario) => [
      usuario.id as string,
      { id: usuario.id as string, nome: usuario.nome_completo as string, area: funcaoExibicao(usuario) },
    ]),
  );

  function montarAvaliacao(row: AvaliacaoRow): AvaliacaoIngresso {
    const contribuicoes = row.avaliacao_contribuicoes ?? [];
    const contribuiram = new Set(contribuicoes.map((c) => c.profissional_id));
    const membros = (row.equipe_responsavel_ids ?? [])
      .map((id) => complementares.get(id))
      .filter((membro): membro is MembroEquipe => !!membro);

    return {
      id: row.id,
      status: row.status_avaliacao as AvaliacaoIngresso["status"],
      dataInicio: row.data_inicio,
      createdAt: row.created_at,
      concluidaEm: row.concluida_em,
      recomendacaoElegibilidade: row.recomendacao_elegibilidade,
      parecerEquipe: row.parecer_equipe,
      complementares: membros,
      semContribuicao: membros.filter((membro) => !contribuiram.has(membro.id)),
      ultimaContribuicaoEm:
        contribuicoes.map((c) => c.created_at).sort().at(-1) ?? null,
    };
  }

  return (estudantesResult.data ?? []).map((estudante) => {
    const avaliacoes = ((estudante.avaliacoes_ingresso ?? []) as AvaliacaoRow[]).map(montarAvaliacao);
    return {
      id: estudante.id as string,
      nome: estudante.nome_completo as string,
      createdAt: estudante.created_at as string,
      emEdicao: avaliacoes.find((a) => a.status === "rascunho" || a.status === "em_andamento") ?? null,
      vigente: avaliacoes.find((a) => a.status === "concluida") ?? null,
    };
  });
});

/** "Fonoaudiologia (Beatriz Nunes)" / "Fonoaudiologia (Beatriz Nunes) e Psicologia (Ana Reis)". */
export function listarMembros(membros: MembroEquipe[]) {
  const nomes = membros.map((membro) => `${membro.area} (${membro.nome})`);
  if (nomes.length <= 1) return nomes.join("");
  return `${nomes.slice(0, -1).join(", ")} e ${nomes.at(-1)}`;
}

export function destinoAvaliacao(estudanteId: string, ancora?: string) {
  return `/estudantes/${estudanteId}/editar?aba=avaliacao${ancora ? `#${ancora}` : ""}`;
}
