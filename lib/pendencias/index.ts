import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";

import { dataLocalISO, diasEntre, hojeISO, tempoDecorrido } from "./datas";
import { PERFIL_LABEL, perfilDaFuncao, type Perfil } from "./perfis";
import { TIPOS_PENDENCIA } from "./registro";
import { calcularSeveridade, ordenarPendencias } from "./severidade";
import type { ContextoPendencias, Ocorrencia, Pendencia, TipoPendencia } from "./types";

export type PendenciasDoUsuario = {
  usuario: { id: string; nomeCompleto: string; perfil: Perfil };
  resolver: Pendencia[];
  acompanhar: Pendencia[];
};

function participa(tipo: TipoPendencia, perfil: Perfil) {
  return tipo.resolve.includes(perfil) || tipo.acompanha.includes(perfil);
}

function resolvePeloUsuario(tipo: TipoPendencia, ocorrencia: Ocorrencia, contexto: ContextoPendencias) {
  if (!tipo.resolve.includes(contexto.perfil)) return false;
  return !tipo.porUsuario || ocorrencia.usuarioResponsavelId === contexto.usuarioId;
}

function montarPendencia(tipo: TipoPendencia, ocorrencia: Ocorrencia, hoje: string): Pendencia {
  const dias = diasEntre(dataLocalISO(ocorrencia.desde), hoje);

  return {
    id: `${tipo.tipo}:${ocorrencia.entidadeId}`,
    tipo: tipo.tipo,
    origem: tipo.origem,
    entidadeId: ocorrencia.entidadeId,
    titulo: tipo.titulo,
    sujeito: ocorrencia.sujeito,
    descricao: ocorrencia.descricao,
    estado: ocorrencia.estado,
    desde: ocorrencia.desde,
    dias,
    tempo: (tipo.rotuloTempo ?? tempoDecorrido)(dias),
    severidade: calcularSeveridade(tipo, dias),
    quemResolve: tipo.resolve.map((perfil) => PERFIL_LABEL[perfil]).join(", "),
    regra: tipo.regra,
    provisorio: tipo.prazo?.provisorio ?? false,
    destino: ocorrencia.destino,
    acao: tipo.acao,
  };
}

/**
 * Quem está logado e o perfil dele no catálogo. Separado de getPendencias()
 * para a homepage já saber o perfil (coluna lateral) sem esperar todas as
 * pendências — as duas partes carregam em paralelo.
 */
export const getUsuarioDasPendencias = cache(async (): Promise<PendenciasDoUsuario["usuario"] | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("usuarios")
    .select("nome_completo, funcao")
    .eq("id", user.id)
    .maybeSingle();
  if (!data) return null;

  return { id: user.id, nomeCompleto: data.nome_completo, perfil: perfilDaFuncao(data.funcao) };
});

/**
 * Pendências do usuário logado, já separadas em "resolver" e "acompanhar".
 * Roda sob a RLS do próprio usuário (client normal), então o escopo da
 * escola ativa e o que cada perfil pode ler vêm do banco. Só os tipos em
 * que o perfil resolve ou acompanha chegam a consultar algo, e as
 * consultas rodam em paralelo — nunca uma por item. `cache()` deixa o
 * layout (sino) e a página reaproveitarem o mesmo cálculo na requisição.
 */
export const getPendencias = cache(async (): Promise<PendenciasDoUsuario | null> => {
  const usuario = await getUsuarioDasPendencias();
  if (!usuario) return null;

  const contexto: ContextoPendencias = {
    supabase: await createClient(),
    usuarioId: usuario.id,
    perfil: usuario.perfil,
    hoje: hojeISO(),
  };

  const tipos = TIPOS_PENDENCIA.filter((tipo) => participa(tipo, contexto.perfil));
  const resultados = await Promise.allSettled(tipos.map((tipo) => tipo.carregar(contexto)));

  const resolver: Pendencia[] = [];
  const acompanhar: Pendencia[] = [];

  resultados.forEach((resultado, index) => {
    const tipo = tipos[index];
    // Um tipo com erro não derruba a homepage inteira — só some da lista.
    if (resultado.status === "rejected") {
      console.error(`[pendencias] falha ao carregar "${tipo.tipo}"`, resultado.reason);
      return;
    }
    for (const ocorrencia of resultado.value) {
      const pendencia = montarPendencia(tipo, ocorrencia, contexto.hoje);
      if (resolvePeloUsuario(tipo, ocorrencia, contexto)) {
        resolver.push(pendencia);
      } else if (tipo.acompanha.includes(contexto.perfil)) {
        acompanhar.push(pendencia);
      }
    }
  });

  return {
    usuario,
    resolver: ordenarPendencias(resolver),
    acompanhar: ordenarPendencias(acompanhar),
  };
});
