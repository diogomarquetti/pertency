import { diasEntre, dataLocalISO } from "../datas";
import { destinoAvaliacao, getEstudantesEmIngresso } from "../fontes/ingresso";
import { PRAZOS } from "../prazos";
import type { TipoPendencia } from "../types";

export const parecerPendente: TipoPendencia = {
  tipo: "parecer_pendente",
  origem: "avaliacao",
  titulo: "Escrever parecer",
  acao: "Escrever parecer",
  resolve: ["pedagogo"],
  acompanha: [],
  regra: "Avaliação em andamento em que todos os profissionais complementares da equipe já registraram contribuição, e a análise integrada e parecer da equipe está vazia.",
  severidade: "normal",
  rotuloTempo: (dias) => (dias === 0 ? "pronta hoje" : `pronta há ${dias} ${dias === 1 ? "dia" : "dias"}`),
  async carregar({ hoje }) {
    const estudantes = await getEstudantesEmIngresso();

    return estudantes.flatMap((estudante) => {
      const avaliacao = estudante.emEdicao;
      if (avaliacao?.status !== "em_andamento") return [];
      if (avaliacao.parecerEquipe || avaliacao.semContribuicao.length > 0) return [];

      // Já aparece como avaliacao_parada.
      const inicio = avaliacao.dataInicio ?? avaliacao.createdAt;
      if (diasEntre(dataLocalISO(inicio), hoje) >= PRAZOS.avaliacao_parada.dias) return [];

      return [
        {
          entidadeId: avaliacao.id,
          sujeito: estudante.nome,
          descricao:
            avaliacao.complementares.length > 0
              ? "Todas as contribuições da equipe foram registradas. Faltam a análise integrada e o parecer."
              : "Faltam a análise integrada e o parecer da equipe.",
          estado: "Em andamento",
          desde: avaliacao.ultimaContribuicaoEm ?? inicio,
          destino: destinoAvaliacao(estudante.id, "parecer"),
        },
      ];
    });
  },
};
