"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitive.Provider;

function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "fixed inset-x-0 bottom-0 z-[100] flex max-h-screen w-full flex-col gap-[10px] p-[16px] outline-none sm:right-[16px] sm:left-auto sm:bottom-[16px] sm:w-[380px]",
        className,
      )}
      {...props}
    />
  );
}

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-[10px] rounded-md p-[14px] shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full data-[swipe=move]:transition-none data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] duration-base ease-standard",
  {
    variants: {
      variant: {
        success: "bg-success-tint text-success-ink",
        danger: "bg-danger-tint text-danger-ink",
        warning: "bg-warning-tint text-warning-ink",
        info: "bg-info-tint text-info-ink",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

function Toast({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Root> & VariantProps<typeof toastVariants>) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Title>) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-[13.5px] leading-snug font-semibold", className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-[12.5px] leading-relaxed opacity-90", className)}
      {...props}
    />
  );
}

function ToastClose({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      className={cn(
        "ml-auto shrink-0 rounded-sm p-[2px] opacity-70 outline-none transition-opacity duration-fast ease-standard hover:opacity-100 focus-visible:opacity-100",
        className,
      )}
      {...props}
    >
      <X size={15} strokeWidth={2} aria-hidden="true" />
      <span className="sr-only">Fechar</span>
    </ToastPrimitive.Close>
  );
}

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, toastVariants };
