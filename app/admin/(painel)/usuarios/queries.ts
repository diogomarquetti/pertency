import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type Operador = {
  id: string;
  nomeCompleto: string;
  email: string;
  ativo: boolean;
  /** Último login (null = ainda não entrou). */
  ultimoAcesso: string | null;
};

async function dadosDeLogin(ids: string[]) {
  const admin = createAdminClient();
  const logins = await Promise.all(ids.map((id) => admin.auth.admin.getUserById(id)));
  return new Map(
    logins.map(({ data }, i) => [ids[i], { email: data.user?.email ?? "", ultimoAcesso: data.user?.last_sign_in_at ?? null }]),
  );
}

export async function listarOperadores(): Promise<Operador[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("operadores_plataforma")
    .select("id, nome_completo, ativo")
    .order("nome_completo");

  if (error) throw error;

  // E-mail e último login vivem em auth.users — a equipe é pequena, uma
  // consulta por operador basta.
  const logins = await dadosDeLogin((data ?? []).map((linha) => linha.id));
  return (data ?? []).map((linha) => ({
    id: linha.id,
    nomeCompleto: linha.nome_completo,
    ativo: linha.ativo,
    email: logins.get(linha.id)?.email ?? "",
    ultimoAcesso: logins.get(linha.id)?.ultimoAcesso ?? null,
  }));
}

export async function getOperador(id: string): Promise<Operador | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("operadores_plataforma")
    .select("id, nome_completo, ativo")
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;
  const login = (await dadosDeLogin([id])).get(id);
  return {
    id: data.id,
    nomeCompleto: data.nome_completo,
    ativo: data.ativo,
    email: login?.email ?? "",
    ultimoAcesso: login?.ultimoAcesso ?? null,
  };
}
