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

export const STATUS_AVALIACAO_EDITAVEIS = ["rascunho", "em_andamento", "concluida"] as const;

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
// equipe pedagógica ao longo de várias sessões — diferente da Aba 1 (Dados
// pessoais), quase nada é obrigatório no schema. A exceção é a decisão final:
// Elegibilidade e Justificativa só são editáveis com o status "Concluída" e,
// nesse status, passam a ser obrigatórias (ver superRefine abaixo).
const avaliacaoFields = z.object({
  equipeResponsavelIds: z.array(z.string()),
  ofertaPretendidaId: z.string().optional().or(z.literal("")),
  organizacaoPretendidaId: z.string().optional().or(z.literal("")),
  dataInicio: z.string().optional().or(z.literal("")),
  dataTermino: z.string().optional().or(z.literal("")),
  statusAvaliacao: z.enum(STATUS_AVALIACAO_EDITAVEIS),

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
  assinaturas: z.string().optional().or(z.literal("")),
});

export const avaliacaoSchema = avaliacaoFields.superRefine((data, ctx) => {
  if (data.statusAvaliacao !== "concluida") return;
  if (!data.recomendacaoElegibilidade) {
    ctx.addIssue({
      code: "custom",
      path: ["recomendacaoElegibilidade"],
      message: "Informe a recomendação de elegibilidade para concluir a avaliação",
    });
  }
  if (!data.justificativaElegibilidade?.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["justificativaElegibilidade"],
      message: "Informe a justificativa para concluir a avaliação",
    });
  }
});

/** Elegibilidade/Justificativa/Encaminhamento só são editáveis com a avaliação concluída. */
export function decisaoFinalLiberada(statusAvaliacao: string) {
  return statusAvaliacao === "concluida";
}

export type AvaliacaoValues = z.infer<typeof avaliacaoSchema>;

export const AVALIACAO_EMPTY_VALUES: AvaliacaoValues = {
  equipeResponsavelIds: [],
  ofertaPretendidaId: "",
  organizacaoPretendidaId: "",
  dataInicio: "",
  dataTermino: "",
  statusAvaliacao: "rascunho",
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
  assinaturas: "",
};
