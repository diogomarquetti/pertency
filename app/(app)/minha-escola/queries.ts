import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";

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
    .select(
      "id, nome_oficial, nome_usual, codigo_escola, tipo_escola, modalidade, nre_referencia, status, logradouro, numero, complemento, bairro, cep, municipio, uf, fone_institucional, email_institucional, diretor_nome, diretor_fone, diretor_email, coordenador_nome, coordenador_fone, coordenador_email",
    )
    .eq("id", perfil.escola_id)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    nomeOficial: data.nome_oficial,
    nomeUsual: data.nome_usual ?? "",
    codigoEscola: data.codigo_escola ?? "",
    tipoEscola: data.tipo_escola,
    modalidade: data.modalidade,
    nreReferencia: data.nre_referencia ?? "",
    status: data.status as "ativa" | "inativa",
    logradouro: data.logradouro ?? "",
    numero: data.numero ?? "",
    complemento: data.complemento ?? "",
    bairro: data.bairro ?? "",
    cep: data.cep ?? "",
    municipio: data.municipio ?? "",
    uf: data.uf ?? "",
    foneInstitucional: data.fone_institucional ?? "",
    emailInstitucional: data.email_institucional ?? "",
    diretorNome: data.diretor_nome ?? "",
    diretorFone: data.diretor_fone ?? "",
    diretorEmail: data.diretor_email ?? "",
    coordenadorNome: data.coordenador_nome ?? "",
    coordenadorFone: data.coordenador_fone ?? "",
    coordenadorEmail: data.coordenador_email ?? "",
  };
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
    .select(
      "id, razao_social, nome_fantasia, cnpj, logradouro, numero, complemento, bairro, cep, municipio, uf, fone_institucional, whatsapp_institucional, email_institucional, site, presidente_nome, presidente_cpf, presidente_fone, presidente_email, status",
    )
    .eq("id", escola.mantenedora_id)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    razaoSocial: data.razao_social,
    nomeFantasia: data.nome_fantasia,
    cnpj: data.cnpj,
    logradouro: data.logradouro,
    numero: data.numero,
    complemento: data.complemento ?? "",
    bairro: data.bairro,
    cep: data.cep,
    municipio: data.municipio,
    uf: data.uf,
    foneInstitucional: data.fone_institucional,
    whatsappInstitucional: data.whatsapp_institucional ?? "",
    emailInstitucional: data.email_institucional,
    site: data.site ?? "",
    presidenteNome: data.presidente_nome,
    presidenteCpf: data.presidente_cpf,
    presidenteFone: data.presidente_fone,
    presidenteEmail: data.presidente_email,
    status: data.status as "ativa" | "inativa",
  };
}
