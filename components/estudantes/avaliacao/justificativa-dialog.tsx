"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Modal de confirmação com justificativa obrigatória — usado por "Retificar
 * avaliação" e "Cancelar avaliação". O botão de confirmar só habilita com
 * texto preenchido; o modal só fecha quando `onConfirm` termina sem erro.
 */
export function JustificativaDialog({
  open,
  onOpenChange,
  titulo,
  descricao,
  confirmarLabel,
  variant = "primary",
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descricao: string;
  confirmarLabel: string;
  variant?: "primary" | "danger";
  pending: boolean;
  onConfirm: (justificativa: string) => void;
}) {
  const [justificativa, setJustificativa] = useState("");

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setJustificativa("");
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2 px-[24px] pt-[16px]">
          <Label htmlFor="justificativa-dialog">Justificativa</Label>
          <Textarea
            id="justificativa-dialog"
            value={justificativa}
            onChange={(event) => setJustificativa(event.target.value)}
            placeholder="Explique o motivo."
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Voltar</AlertDialogCancel>
          <Button
            type="button"
            variant={variant}
            disabled={pending || !justificativa.trim()}
            onClick={() => onConfirm(justificativa.trim())}
          >
            {pending && <Loader2 className="animate-spin" size={15} strokeWidth={2} aria-hidden="true" />}
            {confirmarLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
