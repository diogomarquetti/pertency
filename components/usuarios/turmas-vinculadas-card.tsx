"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { TurmaVinculosTable } from "./turma-vinculos-table";
import type { VinculoLocal } from "./vinculo-types";

export function TurmasVinculadasCard({
  vinculos,
  onRequestAdd,
  onRequestEdit,
  onRemove,
}: {
  vinculos: VinculoLocal[];
  onRequestAdd: () => void;
  onRequestEdit: (index: number) => void;
  onRemove: (turmaId: string) => void;
}) {
  return (
    <Card className="gap-4 p-[24px]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-baseline gap-2 text-highlight text-ink">
          <span className="text-brand">2.</span> Turmas vinculadas
        </h2>
        <Button type="button" size="sm" onClick={onRequestAdd}>
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          Adicionar turma
        </Button>
      </div>

      <TurmaVinculosTable vinculos={vinculos} onEdit={onRequestEdit} onRemove={onRemove} />
    </Card>
  );
}
