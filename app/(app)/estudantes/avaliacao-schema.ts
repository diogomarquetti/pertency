import { z } from "zod";

// Retificada e Cancelada são definidos pelo sistema (fluxos "Retificar
// avaliação" e "Cancelar avaliação"); no select só aparecem os três
// primeiros. Não existe mais "Reaberta": avaliação concluída é imutável.
export const STATUS_AVALIACAO_OPTIONS = [
  { value: "rascunho", label: "Rascunho" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluida", label: "Concluída" },
  { value: "retificada", label: "Retificada" },
  { value: "cancelada", label: "Cancelada" },
] as const;

/** Inclui os status antigos, que ainda aparecem no histórico de alterações. */
export const STATUS_AVALIACAO_LABEL: Record<string, string> = {
  ...Object.fromEntries(STATUS_AVALIACAO_OPTIONS.map((option) => [option.value, option.label])),
  nao_iniciada: "Não iniciada",
  reaberta: "Reaberta",
};

/** Rascunho e Em andamento são editáveis; Concluída, Retificada e Cancelada, não. */
export function avaliacaoEditavel(statusAvaliacao: string) {
  return statusAvaliacao === "rascunho" || statusAvaliacao === "em_andamento";
}

/** Secretaria não compõe a equipe responsável da Avaliação de Ingresso (pedido do P.O, 2026-10-29). */
export function podeComporEquipe(perfil: string) {
  return perfil !== "secretaria";
}

export const NIVEL_APOIO_OPTIONS = [
  { value: "intermitente", label: "Intermitente" },
  { value: "limitado", label: "Limitado" },
  { value: "extensivo", label: "Extensivo" },
  { value: "pervasivo", label: "Pervasivo" },
] as const;

export const RECOMENDACAO_OPTIONS = [
  { value: "elegivel", label: "Elegível" },
  { value: "nao_elegivel", label: "Não elegível" },
] as const;

export const AREA_APOIO_OPTIONS = [
  "Acadêmica",
  "Comunicacional",
  "Motora",
  "Social",
  "Comportamental",
  "Autonomia e vida diária",
] as const;

export const ENCAMINHAMENTO_OPTIONS = [
  { value: "efetivar_matricula", label: "Efetivar matrícula" },
  { value: "rede_regular_com_apoios", label: "Rede regular com apoios" },
  { value: "orientar_familia", label: "Orientar família" },
  { value: "solicitar_complementacao", label: "Solicitar complementação" },
  { value: "outro", label: "Outro" },
] as const;

// A Avaliação de Ingresso é um formulário longo, preenchido aos poucos pela
// equipe pedagógica ao longo de várias sessões: o schema não exige nada, dá
// pra salvar rascunho parcial a qualquer momento. O status NÃO é escolhido
// pelo usuário (decisão do P.O, 2026-11-10): é calculado ao salvar por
// `statusAutomatico` — "Concluída" quando todos os campos mínimos estão
// preenchidos (e quem salva pode concluir), senão Em andamento/Rascunho.
const avaliacaoFields = z.object({
  equipeResponsavelIds: z.array(z.string()),
  ofertaPretendidaId: z.string().optional().or(z.literal("")),
  organizacaoPretendidaId: z.string().optional().or(z.literal("")),
  dataInicio: z.string().optional().or(z.literal("")),
  dataTermino: z.string().optional().or(z.literal("")),

  historicoEscolar: z.string().optional().or(z.literal("")),
  informacoesFamilia: z.string().optional().or(z.literal("")),
  contextoSociocultural: z.string().optional().or(z.literal("")),

  habilidadesConceituais: z.string().optional().or(z.literal("")),
  habilidadesSociais: z.string().optional().or(z.literal("")),
  habilidadesPraticas: z.string().optional().or(z.literal("")),
  dimensaoParticipacao: z.string().optional().or(z.literal("")),

  contextoEscolar: z.string().optional().or(z.literal("")),
  contextoFamiliar: z.string().optional().or(z.literal("")),
  contextoComunitario: z.string().optional().or(z.literal("")),
  fatoresFacilitadores: z.string().optional().or(z.literal("")),
  barreirasIdentificadas: z.string().optional().or(z.literal("")),

  necessidadesEspecificas: z.string().optional().or(z.literal("")),
  nivelApoio: z.string().optional().or(z.literal("")),
  areasApoio: z.array(z.string()),
  parecerEquipe: z.string().optional().or(z.literal("")),
  recomendacaoElegibilidade: z.string().optional().or(z.literal("")),
  justificativaElegibilidade: z.string().optional().or(z.literal("")),
  encaminhamentoRecomendado: z.string().optional().or(z.literal("")),
  orientacoesPai: z.string().optional().or(z.literal("")),
});

export const avaliacaoSchema = avaliacaoFields;

// Campos mínimos para a avaliação passar sozinha para "Concluída".
// PROVISÓRIO: validar com P.O — equipe, oferta/organização pretendidas,
// parecer, recomendação de elegibilidade, justificativa e encaminhamento.
// Orientações para o PAI, necessidades, nível de apoio e as dimensões
// continuam opcionais.
const CAMPOS_MINIMOS: { rotulo: string; preenchido: (v: AvaliacaoValues) => boolean }[] = [
  { rotulo: "Equipe responsável", preenchido: (v) => v.equipeResponsavelIds.length > 0 },
  { rotulo: "Oferta pretendida", preenchido: (v) => !!v.ofertaPretendidaId },
  { rotulo: "Organização pretendida", preenchido: (v) => !!v.organizacaoPretendidaId },
  { rotulo: "Parecer da equipe", preenchido: (v) => !!v.parecerEquipe?.trim() },
  { rotulo: "Recomendação de elegibilidade", preenchido: (v) => !!v.recomendacaoElegibilidade },
  { rotulo: "Justificativa", preenchido: (v) => !!v.justificativaElegibilidade?.trim() },
  { rotulo: "Encaminhamento recomendado", preenchido: (v) => !!v.encaminhamentoRecomendado },
];

/** Rótulos dos campos mínimos que ainda faltam (vazio = pronta para concluir). */
export function camposFaltantesConclusao(values: AvaliacaoValues) {
  return CAMPOS_MINIMOS.filter((campo) => !campo.preenchido(values)).map((campo) => campo.rotulo);
}

const CAMPOS_DE_CONTEUDO = [
  "historicoEscolar", "informacoesFamilia", "contextoSociocultural",
  "habilidadesConceituais", "habilidadesSociais", "habilidadesPraticas", "dimensaoParticipacao",
  "contextoEscolar", "contextoFamiliar", "contextoComunitario", "fatoresFacilitadores",
  "barreirasIdentificadas", "necessidadesEspecificas", "nivelApoio", "parecerEquipe",
  "recomendacaoElegibilidade", "justificativaElegibilidade", "encaminhamentoRecomendado", "orientacoesPai",
] as const;

/**
 * Status calculado ao salvar. Concluída só se todos os mínimos estão
 * preenchidos E quem salva pode concluir (Pedagogo(a)/Administrador — regra
 * do banco); sem permissão, a avaliação completa fica Em andamento aguardando
 * conclusão. Nunca volta de Em andamento para Rascunho.
 */
export function statusAutomatico(
  values: AvaliacaoValues,
  statusAtual: string | null,
  podeConcluir: boolean,
): "rascunho" | "em_andamento" | "concluida" {
  if (podeConcluir && camposFaltantesConclusao(values).length === 0) return "concluida";
  const temConteudo =
    CAMPOS_DE_CONTEUDO.some((campo) => !!values[campo]?.trim()) || values.areasApoio.length > 0;
  return temConteudo || statusAtual === "em_andamento" ? "em_andamento" : "rascunho";
}

export type AvaliacaoValues = z.infer<typeof avaliacaoSchema>;

export const AVALIACAO_EMPTY_VALUES: AvaliacaoValues = {
  equipeResponsavelIds: [],
  ofertaPretendidaId: "",
  organizacaoPretendidaId: "",
  dataInicio: "",
  dataTermino: "",
  historicoEscolar: "",
  informacoesFamilia: "",
  contextoSociocultural: "",
  habilidadesConceituais: "",
  habilidadesSociais: "",
  habilidadesPraticas: "",
  dimensaoParticipacao: "",
  contextoEscolar: "",
  contextoFamiliar: "",
  contextoComunitario: "",
  fatoresFacilitadores: "",
  barreirasIdentificadas: "",
  necessidadesEspecificas: "",
  nivelApoio: "",
  areasApoio: [],
  parecerEquipe: "",
  recomendacaoElegibilidade: "",
  justificativaElegibilidade: "",
  encaminhamentoRecomendado: "",
  orientacoesPai: "",
};
