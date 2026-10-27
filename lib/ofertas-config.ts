/**
 * Fonte única das regras de Oferta / Organização da oferta (retorno do P.O,
 * 2026-10-27). As organizações continuam sendo linhas de `etapas_ciclos`
 * (escopadas por escola e referenciadas por turmas, avaliações e vínculos
 * escolares); cada linha aponta para uma entrada daqui pela coluna
 * `etapas_ciclos.codigo`. Linha sem `codigo` (ou com código que não está
 * aqui) é organização descontinuada: continua abrindo, mas não é mais
 * selecionável — ver `isOrganizacaoAtiva`.
 */

export type OfertaSlug = "ei" | "ef" | "eja";

export type FormaFuncionamento = "diaria" | "cronograma";
export type FormaFuncionamentoRegra = FormaFuncionamento | "livre";

export const OFERTAS: readonly { slug: OfertaSlug; nome: string }[] = [
  { slug: "ei", nome: "Educação Infantil" },
  { slug: "ef", nome: "Ensino Fundamental" },
  { slug: "eja", nome: "EJA" },
];

export type OrganizacaoConfig = {
  codigo: string;
  ofertaSlug: OfertaSlug;
  nome: string;
  /** null = não exibir o código na tela. */
  codigoSere: string | null;
  formaFuncionamentoRegra: FormaFuncionamentoRegra;
  exigeCiclo: boolean;
};

// PROVISÓRIO: validar com P.O — mapeamento SERE da Educação Infantil (6005
// ou 6046) ainda não confirmado; até lá o código fica vazio e não aparece.
// PROVISÓRIO: validar com P.O — forma de funcionamento por organização.
export const ORGANIZACOES_CONFIG: readonly OrganizacaoConfig[] = [
  {
    codigo: "ei_estimulacao_essencial",
    ofertaSlug: "ei",
    nome: "Estimulação Essencial",
    codigoSere: null,
    formaFuncionamentoRegra: "diaria",
    exigeCiclo: false,
  },
  {
    codigo: "ei_pre_escolar",
    ofertaSlug: "ei",
    nome: "Pré-Escolar",
    codigoSere: null,
    formaFuncionamentoRegra: "diaria",
    exigeCiclo: false,
  },
  {
    codigo: "ef_ciclo_continuo",
    ofertaSlug: "ef",
    nome: "Ciclo Contínuo – Multietapas",
    codigoSere: "6053",
    formaFuncionamentoRegra: "diaria",
    exigeCiclo: true,
  },
  {
    codigo: "eja_fase_1",
    ofertaSlug: "eja",
    nome: "EJA Fase I",
    codigoSere: "6039",
    formaFuncionamentoRegra: "diaria",
    exigeCiclo: false,
  },
  {
    codigo: "eja_fase_1_especial",
    ofertaSlug: "eja",
    nome: "EJA Fase I – Educação Especial – Etapa Única",
    codigoSere: "6054",
    formaFuncionamentoRegra: "cronograma",
    exigeCiclo: false,
  },
  // Fora do escopo por enquanto — a estrutura curricular delas ainda não foi
  // definida, então não são ofertas selecionáveis:
  // { codigo: "apoio_ei_especializado", nome: "Apoio Educacional Infantil Especializado", codigoSere: "6036", ... },
  // { codigo: "curriculo_funcional", nome: "Programa Pedagógico do Currículo Funcional", codigoSere: "5110", formaFuncionamentoRegra: "livre", ... },
];

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
