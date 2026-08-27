"use client";

import * as React from "react";
import { IMaskInput } from "react-imask";

import { cn } from "@/lib/utils";
import { inputVariants } from "@/components/ui/input";

type CepInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  name?: string;
  placeholder?: string;
};

/** Input de CEP com máscara `00000-000`. */
const CepInput = React.forwardRef<HTMLInputElement, CepInputProps>(function CepInput(
  { value, onChange, className, ...props },
  ref,
) {
  return (
    <IMaskInput
      mask="00000-000"
      value={value ?? ""}
      unmask={false}
      onAccept={(unmaskedOrMasked: string) => onChange?.(unmaskedOrMasked)}
      inputRef={ref}
      data-slot="input"
      placeholder="00000-000"
      className={cn(inputVariants, className)}
      {...props}
    />
  );
});

export { CepInput };
