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
  type AutorizadoRetiradaValues,
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
    filiacao_mae: data.filiacaoMae || null,
    filiacao_pai: data.filiacaoPai || null,
    responsavel_principal_pode_retirar: data.responsavelPrincipalPodeRetirar,
    // Sem segundo responsável não há quem autorizar — grava false em vez de
    // deixar uma autorização "fantasma" ligada a um nome vazio.
    segundo_responsavel_pode_retirar:
      !!data.segundoResponsavelNome?.trim() && data.segundoResponsavelPodeRetirar,
    contato_emergencia_nome: data.contatoEmergenciaNome,
    contato_emergencia_telefone: data.contatoEmergenciaTelefone,
  };
}

/**
 * Sincroniza a lista de outras pessoas autorizadas com o que veio do
 * formulário: remove as que saíram, atualiza as que já existiam (por
 * `registroId`) e insere as novas. Diff em vez de apagar-e-recriar pra que o
 * histórico (trigger em estudante_autorizados_retirada) registre só o que
 * realmente mudou.
 */
async function syncAutorizadosRetirada(
  supabase: SupabaseServerClient,
  escolaId: string,
  estudanteId: string,
  autorizados: AutorizadoRetiradaValues[],
) {
  const { data: existentes, error: selectError } = await supabase
    .from("estudante_autorizados_retirada")
    .select("id")
    .eq("estudante_id", estudanteId);
  if (selectError) return false;

  const idsMantidos = new Set(autorizados.map((a) => a.registroId).filter(Boolean));
  const idsRemovidos = (existentes ?? []).map((row) => row.id).filter((id) => !idsMantidos.has(id));

  if (idsRemovidos.length > 0) {
    const { error } = await supabase
      .from("estudante_autorizados_retirada")
      .delete()
      .in("id", idsRemovidos);
    if (error) return false;
  }

  for (const autorizado of autorizados) {
    const campos = {
      nome: autorizado.nome.trim(),
      vinculo: autorizado.vinculo,
      telefone: autorizado.telefone,
    };
    const { error } = autorizado.registroId
      ? await supabase
          .from("estudante_autorizados_retirada")
          .update(campos)
          .eq("id", autorizado.registroId)
          .eq("estudante_id", estudanteId)
      : await supabase
          .from("estudante_autorizados_retirada")
          .insert({ ...campos, estudante_id: estudanteId, escola_id: escolaId });
    if (error) return false;
  }

  return true;
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

  if (!(await syncAutorizadosRetirada(supabase, escolaId, inserted.id, data.autorizadosRetirada))) {
    // O estudante já foi criado — segue pra edição, onde a lista pode ser
    // corrigida, em vez de deixar o usuário recriar e duplicar o cadastro.
    redirect(`/estudantes/${inserted.id}/editar?criado=1&retirada=erro`);
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

  if (!(await syncAutorizadosRetirada(supabase, escolaId, id, data.autorizadosRetirada))) {
    return { error: "Os dados foram salvos, mas não foi possível atualizar as pessoas autorizadas a retirar o estudante." };
  }

  revalidatePath("/estudantes");
  redirect("/estudantes?salvo=1");
}
