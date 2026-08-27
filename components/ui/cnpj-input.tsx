"use client";

import * as React from "react";
import { IMaskInput } from "react-imask";

import { cn } from "@/lib/utils";
import { inputVariants } from "@/components/ui/input";

type CnpjInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  name?: string;
  placeholder?: string;
};

/** Input de CNPJ com máscara `00.000.000/0000-00`. */
const CnpjInput = React.forwardRef<HTMLInputElement, CnpjInputProps>(function CnpjInput(
  { value, onChange, className, ...props },
  ref,
) {
  return (
    <IMaskInput
      mask="00.000.000/0000-00"
      value={value ?? ""}
      unmask={false}
      onAccept={(unmaskedOrMasked: string) => onChange?.(unmaskedOrMasked)}
      inputRef={ref}
      data-slot="input"
      placeholder="00.000.000/0000-00"
      className={cn(inputVariants, className)}
      {...props}
    />
  );
});

export { CnpjInput };
