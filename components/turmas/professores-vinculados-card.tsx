"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/lib/use-toast";

import { removerVinculoProfessor } from "@/app/(app)/turmas/professores-actions";
import type { ProfessorVinculado } from "@/app/(app)/turmas/queries";
import type { OfertaSlug } from "@/app/(app)/turmas/schema";

import { ProfessorVinculosTable } from "./professor-vinculos-table";

export function ProfessoresVinculadosCard({
  turmaId,
  professores,
  ofertaSlug,
  onRequestAdd,
  onRequestEdit,
}: {
  turmaId: string;
  professores: ProfessorVinculado[];
  ofertaSlug: OfertaSlug;
  onRequestAdd: () => void;
  onRequestEdit: (professor: ProfessorVinculado) => void;
}) {
  const [, startTransition] = useTransition();
  const router = useRouter();

  function handleRemove(professor: ProfessorVinculado) {
    startTransition(async () => {
      const result = await removerVinculoProfessor(turmaId, professor.id);
      if (result && "error" in result) {
        toast.error("Não foi possível remover", result.error);
        return;
      }
      toast.success("Vínculo removido.");
      router.refresh();
    });
  }

  return (
    <Card className="gap-4 p-[24px]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-baseline gap-2 text-highlight text-ink">
          <span className="text-brand">4.</span> Professores vinculados
        </h2>
        <Button type="button" onClick={onRequestAdd}>
          + Vincular professor
        </Button>
      </div>
      <ProfessorVinculosTable
        professores={professores}
        ofertaSlug={ofertaSlug}
        onEdit={onRequestEdit}
        onRemove={handleRemove}
      />
    </Card>
  );
}
