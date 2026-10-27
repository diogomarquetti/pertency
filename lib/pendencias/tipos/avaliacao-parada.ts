import { diasEntre, dataLocalISO } from "../datas";
import { destinoAvaliacao, getEstudantesEmIngresso, listarMembros } from "../fontes/ingresso";
import { PRAZOS } from "../prazos";
import type { TipoPendencia } from "../types";

// Avaliação em andamento só vira pendência depois do prazo — antes disso é
// trabalho normal em curso. Uma avaliação parada não gera também
// parecer_pendente (a descrição já diz o que falta).
export const avaliacaoParada: TipoPendencia = {
  tipo: "avaliacao_parada",
  origem: "avaliacao",
  titulo: "Avaliação parada",
  acao: "Abrir avaliação",
  resolve: ["pedagogo"],
  acompanha: ["direcao"],
  regra: `Avaliação de Ingresso em andamento há ${PRAZOS.avaliacao_parada.dias} dias ou mais sem ser concluída (contados da data de início).`,
  prazo: PRAZOS.avaliacao_parada,
  rotuloTempo: (dias) => `parada há ${dias} dias`,
  async carregar({ hoje }) {
    const estudantes = await getEstudantesEmIngresso();

    return estudantes.flatMap((estudante) => {
      const avaliacao = estudante.emEdicao;
      if (avaliacao?.status !== "em_andamento") return [];

      const desde = avaliacao.dataInicio ?? avaliacao.createdAt;
      if (diasEntre(dataLocalISO(desde), hoje) < PRAZOS.avaliacao_parada.dias) return [];

      const faltas = [
        avaliacao.semContribuicao.length > 0 &&
          `a contribuição de ${listarMembros(avaliacao.semContribuicao)}`,
        !avaliacao.parecerEquipe && "o parecer da equipe",
      ].filter(Boolean);

      return [
        {
          entidadeId: avaliacao.id,
          sujeito: estudante.nome,
          descricao:
            faltas.length > 0
              ? `Falta ${faltas.join(" e ")}.`
              : "Parecer registrado, mas a avaliação ainda não foi concluída.",
          estado: "Em andamento",
          desde,
          destino: destinoAvaliacao(estudante.id),
        },
      ];
    });
  },
};
