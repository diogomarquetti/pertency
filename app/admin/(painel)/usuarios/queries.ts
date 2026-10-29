import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type UsuarioPlataformaListItem = {
  id: string;
  nomeCompleto: string;
  email: string;
  funcao: string;
  areaAtuacao: string | null;
  areaAtuacaoOutro: string | null;
  status: "ativo" | "inativo";
  senhaDefinida: boolean;
  escolaId: string;
  escola: string;
};

export type EscolaOpcao = { id: string; nome: string; status: "ativa" | "inativa" };

export async function listarUsuarios(): Promise<UsuarioPlataformaListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("usuarios")
    .select(
      "id, nome_completo, email, funcao, area_atuacao, area_atuacao_outro, status, senha_definida, escola_id, escolas(nome_oficial)",
    )
    .order("nome_completo");

  if (error) throw error;

  return (data ?? []).map((linha) => ({
    id: linha.id,
    nomeCompleto: linha.nome_completo,
    email: linha.email,
    funcao: linha.funcao,
    areaAtuacao: linha.area_atuacao,
    areaAtuacaoOutro: linha.area_atuacao_outro,
    status: linha.status,
    senhaDefinida: linha.senha_definida,
    escolaId: linha.escola_id,
    escola: (linha.escolas as unknown as { nome_oficial: string } | null)?.nome_oficial ?? "",
  }));
}

export async function listarOpcoesEscola(): Promise<EscolaOpcao[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("escolas").select("id, nome_oficial, status").order("nome_oficial");

  if (error) throw error;

  return (data ?? []).map((linha) => ({
    id: linha.id,
    nome: linha.nome_oficial,
    status: linha.status as "ativa" | "inativa",
  }));
}

export async function getUsuario(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("usuarios")
    .select(
      "nome_completo, email, telefone, funcao, area_atuacao, area_atuacao_outro, status, escola_id, escolas(nome_oficial)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;

  // E-mail de login vive em auth.users, não em usuarios — precisa da Admin API.
  const { data: authUser } = await createAdminClient().auth.admin.getUserById(id);

  return {
    escola: (data.escolas as unknown as { nome_oficial: string } | null)?.nome_oficial ?? "",
    valores: {
      nomeCompleto: data.nome_completo,
      email: data.email,
      telefone: data.telefone ?? "",
      funcao: data.funcao,
      areaAtuacao: data.area_atuacao ?? "",
      areaAtuacaoOutro: data.area_atuacao_outro ?? "",
      status: data.status,
      emailLogin: authUser.user?.email ?? "",
      escolaId: data.escola_id,
    },
  };
}
