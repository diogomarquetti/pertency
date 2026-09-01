"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { confirmarAcesso } from "./actions";

export function ConfirmarForm({
  tokenHash,
  type,
}: {
  tokenHash: string;
  type: EmailOtpType;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await confirmarAcesso(tokenHash, type);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/redefinir-senha");
    });
  }

  return (
    <div className="flex flex-col gap-[10px]">
      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
        Confirmar acesso
      </Button>

      {error && (
        <p className="flex items-center gap-[8px] text-sm text-danger" role="alert">
          <AlertCircle size={16} strokeWidth={2} className="shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
