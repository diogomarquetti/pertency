import { z } from "zod";

export const MEIO_COMUNICACAO_OPTIONS = [
  { value: "oral", label: "Oral" },
  { value: "gestual", label: "Gestual" },
  { value: "caa", label: "Comunicação Aumentativa e Alternativa (CAA)" },
  { value: "multimodal", label: "Multimodal" },
  { value: "outro", label: "Outro" },
] as const;

export const RECURSO_CAA_OPTIONS = [
  "Prancha",
  "PECS",
  "Pictogramas",
  "Aplicativo/dispositivo",
  "Outro",
] as const;

export const AVD_CHECKLIST_OPTIONS = [
  "Vestir-se",
  "Uso do banheiro",
  "Organização de materiais",
  "Organização da rotina",
  "Orientação no ambiente",
  "Outro",
] as const;

export const RECURSOS_ACESSIBILIDADE_OPTIONS = [
  "Comunicação alternativa",
  "Tecnologia assistiva",
  "Recurso visual",
  "Material adaptado",
  "Apoio de posicionamento",
  "Mobilidade",
  "Outro",
] as const;

// Nenhum campo do Bloco 2/3 é obrigatório na história (mesmo estilo de
// avaliacaoSchema) — os checklists condicionais (AVD, medicação) só
// controlam o que aparece na tela, não validação bloqueante.
export const perfilFuncionalSchema = z.object({
  meioComunicacao: z.string().optional().or(z.literal("")),
  recursosCaa: z.array(z.string()),
  apoioAlimentacao: z.boolean(),
  apoioHigiene: z.boolean(),
  apoioLocomocao: z.boolean(),
  apoioAvd: z.boolean(),
  apoioAvdChecklist: z.array(z.string()),
  alergiasRestricoes: z.string().optional().or(z.literal("")),
  necessitaMedicacao: z.boolean(),
  medicacaoDetalhes: z.string().optional().or(z.literal("")),
  recursosAcessibilidade: z.array(z.string()),
  outrasInformacoes: z.string().optional().or(z.literal("")),
  situacoesAtencao: z.string().optional().or(z.literal("")),
  oQueAjuda: z.string().optional().or(z.literal("")),
  segurancaCuidados: z.string().optional().or(z.literal("")),
});

export type PerfilFuncionalValues = z.infer<typeof perfilFuncionalSchema>;

export const PERFIL_FUNCIONAL_EMPTY_VALUES: PerfilFuncionalValues = {
  meioComunicacao: "",
  recursosCaa: [],
  apoioAlimentacao: false,
  apoioHigiene: false,
  apoioLocomocao: false,
  apoioAvd: false,
  apoioAvdChecklist: [],
  alergiasRestricoes: "",
  necessitaMedicacao: false,
  medicacaoDetalhes: "",
  recursosAcessibilidade: [],
  outrasInformacoes: "",
  situacoesAtencao: "",
  oQueAjuda: "",
  segurancaCuidados: "",
};
