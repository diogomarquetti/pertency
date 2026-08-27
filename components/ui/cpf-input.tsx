"use client";

import * as React from "react";
import { IMaskInput } from "react-imask";

import { cn } from "@/lib/utils";
import { inputVariants } from "@/components/ui/input";

type CpfInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  name?: string;
  placeholder?: string;
};

/** Input de CPF com máscara `000.000.000-00`. */
const CpfInput = React.forwardRef<HTMLInputElement, CpfInputProps>(function CpfInput(
  { value, onChange, className, ...props },
  ref,
) {
  return (
    <IMaskInput
      mask="000.000.000-00"
      value={value ?? ""}
      unmask={false}
      onAccept={(unmaskedOrMasked: string) => onChange?.(unmaskedOrMasked)}
      inputRef={ref}
      data-slot="input"
      placeholder="000.000.000-00"
      className={cn(inputVariants, className)}
      {...props}
    />
  );
});

export { CpfInput };
