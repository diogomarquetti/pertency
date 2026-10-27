import { getEstudantesEmIngresso } from "../fontes/ingresso";
import { PRAZOS } from "../prazos";
import type { TipoPendencia } from "../types";

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
});

// Estudante elegível continua "Em análise de ingresso" até a Secretaria
// salvar os Dados escolares como Ativo — e "Ativo" já exige oferta,
// organização, turno, turma, matrícula, data e forma de origem.
export const matriculaPendente: TipoPendencia = {
  tipo: "matricula_pendente",
  origem: "estudante",
  titulo: "Concluir matrícula",
  acao: "Concluir dados escolares",
  resolve: ["secretaria"],
  acompanha: ["pedagogo", "direcao"],
  regra: `Avaliação de Ingresso concluída como elegível e estudante ainda não Ativo nos Dados escolares. Vira "Atrasada" após ${PRAZOS.matricula_pendente.dias} dias da conclusão.`,
  prazo: PRAZOS.matricula_pendente,
  async carregar() {
    const estudantes = await getEstudantesEmIngresso();

    return estudantes.flatMap((estudante) => {
      const vigente = estudante.vigente;
      if (vigente?.recomendacaoElegibilidade !== "elegivel" || !vigente.concluidaEm) return [];

      return [
        {
          entidadeId: estudante.id,
          sujeito: estudante.nome,
          descricao: `Parecer elegível em ${formatoData.format(new Date(vigente.concluidaEm))}. Faltam os dados escolares (turma, matrícula e data de matrícula efetiva) para ativar o estudante.`,
          estado: "Elegível",
          desde: vigente.concluidaEm,
          destino: `/estudantes/${estudante.id}/editar?aba=dados-escolares`,
        },
      ];
    });
  },
};
