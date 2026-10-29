import { apenasDigitos } from "@/lib/telefone";
import type { SupabaseServerClient } from "@/lib/supabase/require-admin-profile";

/**
 * Outro usuário da escola com o mesmo telefone (comparado só pelos dígitos,
 * então "(46) 99999-0000" e "46999990000" contam como iguais). Não existe
 * índice único no banco porque já há telefones repetidos cadastrados antes
 * desta regra — a checagem fica aqui, usada no cadastro de usuários e em
 * Minha conta. A RLS restringe a busca à escola de quem está salvando.
 */
export async function usuarioComTelefone(
  supabase: SupabaseServerClient,
  telefone: string | null | undefined,
  ignorarUsuarioId: string | null,
): Promise<{ id: string; nome: string } | null> {
  const digitos = apenasDigitos(telefone);
  if (!digitos) return null;

  const { data } = await supabase.from("usuarios").select("id, nome_completo, telefone").not("telefone", "is", null);

  const outro = (data ?? []).find(
    (usuario) => usuario.id !== ignorarUsuarioId && apenasDigitos(usuario.telefone) === digitos,
  );
  return outro ? { id: outro.id, nome: outro.nome_completo } : null;
}

/** Só valida duplicidade quando o telefone muda — os repetidos antigos não travam outras edições. */
export async function telefoneMudou(supabase: SupabaseServerClient, usuarioId: string, telefone: string | null | undefined) {
  const { data } = await supabase.from("usuarios").select("telefone").eq("id", usuarioId).maybeSingle();
  return apenasDigitos(data?.telefone) !== apenasDigitos(telefone);
}
