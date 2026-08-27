"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-brand-ink select-none",
  {
    variants: {
      size: {
        // tamanhos herdados direto da grade de espaçamento — ver
        // pertency-componentes-v1.html § Avatar
        xs: "size-[var(--space-3)] text-[10px]",
        sm: "size-[var(--space-4)] text-[12px]",
        md: "size-[var(--space-5)] text-[13.5px]",
        lg: "size-[var(--space-6)] text-base",
        xl: "size-[var(--space-8)] text-xl",
      },
      variant: {
        brand: "bg-brand-tint text-brand-ink",
        info: "bg-info-tint text-info-ink",
        success: "bg-success-tint text-success-ink",
        warning: "bg-warning-tint text-warning-ink",
        danger: "bg-danger-tint text-danger-ink",
        neutral: "bg-bg text-muted",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "brand",
    },
  },
);

function Avatar({
  className,
  size,
  variant,
  clickable = false,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants> & { clickable?: boolean }) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        avatarVariants({ size, variant }),
        clickable &&
          "cursor-pointer outline-none transition-[box-shadow,transform] duration-base ease-standard hover:shadow-[0_0_0_var(--focus-ring-inner)_var(--brand-tint)] focus-visible:shadow-[0_0_0_var(--focus-ring-inner)_var(--brand-tint),0_0_0_var(--focus-ring-outer)_var(--brand)] active:scale-95",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("flex size-full items-center justify-center", className)}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn("flex items-center [&>*]:-ml-[10px] [&>*]:border-2 [&>*]:border-surface [&>*:first-child]:ml-0", className)}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, avatarVariants };
