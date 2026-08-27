"use client";

import * as React from "react";
import { IMaskInput } from "react-imask";

import { cn } from "@/lib/utils";
import { inputVariants } from "@/components/ui/input";

type PhoneInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  name?: string;
  placeholder?: string;
};

/**
 * Input de telefone com máscara BR (fixo ou celular, alternando
 * automaticamente conforme a quantidade de dígitos digitados).
 */
const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput({ value, onChange, className, ...props }, ref) {
    return (
      <IMaskInput
        mask={[{ mask: "(00) 0000-0000" }, { mask: "(00) 00000-0000" }]}
        value={value ?? ""}
        unmask={false}
        onAccept={(unmaskedOrMasked: string) => onChange?.(unmaskedOrMasked)}
        inputRef={ref}
        data-slot="input"
        placeholder="(00) 00000-0000"
        className={cn(inputVariants, className)}
        {...props}
      />
    );
  },
);

export { PhoneInput };
