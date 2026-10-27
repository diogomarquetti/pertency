import { getTurmasAtivas, listarNomes } from "../fontes/turmas";
import { PRAZOS } from "../prazos";
import type { TipoPendencia } from "../types";

// Não há registro de quando o componente ficou sem professor — o prazo
// conta da criação da turma.
export const componenteSemProfessor: TipoPendencia = {
  tipo: "componente_sem_professor",
  origem: "turma",
  titulo: "Vincular professores",
  acao: "Vincular professores",
  resolve: ["administrador"],
  acompanha: ["pedagogo"],
  regra: `Componente curricular da turma (matriz no Ensino Fundamental, componentes escolhidos na EJA) sem professor ativo vinculado. Vira "Atenção" após ${PRAZOS.componente_sem_professor.dias} dias da criação da turma.`,
  prazo: PRAZOS.componente_sem_professor,
  async carregar() {
    const turmas = await getTurmasAtivas();

    return turmas
      .filter((turma) => turma.componentesSemProfessor.length > 0)
      .map((turma) => {
        const nomes = turma.componentesSemProfessor.map((componente) => componente.nome);
        return {
          entidadeId: turma.id,
          sujeito: turma.nome,
          descricao: `${listarNomes(nomes)} ${nomes.length === 1 ? "está" : "estão"} sem professor vinculado.`,
          estado: nomes.length === 1 ? "1 componente" : `${nomes.length} componentes`,
          desde: turma.createdAt,
          destino: `/turmas/${turma.id}/editar#professores`,
        };
      });
  },
};
