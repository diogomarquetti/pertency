"use server";

import { revalidatePath } from "next/cache";

import { requireAdminProfile } from "@/lib/supabase/require-admin-profile";

import { escolaSchema, mantenedoraSchema, type EscolaValues, type MantenedoraValues } from "./schema";

export async function updateEscola(values: EscolaValues) {
  const parsed = escolaSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireAdminProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, escolaId } = context;

  const { error: updateError } = await supabase
    .from("escolas")
    .update({
      nome_oficial: data.nomeOficial,
      nome_usual: data.nomeUsual || null,
      codigo_escola: data.codigoEscola || null,
      tipo_escola: data.tipoEscola,
      modalidade: data.modalidade,
      nre_referencia: data.nreReferencia,
      status: data.status,
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento || null,
      bairro: data.bairro,
      cep: data.cep,
      municipio: data.municipio,
      uf: data.uf,
      fone_institucional: data.foneInstitucional,
      email_institucional: data.emailInstitucional,
      diretor_nome: data.diretorNome,
      diretor_fone: data.diretorFone,
      diretor_email: data.diretorEmail,
      coordenador_nome: data.coordenadorNome,
      coordenador_fone: data.coordenadorFone,
      coordenador_email: data.coordenadorEmail,
    })
    .eq("id", escolaId);

  if (updateError) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath("/minha-escola");
  return { success: true } as const;
}

function mapMantenedoraFields(data: MantenedoraValues) {
  return {
    razao_social: data.razaoSocial,
    nome_fantasia: data.nomeFantasia,
    cnpj: data.cnpj,
    logradouro: data.logradouro,
    numero: data.numero,
    complemento: data.complemento || null,
    bairro: data.bairro,
    cep: data.cep,
    municipio: data.municipio,
    uf: data.uf,
    fone_institucional: data.foneInstitucional,
    whatsapp_institucional: data.whatsappInstitucional || null,
    email_institucional: data.emailInstitucional,
    site: data.site || null,
    presidente_nome: data.presidenteNome,
    presidente_cpf: data.presidenteCpf,
    presidente_fone: data.presidenteFone,
    presidente_email: data.presidenteEmail,
    status: data.status,
  };
}

export async function createMantenedora(values: MantenedoraValues) {
  const parsed = mantenedoraSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }

  const context = await requireAdminProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, escolaId } = context;

  const { error: insertError } = await supabase.from("mantenedoras").insert({
    escola_id: escolaId,
    ...mapMantenedoraFields(parsed.data),
  });

  if (insertError) {
    return { error: "Não foi possível criar a mantenedora." };
  }

  revalidatePath("/minha-escola");
  return { success: true } as const;
}

export async function updateMantenedora(values: MantenedoraValues) {
  const parsed = mantenedoraSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }

  const context = await requireAdminProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, escolaId } = context;

  const { error: updateError } = await supabase
    .from("mantenedoras")
    .update(mapMantenedoraFields(parsed.data))
    .eq("escola_id", escolaId);

  if (updateError) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath("/minha-escola");
  return { success: true } as const;
}
