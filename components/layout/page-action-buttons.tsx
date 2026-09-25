"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { PageActions } from "@/components/layout/page-actions-context";

/**
 * Par Cancelar/Salvar declarado pela página via usePageActionsSetter. É
 * renderizado em dois lugares, um de cada vez: no AppTopbar a partir de `md`
 * e numa barra fixa no rodapé abaixo disso (ver AppShell) — no mobile a
 * topbar não tem largura pra título + botões + sino + avatar.
 */
export function PageActionButtons({
  actions,
  className,
  buttonClassName,
}: {
  actions: PageActions;
  className?: string;
  buttonClassName?: string;
}) {
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const router = useRouter();

  function proceedCancel() {
    if (actions.onCancel) {
      actions.onCancel();
    } else if (actions.cancelHref) {
      router.push(actions.cancelHref);
    }
  }

  function handleCancelClick() {
    if (actions.isDirty) {
      setShowUnsavedDialog(true);
      return;
    }
    proceedCancel();
  }

  function handleConfirmDiscard() {
    setShowUnsavedDialog(false);
    proceedCancel();
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {(actions.onCancel || actions.cancelHref) && (
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancelClick}
          disabled={actions.pending}
          className={buttonClassName}
        >
          {actions.cancelLabel ?? "Cancelar"}
        </Button>
      )}
      {!actions.readOnly && (
        <Button
          type="submit"
          form={actions.formId}
          disabled={actions.pending}
          className={buttonClassName}
        >
          {actions.pending && (
            <Loader2 className="animate-spin" size={15} strokeWidth={2} aria-hidden="true" />
          )}
          {actions.saveLabel ?? "Salvar"}
        </Button>
      )}

      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterações não salvas</AlertDialogTitle>
            <AlertDialogDescription>Se sair agora, elas serão perdidas.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard}>Sair sem salvar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
