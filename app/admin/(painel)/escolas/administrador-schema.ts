import { z } from "zod";

import { telefoneOpcionalSchema } from "@/lib/telefone";

/** Primeiro administrador da escola — o resto da equipe a própria escola cadastra. */
export const administradorEscolaSchema = z.object({
  nomeCompleto: z.string().trim().min(1, "Informe o nome completo"),
  emailLogin: z.email({ message: "Informe um e-mail de login válido" }),
  telefone: telefoneOpcionalSchema,
});

export type AdministradorEscolaValues = z.infer<typeof administradorEscolaSchema>;
