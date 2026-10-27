import { destinoAvaliacao, getEstudantesEmIngresso } from "../fontes/ingresso";
import type { TipoPendencia } from "../types";

// Só profissionais complementares: pela RLS são os únicos que registram a
// própria contribuição (professor na equipe não contribui nem vê o
// estudante em ingresso — ver docs/requisitos/inicio-pendencias.md, item 4).
export const contribuicaoPendente: TipoPendencia = {
  tipo: "contribuicao_pendente",
  origem: "avaliacao",
  titulo: "Contribuição na avaliação",
  acao: "Contribuir",
  resolve: ["profissional_complementar"],
  porUsuario: true,
  acompanha: ["pedagogo"],
  regra: "Profissional complementar da equipe responsável por uma Avaliação de Ingresso em andamento que ainda não registrou a própria contribuição.",
  severidade: "atencao",
  rotuloTempo: (dias) => (dias === 0 ? "avaliação iniciada hoje" : `avaliação iniciada há ${dias} ${dias === 1 ? "dia" : "dias"}`),
  async carregar({ usuarioId }) {
    const estudantes = await getEstudantesEmIngresso();

    return estudantes.flatMap((estudante) => {
      const avaliacao = estudante.emEdicao;
      if (avaliacao?.status !== "em_andamento") return [];

      return avaliacao.semContribuicao.map((membro) => ({
        entidadeId: `${avaliacao.id}:${membro.id}`,
        sujeito: estudante.nome,
        descricao:
          membro.id === usuarioId
            ? `A equipe aguarda sua contribuição de ${membro.area} na Avaliação de Ingresso.`
            : `${membro.nome} (${membro.area}) ainda não registrou a contribuição.`,
        estado: "Em andamento",
        desde: avaliacao.dataInicio ?? avaliacao.createdAt,
        destino: destinoAvaliacao(estudante.id, "contribuicoes"),
        usuarioResponsavelId: membro.id,
      }));
    });
  },
};
