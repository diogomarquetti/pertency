import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  // padding 4px/10px é exceção intencional fora da grade de espaçamento —
  // ver pertency-componentes-v1.html § Badge (token-manifest)
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-[10px] py-[4px] text-[12.5px] leading-[1.4] font-semibold",
  {
    variants: {
      variant: {
        neutral: "border border-line bg-bg text-muted [&>.badge-dot]:bg-muted",
        brand: "bg-brand-tint text-brand-ink [&>.badge-dot]:bg-brand",
        info: "bg-info-tint text-info-ink [&>.badge-dot]:bg-info",
        success: "bg-success-tint text-success-ink [&>.badge-dot]:bg-success",
        warning: "bg-warning-tint text-warning-ink [&>.badge-dot]:bg-warning",
        danger: "bg-danger-tint text-danger-ink [&>.badge-dot]:bg-danger",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

function Badge({
  className,
  variant,
  dot = true,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { dot?: boolean }) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {dot && <span className="badge-dot size-[6px] shrink-0 rounded-full" aria-hidden="true" />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
