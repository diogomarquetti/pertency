import { destinoAvaliacao, getEstudantesEmIngresso } from "../fontes/ingresso";
import { PRAZOS } from "../prazos";
import type { TipoPendencia } from "../types";

// "Dados pessoais salvos" é o próprio cadastro existir: o formulário não
// salva estudante com Dados pessoais incompletos.
export const avaliacaoNaoIniciada: TipoPendencia = {
  tipo: "avaliacao_nao_iniciada",
  origem: "avaliacao",
  titulo: "Iniciar avaliação",
  acao: "Iniciar avaliação",
  resolve: ["pedagogo"],
  acompanha: ["direcao"],
  regra: `Estudante em análise de ingresso sem Avaliação de Ingresso em andamento. Vira "Atenção" após ${PRAZOS.avaliacao_nao_iniciada.dias} dias do cadastro.`,
  prazo: PRAZOS.avaliacao_nao_iniciada,
  rotuloTempo: (dias) => (dias === 0 ? "cadastrado hoje" : `cadastrado há ${dias} ${dias === 1 ? "dia" : "dias"}`),
  async carregar() {
    const estudantes = await getEstudantesEmIngresso();

    return estudantes
      .filter((estudante) => !estudante.vigente && estudante.emEdicao?.status !== "em_andamento")
      .map((estudante) => ({
        entidadeId: estudante.id,
        sujeito: estudante.nome,
        descricao: estudante.emEdicao
          ? "A avaliação está em rascunho. Defina a equipe e a data de início para começar."
          : "Dados pessoais completos. Ainda não há avaliação, equipe nem data de início definidas.",
        estado: estudante.emEdicao ? "Rascunho" : "Não iniciada",
        desde: estudante.createdAt,
        destino: destinoAvaliacao(estudante.id),
      }));
  },
};
