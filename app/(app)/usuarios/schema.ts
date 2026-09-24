import { z } from "zod";

import { AREA_ATUACAO_LABEL } from "@/lib/area-atuacao";

export const FUNCAO_OPTIONS = [
  { value: "administrador", label: "Administrador" },
  { value: "direcao", label: "Direção" },
  { value: "secretaria", label: "Secretaria" },
  { value: "coordenacao_pedagogica", label: "Coordenação Pedagógica" },
  { value: "professor_regente", label: "Professor(a) Regente" },
  { value: "professor_arte", label: "Professor(a) de Arte" },
  { value: "professor_educacao_fisica", label: "Professor(a) de Educação Física" },
  { value: "profissional_complementar", label: "Profissional Complementar" },
] as const;

const FUNCAO_VALUES = FUNCAO_OPTIONS.map((option) => option.value) as [
  string,
  ...string[],
];

const PROFESSOR_FUNCOES = new Set([
  "professor_regente",
  "professor_arte",
  "professor_educacao_fisica",
]);

export function isFuncaoProfessor(funcao: string) {
  return PROFESSOR_FUNCOES.has(funcao);
}

export const FUNCAO_LABEL: Record<string, string> = Object.fromEntries(
  FUNCAO_OPTIONS.map((option) => [option.value, option.label]),
);

// Perfis cujo nome não diz o que a pessoa faz — ganham o campo "Área de
// atuação". Obrigatório só pra Profissional Complementar (o perfil é vago
// demais sozinho); pra Administrador/Direção é opcional.
const FUNCOES_COM_AREA_ATUACAO = new Set(["profissional_complementar", "administrador", "direcao"]);

export function funcaoTemAreaAtuacao(funcao: string) {
  return FUNCOES_COM_AREA_ATUACAO.has(funcao);
}

export function funcaoExigeAreaAtuacao(funcao: string) {
  return funcao === "profissional_complementar";
}

/**
 * Como a função da pessoa aparece em relatórios (Equipe responsável,
 * Participantes da Avaliação): a área de atuação quando preenchida
 * ("Fonoaudiologia"), senão o perfil de acesso ("Coordenação Pedagógica").
 */
export function funcaoExibicao(usuario: {
  funcao: string;
  area_atuacao?: string | null;
  area_atuacao_outro?: string | null;
}) {
  if (usuario.area_atuacao && funcaoTemAreaAtuacao(usuario.funcao)) {
    if (usuario.area_atuacao === "outro") {
      return usuario.area_atuacao_outro?.trim() || FUNCAO_LABEL[usuario.funcao] || usuario.funcao;
    }
    return AREA_ATUACAO_LABEL[usuario.area_atuacao] ?? usuario.area_atuacao;
  }
  return FUNCAO_LABEL[usuario.funcao] ?? usuario.funcao;
}

export const STATUS_OPTIONS = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
] as const;

// Campos dos blocos Dados gerais e Acesso. Vínculos de turma não fazem
// parte do cadastro de usuário: são criados só no Cadastro de Turma
// (Professores vinculados) e aqui aparecem apenas para consulta.
//
// Sem campo de senha: o acesso do usuário é sempre provisionado por link
// (generateLink 'invite' na criação, 'recovery' na edição) — ver actions.ts.
const usuarioFields = {
  nomeCompleto: z.string().min(1, "Informe o nome completo"),
  email: z.email({ message: "Informe um e-mail válido" }),
  telefone: z.string().optional().or(z.literal("")),
  funcao: z.enum(FUNCAO_VALUES, { message: "Selecione a função" }),
  areaAtuacao: z.string().optional().or(z.literal("")),
  areaAtuacaoOutro: z.string().optional().or(z.literal("")),
  status: z.enum(["ativo", "inativo"] as const),
  emailLogin: z.email({ message: "Informe um e-mail de login válido" }),
};

function withUsuarioRefinements<
  Schema extends z.ZodType<{
    funcao: string;
    areaAtuacao?: string;
    areaAtuacaoOutro?: string;
  }>,
>(schema: Schema) {
  return schema.superRefine((data, ctx) => {
    if (funcaoExigeAreaAtuacao(data.funcao) && !data.areaAtuacao) {
      ctx.addIssue({
        code: "custom",
        path: ["areaAtuacao"],
        message: "Selecione a área de atuação",
      });
    }
    if (
      funcaoTemAreaAtuacao(data.funcao) &&
      data.areaAtuacao === "outro" &&
      !data.areaAtuacaoOutro?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["areaAtuacaoOutro"],
        message: "Especifique a área de atuação",
      });
    }
  });
}

export const createUsuarioSchema = withUsuarioRefinements(z.object({ ...usuarioFields }));
export const updateUsuarioSchema = withUsuarioRefinements(z.object({ ...usuarioFields }));

export type CreateUsuarioValues = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioValues = z.infer<typeof updateUsuarioSchema>;
