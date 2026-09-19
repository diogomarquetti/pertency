import { z } from "zod";

import { CPF_REGEX, isValidCPF } from "@/lib/utils";

export const SITUACAO_OPTIONS = [
  { value: "em_analise_de_ingresso", label: "Em análise de ingresso" },
  { value: "ativo", label: "Ativo" },
  { value: "nao_elegivel", label: "Não elegível" },
  { value: "transferido", label: "Transferido" },
  { value: "desligado", label: "Desligado" },
  { value: "inativo", label: "Inativo" },
] as const;

const SITUACAO_VALUES = SITUACAO_OPTIONS.map((option) => option.value) as [string, ...string[]];

export const SITUACAO_LABEL: Record<string, string> = Object.fromEntries(
  SITUACAO_OPTIONS.map((option) => [option.value, option.label]),
);

// Usado tanto na listagem quanto no Perfil do Estudante — cores semânticas
// por situação, mesmo critério nos dois lugares.
export const SITUACAO_BADGE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  em_analise_de_ingresso: "warning",
  ativo: "success",
  nao_elegivel: "danger",
  transferido: "neutral",
  desligado: "neutral",
  inativo: "neutral",
};

export const SEXO_OPTIONS = [
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
  { value: "outro", label: "Outro" },
  { value: "nao_informado", label: "Não informado" },
] as const;

export const COR_RACA_OPTIONS = [
  { value: "branca", label: "Branca" },
  { value: "preta", label: "Preta" },
  { value: "parda", label: "Parda" },
  { value: "amarela", label: "Amarela" },
  { value: "indigena", label: "Indígena" },
  { value: "nao_informada", label: "Não informada" },
] as const;

export const UF_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR",
  "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export const TIPO_DOCUMENTO_OPTIONS = [
  { value: "rg", label: "RG" },
  { value: "certidao_nascimento", label: "Certidão de Nascimento" },
  { value: "certidao_casamento", label: "Certidão de Casamento" },
] as const;

export const PARENTESCO_OPTIONS = [
  "Mãe",
  "Pai",
  "Avó",
  "Avô",
  "Tio(a)",
  "Irmão(ã)",
  "Tutor(a) legal",
  "Outro",
] as const;

// CPF fica opcional nesta fase — a história permite tratá-lo como "pendência
// documental" (regra 4 da Aba 1), mas o mecanismo de pendência é da Aba
// Documentos. Tipo de documento/Número/Órgão emissor substituem os antigos
// campos soltos RG e Certidão de nascimento (HU-EST-001 v2.0, seção 10.2):
// um único documento de identificação por estudante, com Órgão emissor/UF
// exigido só quando o tipo é RG (regra em withDocumentoIdentificacaoRefinement).
const estudanteFields = {
  nomeCompleto: z.string().min(1, "Informe o nome completo"),
  nomeSocial: z.string().optional().or(z.literal("")),
  situacao: z.enum(SITUACAO_VALUES),
  dataNascimento: z
    .string()
    .min(1, "Informe a data de nascimento")
    .refine(
      (valor) => valor <= new Date().toISOString().slice(0, 10),
      "A data de nascimento não pode ser uma data futura",
    ),
  sexo: z.string().min(1, "Selecione o sexo"),
  corRaca: z.string().min(1, "Selecione a cor/raça"),
  nacionalidade: z.string().min(1, "Informe a nacionalidade"),
  naturalidade: z.string().min(1, "Informe a naturalidade"),
  cpf: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (valor) => !valor || (CPF_REGEX.test(valor) && isValidCPF(valor)),
      "Informe um CPF válido (000.000.000-00)",
    ),
  tipoDocumentoIdentificacao: z.string().min(1, "Selecione o tipo de documento de identificação"),
  numeroDocumento: z.string().min(1, "Informe o número do documento"),
  orgaoEmissorUf: z.string().optional().or(z.literal("")),

  enderecoLogradouro: z.string().min(1, "Informe o logradouro"),
  enderecoNumero: z.string().min(1, "Informe o número"),
  enderecoComplemento: z.string().optional().or(z.literal("")),
  enderecoBairro: z.string().min(1, "Informe o bairro"),
  enderecoCep: z.string().min(1, "Informe o CEP"),
  enderecoMunicipio: z.string().min(1, "Informe o município"),
  enderecoUf: z.string().min(1, "Selecione a UF"),

  responsavelPrincipalNome: z.string().min(1, "Informe o responsável principal"),
  responsavelPrincipalParentesco: z.string().min(1, "Informe o parentesco"),
  responsavelPrincipalTelefone: z.string().min(1, "Informe o telefone principal"),
  segundoResponsavelNome: z.string().optional().or(z.literal("")),
  segundoResponsavelParentesco: z.string().optional().or(z.literal("")),
  segundoResponsavelTelefone: z.string().optional().or(z.literal("")),
  filiacao: z.string().min(1, "Informe a filiação"),
  quemPodeRetirar: z.string().min(1, "Informe quem pode retirar o estudante"),
  contatoEmergenciaNome: z.string().min(1, "Informe o nome do contato de emergência"),
  contatoEmergenciaTelefone: z.string().min(1, "Informe o telefone do contato de emergência"),
};

// Órgão emissor/UF só faz sentido pra RG — Certidão de Nascimento/Casamento
// não têm esse campo (CA04/CA05 da HU-EST-001 v2.0).
function withDocumentoIdentificacaoRefinement<
  Schema extends z.ZodType<{ tipoDocumentoIdentificacao: string; orgaoEmissorUf?: string }>,
>(schema: Schema) {
  return schema.superRefine((data, ctx) => {
    if (data.tipoDocumentoIdentificacao === "rg" && !data.orgaoEmissorUf) {
      ctx.addIssue({
        code: "custom",
        path: ["orgaoEmissorUf"],
        message: "Informe o órgão emissor/UF",
      });
    }
  });
}

export const createEstudanteSchema = withDocumentoIdentificacaoRefinement(
  z.object({ ...estudanteFields }),
);
export const updateEstudanteSchema = withDocumentoIdentificacaoRefinement(
  z.object({ ...estudanteFields }),
);

export type CreateEstudanteValues = z.infer<typeof createEstudanteSchema>;
export type UpdateEstudanteValues = z.infer<typeof updateEstudanteSchema>;

/** Idade calculada a partir da data de nascimento — nunca fica em coluna própria. */
export function calcularIdade(dataNascimento: string): number | null {
  if (!dataNascimento) return null;
  const nascimento = new Date(dataNascimento);
  if (Number.isNaN(nascimento.getTime())) return null;

  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade -= 1;

  return idade >= 0 ? idade : null;
}
