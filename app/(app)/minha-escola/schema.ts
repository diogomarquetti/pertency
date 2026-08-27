import { z } from "zod";

// Catálogo provisório — INEP/MEC têm uma taxonomia oficial mais extensa
// para tipo/modalidade de escola; por ora só o valor já em uso no banco
// (registrado no bootstrap) + variações plausíveis, editável sem migration
// assim que o catálogo definitivo existir.
export const TIPO_ESCOLA_OPTIONS = [
  { value: "Escola de Educação Básica, Modalidade Educação Especial", label: "Escola de Educação Básica, Modalidade Educação Especial" },
  { value: "Escola de Educação Básica", label: "Escola de Educação Básica" },
] as const;

export const MODALIDADE_OPTIONS = [
  { value: "Educação Especial", label: "Educação Especial" },
  { value: "Educação Infantil", label: "Educação Infantil" },
  { value: "Ensino Fundamental", label: "Ensino Fundamental" },
] as const;

export const STATUS_OPTIONS = [
  { value: "ativa", label: "Ativa" },
  { value: "inativa", label: "Inativa" },
] as const;

export const UF_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
] as const;

const CEP_REGEX = /^\d{5}-\d{3}$/;

export const escolaSchema = z.object({
  // Bloco 1 — Identificação
  nomeOficial: z.string().min(1, "Informe o nome oficial"),
  nomeUsual: z.string().optional().or(z.literal("")),
  codigoEscola: z.string().optional().or(z.literal("")),
  tipoEscola: z.string().min(1, "Selecione o tipo de escola"),
  modalidade: z.string().min(1, "Selecione a modalidade"),
  nreReferencia: z.string().min(1, "Informe o NRE vinculado"),
  status: z.enum(["ativa", "inativa"] as const, { message: "Selecione o status" }),

  // Bloco 2 — Endereço e contato
  logradouro: z.string().min(1, "Informe o logradouro"),
  numero: z.string().min(1, "Informe o número"),
  complemento: z.string().optional().or(z.literal("")),
  bairro: z.string().min(1, "Informe o bairro"),
  cep: z.string().regex(CEP_REGEX, "Informe um CEP válido (00000-000)"),
  municipio: z.string().min(1, "Informe o município"),
  uf: z.string().length(2, "Selecione a UF"),
  foneInstitucional: z.string().min(1, "Informe o telefone institucional"),
  emailInstitucional: z.email({ message: "Informe um e-mail válido" }),

  // Bloco 3 — Responsáveis
  diretorNome: z.string().min(1, "Informe o nome do(a) diretor(a)"),
  diretorFone: z.string().min(1, "Informe o telefone do(a) diretor(a)"),
  diretorEmail: z.email({ message: "Informe um e-mail válido" }),
  coordenadorNome: z.string().min(1, "Informe o nome do(a) coordenador(a)"),
  coordenadorFone: z.string().min(1, "Informe o telefone do(a) coordenador(a)"),
  coordenadorEmail: z.email({ message: "Informe um e-mail válido" }),
});

export type EscolaValues = z.infer<typeof escolaSchema>;

const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

/** Validação de dígito verificador de CNPJ (algoritmo padrão), não só formato. */
function isValidCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  function calcDigit(base: string, weights: number[]): number {
    const sum = weights.reduce((acc, weight, i) => acc + Number(base[i]) * weight, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  }

  const digit1 = calcDigit(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (digit1 !== Number(digits[12])) return false;

  const digit2 = calcDigit(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (digit2 !== Number(digits[13])) return false;

  return true;
}

/** Validação de dígito verificador de CPF (algoritmo padrão), não só formato. */
function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  function calcDigit(base: string, factor: number): number {
    let sum = 0;
    for (let i = 0; i < factor - 1; i++) {
      sum += Number(base[i]) * (factor - i);
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  }

  const digit1 = calcDigit(digits, 10);
  if (digit1 !== Number(digits[9])) return false;

  const digit2 = calcDigit(digits, 11);
  if (digit2 !== Number(digits[10])) return false;

  return true;
}

export const mantenedoraSchema = z.object({
  // Bloco 1 — Identificação
  razaoSocial: z.string().min(1, "Informe a razão social"),
  nomeFantasia: z.string().min(1, "Informe o nome fantasia"),
  cnpj: z
    .string()
    .regex(CNPJ_REGEX, "Informe um CNPJ válido (00.000.000/0000-00)")
    .refine(isValidCNPJ, "CNPJ inválido"),

  // Bloco 2 — Endereço e contato
  logradouro: z.string().min(1, "Informe o logradouro"),
  numero: z.string().min(1, "Informe o número"),
  complemento: z.string().optional().or(z.literal("")),
  bairro: z.string().min(1, "Informe o bairro"),
  cep: z.string().regex(CEP_REGEX, "Informe um CEP válido (00000-000)"),
  municipio: z.string().min(1, "Informe o município"),
  uf: z.string().length(2, "Selecione a UF"),
  foneInstitucional: z.string().min(1, "Informe o telefone institucional"),
  whatsappInstitucional: z.string().optional().or(z.literal("")),
  emailInstitucional: z.email({ message: "Informe um e-mail válido" }),
  site: z.string().optional().or(z.literal("")),

  // Bloco 3 — Representação legal
  presidenteNome: z.string().min(1, "Informe o nome do(a) presidente"),
  presidenteCpf: z
    .string()
    .regex(CPF_REGEX, "Informe um CPF válido (000.000.000-00)")
    .refine(isValidCPF, "CPF inválido"),
  presidenteFone: z.string().min(1, "Informe o telefone do(a) presidente"),
  presidenteEmail: z.email({ message: "Informe um e-mail válido" }),

  // Bloco 4 — Situação
  status: z.enum(["ativa", "inativa"] as const, { message: "Selecione o status" }),
});

export type MantenedoraValues = z.infer<typeof mantenedoraSchema>;
