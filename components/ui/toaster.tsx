"use client";

import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { dismissToast, TOAST_DURATION, useToasts, type ToastVariant } from "@/lib/use-toast";

const VARIANT_ICON: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export function Toaster() {
  const toasts = useToasts();

  return (
    <ToastProvider duration={TOAST_DURATION}>
      {toasts.map(({ id, title, description, variant }) => {
        const Icon = VARIANT_ICON[variant];
        return (
          <Toast
            key={id}
            variant={variant}
            onOpenChange={(open) => {
              if (!open) dismissToast(id);
            }}
          >
            <Icon size={17} strokeWidth={2} className="mt-[1px] shrink-0" aria-hidden="true" />
            <div className="flex flex-col gap-[2px]">
              <ToastTitle>{title}</ToastTitle>
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
