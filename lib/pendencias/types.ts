import type { SupabaseServerClient } from "@/lib/supabase/require-admin-profile";

import type { Perfil } from "./perfis";

/**
 * Pendência = item derivado do estado dos cadastros, calculado na leitura
 * (nunca gravado): some sozinha quando o estado que a gerou muda. Ver
 * docs/requisitos/inicio-pendencias.md e a seção "Pendências" do
 * docs/ARCHITECTURE.md.
 */

export type Severidade = "atrasada" | "atencao" | "normal";

export type Origem = "estudante" | "avaliacao" | "documentos" | "turma" | "usuario" | "configuracao";

/** Prazo de uma regra: até `dias` vale `noPrazo`; a partir dele, `vencido`. */
export type Prazo = {
  dias: number;
  noPrazo: Severidade;
  vencido: Severidade;
  /** Prazo ainda não validado com o P.O — aparece em "Por que estou vendo isto?". */
  provisorio: boolean;
};

export type ContextoPendencias = {
  supabase: SupabaseServerClient;
  usuarioId: string;
  perfil: Perfil;
  /** Data de hoje em America/Sao_Paulo (YYYY-MM-DD). */
  hoje: string;
};

/** O que a consulta de um tipo devolve, uma por registro que gerou a pendência. */
export type Ocorrencia = {
  entidadeId: string;
  sujeito: string;
  descricao: string;
  /** Estado do registro, na linha de meta (ex.: "Em andamento"). */
  estado: string;
  /** Data (YYYY-MM-DD) ou timestamp a partir do qual a condição existe. */
  desde: string;
  destino: string;
  /** Só para tipos `porUsuario`: quem resolve esta ocorrência. */
  usuarioResponsavelId?: string;
};

/**
 * Declaração de um tipo de pendência — um arquivo por tipo em
 * lib/pendencias/tipos/, listado em registro.ts. `resolve` precisa ser um
 * subconjunto dos perfis com escrita na tela de destino, de acordo com a
 * RLS (a RLS continua sendo a autoridade; isto só decide em que bloco o
 * item aparece).
 */
export type TipoPendencia = {
  tipo: string;
  origem: Origem;
  titulo: string;
  /** Texto do botão que leva ao destino. */
  acao: string;
  resolve: Perfil[];
  /** Entre os perfis de `resolve`, só o usuário da ocorrência resolve (ex.: a própria contribuição). */
  porUsuario?: boolean;
  acompanha: Perfil[];
  /** Texto exibido em "Por que estou vendo isto?". */
  regra: string;
  /** Sem prazo: severidade fixa. */
  prazo?: Prazo;
  severidade?: Severidade;
  /** Rótulo do tempo na linha de meta. Padrão: "há N dias". */
  rotuloTempo?: (dias: number) => string;
  carregar: (contexto: ContextoPendencias) => Promise<Ocorrencia[]>;
};

export type Pendencia = {
  /** `${tipo}:${entidadeId}` — único na homepage. */
  id: string;
  tipo: string;
  origem: Origem;
  entidadeId: string;
  titulo: string;
  sujeito: string;
  descricao: string;
  estado: string;
  desde: string;
  dias: number;
  tempo: string;
  severidade: Severidade;
  /** Rótulo de quem resolve, para o bloco Acompanhar. */
  quemResolve: string;
  regra: string;
  provisorio: boolean;
  destino: string;
  acao: string;
};
