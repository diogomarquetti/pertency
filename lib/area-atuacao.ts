/**
 * Áreas de atuação profissional — mesma lista usada na "Área" da Contribuição
 * complementar (Avaliação de Ingresso) e na "Área de atuação" do Cadastro de
 * Usuário, pra não existirem duas listas pra mesma coisa. Os valores batem
 * com as constraints `check` de `avaliacao_contribuicoes.area_contribuicao` e
 * `usuarios.area_atuacao`. Nome da área (neutro em gênero), não da profissão —
 * exceto "Médico", rótulo pedido pelo cliente piloto (o valor gravado é `medicina`).
 */
export const AREA_ATUACAO_OPTIONS = [
  { value: "servico_social", label: "Serviço Social" },
  { value: "psicologia", label: "Psicologia" },
  { value: "fonoaudiologia", label: "Fonoaudiologia" },
  { value: "fisioterapia", label: "Fisioterapia" },
  { value: "terapia_ocupacional", label: "Terapia Ocupacional" },
  { value: "pedagogia", label: "Pedagogia" },
  { value: "medicina", label: "Médico" },
  { value: "outro", label: "Outro" },
] as const;

export const AREA_ATUACAO_LABEL: Record<string, string> = Object.fromEntries(
  AREA_ATUACAO_OPTIONS.map((option) => [option.value, option.label]),
);
