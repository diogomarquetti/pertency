/**
 * Componentes curriculares que cada função de professor pode receber no
 * vínculo com uma turma do Ensino Fundamental. Usado no drawer (o que
 * aparece e o que vem marcado) e nas actions (o que é gravado), pra os dois
 * nunca divergirem. Componentes são reconhecidos pelo nome — o catálogo
 * `componentes_curriculares` é global e fixo.
 */
const COMPONENTE_DA_FUNCAO: Record<string, string> = {
  professor_arte: "Arte",
  professor_educacao_fisica: "Educação Física",
};

const COMPONENTES_ESPECIALISTAS = new Set(Object.values(COMPONENTE_DA_FUNCAO));

export type RegraComponentes = {
  /** Componentes que aparecem pra escolher. */
  opcoes: { id: string; nome: string }[];
  /** true = professor especialista: o componente dele vem marcado e travado. */
  fixo: boolean;
};

export function regraComponentesDoProfessor(
  funcao: string | null | undefined,
  componentes: { id: string; nome: string }[],
): RegraComponentes {
  const especialidade = funcao ? COMPONENTE_DA_FUNCAO[funcao] : undefined;
  if (especialidade) {
    return { opcoes: componentes.filter((c) => c.nome === especialidade), fixo: true };
  }
  // Regente (1 e 2) não leciona Arte nem Educação Física.
  return { opcoes: componentes.filter((c) => !COMPONENTES_ESPECIALISTAS.has(c.nome)), fixo: false };
}

/** O que é gravado: especialista sempre com o componente dele; demais, só os permitidos. */
export function componentesPermitidos(
  funcao: string | null | undefined,
  componentes: { id: string; nome: string }[],
  escolhidos: string[],
) {
  const regra = regraComponentesDoProfessor(funcao, componentes);
  if (regra.fixo) return regra.opcoes.map((c) => c.id);
  const permitidos = new Set(regra.opcoes.map((c) => c.id));
  return escolhidos.filter((id) => permitidos.has(id));
}

export function especialidadeDaFuncao(funcao: string | null | undefined) {
  return funcao ? COMPONENTE_DA_FUNCAO[funcao] : undefined;
}
