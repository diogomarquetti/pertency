"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  requireEstudanteWriteProfile,
  type SupabaseServerClient,
} from "@/lib/supabase/require-admin-profile";

import {
  createEstudanteSchema,
  updateEstudanteSchema,
  type CreateEstudanteValues,
  type UpdateEstudanteValues,
} from "./schema";

function toEstudanteRow(escolaId: string, data: CreateEstudanteValues | UpdateEstudanteValues) {
  return {
    escola_id: escolaId,
    nome_completo: data.nomeCompleto,
    nome_social: data.nomeSocial || null,
    situacao: data.situacao,
    data_nascimento: data.dataNascimento,
    sexo: data.sexo,
    cor_raca: data.corRaca,
    nacionalidade: data.nacionalidade,
    naturalidade: data.naturalidade,
    cpf: data.cpf || null,
    tipo_documento_identificacao: data.tipoDocumentoIdentificacao || null,
    numero_documento: data.numeroDocumento || null,
    orgao_emissor_uf: data.tipoDocumentoIdentificacao === "rg" ? data.orgaoEmissorUf || null : null,
    endereco_logradouro: data.enderecoLogradouro,
    endereco_numero: data.enderecoNumero,
    endereco_complemento: data.enderecoComplemento || null,
    endereco_bairro: data.enderecoBairro,
    endereco_cep: data.enderecoCep,
    endereco_municipio: data.enderecoMunicipio,
    endereco_uf: data.enderecoUf,
    responsavel_principal_nome: data.responsavelPrincipalNome,
    responsavel_principal_parentesco: data.responsavelPrincipalParentesco,
    responsavel_principal_telefone: data.responsavelPrincipalTelefone,
    segundo_responsavel_nome: data.segundoResponsavelNome || null,
    segundo_responsavel_parentesco: data.segundoResponsavelParentesco || null,
    segundo_responsavel_telefone: data.segundoResponsavelTelefone || null,
    filiacao: data.filiacao,
    quem_pode_retirar: data.quemPodeRetirar,
    contato_emergencia: data.contatoEmergencia,
  };
}

/**
 * CPF é único por estudante — a história não permite duplicar CPF ativo
 * sem regra de exceção; como não existe essa exceção ainda, bloqueia
 * qualquer duplicidade na escola. RLS já escopa a consulta pela escola do
 * usuário logado, sem precisar filtrar `escola_id` explicitamente aqui.
 */
async function existeOutroEstudanteComCpf(
  supabase: SupabaseServerClient,
  cpf: string,
  estudanteId?: string,
) {
  let query = supabase.from("estudantes").select("id").eq("cpf", cpf);
  if (estudanteId) {
    query = query.neq("id", estudanteId);
  }
  const { data } = await query.limit(1).maybeSingle();
  return !!data;
}

export async function createEstudante(values: CreateEstudanteValues) {
  const parsed = createEstudanteSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireEstudanteWriteProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, userId, escolaId } = context;

  if (data.cpf && (await existeOutroEstudanteComCpf(supabase, data.cpf))) {
    return { error: "Já existe um estudante cadastrado com este CPF." };
  }

  const { data: inserted, error } = await supabase
    .from("estudantes")
    .insert({ ...toEstudanteRow(escolaId, data), created_by: userId })
    .select("id")
    .single();

  if (error || !inserted) {
    return { error: "Não foi possível salvar o estudante. Tente novamente." };
  }

  revalidatePath("/estudantes");
  redirect(`/estudantes/${inserted.id}/editar?criado=1`);
}

export async function updateEstudante(id: string, values: UpdateEstudanteValues) {
  const parsed = updateEstudanteSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos e tente novamente." };
  }
  const data = parsed.data;

  const context = await requireEstudanteWriteProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, escolaId } = context;

  if (data.cpf && (await existeOutroEstudanteComCpf(supabase, data.cpf, id))) {
    return { error: "Já existe um estudante cadastrado com este CPF." };
  }

  const { data: updated, error } = await supabase
    .from("estudantes")
    .update(toEstudanteRow(escolaId, data))
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !updated) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath("/estudantes");
  redirect("/estudantes?salvo=1");
}
