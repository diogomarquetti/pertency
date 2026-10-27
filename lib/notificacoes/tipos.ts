import type { Origem } from "@/lib/pendencias/types";

/**
 * Catálogo dos tipos de notificação gravados pelos triggers da migration
 * 20261028100000_notificacoes.sql. O banco guarda só o tipo e nomes curtos
 * em `dados`; o texto mora aqui. Regra de produto: texto curto, de bater o
 * olho — um título de poucas palavras e o sujeito (estudante ou turma).
 * Detalhe fica na tela de destino.
 */

export type DadosNotificacao = {
  estudante?: string;
  turma?: string;
  profissional?: string;
  elegibilidade?: "elegivel" | "nao_elegivel" | null;
};

type TipoNotificacao = {
  origem: Origem;
  titulo: (dados: DadosNotificacao, quantidade: number) => string;
  sujeito: (dados: DadosNotificacao) => string | undefined;
};

const doEstudante = (dados: DadosNotificacao) => dados.estudante;

export const TIPOS_NOTIFICACAO: Record<string, TipoNotificacao> = {
  alerta_rotina_atualizado: {
    origem: "estudante",
    titulo: () => "Alerta de rotina atualizado",
    sujeito: doEstudante,
  },
  estudante_entrou_turma: {
    origem: "turma",
    titulo: () => "Entrou na sua turma",
    sujeito: doEstudante,
  },
  estudante_saiu_turma: {
    origem: "turma",
    titulo: () => "Saiu da sua turma",
    sujeito: doEstudante,
  },
  vinculado_turma: {
    origem: "turma",
    titulo: () => "Você foi vinculado(a) à turma",
    sujeito: (dados) => dados.turma,
  },
  incluido_equipe_avaliacao: {
    origem: "avaliacao",
    titulo: () => "Você está na equipe da avaliação",
    sujeito: doEstudante,
  },
  contribuicao_registrada: {
    origem: "avaliacao",
    titulo: (_, quantidade) => (quantidade > 1 ? `${quantidade} novas contribuições` : "Nova contribuição"),
    sujeito: doEstudante,
  },
  contribuicoes_completas: {
    origem: "avaliacao",
    titulo: () => "Pronta para o parecer",
    sujeito: doEstudante,
  },
  avaliacao_concluida: {
    origem: "avaliacao",
    titulo: (dados) =>
      dados.elegibilidade === "elegivel"
        ? "Avaliação concluída: elegível"
        : dados.elegibilidade === "nao_elegivel"
          ? "Avaliação concluída: não elegível"
          : "Avaliação concluída",
    sujeito: doEstudante,
  },
};
