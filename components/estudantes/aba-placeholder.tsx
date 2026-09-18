import { Construction } from "lucide-react";

import { Card } from "@/components/ui/card";

export function AbaPlaceholder({ titulo }: { titulo: string }) {
  return (
    <Card className="items-center gap-3 p-[48px] text-center">
      <div className="flex size-[52px] items-center justify-center rounded-full bg-brand-tint text-brand">
        <Construction size={22} strokeWidth={2} aria-hidden="true" />
      </div>
      <h2 className="text-highlight text-ink">{titulo}</h2>
      <p className="max-w-[420px] text-[13px] leading-relaxed text-muted">
        Esta etapa ainda não está disponível — chega numa próxima fase do Cadastro de Estudante.
      </p>
    </Card>
  );
}
