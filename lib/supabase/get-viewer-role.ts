import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";
import { isFuncaoProfessor } from "@/app/(app)/usuarios/schema";

/**
 * Só pra UI decidir o que renderizar (esconder Salvar, travar campos, etc) —
 * não é um guard de escrita. Isso continua sendo `requireAdminProfile()` nas
 * Server Actions, e a RLS por baixo de tudo.
 */
export async function getViewerIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return false;

  const { data } = await supabase
    .from("usuarios")
    .select("funcao")
    .eq("id", user.id)
    .maybeSingle();

  return data?.funcao === "administrador";
}

/**
 * Professor vê a lista de usuários, mas não abre o cadastro de cada um
 * (pedido do P.O, 2026-10-29). O próprio perfil continua em Minha conta.
 */
export async function getViewerPodeAbrirCadastroUsuario(): Promise<boolean> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return false;

  const { data } = await supabase
    .from("usuarios")
    .select("funcao")
    .eq("id", user.id)
    .maybeSingle();

  return !!data && !isFuncaoProfessor(data.funcao);
}

const ESTUDANTE_WRITE_FUNCOES = new Set(["administrador", "secretaria", "coordenacao_pedagogica"]);

/** Mesma ideia de getViewerIsAdmin(), para o Cadastro de Estudante. */
export async function getViewerCanEditEstudante(): Promise<boolean> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return false;

  const { data } = await supabase
    .from("usuarios")
    .select("funcao")
    .eq("id", user.id)
    .maybeSingle();

  return !!data && ESTUDANTE_WRITE_FUNCOES.has(data.funcao);
}

// Os mesmos perfis que geram PDF retificam e cancelam a Avaliação de Ingresso
// (no banco: pode_fechar_avaliacao()). Concluir é só Pedagogo(a) e
// Administrador — ver getViewerCanConcluirAvaliacao().
const RELATORIO_GERACAO_FUNCOES = new Set(["administrador", "coordenacao_pedagogica", "direcao"]);

/** Mesma ideia de getViewerCanEditEstudante(), para o botão de gerar PDF da Avaliação. */
export async function getViewerCanGerarRelatorio(): Promise<boolean> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return false;

  const { data } = await supabase
    .from("usuarios")
    .select("funcao")
    .eq("id", user.id)
    .maybeSingle();

  return !!data && RELATORIO_GERACAO_FUNCOES.has(data.funcao);
}

const CONCLUSAO_AVALIACAO_FUNCOES = new Set(["administrador", "coordenacao_pedagogica"]);

/** Quem pode concluir a Avaliação de Ingresso (no banco: pode_concluir_avaliacao()). */
export async function getViewerCanConcluirAvaliacao(): Promise<boolean> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return false;

  const { data } = await supabase
    .from("usuarios")
    .select("funcao")
    .eq("id", user.id)
    .maybeSingle();

  return !!data && CONCLUSAO_AVALIACAO_FUNCOES.has(data.funcao);
}

/** Mesma ideia de getViewerCanEditEstudante(), pra Contribuições complementares (Onda 4, fatia 2). */
export async function getViewerCanEditContribuicaoPropria(): Promise<boolean> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return false;

  const { data } = await supabase
    .from("usuarios")
    .select("funcao")
    .eq("id", user.id)
    .maybeSingle();

  return !!data && (ESTUDANTE_WRITE_FUNCOES.has(data.funcao) || data.funcao === "profissional_complementar");
}

const CONDICAO_WRITE_FUNCOES = new Set(["administrador", "coordenacao_pedagogica"]);

/** Mesma ideia de getViewerCanEditEstudante(), para a Aba 5 (Condição do estudante). */
export async function getViewerCanEditCondicao(): Promise<boolean> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return false;

  const { data } = await supabase
    .from("usuarios")
    .select("funcao")
    .eq("id", user.id)
    .maybeSingle();

  return !!data && CONDICAO_WRITE_FUNCOES.has(data.funcao);
}
