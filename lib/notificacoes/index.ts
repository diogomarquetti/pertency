import { cache } from "react";

import type { Origem } from "@/lib/pendencias/types";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";

import { TIPOS_NOTIFICACAO, type DadosNotificacao } from "./tipos";

// PROVISÓRIO: validar com P.O — quanto tempo o sino mostra e quantos itens.
export const JANELA_DIAS = 30;
export const LIMITE_ITENS = 30;

export type Notificacao = {
  id: string;
  origem: Origem;
  titulo: string;
  sujeito?: string;
  destino: string;
  criadaEm: string;
  lida: boolean;
};

export type NotificacoesDoUsuario = {
  itens: Notificacao[];
  naoLidas: number;
};

const VAZIO: NotificacoesDoUsuario = { itens: [], naoLidas: 0 };

/**
 * Notificações do usuário logado (a RLS já restringe às próprias). Um tipo
 * desconhecido — ex.: gravado por uma migration mais nova que o deploy —
 * é ignorado, e uma falha de leitura devolve vazio: o sino nunca derruba o
 * layout.
 */
export const getNotificacoes = cache(async (): Promise<NotificacoesDoUsuario> => {
  const user = await getCurrentUser();
  if (!user) return VAZIO;

  const supabase = await createClient();
  const desde = new Date(Date.now() - JANELA_DIAS * 86_400_000).toISOString();

  const { data, error } = await supabase
    .from("notificacoes")
    .select("id, tipo, dados, destino, quantidade, criada_em, lida_em")
    .eq("destinatario_id", user.id)
    .gte("criada_em", desde)
    .order("criada_em", { ascending: false })
    .limit(LIMITE_ITENS);

  if (error) {
    console.error("[notificacoes] falha ao carregar", error);
    return VAZIO;
  }

  const itens = (data ?? []).flatMap((row): Notificacao[] => {
    const tipo = TIPOS_NOTIFICACAO[row.tipo];
    if (!tipo) return [];
    const dados = (row.dados ?? {}) as DadosNotificacao;

    return [
      {
        id: row.id,
        origem: tipo.origem,
        titulo: tipo.titulo(dados, row.quantidade),
        sujeito: tipo.sujeito(dados),
        destino: row.destino,
        criadaEm: row.criada_em,
        lida: row.lida_em !== null,
      },
    ];
  });

  return { itens, naoLidas: itens.filter((item) => !item.lida).length };
});
