import { z } from "zod";

// Ofertas são um catálogo global fixo (Educação Infantil / Ensino Fundamental
// / EJA Fase I) — a lista em si não muda por escola, só a organização, matriz
// e turmas vinculadas a cada uma. Slug é usado pra lógica condicional do
// formulário; ofertaId (uuid real, vindo de `referencia.ofertas`) é o que é
// persistido.
export const OFERTA_OPTIONS = [
  { slug: "ei", nome: "Educação Infantil" },
  { slug: "ef", nome: "Ensino Fundamental" },
  { slug: "eja", nome: "EJA Fase I" },
] as const;

export type OfertaSlug = (typeof OFERTA_OPTIONS)[number]["slug"];
const OFERTA_SLUGS = OFERTA_OPTIONS.map((o) => o.slug) as [OfertaSlug, ...OfertaSlug[]];

export const STATUS_OPTIONS = [
  { value: "ativa", label: "Ativa" },
  { value: "inativa", label: "Inativa" },
  { value: "encerrada", label: "Encerrada" },
] as const;

// Listas fechadas e universais da história (base BNCC) — não são
// customizáveis por escola, por isso ficam como const aqui em vez de tabela
// (mesmo padrão de FUNCAO_OPTIONS/STATUS_OPTIONS em usuarios/schema.ts).
export const CAMPOS_EXPERIENCIA = [
  "O eu, o outro e o nós",
  "Corpo, gestos e movimentos",
  "Escuta, fala, pensamento e imaginação",
  "Traços, sons, cores e formas",
  "Espaços, tempos, quantidades, relações e transformações",
] as const;

export const DIREITOS_APRENDIZAGEM = [
  "Conviver",
  "Brincar",
  "Participar",
  "Explorar",
  "Expressar",
  "Conhecer-se",
] as const;

export const EIXO_ESTRUTURANTE_EI = "Interações e Brincadeiras";

// Ensino Fundamental inclui Ensino Religioso; EJA Fase I não (ver "Áreas do
// conhecimento" nos itens 7.2 e 7.3 da história).
export const AREAS_CONHECIMENTO_EF = [
  "Linguagens",
  "Matemática",
  "Ciências da Natureza",
  "Ciências Humanas",
  "Ensino Religioso",
] as const;

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

// "Etapa do ciclo" (Bloco 3, Ensino Fundamental) é uma granularidade a mais
// que "Ciclo" (Bloco 2 — organização da oferta, já modelada por
// etapas_ciclos). Como os nomes de organização são seed fixo desta mesma
// migration, mapear por nome é seguro.
const ETAPAS_POR_CICLO: Record<string, readonly string[]> = {
  "1º Ciclo": ["1º ano", "2º ano", "3º ano"],
  "2º Ciclo": ["4º ano", "5º ano"],
};

export function getEtapasDoCiclo(organizacaoNome: string | undefined): readonly string[] {
  if (!organizacaoNome) return [];
  return ETAPAS_POR_CICLO[organizacaoNome] ?? [];
}

const turmaFields = {
  nome: z.string().min(1, "Informe o nome da turma"),
  anoLetivoId: z.uuid({ message: "Selecione o ano letivo" }),
  turnoId: z.uuid({ message: "Selecione o turno" }),
  capacidade: z.string().optional().or(z.literal("")),
  ofertaSlug: z.enum(OFERTA_SLUGS, { message: "Selecione a oferta" }),
  ofertaId: z.uuid({ message: "Selecione a oferta" }),
  organizacaoId: z.uuid({ message: "Selecione a organização da oferta" }),
  matrizCurricularId: z.uuid({ message: "Selecione a matriz curricular" }),
  status: z.enum(["ativa", "inativa", "encerrada"] as const),
  dataInicio: z.string().min(1, "Informe a data de início"),
  dataFim: z.string().optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),
  // Estrutura curricular (Bloco 3) — só os campos da oferta selecionada são
  // exigidos, ver withEstruturaCurricularRefinement abaixo.
  camposExperiencias: z.array(z.string()),
  direitosAprendizagem: z.array(z.string()),
  objetivoGeral: z.string().optional().or(z.literal("")),
  etapaDoCiclo: z.string().optional().or(z.literal("")),
  areasConhecimento: z.array(z.string()),
  componenteIds: z.array(z.uuid()),
  unidadesOcupacionais: z.array(z.string()),
  eixosFuncionais: z.array(z.string()),
};

type TurmaFieldsShape = {
  ofertaSlug: OfertaSlug;
  camposExperiencias: string[];
  direitosAprendizagem: string[];
  etapaDoCiclo?: string;
  areasConhecimento: string[];
  componenteIds: string[];
  unidadesOcupacionais: string[];
  eixosFuncionais: string[];
  dataInicio: string;
  dataFim?: string;
};

function withEstruturaCurricularRefinement<Schema extends z.ZodType<TurmaFieldsShape>>(
  schema: Schema,
) {
  return schema.superRefine((data, ctx) => {
    if (data.ofertaSlug === "ei") {
      if (data.camposExperiencias.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["camposExperiencias"],
          message: "Selecione ao menos um campo de experiência",
        });
      }
      if (data.direitosAprendizagem.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["direitosAprendizagem"],
          message: "Selecione ao menos um direito de aprendizagem",
        });
      }
    }

    if (data.ofertaSlug === "ef") {
      if (!data.etapaDoCiclo) {
        ctx.addIssue({ code: "custom", path: ["etapaDoCiclo"], message: "Selecione a etapa do ciclo" });
      }
      if (data.areasConhecimento.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["areasConhecimento"],
          message: "Selecione ao menos uma área do conhecimento",
        });
      }
      if (data.componenteIds.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["componenteIds"],
          message: "Selecione ao menos um componente curricular",
        });
      }
    }

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

    if (data.dataFim && data.dataInicio && data.dataFim <= data.dataInicio) {
      ctx.addIssue({
        code: "custom",
        path: ["dataFim"],
        message: "A data de término deve ser posterior à data de início",
      });
    }
  });
}

export const createTurmaSchema = withEstruturaCurricularRefinement(z.object({ ...turmaFields }));
export const updateTurmaSchema = withEstruturaCurricularRefinement(z.object({ ...turmaFields }));

export type CreateTurmaValues = z.infer<typeof createTurmaSchema>;
export type UpdateTurmaValues = z.infer<typeof updateTurmaSchema>;
