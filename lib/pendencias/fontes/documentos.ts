import { cache } from "react";

import { DOCUMENTO_TIPOS_FIXOS, documentosPendentes, type DocumentoTipoFixo } from "@/app/(app)/estudantes/documentos-schema";
import { createClient } from "@/lib/supabase/server";

/**
 * Estudantes Ativos com documento pendente — mesma regra da aba Documentos
 * (`documentosPendentes`). A RLS de documentos_estudante e dados_escolares
 * é só de Administrador, Secretaria e Pedagogo(a): para os demais perfis
 * isto vem vazio de documentos e não pode ser usado.
 *
 * Alimenta o tipo documentos_pendentes e o filtro
 * /estudantes?pendencia=documentos.
 */

export type EstudanteComDocumentosPendentes = {
  id: string;
  nome: string;
  pendentes: DocumentoTipoFixo[];
  /** Data de matrícula efetiva mais recente (ou o cadastro, sem vínculo). */
  desde: string;
};

type Relacao<T> = T | T[] | null;

function primeiro<T>(valor: Relacao<T>): T | null {
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

export const getEstudantesComDocumentosPendentes = cache(
  async (): Promise<EstudanteComDocumentosPendentes[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("estudantes")
      .select(
        `id, nome_completo, created_at, segundo_responsavel_nome,
         documentos_estudante(tipo, status),
         dados_escolares(forma_origem),
         vinculos_escolares_anuais(data_matricula_efetiva)`,
      )
      .eq("situacao", "ativo");
    if (error) throw error;

    return (data ?? []).flatMap((estudante) => {
      const pendentes = documentosPendentes(estudante.documentos_estudante ?? [], {
        formaOrigem: primeiro(estudante.dados_escolares as Relacao<{ forma_origem: string | null }>)?.forma_origem,
        temSegundoResponsavel: !!estudante.segundo_responsavel_nome?.trim(),
      });
      if (pendentes.length === 0) return [];

      const matriculas = ((estudante.vinculos_escolares_anuais ?? []) as { data_matricula_efetiva: string | null }[])
        .map((vinculo) => vinculo.data_matricula_efetiva)
        .filter((data): data is string => !!data)
        .sort();

      return [
        {
          id: estudante.id as string,
          nome: estudante.nome_completo as string,
          pendentes,
          desde: matriculas.at(-1) ?? (estudante.created_at as string),
        },
      ];
    });
  },
);

export const DOCUMENTO_LABEL: Record<string, string> = Object.fromEntries(
  DOCUMENTO_TIPOS_FIXOS.map((item) => [item.tipo, item.label]),
);
