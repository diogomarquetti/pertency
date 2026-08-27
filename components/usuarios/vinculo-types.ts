/**
 * Vínculo de turma mantido em estado local no formulário (Bloco 2) — só vira
 * escrita real no banco quando o usuário clica em Salvar (ver user-form.tsx).
 * Guarda os nomes já resolvidos para exibir na tabela sem precisar de outro
 * round-trip.
 */
export type VinculoLocal = {
  turmaId: string;
  etapaCicloId: string;
  turnoId: string;
  componenteIds: string[];
  etapaCicloNome: string;
  turnoNome: string;
  turmaNome: string;
  componentesNomes: string[];
};
