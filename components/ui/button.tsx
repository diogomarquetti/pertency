import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[var(--space-1)] whitespace-nowrap rounded-sm border font-semibold text-sm transition-colors duration-base ease-standard active:scale-[0.97] disabled:pointer-events-none disabled:cursor-not-allowed outline-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-[var(--icon-md)]",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-brand text-white hover:bg-blue-700 focus-visible:shadow-[0_0_0_var(--focus-ring-inner)_#fff,0_0_0_var(--focus-ring-outer)_var(--brand)] disabled:bg-blue-100 disabled:text-white disabled:opacity-70",
        secondary:
          "border-line bg-surface text-brand-ink hover:border-brand hover:bg-brand-tint focus-visible:shadow-[0_0_0_var(--focus-ring-inner)_var(--brand-tint),0_0_0_var(--focus-ring-outer)_var(--brand)] disabled:text-muted disabled:border-line disabled:opacity-60",
        ghost:
          "border-transparent bg-transparent text-ink hover:bg-brand-tint focus-visible:shadow-[0_0_0_var(--focus-ring-inner)_var(--brand-tint),0_0_0_var(--focus-ring-outer)_var(--brand)] disabled:text-muted disabled:opacity-60",
        danger:
          "border-transparent bg-danger text-white hover:bg-[#A32A1C] focus-visible:shadow-[0_0_0_var(--focus-ring-inner)_#fff,0_0_0_var(--focus-ring-outer)_var(--danger)] disabled:bg-[#E9AFA6] disabled:opacity-80",
        // bônus fora da spec (pertency-componentes-v1.html só define primary/secondary/ghost/danger)
        subtle: "border-transparent bg-brand-tint text-brand-ink hover:bg-blue-100",
        link: "border-transparent text-brand underline-offset-4 hover:underline",
      },
      size: {
        // alturas/paddings fora da grade de espaçamento onde a spec assim define
        // (padding 18/13/22px) — ver pertency-componentes-v1.html § Botão
        default: "h-[var(--space-5)] px-[18px]",
        sm: "h-[var(--space-4)] rounded-sm px-[13px] text-[12.5px] [&_svg]:size-[var(--icon-sm)]",
        lg: "h-[var(--space-6)] rounded-md px-[22px] text-[15px] [&_svg]:size-[var(--icon-lg)]",
      },
      icon: {
        true: "flex-none gap-0 p-0",
        false: "",
      },
    },
    compoundVariants: [
      { size: "default", icon: true, className: "w-[var(--space-5)]" },
      { size: "sm", icon: true, className: "w-[var(--space-4)]" },
      { size: "lg", icon: true, className: "w-[var(--space-6)]" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "default",
      icon: false,
    },
  },
);

function Button({
  className,
  variant,
  size,
  icon,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, icon, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
