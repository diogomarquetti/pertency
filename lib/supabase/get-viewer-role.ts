import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";
import { isFuncaoProfessor } from "@/app/(app)/usuarios/schema";

/**
 * A função do usuário logado, lida uma vez por requisição — uma mesma tela
 * (ex: edição do estudante) chama vários getViewer*() ao mesmo tempo, e
 * cada um fazia a própria consulta.
 */
const getFuncaoDoViewer = cache(async (): Promise<string | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("usuarios")
    .select("funcao")
    .eq("id", user.id)
    .maybeSingle();

  return data?.funcao ?? null;
});

/**
 * Só pra UI decidir o que renderizar (esconder Salvar, travar campos, etc) —
 * não é um guard de escrita. Isso continua sendo `requireAdminProfile()` nas
 * Server Actions, e a RLS por baixo de tudo.
 */
export async function getViewerIsAdmin(): Promise<boolean> {
  const funcao = await getFuncaoDoViewer();
  return funcao === "administrador";
}

/**
 * Professor vê a lista de usuários, mas não abre o cadastro de cada um
 * (pedido do P.O, 2026-10-29). O próprio perfil continua em Minha conta.
 */
export async function getViewerPodeAbrirCadastroUsuario(): Promise<boolean> {
  const funcao = await getFuncaoDoViewer();
  return !!funcao && !isFuncaoProfessor(funcao);
}

const ESTUDANTE_WRITE_FUNCOES = new Set(["administrador", "secretaria", "coordenacao_pedagogica"]);

/** Mesma ideia de getViewerIsAdmin(), para o Cadastro de Estudante. */
export async function getViewerCanEditEstudante(): Promise<boolean> {
  const funcao = await getFuncaoDoViewer();
  return !!funcao && ESTUDANTE_WRITE_FUNCOES.has(funcao);
}

// Os mesmos perfis que geram PDF retificam e cancelam a Avaliação de Ingresso
// (no banco: pode_fechar_avaliacao()). Concluir é só Pedagogo(a) e
// Administrador — ver getViewerCanConcluirAvaliacao().
const RELATORIO_GERACAO_FUNCOES = new Set(["administrador", "coordenacao_pedagogica", "direcao"]);

/** Mesma ideia de getViewerCanEditEstudante(), para o botão de gerar PDF da Avaliação. */
export async function getViewerCanGerarRelatorio(): Promise<boolean> {
  const funcao = await getFuncaoDoViewer();
  return !!funcao && RELATORIO_GERACAO_FUNCOES.has(funcao);
}

const CONCLUSAO_AVALIACAO_FUNCOES = new Set(["administrador", "coordenacao_pedagogica"]);

/** Quem pode concluir a Avaliação de Ingresso (no banco: pode_concluir_avaliacao()). */
export async function getViewerCanConcluirAvaliacao(): Promise<boolean> {
  const funcao = await getFuncaoDoViewer();
  return !!funcao && CONCLUSAO_AVALIACAO_FUNCOES.has(funcao);
}

/** Mesma ideia de getViewerCanEditEstudante(), pra Contribuições complementares (Onda 4, fatia 2). */
export async function getViewerCanEditContribuicaoPropria(): Promise<boolean> {
  const funcao = await getFuncaoDoViewer();
  return !!funcao && (ESTUDANTE_WRITE_FUNCOES.has(funcao) || funcao === "profissional_complementar");
}

const CONDICAO_WRITE_FUNCOES = new Set(["administrador", "coordenacao_pedagogica"]);

/** Mesma ideia de getViewerCanEditEstudante(), para a Aba 5 (Condição do estudante). */
export async function getViewerCanEditCondicao(): Promise<boolean> {
  const funcao = await getFuncaoDoViewer();
  return !!funcao && CONDICAO_WRITE_FUNCOES.has(funcao);
}
