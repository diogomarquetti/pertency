import { getTurmasAtivas, listarNomes } from "../fontes/turmas";
import type { TipoPendencia } from "../types";

// Um item só para a escola inteira (agrupado), não um por turma.
export const turmaOrganizacaoLegada: TipoPendencia = {
  tipo: "turma_organizacao_legada",
  origem: "turma",
  titulo: "Revisar organização da oferta",
  acao: "Revisar turmas",
  resolve: ["administrador"],
  acompanha: ["direcao"],
  regra: "Turma ativa com organização da oferta que deixou de existir na configuração central de ofertas.",
  severidade: "atencao",
  async carregar() {
    const turmas = (await getTurmasAtivas()).filter((turma) => turma.organizacaoDescontinuada);
    if (turmas.length === 0) return [];

    const organizacoes = [...new Set(turmas.map((turma) => `"${turma.organizacaoNome}"`))];

    return [
      {
        entidadeId: "escola",
        sujeito: turmas.length === 1 ? turmas[0].nome : `${turmas.length} turmas`,
        descricao: `${listarNomes(turmas.map((turma) => turma.nome))} ${turmas.length === 1 ? "usa" : "usam"} ${
          organizacoes.length === 1 ? "uma organização que deixou" : "organizações que deixaram"
        } de existir (${listarNomes(organizacoes)}).`,
        estado: "Organização descontinuada",
        desde: turmas.map((turma) => turma.createdAt).sort()[0],
        destino: "/turmas?pendencia=organizacao",
      },
    ];
  },
};
