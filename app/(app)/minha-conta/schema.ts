import { z } from "zod";

import { telefoneOpcionalSchema } from "@/lib/telefone";

export const minhaContaSchema = z.object({
  nomeCompleto: z.string().min(1, "Informe o nome completo"),
  email: z.email({ message: "Informe um e-mail válido" }),
  telefone: telefoneOpcionalSchema,
});

export type MinhaContaValues = z.infer<typeof minhaContaSchema>;
