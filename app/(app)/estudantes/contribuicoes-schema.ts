import { z } from "zod";

import { AREA_ATUACAO_OPTIONS } from "@/lib/area-atuacao";

// Mesma lista da "Área de atuação" do Cadastro de Usuário — ver lib/area-atuacao.ts.
export const AREA_CONTRIBUICAO_OPTIONS = AREA_ATUACAO_OPTIONS;

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
