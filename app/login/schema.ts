import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Informe um e-mail válido" }),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres"),
});

export type LoginValues = z.infer<typeof loginSchema>;
