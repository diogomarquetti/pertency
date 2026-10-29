/**
 * Fonte única das regras de Oferta / Organização da oferta (retorno do P.O,
 * 2026-10-27). As organizações continuam sendo linhas de `etapas_ciclos`
 * (escopadas por escola e referenciadas por turmas, avaliações e vínculos
 * escolares); cada linha aponta para uma entrada daqui pela coluna
 * `etapas_ciclos.codigo`. Linha sem `codigo` (ou com código que não está
 * aqui) é organização descontinuada: continua abrindo, mas não é mais
 * selecionável — ver `isOrganizacaoAtiva`.
 */

/** Grupo da oferta — linha de `ofertas`; define o comportamento do formulário. */
export type OfertaSlug = "ei" | "ef" | "eja" | "aee_infantil" | "curriculo_funcional";

export type FormaFuncionamento = "diaria" | "cronograma";
export type FormaFuncionamentoRegra = FormaFuncionamento | "livre";

export const OFERTAS: readonly { slug: OfertaSlug; nome: string }[] = [
  { slug: "ei", nome: "Educação Infantil" },
  { slug: "aee_infantil", nome: "Apoio Educacional Infantil Especializado" },
  { slug: "ef", nome: "Ensino Fundamental" },
  { slug: "eja", nome: "EJA" },
  { slug: "curriculo_funcional", nome: "Programa Pedagógico do Currículo Funcional" },
];

export type OrganizacaoConfig = {
  codigo: string;
  ofertaSlug: OfertaSlug;
  nome: string;
  exigeCiclo: boolean;
};

export const ORGANIZACOES_CONFIG: readonly OrganizacaoConfig[] = [
  { codigo: "ei_estimulacao_essencial", ofertaSlug: "ei", nome: "Estimulação Essencial", exigeCiclo: false },
  { codigo: "ei_pre_escolar", ofertaSlug: "ei", nome: "Pré-Escolar", exigeCiclo: false },
  {
    codigo: "aee_infantil",
    ofertaSlug: "aee_infantil",
    nome: "Apoio Educacional Infantil Especializado",
    exigeCiclo: false,
  },
  { codigo: "ef_ciclo_continuo", ofertaSlug: "ef", nome: "Ciclo Contínuo – Multietapas", exigeCiclo: true },
  { codigo: "eja_fase_1", ofertaSlug: "eja", nome: "EJA Fase I", exigeCiclo: false },
  {
    codigo: "eja_fase_1_especial",
    ofertaSlug: "eja",
    nome: "EJA Fase I – Educação Especial – Etapa Única",
    exigeCiclo: false,
  },
  {
    codigo: "curriculo_funcional",
    ofertaSlug: "curriculo_funcional",
    nome: "Programa Pedagógico do Currículo Funcional",
    exigeCiclo: false,
  },
];

/**
 * Oferta como a turma é cadastrada: o código SERE (gravado em
 * `turmas.oferta_sere`), as organizações permitidas e a forma de
 * funcionamento (tabela do P.O de 2026-10-29).
 */
export type OfertaSereConfig = {
  codigo: string;
  nome: string;
  ofertaSlug: OfertaSlug;
  organizacoes: readonly string[];
  formaFuncionamentoRegra: FormaFuncionamentoRegra;
  /** false = estrutura curricular ainda não definida: matriz opcional, bloco 3 só com aviso. */
  estruturaDefinida: boolean;
};

