import { z } from "zod";

// Lista provisória — a HU pede "lista parametrizável pela escola", mas ainda
// não existe módulo de Configurações. Mesmo tratamento dado a
// FORMA_INGRESSO_OPTIONS/MOTIVO_ENCERRAMENTO_OPTIONS (dados-escolares-schema.ts).
export const TIPO_CONDICAO_OPTIONS = [
  { value: "tea", label: "TEA" },
  { value: "deficiencia_intelectual", label: "Deficiência Intelectual" },
  { value: "deficiencia_fisica", label: "Deficiência Física" },
  { value: "deficiencia_multipla", label: "Deficiência Múltipla" },
  { value: "deficiencia_visual", label: "Deficiência Visual" },
  { value: "deficiencia_auditiva", label: "Deficiência Auditiva" },
  { value: "outra", label: "Outra" },
] as const;

export const condicaoSchema = z.object({
  tipoCondicao: z.string().min(1, "Selecione o tipo de condição"),
  documentoId: z.string().optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),
  cid: z.string().optional().or(z.literal("")),
});

export type CondicaoValues = z.infer<typeof condicaoSchema>;

export const CONDICAO_EMPTY_VALUES: CondicaoValues = {
  tipoCondicao: "",
  documentoId: "",
  observacoes: "",
  cid: "",
};
