import { z } from "zod";

export const AREA_CONTRIBUICAO_OPTIONS = [
  { value: "servico_social", label: "Serviço Social" },
  { value: "psicologia", label: "Psicologia" },
  { value: "fonoaudiologia", label: "Fonoaudiologia" },
  { value: "fisioterapia", label: "Fisioterapia" },
  { value: "terapia_ocupacional", label: "Terapia Ocupacional" },
  { value: "pedagogia", label: "Pedagogia" },
  { value: "arte", label: "Arte" },
  { value: "educacao_fisica", label: "Educação Física" },
  { value: "outro", label: "Outro" },
] as const;

export const contribuicaoSchema = z.object({
  profissionalId: z.string().min(1, "Selecione o profissional"),
  areaContribuicao: z.string().min(1, "Selecione a área da contribuição"),
  observacoes: z.string().min(1, "Descreva a contribuição"),
  implicacoesParticipacao: z.string().optional().or(z.literal("")),
  recomendacoesEscolares: z.string().optional().or(z.literal("")),
});

export type ContribuicaoValues = z.infer<typeof contribuicaoSchema>;

export const CONTRIBUICAO_EMPTY_VALUES: ContribuicaoValues = {
  profissionalId: "",
  areaContribuicao: "",
  observacoes: "",
  implicacoesParticipacao: "",
  recomendacoesEscolares: "",
};
