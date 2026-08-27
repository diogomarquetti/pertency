"use client";

import * as React from "react";

export type ToastVariant = "success" | "danger" | "warning" | "info";

export type ToastData = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

const TOAST_DURATION = 5000;

let toasts: ToastData[] = [];
const listeners = new Set<(toasts: ToastData[]) => void>();

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

export function dismissToast(id: string) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

function pushToast(data: Omit<ToastData, "id">) {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, ...data }];
  emit();
  return id;
}

/**
 * API imperativa — chamável de qualquer Client Component, sem precisar de
 * um hook/contexto no componente que dispara o toast (útil em callbacks de
 * Server Action, fora do corpo de render). `<Toaster />` (montado uma vez
 * no AppShell) é quem escuta `useToasts()` e renderiza a fila via Radix.
 */
export function toast(data: Omit<ToastData, "id">) {
  return pushToast(data);
}

toast.success = (title: string, description?: string) =>
  pushToast({ title, description, variant: "success" });
toast.error = (title: string, description?: string) =>
  pushToast({ title, description, variant: "danger" });
toast.warning = (title: string, description?: string) =>
  pushToast({ title, description, variant: "warning" });
toast.info = (title: string, description?: string) =>
  pushToast({ title, description, variant: "info" });

const EMPTY_TOASTS: ToastData[] = [];

export function useToasts() {
  return React.useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => toasts,
    () => EMPTY_TOASTS,
  );
}

export { TOAST_DURATION };
