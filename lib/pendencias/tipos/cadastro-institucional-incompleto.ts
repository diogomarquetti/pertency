import { getCadastroInstitucional } from "../fontes/configuracao";
import { listarNomes } from "../fontes/turmas";
import type { Ocorrencia, TipoPendencia } from "../types";

// Não há registro de quando o campo ficou vazio — o tempo conta da criação
// do cadastro. PROVISÓRIO: validar com P.O
export const cadastroInstitucionalIncompleto: TipoPendencia = {
  tipo: "cadastro_institucional_incompleto",
  origem: "configuracao",
  titulo: "Completar cadastro institucional",
  acao: "Completar cadastro",
  resolve: ["administrador"],
  acompanha: [],
  regra: "Campo obrigatório vazio ou inválido no cadastro da Escola ou da Mantenedora (a Mantenedora só conta se estiver cadastrada).",
  severidade: "normal",
  async carregar() {
    const { escola, mantenedora } = await getCadastroInstitucional();
    const ocorrencias: Ocorrencia[] = [];

    for (const [cadastro, sujeito, destino] of [
      [escola, "Escola", "/minha-escola/escola"],
      [mantenedora, "Mantenedora", "/minha-escola/mantenedora"],
    ] as const) {
      if (!cadastro || cadastro.faltando.length === 0) continue;
      const { faltando } = cadastro;

      ocorrencias.push({
        entidadeId: cadastro.id,
        sujeito,
        descricao: `${faltando.length === 1 ? "Falta" : "Faltam"} ${listarNomes(faltando)}.`,
        estado: faltando.length === 1 ? "1 informação" : `${faltando.length} informações`,
        desde: cadastro.createdAt,
        destino,
      });
    }

    return ocorrencias;
  },
};
