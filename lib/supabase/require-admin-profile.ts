import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Confere que quem está chamando a Server Action é um administrador com
 * perfil em `usuarios` — a RLS já bloqueia a escrita de qualquer outro
 * jeito, isso só dá uma mensagem de erro clara em vez de um insert/update
 * silenciosamente ignorado pela política. Compartilhado entre features
 * (usuarios, minha-escola, ...) que escrevem em tabelas escopadas por
 * escola_id + funcao=administrador.
 */
export async function requireAdminProfile(): Promise<
  { error: string } | { supabase: SupabaseServerClient; adminId: string; escolaId: string }
> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." } as const;
  }

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("escola_id, funcao")
    .eq("id", user.id)
    .single();

  if (!perfil || perfil.funcao !== "administrador") {
    return { error: "Você não tem permissão para realizar esta ação." } as const;
  }

  return { supabase, adminId: user.id, escolaId: perfil.escola_id as string } as const;
}

const ESTUDANTE_WRITE_FUNCOES = new Set(["administrador", "secretaria", "coordenacao_pedagogica"]);

/**
 * Mesma ideia de requireAdminProfile(), mas para o Cadastro de Estudante —
 * a história aponta Administrador, Secretaria e Coordenação Pedagógica como
 * responsáveis pelas Abas 1 e 2, então a escrita não é admin-only aqui. A
 * RLS de `estudantes` usa a mesma lista de perfis (ver migration
 * 20260916151628_estudantes.sql).
 */
export async function requireEstudanteWriteProfile(): Promise<
  { error: string } | { supabase: SupabaseServerClient; userId: string; escolaId: string }
> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." } as const;
  }

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("escola_id, funcao")
    .eq("id", user.id)
    .single();

  if (!perfil || !ESTUDANTE_WRITE_FUNCOES.has(perfil.funcao)) {
    return { error: "Você não tem permissão para realizar esta ação." } as const;
  }

  return { supabase, userId: user.id, escolaId: perfil.escola_id as string } as const;
}

const RELATORIO_GERACAO_FUNCOES = new Set(["administrador", "coordenacao_pedagogica", "direcao"]);

/**
 * Geração de PDF da Avaliação de Ingresso (HU-EST-001 v2.0, seção 19) tem um
 * conjunto de perfis diferente do resto do Cadastro de Estudante — inclui
 * Direção (que não escreve na avaliação em si) e exclui Secretaria (que só
 * visualiza/baixa a versão já gerada).
 */
export async function requireRelatorioGeracaoProfile(): Promise<
  { error: string } | { supabase: SupabaseServerClient; userId: string; escolaId: string }
> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." } as const;
  }

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("escola_id, funcao")
    .eq("id", user.id)
    .single();

  if (!perfil || !RELATORIO_GERACAO_FUNCOES.has(perfil.funcao)) {
    return { error: "Você não tem permissão para gerar este relatório." } as const;
  }

  return { supabase, userId: user.id, escolaId: perfil.escola_id as string } as const;
}

/**
 * Contribuições complementares (Onda 4, fatia 2): administrador/secretaria/
 * coordenação continuam lançando em nome de qualquer profissional
 * (`ESTUDANTE_WRITE_FUNCOES`); um profissional complementar logado só pode
 * mexer na própria — quem chama precisa checar `podeEditarQualquer` e, se
 * for false, validar que o registro pertence ao próprio `userId` (isso não
 * dá pra fazer aqui, porque depende do `profissionalId` sendo salvo/da
 * linha sendo editada).
 */
export async function requireContribuicaoWriteProfile(): Promise<
  | { error: string }
  | { supabase: SupabaseServerClient; userId: string; escolaId: string; podeEditarQualquer: boolean }
> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." } as const;
  }

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("escola_id, funcao")
    .eq("id", user.id)
    .single();

  const podeEditarQualquer = !!perfil && ESTUDANTE_WRITE_FUNCOES.has(perfil.funcao);
  const ehProfissionalComplementar = perfil?.funcao === "profissional_complementar";

  if (!perfil || (!podeEditarQualquer && !ehProfissionalComplementar)) {
    return { error: "Você não tem permissão para realizar esta ação." } as const;
  }

  return {
    supabase,
    userId: user.id,
    escolaId: perfil.escola_id as string,
    podeEditarQualquer,
  } as const;
}

const CONDICAO_WRITE_FUNCOES = new Set(["administrador", "coordenacao_pedagogica"]);

/**
 * Aba 5 (Condição do estudante) tem o guard mais estreito do módulo —
 * HU-EST-001 v2.0, seção 19: Secretaria "não edita análise pedagógica/
 * condição sem permissão", diferente de todas as outras abas onde ela
 * escreve normalmente.
 */
export async function requireCondicaoWriteProfile(): Promise<
  { error: string } | { supabase: SupabaseServerClient; userId: string; escolaId: string }
> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." } as const;
  }

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("escola_id, funcao")
    .eq("id", user.id)
    .single();

  if (!perfil || !CONDICAO_WRITE_FUNCOES.has(perfil.funcao)) {
    return { error: "Você não tem permissão para realizar esta ação." } as const;
  }

  return { supabase, userId: user.id, escolaId: perfil.escola_id as string } as const;
}
