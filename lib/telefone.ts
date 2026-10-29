import { z } from "zod";

export function apenasDigitos(telefone: string | null | undefined) {
  return (telefone ?? "").replace(/\D/g, "");
}

/** Telefone opcional; quando preenchido, completo com DDD (fixo ou celular). */
export const telefoneOpcionalSchema = z
  .string()
  .optional()
  .refine((valor) => !valor || [10, 11].includes(apenasDigitos(valor).length), {
    message: "Informe o telefone completo, com DDD",
  });
