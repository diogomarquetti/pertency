import { z } from "zod";

import { createUsuarioSchema } from "@/app/(app)/usuarios/schema";

/** Mesmo cadastro do app das escolas, mais a escola — que o operador escolhe ao criar. */
export const usuarioPlataformaSchema = createUsuarioSchema.and(
  z.object({ escolaId: z.string().min(1, "Selecione a escola") }),
);

export type UsuarioPlataformaValues = z.infer<typeof usuarioPlataformaSchema>;
