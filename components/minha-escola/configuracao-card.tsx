import Link from "next/link";
import { Eye, Pencil, Plus, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ConfiguracaoCard({
  icon: Icon,
  tipo,
  titulo,
  descricao,
  status,
  href,
  preenchido,
  canEdit,
}: {
  icon: LucideIcon;
  tipo: string;
  titulo: string;
  descricao: string;
  status?: { label: string; variant: "success" | "neutral" };
  href: string;
  preenchido: boolean;
  canEdit: boolean;
}) {
  return (
    <Card className="flex-col gap-4 p-[24px] sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex size-[var(--space-8)] shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
          <Icon size={24} strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-col gap-[4px]">
          <p className="text-[12.5px] font-semibold tracking-[0.02em] text-muted uppercase">{tipo}</p>
          <h2 className="truncate text-highlight text-ink">{titulo}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[13.5px] text-muted">{descricao}</p>
            {status && <Badge variant={status.variant}>{status.label}</Badge>}
          </div>
        </div>
      </div>

      {preenchido && canEdit ? (
        <Button variant="secondary" size="sm" asChild className="shrink-0">
          <Link href={href}>
            <Pencil size={14} strokeWidth={2} aria-hidden="true" />
            Editar
          </Link>
        </Button>
      ) : preenchido ? (
        <Button variant="secondary" size="sm" asChild className="shrink-0">
          <Link href={href}>
            <Eye size={14} strokeWidth={2} aria-hidden="true" />
            Visualizar
          </Link>
        </Button>
      ) : canEdit ? (
        <Button variant="secondary" size="sm" asChild className="shrink-0">
          <Link href={href}>
            <Plus size={14} strokeWidth={2} aria-hidden="true" />
            Iniciar cadastro
          </Link>
        </Button>
      ) : null}
    </Card>
  );
}
