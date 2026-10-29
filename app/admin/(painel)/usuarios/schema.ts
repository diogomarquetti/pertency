import { z } from "zod";

export const convidarOperadorSchema = z.object({
  nomeCompleto: z.string().trim().min(1, "Informe o nome completo"),
  email: z.email({ message: "Informe um e-mail válido" }),
});

export type ConvidarOperadorValues = z.infer<typeof convidarOperadorSchema>;

export const atualizarOperadorSchema = z.object({
  nomeCompleto: z.string().trim().min(1, "Informe o nome completo"),
  ativo: z.boolean(),
});

export type AtualizarOperadorValues = z.infer<typeof atualizarOperadorSchema>;
