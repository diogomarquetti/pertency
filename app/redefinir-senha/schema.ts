import { z } from "zod";

export const redefinirSenhaSchema = z
  .object({
    senha: z
      .string()
      .min(8, "A senha precisa ter pelo menos 8 caracteres")
      .regex(/\d/, "A senha precisa ter pelo menos 1 número"),
    confirmarSenha: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type RedefinirSenhaValues = z.infer<typeof redefinirSenhaSchema>;
