import { z } from "zod";

export const STATUS_AVALIACAO_OPTIONS = [
  { value: "nao_iniciada", label: "Não iniciada" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluida", label: "Concluída" },
  { value: "reaberta", label: "Reaberta" },
] as const;

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
// pessoais), aqui nada é obrigatório no schema. A história não pede bloqueio
// de campo a campo, só que a recomendação final seja Elegível/Não elegível
// quando a avaliação for concluída (isso fica a critério de quem preenche,
// não é validado à força).
export const avaliacaoSchema = z.object({
  equipeResponsavelIds: z.array(z.string()),
  ofertaPretendidaId: z.string().optional().or(z.literal("")),
  organizacaoPretendidaId: z.string().optional().or(z.literal("")),
  dataInicio: z.string().optional().or(z.literal("")),
  dataTermino: z.string().optional().or(z.literal("")),
  statusAvaliacao: z.enum(["nao_iniciada", "em_andamento", "concluida", "reaberta"]),

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

export type AvaliacaoValues = z.infer<typeof avaliacaoSchema>;

export const AVALIACAO_EMPTY_VALUES: AvaliacaoValues = {
  equipeResponsavelIds: [],
  ofertaPretendidaId: "",
  organizacaoPretendidaId: "",
  dataInicio: "",
  dataTermino: "",
  statusAvaliacao: "nao_iniciada",
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
