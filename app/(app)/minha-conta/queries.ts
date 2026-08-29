import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";

export type MeuPerfil = {
  id: string;
  escolaId: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  fotoUrl: string | null;
  funcao: string;
};

export async function getMeuPerfil(): Promise<MeuPerfil | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return null;

  const { data } = await supabase
    .from("usuarios")
    .select("id, escola_id, nome_completo, email, telefone, foto_url, funcao")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    escolaId: data.escola_id,
    nomeCompleto: data.nome_completo,
    email: data.email,
    telefone: data.telefone ?? "",
    fotoUrl: data.foto_url,
    funcao: data.funcao,
  };
}
