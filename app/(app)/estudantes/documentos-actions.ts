"use server";

import { revalidatePath } from "next/cache";

import {
  requireEstudanteWriteProfile,
  type SupabaseServerClient,
} from "@/lib/supabase/require-admin-profile";

import type { DocumentoTipoFixo } from "./documentos-schema";

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Grava um patch numa linha de documento fixo, criando na primeira vez —
 * não dá pra usar `.upsert()` com `onConflict` aqui porque o índice único
 * de (estudante_id, tipo) é parcial (`where tipo <> 'outro'`), e o Postgres
 * não casa `ON CONFLICT (col1, col2)` com um índice parcial. Select +
 * insert/update evita depender disso.
 */
async function gravarDocumentoFixo(
  supabase: SupabaseServerClient,
  estudanteId: string,
  escolaId: string,
  userId: string,
  tipo: DocumentoTipoFixo,
  patch: Record<string, unknown>,
) {
  const { data: existente } = await supabase
    .from("documentos_estudante")
    .select("id")
    .eq("estudante_id", estudanteId)
    .eq("tipo", tipo)
    .maybeSingle();

  if (existente) {
    return supabase.from("documentos_estudante").update(patch).eq("id", existente.id);
  }

  return supabase.from("documentos_estudante").insert({
    estudante_id: estudanteId,
    escola_id: escolaId,
    tipo,
    created_by: userId,
    ...patch,
  });
}

/**
 * Garante que a linha "ponteiro" do documento fixo existe, sem tocar nos
 * campos de arquivo — usado por `salvarArquivoDocumento` antes de registrar
 * a versão, que precisa do `documento_id` primeiro.
 */
async function garantirDocumentoFixo(
  supabase: SupabaseServerClient,
  estudanteId: string,
  escolaId: string,
  userId: string,
  tipo: DocumentoTipoFixo,
): Promise<{ documentoId: string | null; error: { message: string } | null }> {
  const { data: existente } = await supabase
    .from("documentos_estudante")
    .select("id")
    .eq("estudante_id", estudanteId)
    .eq("tipo", tipo)
    .maybeSingle();

  if (existente) {
    return { documentoId: existente.id as string, error: null };
  }

  const { data, error } = await supabase
    .from("documentos_estudante")
    .insert({ estudante_id: estudanteId, escola_id: escolaId, tipo, created_by: userId })
    .select("id")
    .single();

  return { documentoId: (data?.id as string | undefined) ?? null, error };
}

type AlvoDocumento = { tipo: DocumentoTipoFixo } | { docId: string };

/** Aplica um patch no documento-alvo — fixo (cria a linha na primeira vez) ou extra (por id). */
async function gravarDocumento(
  estudanteId: string,
  alvo: AlvoDocumento,
  patch: (userId: string) => Record<string, unknown>,
) {
  const context = await requireEstudanteWriteProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, userId, escolaId } = context;

  const { error } =
    "tipo" in alvo
      ? await gravarDocumentoFixo(supabase, estudanteId, escolaId, userId, alvo.tipo, patch(userId))
      : await supabase
          .from("documentos_estudante")
          .update(patch(userId))
          .eq("id", alvo.docId)
          .eq("estudante_id", estudanteId);

  if (error) {
    return { error: "Não foi possível atualizar o documento." };
  }

  revalidatePath(`/estudantes/${estudanteId}/editar`);
  return { success: true } as const;
}

/*
 * O status do checklist não é mais escolhido num select: cada ação abaixo
 * (e o envio de arquivo, em salvarArquivoDocumento) define o status como
 * consequência — quem fez e quando ficam em conferido_por/data_envio, e a
 * troca de status entra no histórico pelo trigger de auditoria.
 */

/** Documento entregue em papel, sem arquivo digitalizado. */
export async function registrarEntregaFisica(estudanteId: string, alvo: AlvoDocumento) {
  return gravarDocumento(estudanteId, alvo, (userId) => ({
    status: "entregue",
    forma_entrega: "fisica",
    motivo_nao_se_aplica: null,
    conferido_por: userId,
    data_envio: hoje(),
  }));
}

