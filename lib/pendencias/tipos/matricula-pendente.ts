import { getEstudantesEmIngresso } from "../fontes/ingresso";
import { PRAZOS } from "../prazos";
import type { TipoPendencia } from "../types";

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
});

// Concluir a avaliação como elegível, com encaminhamento "Efetivar
// matrícula", passa o estudante para "A matricular". Ele vira "Ativo"
// sozinho quando a Secretaria completa os Dados escolares (turno, turma,
// matrícula, data e forma de origem).
export const matriculaPendente: TipoPendencia = {
  tipo: "matricula_pendente",
  origem: "estudante",
  titulo: "Concluir matrícula",
  acao: "Concluir dados escolares",
  resolve: ["secretaria"],
  acompanha: ["pedagogo", "direcao"],
  regra: `Avaliação de Ingresso concluída como elegível com encaminhamento "Efetivar matrícula": estudante "A matricular" até os Dados escolares ficarem completos. Vira "Atrasada" após ${PRAZOS.matricula_pendente.dias} dias da conclusão.`,
  prazo: PRAZOS.matricula_pendente,
  async carregar() {
    const estudantes = await getEstudantesEmIngresso();

    return estudantes.flatMap((estudante) => {
      const vigente = estudante.vigente;
      if (estudante.situacao !== "a_matricular" || !vigente?.concluidaEm) return [];

      return [
        {
          entidadeId: estudante.id,
          sujeito: estudante.nome,
          descricao: `Parecer elegível em ${formatoData.format(new Date(vigente.concluidaEm))}. Faltam os dados escolares (turno, turma, matrícula, data de matrícula efetiva e forma de origem) para ativar o estudante.`,
          estado: "A matricular",
          desde: vigente.concluidaEm,
          destino: `/estudantes/${estudante.id}/editar?aba=dados-escolares`,
        },
      ];
    });
  },
};
