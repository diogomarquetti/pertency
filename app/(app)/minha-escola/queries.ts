import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";

import { ESCOLA_COLUNAS, MANTENEDORA_COLUNAS, escolaDaLinha, mantenedoraDaLinha } from "./mapeamento";
import type { EscolaValues, MantenedoraValues } from "./schema";

export type EscolaAtual = EscolaValues & { id: string };

/**
 * A escola do tenant — singleton, sempre existe exatamente 1 linha
 * (criada no bootstrap), escopada por RLS via get_escola_id(). Nunca há
 * estado "nenhuma escola cadastrada": se a linha não vier, é bug de
 * bootstrap/RLS, não um caso de UI a tratar.
 */
export async function getEscolaAtualCompleta(): Promise<EscolaAtual | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return null;

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("escola_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!perfil?.escola_id) return null;

  const { data } = await supabase
    .from("escolas")
    .select(ESCOLA_COLUNAS)
    .eq("id", perfil.escola_id)
    .maybeSingle();

  return data ? escolaDaLinha(data) : null;
}

async function getEscolaIdAtual(): Promise<string | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return null;

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("escola_id")
    .eq("id", user.id)
    .maybeSingle();

  return perfil?.escola_id ?? null;
}

export type MantenedoraAtual = MantenedoraValues & { id: string };

/**
 * A mantenedora selecionada pela escola (`escolas.mantenedora_id`) — pode não
 * existir ainda. `null` aqui significa "ainda não vinculada", não um erro.
 * Quem cadastra e vincula é o operador da plataforma, no admin.
 */
export async function getMantenedoraAtual(): Promise<MantenedoraAtual | null> {
  const escolaId = await getEscolaIdAtual();
  if (!escolaId) return null;

  const supabase = await createClient();
  const { data: escola } = await supabase
    .from("escolas")
    .select("mantenedora_id")
    .eq("id", escolaId)
    .maybeSingle();

  if (!escola?.mantenedora_id) return null;

  const { data } = await supabase
    .from("mantenedoras")
    .select(MANTENEDORA_COLUNAS)
    .eq("id", escola.mantenedora_id)
    .maybeSingle();

  return data ? mantenedoraDaLinha(data) : null;
}