// PROVISÓRIO: validar com P.O — as duas ofertas de Educação Infantil (6005 e
// 6046) com as duas organizações cada uma; 6036 e 5110 com organização única
// de mesmo nome e sem estrutura curricular / matriz.
export const OFERTAS_SERE: readonly OfertaSereConfig[] = [
  {
    codigo: "6005",
    nome: "Educação Infantil",
    ofertaSlug: "ei",
    organizacoes: ["ei_estimulacao_essencial", "ei_pre_escolar"],
    formaFuncionamentoRegra: "diaria",
    estruturaDefinida: true,
  },
  {
    codigo: "6046",
    nome: "Educação Infantil",
    ofertaSlug: "ei",
    organizacoes: ["ei_estimulacao_essencial", "ei_pre_escolar"],
    formaFuncionamentoRegra: "diaria",
    estruturaDefinida: true,
  },
  {
    codigo: "6036",
    nome: "Apoio Educacional Infantil Especializado",
    ofertaSlug: "aee_infantil",
    organizacoes: ["aee_infantil"],
    formaFuncionamentoRegra: "cronograma",
    estruturaDefinida: false,
  },
  {
    codigo: "6053",
    nome: "Ensino Fundamental",
    ofertaSlug: "ef",
    organizacoes: ["ef_ciclo_continuo"],
    formaFuncionamentoRegra: "diaria",
    estruturaDefinida: true,
  },
  {
    codigo: "6039",
    nome: "EJA Fase I",
    ofertaSlug: "eja",
    organizacoes: ["eja_fase_1"],
    formaFuncionamentoRegra: "diaria",
    estruturaDefinida: true,
  },
  {
    codigo: "6054",
    nome: "EJA Fase I Especial",
    ofertaSlug: "eja",
    organizacoes: ["eja_fase_1_especial"],
    formaFuncionamentoRegra: "cronograma",
    estruturaDefinida: true,
  },
  {
    codigo: "5110",
    nome: "Programa Pedagógico do Currículo Funcional",
    ofertaSlug: "curriculo_funcional",
    organizacoes: ["curriculo_funcional"],
    formaFuncionamentoRegra: "livre",
    estruturaDefinida: false,
  },
];

export function getOfertaSere(codigo: string | null | undefined) {
  if (!codigo) return undefined;
  return OFERTAS_SERE.find((oferta) => oferta.codigo === codigo);
}

/** "Educação Infantil (6005)". */
export function ofertaSereLabel(oferta: { nome: string; codigo: string }) {
  return `${oferta.nome} (${oferta.codigo})`;
}

/** A organização (pelo `codigo` de etapas_ciclos) é permitida nessa oferta SERE? */
export function organizacaoPermitida(ofertaSere: string | null | undefined, codigo: string | null | undefined) {
  return !!codigo && !!getOfertaSere(ofertaSere)?.organizacoes.includes(codigo);
}

export function getOrganizacaoConfig(codigo: string | null | undefined) {
  if (!codigo) return undefined;
  return ORGANIZACOES_CONFIG.find((organizacao) => organizacao.codigo === codigo);
}

export function isOrganizacaoAtiva(codigo: string | null | undefined) {
  return !!getOrganizacaoConfig(codigo);
}

export const FORMA_FUNCIONAMENTO_OPTIONS: readonly { value: FormaFuncionamento; label: string }[] = [
  { value: "diaria", label: "Frequência diária" },
  { value: "cronograma", label: "Por cronograma" },
];

/** Ciclos do Ensino Fundamental — Ciclo Contínuo – Multietapas (SERE 6053). */
export const CICLOS_EF = [
  { value: 1, label: "1º Ciclo", etapas: [1, 2, 3, 4] },
  { value: 2, label: "2º Ciclo", etapas: [1, 2, 3, 4, 5, 6] },
] as const;

export function getEtapasDoCicloEf(ciclo: number | null | undefined): readonly number[] {
  return CICLOS_EF.find((item) => item.value === ciclo)?.etapas ?? [];
}

export function etapaLabel(etapa: number) {
  return `${etapa}ª Etapa`;
}

export function cicloLabel(ciclo: number | null | undefined) {
  return CICLOS_EF.find((item) => item.value === ciclo)?.label ?? "";
}

// PROVISÓRIO: validar com P.O — sem sábado.
export const DIAS_SEMANA = [
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
] as const;

/**
 * Organizações que aparecem num select: as ativas da oferta, mais a
 * descontinuada já gravada no registro (pra ele continuar abrindo).
 */
export function organizacoesSelecionaveis<T extends { id: string; ofertaId: string; codigo: string | null }>(
  organizacoes: T[],
  ofertaId: string | null | undefined,
  organizacaoAtualId: string | null | undefined,
) {
  return organizacoes.filter(
    (organizacao) =>
      organizacao.ofertaId === ofertaId &&
      (isOrganizacaoAtiva(organizacao.codigo) || organizacao.id === organizacaoAtualId),
  );
}

export function organizacaoLabel(organizacao: { nome: string; codigo: string | null }) {
  return isOrganizacaoAtiva(organizacao.codigo) ? organizacao.nome : `${organizacao.nome} (descontinuada)`;
}
