"use server";

import { renderToBuffer } from "@react-pdf/renderer";

import { requireEstudanteWriteProfile } from "@/lib/supabase/require-admin-profile";
import { AutorizacaoImagemPdf } from "@/lib/pdf/autorizacao-imagem";

/**
 * Gera o termo padrão de autorização de uso de imagem, já com estudante,
 * responsáveis e escola preenchidos, pra impressão e assinatura. Não grava
 * nada: a via assinada entra no checklist por upload ou entrega física.
 * Devolve o PDF em base64 pro client abrir numa aba nova (mesmo fluxo da
 * prévia do relatório da Avaliação de Ingresso).
 */
export async function gerarTermoAutorizacaoImagem(estudanteId: string) {
  const context = await requireEstudanteWriteProfile();
  if ("error" in context) {
    return context;
  }
  const { supabase, escolaId } = context;

  const [{ data: estudante }, { data: escola }] = await Promise.all([
    supabase
      .from("estudantes")
      .select("nome_completo, data_nascimento, responsavel_principal_nome, segundo_responsavel_nome")
      .eq("id", estudanteId)
      .single(),
    supabase.from("escolas").select("nome_usual, nome_oficial, municipio").eq("id", escolaId).single(),
  ]);

  if (!estudante || !escola) {
    return { error: "Estudante não encontrado." };
  }

  try {
    const pdfBuffer = await renderToBuffer(
      <AutorizacaoImagemPdf
        data={{
          escolaNomeOficial: escola.nome_oficial ?? escola.nome_usual ?? "",
          escolaMunicipio: escola.municipio ?? "",
          estudanteNome: estudante.nome_completo,
          dataNascimento: estudante.data_nascimento,
          responsaveis: [estudante.responsavel_principal_nome, estudante.segundo_responsavel_nome].filter(
            (nome): nome is string => !!nome?.trim(),
          ),
        }}
      />,
    );
    return { pdfBase64: pdfBuffer.toString("base64") };
  } catch {
    return { error: "Não foi possível gerar o termo. Tente novamente." };
  }
}
