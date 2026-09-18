import * as React from "react";

import { cn } from "@/lib/utils";

// altura 42px e padding 14px são exceções intencionais fora da grade de
// espaçamento — ver pertency-componentes-v1.html § Input (token-manifest).
// Compartilhada com PhoneInput (components/ui/phone-input.tsx), que precisa
// da mesma caixa mas não é um <input> plano (react-imask).
const inputVariants =
  "flex h-[42px] w-full min-w-0 rounded-sm border-[1.5px] border-line bg-surface px-[14px] text-control text-ink outline-none transition-colors duration-base ease-standard placeholder:text-[#94A3B8] hover:border-[#C7D0DB] focus-visible:border-brand focus-visible:shadow-[0_0_0_var(--focus-ring-inner)_var(--brand-tint)] disabled:cursor-not-allowed disabled:border-line disabled:bg-bg disabled:text-muted aria-invalid:border-danger aria-invalid:focus-visible:shadow-[0_0_0_var(--focus-ring-inner)_var(--danger-tint)]";

// Desliga autopreenchimento por padrão — o Chrome já inseriu o nome do
// usuário logado num campo "Nome social" de outra pessoa (autofill de
// endereço/nome, não de senha, então autocomplete="off" é respeitado).
// Quem realmente precisa de autofill (login, redefinir senha) passa seu
// próprio `autoComplete` explícito, que sobrescreve este default.
function Input({ className, type, autoComplete = "off", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      autoComplete={autoComplete}
      data-slot="input"
      className={cn(inputVariants, className)}
      {...props}
    />
  );
}

export { Input, inputVariants };
