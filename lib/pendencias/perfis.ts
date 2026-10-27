import type { Enums } from "@/lib/supabase/types";

/**
 * Perfis do catálogo de pendências. Cada usuário tem uma única `funcao`
 * (enum `user_role`), então não existe união de perfis: os quatro papéis de
 * professor viram "Professor(a)" e `coordenacao_pedagogica` é o Pedagogo(a).
 */
export type Perfil =
  | "administrador"
  | "direcao"
  | "secretaria"
  | "pedagogo"
  | "professor"
  | "profissional_complementar";

const PERFIL_POR_FUNCAO: Record<Enums<"user_role">, Perfil> = {
  administrador: "administrador",
  direcao: "direcao",
  secretaria: "secretaria",
  coordenacao_pedagogica: "pedagogo",
  professor_regente: "professor",
  professor_regente_2: "professor",
  professor_arte: "professor",
  professor_educacao_fisica: "professor",
  profissional_complementar: "profissional_complementar",
};

export const PERFIL_LABEL: Record<Perfil, string> = {
  administrador: "Administrador",
  direcao: "Direção",
  secretaria: "Secretaria",
  pedagogo: "Pedagogo(a)",
  professor: "Professor(a)",
  profissional_complementar: "Profissional complementar",
};

export function perfilDaFuncao(funcao: Enums<"user_role">): Perfil {
  return PERFIL_POR_FUNCAO[funcao];
}