export async function marcarNaoSeAplica(estudanteId: string, alvo: AlvoDocumento, motivo: string) {
  if (!motivo.trim()) {
    return { error: "Informe o motivo." };
  }
  return gravarDocumento(estudanteId, alvo, (userId) => ({
    status: "nao_se_aplica",
    forma_entrega: null,
    motivo_nao_se_aplica: motivo.trim(),
    conferido_por: userId,
    data_envio: hoje(),
  }));
}

/**
 * Volta pra Pendente uma entrega física ou um "não se aplica" registrados
 * por engano. Entrega por arquivo não se desfaz aqui — corrige-se enviando
 * uma nova versão.
 */
export async function desfazerStatusDocumento(estudanteId: string, alvo: AlvoDocumento) {
  return gravarDocumento(estudanteId, alvo, () => ({
    status: "pendente",
    forma_entrega: null,
    motivo_nao_se_aplica: null,
    conferido_por: null,
    data_envio: null,
  }));
}

/**
 * Registra uma nova versão do arquivo (que já subiu pro Storage em um
 * caminho próprio, no client — mesmo padrão de
 * components/estudantes/estudante-hero-card.tsx) e só depois move o ponteiro "atual"
 * em documentos_estudante. A versão é gravada ANTES do ponteiro de
 * propósito: se o update do ponteiro falhar, o registro de histórico não se
 * perde (CA20 — nunca perder versão anterior).
 */
export async function salvarArquivoDocumento(
  estudanteId: string,
  arquivoPath: string,
  arquivoNome: string,
  options: { tipo: DocumentoTipoFixo } | { docId: string },
) {
  const context = await requireEstudanteWriteProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, userId, escolaId } = context;

  let documentoId: string;
  if ("tipo" in options) {
    const { documentoId: id, error } = await garantirDocumentoFixo(
      supabase,
      estudanteId,
      escolaId,
      userId,
      options.tipo,
    );
    if (error || !id) {
      return { error: "Não foi possível registrar o documento." };
    }
    documentoId = id;
  } else {
    documentoId = options.docId;
  }

  const { data: ultimaVersao } = await supabase
    .from("documentos_estudante_versoes")
    .select("versao")
    .eq("documento_id", documentoId)
    .order("versao", { ascending: false })
    .limit(1)
    .maybeSingle();

  const versao = (ultimaVersao?.versao ?? 0) + 1;

  const { error: versaoError } = await supabase.from("documentos_estudante_versoes").insert({
    documento_id: documentoId,
    estudante_id: estudanteId,
    escola_id: escolaId,
    versao,
    arquivo_path: arquivoPath,
    arquivo_nome: arquivoNome,
    enviado_por: userId,
  });

  if (versaoError) {
    return { error: "Não foi possível registrar a nova versão do documento." };
  }

  // Enviar o arquivo é o que marca o documento como entregue.
  const { error: patchError } = await supabase
    .from("documentos_estudante")
    .update({
      arquivo_path: arquivoPath,
      arquivo_nome: arquivoNome,
      status: "entregue",
      forma_entrega: "arquivo",
      motivo_nao_se_aplica: null,
      conferido_por: userId,
      data_envio: hoje(),
    })
    .eq("id", documentoId);

  if (patchError) {
    return { error: "Versão registrada, mas não foi possível atualizar o documento atual." };
  }

  revalidatePath(`/estudantes/${estudanteId}/editar`);
  return { success: true } as const;
}

export async function adicionarDocumentoExtra(estudanteId: string, nomeDocumento: string) {
  if (!nomeDocumento.trim()) {
    return { error: "Informe um nome para o documento." };
  }

  const context = await requireEstudanteWriteProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, userId, escolaId } = context;

  const { error } = await supabase.from("documentos_estudante").insert({
    estudante_id: estudanteId,
    escola_id: escolaId,
    tipo: "outro",
    nome_documento: nomeDocumento.trim(),
    created_by: userId,
  });

  if (error) {
    return { error: "Não foi possível adicionar o documento." };
  }

  revalidatePath(`/estudantes/${estudanteId}/editar`);
  return { success: true } as const;
}

export async function removerDocumentoExtra(estudanteId: string, docId: string) {
  const context = await requireEstudanteWriteProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase } = context;

  const { error } = await supabase.from("documentos_estudante").delete().eq("id", docId);

  if (error) {
    return { error: "Não foi possível remover o documento." };
  }

  revalidatePath(`/estudantes/${estudanteId}/editar`);
  return { success: true } as const;
}
