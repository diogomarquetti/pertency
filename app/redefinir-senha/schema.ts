import { z } from "zod";

export const redefinirSenhaSchema = z
  .object({
    senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type RedefinirSenhaValues = z.infer<typeof redefinirSenhaSchema>;
