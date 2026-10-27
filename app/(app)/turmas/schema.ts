import { z } from "zod";

import { OFERTAS, getEtapasDoCicloEf, type OfertaSlug } from "@/lib/ofertas-config";

// Ofertas, organizações e as regras de cada uma vêm da configuração central
// (lib/ofertas-config.ts). Slug é usado pra lógica condicional do
// formulário; ofertaId (uuid real, vindo de `referencia.ofertas`) é o que é
// persistido.
export const OFERTA_OPTIONS = OFERTAS;
export type { OfertaSlug };
const OFERTA_SLUGS = OFERTAS.map((o) => o.slug) as [OfertaSlug, ...OfertaSlug[]];

export const STATUS_OPTIONS = [
  { value: "ativa", label: "Ativa" },
  { value: "inativa", label: "Inativa" },
  { value: "encerrada", label: "Encerrada" },
] as const;

// Estrutura curricular da EJA continua sendo escolhida na turma (fora do
// escopo do retorno do P.O de 2026-10-27). EI e EF passaram a vir da matriz
// curricular vinculada — ver matrizes_curriculares / matriz_componentes.
export const AREAS_CONHECIMENTO_EJA = [
  "Linguagens",
  "Matemática",
  "Ciências da Natureza",
  "Ciências Humanas",
] as const;

export const UNIDADES_OCUPACIONAIS = [
  "Unidade Ocupacional de Produção",
  "Unidade Ocupacional de Formação Inicial",
] as const;

export const EIXOS_FUNCIONAIS = [
  "Comunicação funcional",
  "Leitura e escrita funcional",
  "Matemática funcional",
  "Autonomia e vida diária",
  "Vida em comunidade",
  "Mundo do trabalho",
  "Segurança e autocuidado",
] as const;

const turmaFields = {
  nome: z.string().min(1, "Informe o nome da turma"),
  anoLetivoId: z.uuid({ message: "Selecione o ano letivo" }),
  turnoId: z.uuid({ message: "Selecione o turno" }),
  capacidade: z.string().optional().or(z.literal("")),
  ofertaSlug: z.enum(OFERTA_SLUGS, { message: "Selecione a oferta" }),
  ofertaId: z.uuid({ message: "Selecione a oferta" }),
  organizacaoId: z.uuid({ message: "Selecione a organização da oferta" }),
  // Ensino Fundamental: ciclo + etapas (seleção múltipla), no bloco 2.
  ciclo: z.string().optional().or(z.literal("")),
  etapas: z.array(z.number().int()),
  matrizCurricularId: z.uuid({ message: "Selecione a matriz curricular" }),
  formaFuncionamento: z.enum(["diaria", "cronograma"] as const, {
    message: "Selecione a forma de funcionamento",
  }),
  status: z.enum(["ativa", "inativa", "encerrada"] as const),
  dataInicio: z.string().min(1, "Informe a data de início"),
  dataFim: z.string().optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),
  // Educação Infantil: só o objetivo geral continua editável na turma.
  objetivoGeral: z.string().optional().or(z.literal("")),
  // EJA — ver withEstruturaCurricularRefinement.
  areasConhecimento: z.array(z.string()),
  componenteIds: z.array(z.uuid()),
  unidadesOcupacionais: z.array(z.string()),
  eixosFuncionais: z.array(z.string()),
  // Cronograma de atendimento — só quando formaFuncionamento = cronograma.
  cronogramaDias: z.array(z.number().int()),
  cronogramaHoraInicio: z.string().optional().or(z.literal("")),
  cronogramaHoraFim: z.string().optional().or(z.literal("")),
};

type TurmaFieldsShape = {
  ofertaSlug: OfertaSlug;
  ciclo?: string;
  etapas: number[];
  formaFuncionamento: "diaria" | "cronograma";
  areasConhecimento: string[];
  unidadesOcupacionais: string[];
  eixosFuncionais: string[];
  cronogramaDias: number[];
  cronogramaHoraInicio?: string;
  cronogramaHoraFim?: string;
  dataInicio: string;
  dataFim?: string;
};

/**
 * Regras dos blocos 1 e 2 (os que existem na criação) — o ciclo e as
 * etapas do Ensino Fundamental moram no bloco 2.
 */
function refineOfertaOrganizacao(data: TurmaFieldsShape, ctx: z.RefinementCtx) {
  if (data.ofertaSlug === "ef") {
    const ciclo = Number(data.ciclo);
    if (!data.ciclo) {
      ctx.addIssue({ code: "custom", path: ["ciclo"], message: "Selecione o ciclo" });
    } else if (data.etapas.length === 0) {
      ctx.addIssue({ code: "custom", path: ["etapas"], message: "Selecione ao menos uma etapa" });
    } else if (data.etapas.some((etapa) => !getEtapasDoCicloEf(ciclo).includes(etapa))) {
      ctx.addIssue({ code: "custom", path: ["etapas"], message: "Etapa fora do ciclo selecionado" });
    }
  }
}

/** Regras dos blocos que só existem na página de edição (3, 4 e 7). */
function refineEdicao(data: TurmaFieldsShape, ctx: z.RefinementCtx) {
  if (data.ofertaSlug === "eja") {
    if (data.areasConhecimento.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["areasConhecimento"],
        message: "Selecione ao menos uma área do conhecimento",
      });
    }
    if (data.unidadesOcupacionais.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["unidadesOcupacionais"],
        message: "Selecione ao menos uma unidade ocupacional",
      });
    }
    if (data.eixosFuncionais.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["eixosFuncionais"],
        message: "Selecione ao menos um eixo funcional",
      });
    }
  }

  if (data.formaFuncionamento === "cronograma") {
    if (data.cronogramaDias.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["cronogramaDias"],
        message: "Selecione ao menos um dia de atendimento",
      });
    }
    if (!data.cronogramaHoraInicio) {
      ctx.addIssue({ code: "custom", path: ["cronogramaHoraInicio"], message: "Informe o horário inicial" });
    }
    if (!data.cronogramaHoraFim) {
      ctx.addIssue({ code: "custom", path: ["cronogramaHoraFim"], message: "Informe o horário final" });
    } else if (data.cronogramaHoraInicio && data.cronogramaHoraFim <= data.cronogramaHoraInicio) {
      ctx.addIssue({
        code: "custom",
        path: ["cronogramaHoraFim"],
        message: "O horário final deve ser depois do inicial",
      });
    }
  }

  if (data.dataFim && data.dataInicio && data.dataFim <= data.dataInicio) {
    ctx.addIssue({
      code: "custom",
      path: ["dataFim"],
      message: "A data de término deve ser posterior à data de início",
    });
  }
}

// Criação (página /turmas/novo) só tem os blocos 1 e 2; a estrutura da
// EJA e o cronograma são completados na página de edição, logo depois.
export const createTurmaSchema = z.object({ ...turmaFields }).superRefine(refineOfertaOrganizacao);
export const updateTurmaSchema = z.object({ ...turmaFields }).superRefine((data, ctx) => {
  refineOfertaOrganizacao(data, ctx);
  refineEdicao(data, ctx);
});

export type CreateTurmaValues = z.infer<typeof createTurmaSchema>;
export type UpdateTurmaValues = z.infer<typeof updateTurmaSchema>;

/** "3 vezes por semana" — frequência semanal é calculada, não gravada. */
export function frequenciaSemanalLabel(dias: number) {
  if (dias === 0) return "—";
  return `${dias} ${dias === 1 ? "vez" : "vezes"} por semana`;
}
