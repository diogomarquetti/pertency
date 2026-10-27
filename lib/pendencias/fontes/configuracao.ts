import { cache } from "react";
import type { ZodType } from "zod";

import { getEscolaAtualCompleta, getMantenedoraAtual } from "@/app/(app)/minha-escola/queries";
import { escolaSchema, mantenedoraSchema } from "@/app/(app)/minha-escola/schema";
import { createClient } from "@/lib/supabase/server";

/**
 * Cadastro da Escola e da Mantenedora com o que falta em cada um — fonte do
 * tipo cadastro_institucional_incompleto e do painel "Configuração da escola".
 */

export type CadastroInstitucional = {
  id: string;
  /** Rótulos agrupados do que está vazio ou inválido. */
  faltando: string[];
  createdAt: string;
};

// Mesma validação dos formulários de Configurações: se o formulário passar a
// exigir um campo, a pendência acompanha. Campo vazio ou inválido conta.
const CAMPOS_ESCOLA: Record<string, string> = {
  nomeOficial: "nome oficial",
  tipoEscola: "tipo de escola",
  modalidade: "modalidade",
  nreReferencia: "NRE vinculado",
  status: "status",
  logradouro: "endereço",
  numero: "endereço",
  bairro: "endereço",
  cep: "endereço",
  municipio: "endereço",
  uf: "endereço",
  foneInstitucional: "telefone institucional",
  emailInstitucional: "e-mail institucional",
  diretorNome: "dados do(a) diretor(a)",
  diretorFone: "dados do(a) diretor(a)",
  diretorEmail: "dados do(a) diretor(a)",
  coordenadorNome: "dados do(a) coordenador(a)",
  coordenadorFone: "dados do(a) coordenador(a)",
  coordenadorEmail: "dados do(a) coordenador(a)",
};

const CAMPOS_MANTENEDORA: Record<string, string> = {
  razaoSocial: "razão social",
  nomeFantasia: "nome fantasia",
  cnpj: "CNPJ",
  logradouro: "endereço",
  numero: "endereço",
  bairro: "endereço",
  cep: "endereço",
  municipio: "endereço",
  uf: "endereço",
  foneInstitucional: "telefone institucional",
  emailInstitucional: "e-mail institucional",
  presidenteNome: "dados do(a) presidente",
  presidenteCpf: "dados do(a) presidente",
  presidenteFone: "dados do(a) presidente",
  presidenteEmail: "dados do(a) presidente",
  status: "situação",
};

function camposFaltando(schema: ZodType, valores: unknown, rotulos: Record<string, string>) {
  const resultado = schema.safeParse(valores);
  if (resultado.success) return [];
  return [...new Set(resultado.error.issues.map((issue) => rotulos[String(issue.path[0])] ?? String(issue.path[0])))];
}

async function criadoEm(tabela: "escolas" | "mantenedoras", id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from(tabela).select("created_at").eq("id", id).single();
  if (error) throw error;
  return data.created_at as string;
}

export const getCadastroInstitucional = cache(
  async (): Promise<{ escola: CadastroInstitucional | null; mantenedora: CadastroInstitucional | null }> => {
    const [escola, mantenedora] = await Promise.all([getEscolaAtualCompleta(), getMantenedoraAtual()]);

    async function avaliar(
      cadastro: { id: string } | null,
      schema: ZodType,
      rotulos: Record<string, string>,
      tabela: "escolas" | "mantenedoras",
    ): Promise<CadastroInstitucional | null> {
      if (!cadastro) return null;
      return {
        id: cadastro.id,
        faltando: camposFaltando(schema, cadastro, rotulos),
        createdAt: await criadoEm(tabela, cadastro.id),
      };
    }

    const [escolaAvaliada, mantenedoraAvaliada] = await Promise.all([
      avaliar(escola, escolaSchema, CAMPOS_ESCOLA, "escolas"),
      avaliar(mantenedora, mantenedoraSchema, CAMPOS_MANTENEDORA, "mantenedoras"),
    ]);
    return { escola: escolaAvaliada, mantenedora: mantenedoraAvaliada };
  },
);

