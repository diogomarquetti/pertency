"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // 18px e r-xs (não r-sm — em 18px o raio padrão lê como círculo) —
        // ver pertency-componentes-v1.html § Checkbox
        "peer size-[18px] shrink-0 rounded-xs border-[1.5px] border-line bg-surface outline-none",
        "flex items-center justify-center",
        "transition-colors duration-base ease-standard",
        "hover:border-brand",
        "focus-visible:shadow-[0_0_0_var(--focus-ring-inner)_var(--brand-tint),0_0_0_var(--focus-ring-outer)_var(--brand)]",
        "data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=indeterminate]:border-brand data-[state=indeterminate]:bg-brand",
        "disabled:cursor-not-allowed disabled:border-line disabled:bg-bg",
        "aria-invalid:border-danger",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
        {props.checked === "indeterminate" ? (
          <Minus size={12} strokeWidth={2.5} aria-hidden="true" />
        ) : (
          <Check size={12} strokeWidth={2.5} aria-hidden="true" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
