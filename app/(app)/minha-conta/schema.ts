import { z } from "zod";

export const minhaContaSchema = z.object({
  nomeCompleto: z.string().min(1, "Informe o nome completo"),
  email: z.email({ message: "Informe um e-mail válido" }),
  telefone: z.string().optional().or(z.literal("")),
});

export type MinhaContaValues = z.infer<typeof minhaContaSchema>;
