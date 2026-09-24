/**
 * Vínculo de turma de um professor, com os nomes já resolvidos para exibir
 * no card "Turmas vinculadas" do cadastro de usuário (só consulta — o
 * vínculo é gerenciado no Cadastro de Turma).
 */
export type VinculoLocal = {
  turmaId: string;
  etapaCicloId: string;
  turnoId: string;
  componenteIds: string[];
  etapaCicloNome: string;
  turnoNome: string;
  turmaNome: string;
  turmaAtiva: boolean;
  componentesNomes: string[];
};
